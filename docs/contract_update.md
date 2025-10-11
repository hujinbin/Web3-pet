# Web3-Pet 智能合约更新方案

## 1. 合约架构

为了支持金币系统和宠物数据上链，我们将采用以下合约架构：

```
PetCoin.sol       - 金币系统合约
PetNFT.sol        - 宠物NFT合约
PetBreeding.sol   - 宠物繁殖合约
PetAdoption.sol   - 宠物领养合约
PetCore.sol       - 核心合约，整合以上功能
```

## 2. PetCoin 合约设计

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PetCoin is Ownable, ReentrancyGuard {
    // 金币数据结构
    struct UserCoin {
        uint256 balance;       // 金币余额
        uint256 lastSignIn;    // 上次签到时间戳
        uint256 signInStreak;  // 连续签到天数
    }
    
    // 用户金币映射
    mapping(address => UserCoin) public userCoins;
    
    // 每日签到奖励
    uint256 public baseSignInReward = 10;
    uint256 public maxStreakBonus = 50;
    
    // 事件
    event CoinMinted(address indexed user, uint256 amount, string reason);
    event CoinSpent(address indexed user, uint256 amount, string reason);
    event SignIn(address indexed user, uint256 reward, uint256 streak);
    
    // 签到函数
    function signIn() external nonReentrant returns (uint256) {
        UserCoin storage userCoin = userCoins[msg.sender];
        
        // 检查是否已经签到
        require(isNewDay(userCoin.lastSignIn), "Already signed in today");
        
        // 计算连续签到天数
        if (isConsecutiveDay(userCoin.lastSignIn)) {
            userCoin.signInStreak++;
        } else {
            userCoin.signInStreak = 1;
        }
        
        // 计算奖励
        uint256 streakBonus = (userCoin.signInStreak - 1) * 2;
        if (streakBonus > maxStreakBonus) streakBonus = maxStreakBonus;
        
        uint256 reward = baseSignInReward + streakBonus;
        
        // 更新签到时间和余额
        userCoin.lastSignIn = block.timestamp;
        userCoin.balance += reward;
        
        emit SignIn(msg.sender, reward, userCoin.signInStreak);
        emit CoinMinted(msg.sender, reward, "Daily Sign In");
        
        return reward;
    }
    
    // 消费金币
    function spendCoin(address user, uint256 amount, string memory reason) external returns (bool) {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        require(userCoins[user].balance >= amount, "Insufficient balance");
        
        userCoins[user].balance -= amount;
        emit CoinSpent(user, amount, reason);
        
        return true;
    }
    
    // 铸造金币（管理员功能）
    function mintCoin(address user, uint256 amount, string memory reason) external onlyOwner {
        userCoins[user].balance += amount;
        emit CoinMinted(user, amount, reason);
    }
    
    // 查询余额
    function getBalance(address user) external view returns (uint256) {
        return userCoins[user].balance;
    }
    
    // 辅助函数：检查是否是新的一天
    function isNewDay(uint256 lastTimestamp) internal view returns (bool) {
        return lastTimestamp / 86400 < block.timestamp / 86400;
    }
    
    // 辅助函数：检查是否是连续的一天
    function isConsecutiveDay(uint256 lastTimestamp) internal view returns (bool) {
        return (block.timestamp / 86400) - (lastTimestamp / 86400) <= 1;
    }
}
```

## 3. PetNFT 合约设计

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PetNFT is ERC721Enumerable, Ownable {
    // 宠物数据结构
    struct Pet {
        uint256 id;            // 宠物ID
        string name;           // 宠物名称
        string petType;        // 宠物类型
        uint256 dna;           // 宠物DNA，决定外观和属性
        uint256 birthTime;     // 出生时间
        uint256 level;         // 等级
        uint256[] attributes;  // 属性数组[力量,敏捷,智力,体力,魅力]
        uint256 parent1Id;     // 父母ID，如为0则表示初代宠物
        uint256 parent2Id;     // 父母ID，如为0则表示初代宠物
    }
    
    // 宠物数据存储
    mapping(uint256 => Pet) public pets;
    
    // 宠物计数器
    uint256 public petCounter = 0;
    
    // 授权合约地址
    mapping(address => bool) public authorizedContracts;
    
    // 事件
    event PetCreated(uint256 indexed petId, address indexed owner, string name, string petType);
    event PetBred(uint256 indexed petId, uint256 parent1Id, uint256 parent2Id);
    
    constructor() ERC721("Web3Pet", "W3P") {}
    
    // 只允许授权合约调用
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    // 设置授权合约
    function setAuthorizedContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
    }
    
    // 创建宠物
    function createPet(
        address owner,
        string memory name,
        string memory petType,
        uint256 dna,
        uint256[] memory attributes,
        uint256 parent1Id,
        uint256 parent2Id
    ) external onlyAuthorized returns (uint256) {
        petCounter++;
        uint256 newPetId = petCounter;
        
        // 创建宠物数据
        Pet memory newPet = Pet({
            id: newPetId,
            name: name,
            petType: petType,
            dna: dna,
            birthTime: block.timestamp,
            level: 1,
            attributes: attributes,
            parent1Id: parent1Id,
            parent2Id: parent2Id
        });
        
        // 存储宠物数据
        pets[newPetId] = newPet;
        
        // 铸造NFT
        _safeMint(owner, newPetId);
        
        // 触发事件
        if (parent1Id == 0 && parent2Id == 0) {
            emit PetCreated(newPetId, owner, name, petType);
        } else {
            emit PetBred(newPetId, parent1Id, parent2Id);
        }
        
        return newPetId;
    }
    
    // 获取宠物信息
    function getPet(uint256 petId) external view returns (Pet memory) {
        require(_exists(petId), "Pet does not exist");
        return pets[petId];
    }
    
    // 获取用户拥有的所有宠物
    function getPetsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 petCount = balanceOf(owner);
        uint256[] memory result = new uint256[](petCount);
        
        for (uint256 i = 0; i < petCount; i++) {
            result[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return result;
    }
}
```

