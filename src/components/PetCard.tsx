import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Tag, Space, Button, Statistic, Row, Col } from 'antd';
import { HeartOutlined, ThunderboltOutlined, CalendarOutlined, IdcardOutlined } from '@ant-design/icons';

interface PetCardProps {
  pet: any;
  onBreed?: () => void;
  showActions?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onBreed, showActions = false }) => {
  // 计算宠物年龄
  const ageInDays = Math.floor((Date.now() - pet.birthTime) / (1000 * 60 * 60 * 24));
  
  // 根据稀有度设置颜色
  const rarityColors: { [key: string]: string } = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  };
  
  // 根据类型设置图标
  const typeIcons: { [key: string]: string } = {
    dog: 'fa-dog',
    cat: 'fa-cat',
    bird: 'fa-dove',
    rabbit: 'fa-rabbit',
    dragon: 'fa-dragon'
  };
  
  const { Title, Text } = Typography;

  // 根据稀有度设置颜色
  const rarityTagColors: { [key: string]: string } = {
    common: 'default',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'gold'
  };

  return (
    <Card
      hoverable
      cover={
        <div style={{ position: 'relative' }}>
          <img 
            src={pet.imageUrl} 
            alt={`宠物 ${pet.name}`} 
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
          <Tag color="white" style={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            background: 'rgba(255, 255, 255, 0.8)'
          }}>
            {pet.type}
          </Tag>
        </div>
      }
      actions={showActions ? [
        <Link to={`/pet/${pet.id}`} key="details">
          <Button type="link">查看详情</Button>
        </Link>,
        pet.canBreed && (
          <Button 
            type="link" 
            onClick={onBreed} 
            key="breed"
            icon={<HeartOutlined />}
          >
            繁殖
          </Button>
        )
      ].filter(Boolean) : [
        <Link to={`/pet/${pet.id}`} key="details">
          <Button type="link">查看详情</Button>
        </Link>
      ]}
    >
      <div style={{ marginBottom: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>{pet.name}</Title>
          </Col>
          <Col>
            <Tag color={rarityTagColors[pet.rarity] || 'default'}>
              {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
            </Tag>
          </Col>
        </Row>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic 
            title="等级" 
            value={pet.level} 
            prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />} 
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="年龄" 
            value={`${ageInDays}天`} 
            prefix={<CalendarOutlined style={{ color: '#1890ff' }} />} 
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="ID" 
            value={`#${pet.id}`} 
            prefix={<IdcardOutlined style={{ color: '#722ed1' }} />} 
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title="可繁殖" 
            value={pet.canBreed ? '是' : '否'} 
            prefix={<HeartOutlined style={{ color: '#f5222d' }} />} 
            valueStyle={{ fontSize: '14px' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default PetCard;