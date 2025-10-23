import React from 'react';
import { Typography } from 'antd';
import { GoldOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CoinDisplayProps {
  value: number;
  showLabel?: boolean;
  sufficient?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ value, showLabel = true, sufficient = true }) => {
  // 直接从 props 获取金币数
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <GoldOutlined style={{ color: '#FFD700', fontSize: 20, marginRight: 4 }} />
      <Text strong style={{ color: sufficient ? '#333' : '#f5222d' }}>{value}</Text>
      {showLabel && <span style={{ marginLeft: 4 }}>金币</span>}
    </div>
  );
};

export default CoinDisplay;