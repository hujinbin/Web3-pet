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
    
    // 检查宠物是否可以繁殖
    function canBreed(uint256 petId) external view returns (bool) {
        return block.timestamp >= lastBreedingTime[petId] + cooldownTime;
    }
    
    // 获取宠物冷却剩余时间
    function getCooldownTime(uint256 petId) external view returns (uint256) {
        uint256 lastBreed = lastBreedingTime[petId];
        if (block.timestamp >= lastBreed + cooldownTime) {
            return 0;
        }
        return (lastBreed + cooldownTime) - block.timestamp;
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