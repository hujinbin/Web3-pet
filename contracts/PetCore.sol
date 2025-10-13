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
    
    constructor() Ownable(msg.sender) {
        // 部署合约
        petNFT = new PetNFT();
        petCoin = new PetCoin();
        petAdoption = new PetAdoption(address(petNFT), address(petCoin));
        petBreeding = new PetBreeding(address(petNFT), address(petCoin));
        
        // 设置授权
        petNFT.setAuthorizedContract(address(petAdoption), true);
        petNFT.setAuthorizedContract(address(petBreeding), true);
    }
    
    // 获取所有合约地址
    function getContractAddresses() external view returns (
        address nftAddress,
        address coinAddress,
        address adoptionAddress,
        address breedingAddress
    ) {
        return (
            address(petNFT),
            address(petCoin),
            address(petAdoption),
            address(petBreeding)
        );
    }
}