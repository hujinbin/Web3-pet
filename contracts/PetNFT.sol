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
    
    constructor() ERC721("Web3Pet", "W3P") Ownable(msg.sender) {}
    
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
    
    // 升级宠物等级（仅授权合约可调用）
    function levelUp(uint256 petId) external onlyAuthorized {
        require(_exists(petId), "Pet does not exist");
        pets[petId].level += 1;
    }
    
    // 更新宠物属性（仅授权合约可调用）
    function updateAttributes(uint256 petId, uint256[] memory newAttributes) external onlyAuthorized {
        require(_exists(petId), "Pet does not exist");
        require(newAttributes.length == pets[petId].attributes.length, "Invalid attributes length");
        pets[petId].attributes = newAttributes;
    }
}