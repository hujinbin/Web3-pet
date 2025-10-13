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
    
    constructor() Ownable(msg.sender) {}
    
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
    
    // 查询签到信息
    function getSignInInfo(address user) external view returns (uint256 lastSignIn, uint256 streak) {
        UserCoin memory userCoin = userCoins[user];
        return (userCoin.lastSignIn, userCoin.signInStreak);
    }
    
    // 检查今天是否可以签到
    function canSignInToday(address user) external view returns (bool) {
        return isNewDay(userCoins[user].lastSignIn);
    }
    
    // 辅助函数：检查是否是新的一天
    function isNewDay(uint256 lastTimestamp) internal view returns (bool) {
        return lastTimestamp / 86400 < block.timestamp / 86400;
    }
    
    // 辅助函数：检查是否是连续的一天
    function isConsecutiveDay(uint256 lastTimestamp) internal view returns (bool) {
        return (block.timestamp / 86400) - (lastTimestamp / 86400) <= 1;
    }
    
    // 设置基础签到奖励（管理员功能）
    function setBaseSignInReward(uint256 _reward) external onlyOwner {
        baseSignInReward = _reward;
    }
    
    // 设置最大连续签到奖励（管理员功能）
    function setMaxStreakBonus(uint256 _bonus) external onlyOwner {
        maxStreakBonus = _bonus;
    }
}