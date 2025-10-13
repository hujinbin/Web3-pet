import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 宠物接口定义
export interface Pet {
  id: number;
  name: string;
  type: string;
  rarity: string;
  level: number;
  experience: number;
  birthTime: number;
  lastBreedTime: number;
  canBreed: boolean;
  owner: string;
  dna: string;
  imageUrl: string;
}

// 获取单个宠物信息
export const getPetInfo = createAsyncThunk(
  'pet/getPetInfo',
  async ({ contract, petId }: { contract: any; petId: number }) => {
    try {
      const petData = await contract.methods.getPetInfo(petId).call();
      
      // 格式化宠物数据
      const pet: Pet = {
        id: petId,
        name: petData.name,
        type: petData.type,
        rarity: petData.rarity,
        level: parseInt(petData.level.toString()),
        experience: parseInt(petData.experience.toString()),
        birthTime: parseInt(petData.birthTime.toString()),
        lastBreedTime: parseInt(petData.lastBreedTime.toString()),
        canBreed: petData.canBreed,
        owner: petData.owner,
        dna: petData.dna.toString(),
        imageUrl: `https://picsum.photos/seed/pet${petId}/200/200`
      };
      
      return pet;
    } catch (error) {
      console.error('获取宠物信息失败:', error);
      throw new Error('无法获取宠物信息');
    }
  }
);

// 获取用户宠物列表
export const fetchUserPets = createAsyncThunk(
  'pet/fetchUserPets',
  async (_, { getState }) => {
    const state = getState() as any;
    const { contract, account } = state.web3;
    
    if (!contract || !account) {
      throw new Error('未连接合约或账户');
    }
    
    try {
      // 调用智能合约获取用户宠物数量
      const petCount = await contract.methods.balanceOf(account).call();
      
      // 获取每只宠物的详细信息
      const pets: Pet[] = [];
      for (let i = 0; i < petCount; i++) {
        const petId = await contract.methods.tokenOfOwnerByIndex(account, i).call();
        const petInfo = await contract.methods.getPetInfo(petId).call();
        
        // 格式化宠物数据
        const pet: Pet = {
          id: parseInt(petId),
          name: petInfo.name,
          type: petInfo.type,
          rarity: petInfo.rarity,
          level: parseInt(petInfo.level),
          experience: parseInt(petInfo.experience),
          birthTime: parseInt(petInfo.birthTime) * 1000, // 转换为毫秒
          lastBreedTime: parseInt(petInfo.lastBreedTime) * 1000, // 转换为毫秒
          canBreed: petInfo.canBreed,
          owner: petInfo.owner,
          dna: petInfo.dna,
          imageUrl: `https://picsum.photos/seed/pet${petId}/200/200`
        };
        
        pets.push(pet);
      }
      
      return pets;
    } catch (error: any) {
      throw new Error(`获取宠物列表失败: ${error.message}`);
    }
  }
);

// 领养新宠物
export const adoptPet = createAsyncThunk(
  'pet/adoptPet',
  async ({ name, petType }: { name: string, petType: string }, { getState, dispatch }) => {
    const state = getState() as any;
    const { account, petAdoptionContract, petCoinContract } = state.web3;
    
    if (!petAdoptionContract || !account || !petCoinContract) {
      throw new Error('未连接合约或账户');
    }
    
    try {
      // 获取领养费用
      const adoptionFee = await petAdoptionContract.methods.getAdoptionFee().call();
      
      // 检查用户金币余额
      const coinBalance = await petCoinContract.methods.getBalance(account).call();
      if (Number(coinBalance) < Number(adoptionFee)) {
        throw new Error(`金币不足，领养需要 ${adoptionFee} 金币，当前余额 ${coinBalance} 金币`);
      }
      
      // 发送领养交易
      const tx = await petAdoptionContract.methods.adoptPet(name, petType).send({
        from: account
      });
      
      // 交易成功后刷新宠物列表和金币余额
      dispatch(fetchUserPets());
      dispatch({ type: 'web3/getPetCoinBalance' });
      
      return {
        success: true,
        transactionHash: tx.transactionHash,
        message: '宠物领养成功！'
      };
    } catch (error: any) {
      throw new Error(`领养宠物失败: ${error.message}`);
    }
  }
);

// 繁殖宠物
export const breedPets = createAsyncThunk(
  'pet/breedPets',
  async ({ petId1, petId2 }: { petId1: number, petId2: number }, { getState, dispatch }) => {
    const state = getState() as any;
    const { contract, account, web3 } = state.web3;
    
    if (!contract || !account || !web3) {
      throw new Error('未连接合约或账户');
    }
    
    try {
      // 获取繁殖费用
      const breedingFee = await contract.methods.breedingFee().call();
      
      // 发送繁殖交易
      const tx = await contract.methods.breed(petId1, petId2).send({
        from: account,
        value: breedingFee
      });
      
      // 交易成功后刷新宠物列表
      dispatch(fetchUserPets());
      
      return {
        success: true,
        transactionHash: tx.transactionHash,
        message: '宠物繁殖成功！新宠物正在孵化中...'
      };
    } catch (error: any) {
      throw new Error(`繁殖宠物失败: ${error.message}`);
    }
  }
);

// 初始状态
interface PetState {
  pets: Pet[];
  pet: Pet | null;
  loading: boolean;
  error: string | null;
  breeding: boolean;
  adopting: boolean;
}

const initialState: PetState = {
  pets: [],
  pet: null,
  loading: false,
  error: null,
  breeding: false,
  adopting: false
};

// 创建pet slice
const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPetInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPetInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.pet = action.payload;
      })
      .addCase(getPetInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取宠物信息失败';
      })
      .addCase(fetchUserPets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPets.fulfilled, (state, action) => {
        state.loading = false;
        state.pets = action.payload;
      })
      .addCase(fetchUserPets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取宠物列表失败';
      })
      .addCase(adoptPet.pending, (state) => {
        state.adopting = true;
        state.error = null;
      })
      .addCase(adoptPet.fulfilled, (state, action) => {
        state.adopting = false;
      })
      .addCase(adoptPet.rejected, (state, action) => {
        state.adopting = false;
        state.error = action.error.message || '领养宠物失败';
      })
      .addCase(breedPets.pending, (state) => {
        state.breeding = true;
        state.error = null;
      })
      .addCase(breedPets.fulfilled, (state, action) => {
        state.breeding = false;
      })
      .addCase(breedPets.rejected, (state, action) => {
        state.breeding = false;
        state.error = action.error.message || '繁殖宠物失败';
      });
  }
});

export default petSlice.reducer;