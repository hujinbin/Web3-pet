import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Web3 from 'web3';
import petABI from '../abis/PetABI.json';
import petCoinABI from '../abis/PetCoinABI.json';
import petAdoptionABI from '../abis/PetAdoptionABI.json';

// 初始化web3
let web3: Web3 | null = null;

// 检查是否有可用的web3提供程序
export const checkWeb3 = createAsyncThunk(
  'web3/checkWeb3',
  async () => {
    if ((window as any).ethereum) {
      web3 = new Web3((window as any).ethereum);
      try {
        // 请求账户权限
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        return {
          web3: web3,
          account: accounts[0],
          networkId: await web3.eth.net.getId()
        };
      } catch (error) {
        throw new Error('用户拒绝了账户访问请求');
      }
    } else if ((window as any).web3) {
      // 老版本的MetaMask提供的web3
      web3 = new Web3((window as any).web3.currentProvider);
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
  async () => {
    if (!web3) {
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
    const state = getState() as any;
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

// 连接PetCoin合约
export const connectPetCoinContract = createAsyncThunk(
  'web3/connectPetCoinContract',
  async (contractAddress: string, { getState }) => {
    const state = getState() as any;
    const { web3 } = state.web3;
    
    if (!web3) {
      throw new Error('Web3未初始化');
    }
    
    try {
      const contract = new web3.eth.Contract(petCoinABI as any, contractAddress);
      return contract;
    } catch (error) {
      throw new Error('无法连接到PetCoin合约');
    }
  }
);

// 连接PetAdoption合约
export const connectPetAdoptionContract = createAsyncThunk(
  'web3/connectPetAdoptionContract',
  async (contractAddress: string, { getState }) => {
    const state = getState() as any;
    const { web3 } = state.web3;
    
    if (!web3) {
      throw new Error('Web3未初始化');
    }
    
    try {
      const contract = new web3.eth.Contract(petAdoptionABI as any, contractAddress);
      return contract;
    } catch (error) {
      throw new Error('无法连接到PetAdoption合约');
    }
  }
);

// 获取账户余额
export const getBalance = createAsyncThunk(
  'web3/getBalance',
  async (_, { getState }) => {
    const state = getState() as any;
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

// 获取PetCoin余额
export const getPetCoinBalance = createAsyncThunk(
  'web3/getPetCoinBalance',
  async (_, { getState }) => {
    const state = getState() as any;
    const { account, petCoinContract } = state.web3;
    
    if (!petCoinContract || !account) {
      return '0';
    }
    
    try {
      const balance = await petCoinContract.methods.getBalance(account).call();
      return balance.toString();
    } catch (error) {
      console.error('获取PetCoin余额失败:', error);
      return '0';
    }
  }
);

// 初始状态
interface Web3State {
  web3: Web3 | null;
  account: string | null;
  networkId: number | null;
  contract: any | null;
  petCoinContract: any | null;
  petAdoptionContract: any | null;
  balance: string;
  petCoinBalance: string;
  loading: boolean;
  error: string | null;
}

const initialState: Web3State = {
  web3: null,
  account: null,
  networkId: null,
  contract: null,
  petCoinContract: null,
  petAdoptionContract: null,
  balance: '0',
  petCoinBalance: '0',
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
        state.web3 = action.payload.web3 as Web3 | null;
        state.account = action.payload.account;
        state.networkId = Number(action.payload.networkId);
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
      })
      .addCase(connectPetCoinContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectPetCoinContract.fulfilled, (state, action) => {
        state.loading = false;
        state.petCoinContract = action.payload;
      })
      .addCase(connectPetCoinContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '连接PetCoin合约失败';
      })
      .addCase(connectPetAdoptionContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectPetAdoptionContract.fulfilled, (state, action) => {
        state.loading = false;
        state.petAdoptionContract = action.payload;
      })
      .addCase(connectPetAdoptionContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '连接PetAdoption合约失败';
      })
      .addCase(getPetCoinBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPetCoinBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.petCoinBalance = action.payload;
      })
      .addCase(getPetCoinBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取PetCoin余额失败';
      });
  }
});

export const { disconnect } = web3Slice.actions;
export default web3Slice.reducer;