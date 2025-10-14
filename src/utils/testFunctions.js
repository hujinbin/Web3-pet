// 测试功能辅助函数
import Web3 from 'web3';
import PetABI from '../contracts/PetABI.json';
import PetCoinABI from '../contracts/PetCoinABI.json';
import PetAdoptionABI from '../contracts/PetAdoptionABI.json';
import PetBreedingABI from '../contracts/PetBreedingABI.json';

// 测试连接
export const testConnection = async () => {
  try {
    // 检查是否安装了MetaMask
    if (!window.ethereum) {
      return { success: false, message: '请安装MetaMask钱包' };
    }

    // 连接到以太坊网络
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    
    if (!accounts || accounts.length === 0) {
      return { success: false, message: '无法获取账户，请确保MetaMask已解锁' };
    }

    return { success: true, message: '连接成功', account: accounts[0] };
  } catch (error) {
    return { success: false, message: `连接错误: ${error.message}` };
  }
};

// 测试合约连接
export const testContracts = async (contractAddresses) => {
  try {
    const { petAddress, petCoinAddress, petAdoptionAddress, petBreedingAddress } = contractAddresses;
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    const results = {};

    // 测试Pet合约
    if (petAddress) {
      try {
        const petContract = new web3.eth.Contract(PetABI, petAddress);
        const name = await petContract.methods.name().call();
        results.pet = { success: true, message: `Pet合约连接成功: ${name}` };
      } catch (error) {
        results.pet = { success: false, message: `Pet合约连接失败: ${error.message}` };
      }
    }

    // 测试PetCoin合约
    if (petCoinAddress) {
      try {
        const petCoinContract = new web3.eth.Contract(PetCoinABI, petCoinAddress);
        const balance = await petCoinContract.methods.getBalance(account).call();
        results.petCoin = { success: true, message: `PetCoin合约连接成功，余额: ${balance}` };
      } catch (error) {
        results.petCoin = { success: false, message: `PetCoin合约连接失败: ${error.message}` };
      }
    }

    // 测试PetAdoption合约
    if (petAdoptionAddress) {
      try {
        const petAdoptionContract = new web3.eth.Contract(PetAdoptionABI, petAdoptionAddress);
        const fee = await petAdoptionContract.methods.adoptionFee().call();
        results.petAdoption = { success: true, message: `PetAdoption合约连接成功，领养费用: ${fee}` };
      } catch (error) {
        results.petAdoption = { success: false, message: `PetAdoption合约连接失败: ${error.message}` };
      }
    }

    // 测试PetBreeding合约
    if (petBreedingAddress) {
      try {
        const petBreedingContract = new web3.eth.Contract(PetBreedingABI, petBreedingAddress);
        const fee = await petBreedingContract.methods.breedingFee().call();
        results.petBreeding = { success: true, message: `PetBreeding合约连接成功，繁殖费用: ${fee}` };
      } catch (error) {
        results.petBreeding = { success: false, message: `PetBreeding合约连接失败: ${error.message}` };
      }
    }

    return results;
  } catch (error) {
    return { success: false, message: `测试合约连接错误: ${error.message}` };
  }
};

// 测试签到功能
export const testSignIn = async (petCoinContract, account) => {
  try {
    if (!petCoinContract || !account) {
      return { success: false, message: '合约或账户未初始化' };
    }

    // 检查是否可以签到
    const canSignIn = await petCoinContract.methods.canSignInToday(account).call();
    
    if (!canSignIn) {
      return { success: false, message: '今天已经签到过了' };
    }

    // 执行签到
    const tx = await petCoinContract.methods.signIn().send({ from: account });
    
    // 获取签到后的余额和信息
    const balance = await petCoinContract.methods.getBalance(account).call();
    const signInInfo = await petCoinContract.methods.getSignInInfo(account).call();
    
    return { 
      success: true, 
      message: '签到成功', 
      balance, 
      consecutiveDays: signInInfo.consecutiveDays,
      lastSignInTime: signInInfo.lastSignInTime
    };
  } catch (error) {
    return { success: false, message: `签到错误: ${error.message}` };
  }
};

// 测试领养功能
export const testAdoption = async (petAdoptionContract, petCoinContract, account, petName, petType) => {
  try {
    if (!petAdoptionContract || !petCoinContract || !account) {
      return { success: false, message: '合约或账户未初始化' };
    }

    // 获取领养费用
    const adoptionFee = await petAdoptionContract.methods.adoptionFee().call();
    
    // 检查金币余额
    const balance = await petCoinContract.methods.getBalance(account).call();
    
    if (Number(balance) < Number(adoptionFee)) {
      return { success: false, message: `金币不足，需要 ${adoptionFee} 金币，当前余额 ${balance} 金币` };
    }

    // 授权PetAdoption合约使用PetCoin
    await petCoinContract.methods.approve(petAdoptionContract._address, adoptionFee).send({ from: account });
    
    // 执行领养
    const tx = await petAdoptionContract.methods.adoptPet(petName, petType).send({ from: account });
    
    // 从事件中获取新宠物ID
    let petId = null;
    if (tx.events && tx.events.PetAdopted) {
      petId = tx.events.PetAdopted.returnValues.petId;
    }
    
    return { 
      success: true, 
      message: '领养成功', 
      petId,
      petName,
      petType
    };
  } catch (error) {
    return { success: false, message: `领养错误: ${error.message}` };
  }
};

// 测试繁殖功能
export const testBreeding = async (petBreedingContract, petCoinContract, account, petId1, petId2, childName) => {
  try {
    if (!petBreedingContract || !petCoinContract || !account) {
      return { success: false, message: '合约或账户未初始化' };
    }

    // 获取繁殖费用
    const breedingFee = await petBreedingContract.methods.breedingFee().call();
    
    // 检查金币余额
    const balance = await petCoinContract.methods.getBalance(account).call();
    
    if (Number(balance) < Number(breedingFee)) {
      return { success: false, message: `金币不足，需要 ${breedingFee} 金币，当前余额 ${balance} 金币` };
    }

    // 检查宠物是否可以繁殖
    const pet1CanBreed = await petBreedingContract.methods.canBreed(petId1).call();
    const pet2CanBreed = await petBreedingContract.methods.canBreed(petId2).call();
    
    if (!pet1CanBreed || !pet2CanBreed) {
      return { success: false, message: '所选宠物无法繁殖，请确保它们都可以繁殖且冷却时间已过' };
    }

    // 授权PetBreeding合约使用PetCoin
    await petCoinContract.methods.approve(petBreedingContract._address, breedingFee).send({ from: account });
    
    // 执行繁殖
    const tx = await petBreedingContract.methods.breedPets(petId1, petId2, childName).send({ from: account });
    
    // 从事件中获取新宠物ID
    let childId = null;
    if (tx.events && tx.events.PetsBreed) {
      childId = tx.events.PetsBreed.returnValues.childId;
    }
    
    return { 
      success: true, 
      message: '繁殖成功', 
      childId,
      childName
    };
  } catch (error) {
    return { success: false, message: `繁殖错误: ${error.message}` };
  }
};