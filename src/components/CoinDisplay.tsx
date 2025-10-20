import React, { useState, useEffect } from 'react';
import { Typography, Badge, Tooltip, Popover, List, Spin } from 'antd';
import { GoldOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import Web3 from 'web3';
import type { RootState } from '../store/store';

const { Text } = Typography;

interface CoinDisplayProps {
  size?: 'small' | 'default' | 'large';
  showLabel?: boolean;
}

interface Transaction {
  amount: number;
  type: 'in' | 'out';
  reason: string;
  timestamp: number;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ 
  size = 'default', 
  showLabel = true 
}) => {
  const dispatch = useDispatch();
  const { account, web3Instance, coinContract } = useSelector((state: RootState) => state.web3);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [animateChange, setAnimateChange] = useState<boolean>(false);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  // 获取金币余额
  const fetchBalance = async () => {
    if (!web3Instance || !account || !coinContract) return;
    
    try {
      setLoading(true);
      const balanceWei = await coinContract.methods.getBalance(account).call();
      const balanceNumber = parseInt(balanceWei);
      
      // 如果余额变化，触发动画
      if (balance !== null && balanceNumber !== balance) {
        setChangeAmount(balanceNumber - balance);
        setAnimateChange(true);
        setTimeout(() => setAnimateChange(false), 2000);
      }
      
      setBalance(balanceNumber);
      dispatch(updateBalance(balanceNumber));
    } catch (error) {
      console.error('Error fetching coin balance:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听金币变动事件
  const setupEventListeners = async () => {
    if (!web3Instance || !account || !coinContract) return;
    
    try {
      // 监听金币铸造事件
      coinContract.events.CoinMinted({
        filter: { user: account }
      })
      .on('data', (event: any) => {
        const { user, amount, reason } = event.returnValues;
        if (user.toLowerCase() === account.toLowerCase()) {
          setTransactions(prev => [{
            amount: parseInt(amount),
            type: 'in',
            reason,
            timestamp: Date.now()
          }, ...prev].slice(0, 5));
          fetchBalance();
        }
      });
      
      // 监听金币消费事件
      coinContract.events.CoinSpent({
        filter: { user: account }
      })
      .on('data', (event: any) => {
        const { user, amount, reason } = event.returnValues;
        if (user.toLowerCase() === account.toLowerCase()) {
          setTransactions(prev => [{
            amount: parseInt(amount),
            type: 'out',
            reason,
            timestamp: Date.now()
          }, ...prev].slice(0, 5));
          fetchBalance();
        }
      });
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  };

  useEffect(() => {
    if (web3Instance && account && coinContract) {
      fetchBalance();
      setupEventListeners();
    }
  }, [web3Instance, account, coinContract]);

  // 定期刷新余额
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBalance();
    }, 30000); // 每30秒刷新一次
    
    return () => clearInterval(interval);
  }, [web3Instance, account, coinContract]);

  // 交易记录内容
  const transactionContent = (
    <List
      size="small"
      header={<Text strong>最近交易记录</Text>}
      bordered
      dataSource={transactions}
      renderItem={(item) => (
        <List.Item>
          <Text type={item.type === 'in' ? 'success' : 'danger'}>
            {item.type === 'in' ? '+' : '-'}{item.amount} 金币
          </Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            {item.reason}
          </Text>
        </List.Item>
      )}
      locale={{ emptyText: '暂无交易记录' }}
    />
  );

  // 根据size调整样式
  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 18;
      default: return 14;
    }
  };

  return (
    <Popover 
      content={transactionContent} 
      title="金币余额" 
      trigger="click"
      placement="bottomRight"
    >
      <Badge count={animateChange ? (
        <Text 
          style={{ 
            color: changeAmount > 0 ? '#52c41a' : '#ff4d4f',
            fontSize: getFontSize() * 0.8,
            animation: 'fadeOut 2s forwards'
          }}
        >
          {changeAmount > 0 ? `+${changeAmount}` : changeAmount}
        </Text>
      ) : 0}>
        <Tooltip title="点击查看交易记录">
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '4px 8px',
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '16px'
            }}
          >
            <GoldOutlined 
              style={{ 
                color: '#F59E0B', 
                fontSize: getIconSize(),
                marginRight: showLabel ? 8 : 0
              }} 
            />
            {showLabel && (
              <Text 
                style={{ 
                  color: '#F59E0B', 
                  fontSize: getFontSize(),
                  fontWeight: 'bold'
                }}
              >
                {loading ? <Spin size="small" /> : balance ?? 0}
              </Text>
            )}
          </div>
        </Tooltip>
      </Badge>
    </Popover>
  );
};

export default CoinDisplay;