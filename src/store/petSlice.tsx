import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import PetContractABI from '../contracts/PetContractABI.json';

// 宠物接口定义
export interface Pet {
  id: number;
  name: string;
  imageUrl: string;
  owner: string;
  rarity: number;
  strength: number;
  speed: number;
  intelligence: number;
  health: number;
  experience: number;
  birthTime: number;
  lastBreedTime: number;
  canBreed: boolean;
}

// 初始状态
interface PetState {
  pets: Pet[];
  allPets: Pet[];
  loading: boolean;
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  allPets: [],
  loading: false,
  error: null,
};

// 获取用户宠物
export const fetchUserPets = createAsyncThunk(
  'pet/fetchUserPets',
  async (ownerAddress: string, { rejectWithValue }) => {
    try {
      // 检查以太坊提供者
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      // 创建合约实例
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        '0xYourContractAddress',
        PetContractABI,
        provider
      );

      // 获取用户宠物ID
      const petIds = await contract.getPetsByOwner(ownerAddress);
      
      // 获取每个宠物的详细信息
      const pets = await Promise.all(
        petIds.map(async (id: ethers.BigNumber) => {
          const petData = await contract.getPet(id);
          return {
            id: id.toNumber(),
            name: petData.name,
            imageUrl: petData.imageUrl,
            owner: petData.owner,
            rarity: petData.rarity.toNumber(),
            strength: petData.strength.toNumber(),
            speed: petData.speed.toNumber(),
            intelligence: petData.intelligence.toNumber(),
            health: petData.health.toNumber(),
            experience: petData.experience.toNumber(),
            birthTime: petData.birthTime.toNumber(),
            lastBreedTime: petData.lastBreedTime.toNumber(),
            canBreed: petData.canBreed
          };
        })
      );

      return pets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 获取所有宠物
export const fetchAllPets = createAsyncThunk(
  'pet/fetchAllPets',
  async (_, { rejectWithValue }) => {
    try {
      // 检查以太坊提供者
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      // 创建合约实例
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        '0xYourContractAddress',
        PetContractABI,
        provider
      );

      // 获取宠物总数
      const totalSupply = await contract.totalSupply();
      const totalPets = totalSupply.toNumber();

      // 分批获取所有宠物
      const batchSize = 20;
      const pets: Pet[] = [];

      for (let i = 0; i < totalPets; i += batchSize) {
        const end = Math.min(i + batchSize, totalPets);
        const batchPromises = Array.from({ length: end - i }, (_, j) => i + j).map(async (index) => {
          const petId = await contract.tokenByIndex(index);
          const petData = await contract.getPet(petId);
          return {
            id: petId.toNumber(),
            name: petData.name,
            imageUrl: petData.imageUrl,
            owner: petData.owner,
            rarity: petData.rarity.toNumber(),
            strength: petData.strength.toNumber(),
            speed: petData.speed.toNumber(),
            intelligence: petData.intelligence.toNumber(),
            health: petData.health.toNumber(),
            experience: petData.experience.toNumber(),
            birthTime: petData.birthTime.toNumber(),
            lastBreedTime: petData.lastBreedTime.toNumber(),
            canBreed: petData.canBreed
          };
        });

        const batchPets = await Promise.all(batchPromises);
        pets.push(...batchPets);
      }

      return pets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 领养新宠物
export const adoptPet = createAsyncThunk(
  'pet/adoptPet',
  async (name: string, { dispatch, rejectWithValue }) => {
    try {
      // 检查以太坊提供者
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      // 请求账户权限
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 创建合约实例
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        '0xYourContractAddress',
        PetContractABI,
        signer
      );

      // 估算Gas
      const gasEstimate = await contract.estimateGas.adoptPet(name);

      // 执行领养交易
      const tx = await contract.adoptPet(name, { gasLimit: gasEstimate.mul(130).div(100) });
      await tx.wait();

      // 刷新用户宠物
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        dispatch(fetchUserPets(accounts[0]));
      }

      return { success: true, message: '领养成功！' };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 繁殖宠物
export const breedPets = createAsyncThunk(
  'pet/breedPets',
  async ({ petId1, petId2 }: { petId1: number, petId2: number }, { dispatch, rejectWithValue }) => {
    try {
      // 检查以太坊提供者
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      // 请求账户权限
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 创建合约实例
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        '0xYourContractAddress',
        PetContractABI,
        signer
      );

      // 估算Gas
      const gasEstimate = await contract.estimateGas.breedPets(petId1, petId2);

      // 执行繁殖交易
      const tx = await contract.breedPets(petId1, petId2, { gasLimit: gasEstimate.mul(130).div(100) });
      await tx.wait();

      // 刷新用户宠物
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        dispatch(fetchUserPets(accounts[0]));
      }

      return { success: true, message: '繁殖成功！新宠物正在孵化中...' };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 宠物切片
const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // 获取用户宠物
    builder.addCase(fetchUserPets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserPets.fulfilled, (state, action: PayloadAction<Pet[]>) => {
      state.loading = false;
      state.pets = action.payload;
    });
    builder.addCase(fetchUserPets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 获取所有宠物
    builder.addCase(fetchAllPets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllPets.fulfilled, (state, action: PayloadAction<Pet[]>) => {
      state.loading = false;
      state.allPets = action.payload;
    });
    builder.addCase(fetchAllPets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 领养宠物
    builder.addCase(adoptPet.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(adoptPet.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(adoptPet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 繁殖宠物
    builder.addCase(breedPets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(breedPets.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(breedPets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default petSlice.reducer;    