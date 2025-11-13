import React from 'react';
import { Row, Col, Typography, Card, Space, Button, Tag } from 'antd';
import PetCard from '../components/PetCard';

type MarketItem = {
  id: number;
  name: string;
  type: string;
  rarity: string;
  level: number;
  experience: number;
  birthTime: number;
  lastBreedTime: number;
  canBreed: boolean;
  owner: string;
  dna: string;
  imageUrl: string;
  price: number;
  currency: 'ETH' | 'PET';
  seller: string;
};

const mockMarket: MarketItem[] = [
  {
    id: 101,
    name: '霜牙猎犬',
    type: 'dog',
    rarity: 'epic',
    level: 12,
    experience: 860,
    birthTime: Date.now() - 1000 * 60 * 60 * 24 * 40,
    lastBreedTime: Date.now() - 1000 * 60 * 60 * 24 * 10,
    canBreed: true,
    owner: '0xSellerA',
    dna: '0xabc',
    imageUrl: 'https://picsum.photos/seed/market101/400/300',
    price: 0.25,
    currency: 'ETH',
    seller: '0xSellerA'
  },
  {
    id: 102,
    name: '星辉猫',
    type: 'cat',
    rarity: 'rare',
    level: 8,
    experience: 420,
    birthTime: Date.now() - 1000 * 60 * 60 * 24 * 25,
    lastBreedTime: Date.now() - 1000 * 60 * 60 * 24 * 5,
    canBreed: false,
    owner: '0xSellerB',
    dna: '0xdef',
    imageUrl: 'https://picsum.photos/seed/market102/400/300',
    price: 1200,
    currency: 'PET',
    seller: '0xSellerB'
  },
  {
    id: 103,
    name: '晨光鸟',
    type: 'bird',
    rarity: 'uncommon',
    level: 5,
    experience: 210,
    birthTime: Date.now() - 1000 * 60 * 60 * 24 * 15,
    lastBreedTime: Date.now() - 1000 * 60 * 60 * 24 * 2,
    canBreed: true,
    owner: '0xSellerC',
    dna: '0xghi',
    imageUrl: 'https://picsum.photos/seed/market103/400/300',
    price: 450,
    currency: 'PET',
    seller: '0xSellerC'
  }
];

const Marketplace: React.FC = () => {
  const { Title, Text } = Typography;

  return (
    <div>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Title level={2} style={{ marginBottom: 0 }}>市场</Title>
        <Text type="secondary">浏览在售宠物，支持使用 ETH 或 PET 金币购买。</Text>
      </Space>

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        {mockMarket.map(item => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              bordered={false}
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              bodyStyle={{ padding: 16 }}
            >
              <PetCard pet={item} />
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color={item.currency === 'ETH' ? 'blue' : 'gold'}>{item.currency}</Tag>
                  <Title level={4} style={{ margin: 0, fontSize: 18 }}>{item.price}</Title>
                </Space>
                <Button type="primary">购买</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Marketplace;

