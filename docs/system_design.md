# Web3-Pet 系统设计文档

## 1. 系统概述

Web3-Pet是一个基于区块链技术的电子宠物平台，用户可以领养、培养和合成独特的数字宠物。所有宠物数据和金币数据均存储在区块链上，确保数据的真实性和永久性。

## 2. 金币系统设计

### 2.1 金币基本属性

- **名称**：PetCoin (PTC)
- **存储方式**：链上存储，与用户钱包地址绑定
- **用途**：领养宠物、购买道具、宠物培养、宠物合成等
- **获取方式**：每日签到、完成任务、参与活动等

### 2.2 金币数据结构

```solidity
struct UserCoin {
    uint256 balance;       // 金币余额
    uint256 lastSignIn;    // 上次签到时间戳
    uint256 signInStreak;  // 连续签到天数
}

mapping(address => UserCoin) public userCoins;
```

### 2.3 金币相关功能

1. **每日签到**
   - 用户每天可签到一次获取金币
   - 连续签到有额外奖励
   - 签到时间重置为UTC 0点

2. **金币消费**
   - 领养宠物：100金币/只
   - 宠物合成：50金币/次
   - 其他功能待扩展

3. **金币查询**
   - 用户可随时查询自己的金币余额
   - 金币交易记录可在区块链浏览器中查看

## 3. 宠物领养机制

### 3.1 领养流程

1. 用户连接钱包
2. 选择宠物类型
3. 为宠物命名
4. 支付100金币
5. 智能合约生成随机属性的宠物
6. 宠物NFT铸造并转移到用户钱包

### 3.2 宠物数据结构

```solidity
struct Pet {
    uint256 id;            // 宠物ID
    string name;           // 宠物名称
    string petType;        // 宠物类型
    uint256 dna;           // 宠物DNA，决定外观和属性
    uint256 birthTime;     // 出生时间
    uint256 level;         // 等级
    uint256[] attributes;  // 属性数组[力量,敏捷,智力,体力,魅力]
    address owner;         // 所有者地址
    uint256 parent1Id;     // 父母ID，如为0则表示初代宠物
    uint256 parent2Id;     // 父母ID，如为0则表示初代宠物
}

mapping(uint256 => Pet) public pets;
mapping(address => uint256[]) public ownerToPets;
```

### 3.3 宠物合成机制

1. 用户选择两只已拥有的宠物
2. 支付50金币
3. 智能合约根据父母宠物的DNA和属性，生成新的宠物
4. 新宠物继承父母的部分特征，并有一定概率产生变异
5. 新宠物NFT铸造并转移到用户钱包

## 4. 智能合约接口设计

### 4.1 金币相关接口

```solidity
// 查询金币余额
function getBalance(address user) external view returns (uint256);

// 每日签到
function signIn() external returns (uint256 reward);

// 转移金币
function transferCoin(address to, uint256 amount) external returns (bool);

// 消费金币
function spendCoin(uint256 amount) external returns (bool);
```

### 4.2 宠物相关接口

```solidity
// 领养宠物
function adoptPet(string memory name, string memory petType) external returns (uint256 petId);

// 查询宠物信息
function getPet(uint256 petId) external view returns (Pet memory);

// 查询用户拥有的宠物
function getPetsByOwner(address owner) external view returns (uint256[] memory);

// 宠物合成
function breedPets(uint256 pet1Id, uint256 pet2Id) external returns (uint256 newPetId);
```

## 5. 前端实现计划

### 5.1 页面更新

1. **导航栏**：添加金币余额显示
2. **Dashboard**：添加签到按钮和金币信息展示
3. **领养页面**：更新为需要金币支付
4. **合成页面**：实现宠物选择和合成功能

### 5.2 状态管理

在Redux中添加金币相关状态：

```typescript
interface CoinState {
  balance: number;
  lastSignIn: number;
  signInStreak: number;
  loading: boolean;
  error: string | null;
}

// Actions
const signIn = createAsyncThunk('coin/signIn', async (_, { getState }) => {
  // 实现签到逻辑
});

const spendCoin = createAsyncThunk('coin/spend', async (amount: number, { getState }) => {
  // 实现消费逻辑
});
```

## 6. 实现优先级

1. 智能合约更新：金币系统和宠物数据结构
2. 前端金币余额显示
3. 领养页面更新，添加金币支付
4. 每日签到功能
5. 宠物合成功能

## 7. 未来扩展

1. 宠物培养和升级系统
2. 宠物对战功能
3. 宠物市场，允许用户交易宠物
4. 社区功能，用户互动