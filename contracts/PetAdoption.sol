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
    
    // 添加新的宠物类型（仅管理员）
    function addPetType(string memory _petType) external {
        require(msg.sender == petNFT.owner(), "Not authorized");
        
        // 检查是否已存在
        for (uint i = 0; i < availablePetTypes.length; i++) {
            require(keccak256(bytes(availablePetTypes[i])) != keccak256(bytes(_petType)), "Pet type already exists");
        }
        
        availablePetTypes.push(_petType);
    }
    
    // 获取所有可用宠物类型
    function getAllPetTypes() external view returns (string[] memory) {
        return availablePetTypes;
    }
    
    // 获取领养费用
    function getAdoptionFee() external view returns (uint256) {
        return adoptionFee;
    }
}