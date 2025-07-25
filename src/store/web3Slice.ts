import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import petABI from '../abis/PetABI.json';

// 初始化web3
let web3: Web3 | null = null;

// 检查是否有可用的web3提供程序
export const checkWeb3 = createAsyncThunk(
  'web3/checkWeb3',
  async (_, { dispatch }) => {
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      try {
        // 请求账户权限
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return {
          web3: web3,
          account: accounts[0],
          networkId: await web3.eth.net.getId()
        };
      } catch (error) {
        throw new Error('用户拒绝了账户访问请求');
      }
    } else if (window.web3) {
      // 老版本的MetaMask提供的web3
      web3 = new Web3(window.web3.currentProvider);
      const accounts = await web3.eth.getAccounts();
      return {
        web3: web3,
        account: accounts[0],
        networkId: await web3.eth.net.getId()
      };
    } else {
      throw new Error('没有找到Web3提供程序，请安装MetaMask');
    }
  }
);

// 获取用户账户
export const getAccount = createAsyncThunk(
  'web3/getAccount',
  async (_, { dispatch }) => {
    if (!web3) {
      dispatch(checkWeb3());
      return null;
    }
    
    try {
      const accounts = await web3.eth.getAccounts();
      return accounts[0] || null;
    } catch (error) {
      throw new Error('无法获取账户信息');
    }
  }
);

// 连接宠物合约
export const connectContract = createAsyncThunk(
  'web3/connectContract',
  async (contractAddress: string, { getState }) => {
    const state = getState() as RootState;
    const { web3 } = state.web3;
    
    if (!web3) {
      throw new Error('Web3未初始化');
    }
    
    try {
      const contract = new web3.eth.Contract(petABI as any, contractAddress);
      return contract;
    } catch (error) {
      throw new Error('无法连接到智能合约');
    }
  }
);

// 获取账户余额
export const getBalance = createAsyncThunk(
  'web3/getBalance',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { web3, account } = state.web3;
    
    if (!web3 || !account) {
      return '0';
    }
    
    try {
      const balance = await web3.eth.getBalance(account);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      throw new Error('无法获取账户余额');
    }
  }
);

// 初始状态
interface Web3State {
  web3: Web3 | null;
  account: string | null;
  networkId: number | null;
  contract: any | null;
  balance: string;
  loading: boolean;
  error: string | null;
}

const initialState: Web3State = {
  web3: null,
  account: null,
  networkId: null,
  contract: null,
  balance: '0',
  loading: false,
  error: null
};

// 创建web3 slice
const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    disconnect: (state) => {
      state.web3 = null;
      state.account = null;
      state.networkId = null;
      state.contract = null;
      state.balance = '0';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkWeb3.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkWeb3.fulfilled, (state, action) => {
        state.loading = false;
        state.web3 = action.payload.web3;
        state.account = action.payload.account;
        state.networkId = action.payload.networkId;
      })
      .addCase(checkWeb3.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '连接Web3失败';
      })
      .addCase(getAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
      })
      .addCase(getAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取账户失败';
      })
      .addCase(connectContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectContract.fulfilled, (state, action) => {
        state.loading = false;
        state.contract = action.payload;
      })
      .addCase(connectContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '连接合约失败';
      })
      .addCase(getBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(getBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取余额失败';
      });
  }
});

export const { disconnect } = web3Slice.actions;
export default web3Slice.reducer;    