## 4. PetAdoption 合约设计

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PetNFT.sol";
import "./PetCoin.sol";

contract PetAdoption {
    PetNFT public petNFT;
    PetCoin public petCoin;
    
    // 领养费用
    uint256 public adoptionFee = 100;
    
    // 宠物类型
    string[] public availablePetTypes = ["dog", "cat", "bird", "rabbit", "dragon"];
    
    // 事件
    event PetAdopted(address indexed owner, uint256 petId, string name, string petType);
    
    constructor(address _petNFT, address _petCoin) {
        petNFT = PetNFT(_petNFT);
        petCoin = PetCoin(_petCoin);
    }
    
    // 领养宠物
    function adoptPet(string memory name, string memory petType) external returns (uint256) {
        // 验证宠物类型
        bool validType = false;
        for (uint i = 0; i < availablePetTypes.length; i++) {
            if (keccak256(bytes(availablePetTypes[i])) == keccak256(bytes(petType))) {
                validType = true;
                break;
            }
        }
        require(validType, "Invalid pet type");
        
        // 扣除金币
        require(petCoin.spendCoin(msg.sender, adoptionFee, "Pet Adoption"), "Failed to spend coins");
        
        // 生成随机DNA和属性
        uint256 dna = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, name))) % 10**16;
        
        // 创建属性数组
        uint256[] memory attributes = new uint256[](5);
        for (uint i = 0; i < 5; i++) {
            attributes[i] = (uint256(keccak256(abi.encodePacked(dna, i))) % 100) + 1;
        }
        
        // 创建宠物
        uint256 petId = petNFT.createPet(msg.sender, name, petType, dna, attributes, 0, 0);
        
        emit PetAdopted(msg.sender, petId, name, petType);
        
        return petId;
    }
    
    // 设置领养费用（仅管理员）
    function setAdoptionFee(uint256 _fee) external {
        require(msg.sender == petNFT.owner(), "Not authorized");
        adoptionFee = _fee;
    }
}
```

## 5. PetBreeding 合约设计

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PetNFT.sol";
import "./PetCoin.sol";

contract PetBreeding {
    PetNFT public petNFT;
    PetCoin public petCoin;
    
    // 繁殖费用
    uint256 public breedingFee = 50;
    
    // 冷却时间（24小时）
    uint256 public cooldownTime = 86400;
    
    // 宠物最后繁殖时间
    mapping(uint256 => uint256) public lastBreedingTime;
    
    // 事件
    event PetsBreed(address indexed owner, uint256 parent1Id, uint256 parent2Id, uint256 childId);
    
    constructor(address _petNFT, address _petCoin) {
        petNFT = PetNFT(_petNFT);
        petCoin = PetCoin(_petCoin);
    }
    
    // 繁殖宠物
    function breedPets(uint256 parent1Id, uint256 parent2Id, string memory name) external returns (uint256) {
        // 验证宠物所有权
        require(petNFT.ownerOf(parent1Id) == msg.sender, "Not owner of parent1");
        require(petNFT.ownerOf(parent2Id) == msg.sender, "Not owner of parent2");
        require(parent1Id != parent2Id, "Cannot breed with self");
        
        // 验证冷却时间
        require(block.timestamp >= lastBreedingTime[parent1Id] + cooldownTime, "Parent1 in cooldown");
        require(block.timestamp >= lastBreedingTime[parent2Id] + cooldownTime, "Parent2 in cooldown");
        
        // 扣除金币
        require(petCoin.spendCoin(msg.sender, breedingFee, "Pet Breeding"), "Failed to spend coins");
        
        // 获取父母宠物数据
        PetNFT.Pet memory parent1 = petNFT.getPet(parent1Id);
        PetNFT.Pet memory parent2 = petNFT.getPet(parent2Id);
        
        // 混合DNA
        uint256 childDna = mixDna(parent1.dna, parent2.dna);
        
        // 确定宠物类型（50%概率继承任一父母）
        string memory childType = uint256(keccak256(abi.encodePacked(block.timestamp, childDna))) % 2 == 0 
            ? parent1.petType 
            : parent2.petType;
        
        // 混合属性
        uint256[] memory childAttributes = new uint256[](5);
        for (uint i = 0; i < 5; i++) {
            // 70%概率从父母继承，30%概率随机变异
            if (uint256(keccak256(abi.encodePacked(childDna, i))) % 100 < 70) {
                // 从父母属性中取平均值，并有小幅度浮动
                uint256 avgAttr = (parent1.attributes[i] + parent2.attributes[i]) / 2;
                int256 variation = int256(uint256(keccak256(abi.encodePacked(childDna, i, block.timestamp))) % 21) - 10;
                childAttributes[i] = uint256(int256(avgAttr) + variation);
                if (childAttributes[i] > 100) childAttributes[i] = 100;
                if (childAttributes[i] < 1) childAttributes[i] = 1;
            } else {
                // 随机属性
                childAttributes[i] = (uint256(keccak256(abi.encodePacked(childDna, i, block.timestamp))) % 100) + 1;
            }
        }
        
        // 创建子代宠物
        uint256 childId = petNFT.createPet(
            msg.sender,
            name,
            childType,
            childDna,
            childAttributes,
            parent1Id,
            parent2Id
        );
        
        // 更新繁殖时间
        lastBreedingTime[parent1Id] = block.timestamp;
        lastBreedingTime[parent2Id] = block.timestamp;
        
        emit PetsBreed(msg.sender, parent1Id, parent2Id, childId);
        
        return childId;
    }
    
    // 混合DNA
    function mixDna(uint256 dna1, uint256 dna2) internal view returns (uint256) {
        uint256 newDna = 0;
        uint256 i = 10**15;
        
        // 每一位有50%概率来自任一父母，5%概率发生变异
        while (i > 0) {
            uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, i, dna1, dna2)));
            
            if (rand % 100 < 5) {
                // 变异
                newDna += (rand % 10) * i;
            } else if (rand % 100 < 55) {
                // 继承父亲DNA的这一位
                newDna += (dna1 / i % 10) * i;
            } else {
                // 继承母亲DNA的这一位
                newDna += (dna2 / i % 10) * i;
            }
            
            i = i / 10;
        }
        
        return newDna;
    }
    
    // 设置繁殖费用（仅管理员）
    function setBreedingFee(uint256 _fee) external {
        require(msg.sender == petNFT.owner(), "Not authorized");
        breedingFee = _fee;
    }
    
    // 设置冷却时间（仅管理员）
    function setCooldownTime(uint256 _time) external {
        require(msg.sender == petNFT.owner(), "Not authorized");
        cooldownTime = _time;
    }
}
```

## 6. PetCore 合约设计

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PetNFT.sol";
import "./PetCoin.sol";
import "./PetAdoption.sol";
import "./PetBreeding.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PetCore is Ownable {
    PetNFT public petNFT;
    PetCoin public petCoin;
    PetAdoption public petAdoption;
    PetBreeding public petBreeding;
    
    constructor() {
        // 部署合约
        petNFT = new PetNFT();
        petCoin = new PetCoin();
        petAdoption = new PetAdoption(address(petNFT), address(petCoin));
        petBreeding = new PetBreeding(address(petNFT), address(petCoin));
        
        // 设置授权
        petNFT.setAuthorizedContract(address(petAdoption), true);
        petNFT.setAuthorizedContract(address(petBreeding), true);
        
        // 转移所有权
        petNFT.transferOwnership(msg.sender);
        petCoin.transferOwnership(msg.sender);
    }
}
```

## 7. 合约部署流程

1. 部署 PetCore 合约，它会自动部署其他所有合约
2. 记录各个合约地址，用于前端集成
3. 验证合约功能：
   - 测试签到获取金币
   - 测试领养宠物
   - 测试宠物繁殖

## 8. 前端集成

前端需要与以下合约交互：

1. **PetCoin 合约**：
   - 查询金币余额
   - 执行每日签到
   - 监听金币变动事件

2. **PetNFT 合约**：
   - 查询用户拥有的宠物
   - 获取宠物详细信息
   - 监听宠物创建和繁殖事件

3. **PetAdoption 合约**：
   - 执行宠物领养
   - 查询领养费用

4. **PetBreeding 合约**：
   - 执行宠物繁殖
   - 查询繁殖费用和冷却时间

## 9. 合约升级策略

为了支持未来功能扩展，我们将采用以下升级策略：

1. 使用代理合约模式，允许合约逻辑升级而保持数据不变
2. 实现紧急暂停功能，在发现漏洞时可以暂停合约操作
3. 保留管理员功能，可以调整参数如费用、奖励等

## 10. 安全考虑

1. 使用 OpenZeppelin 库的安全合约
2. 实现重入攻击保护
3. 限制函数访问权限
4. 避免在合约中存储敏感信息
5. 进行全面的测试和审计，包括单元测试、集成测试和端到端测试