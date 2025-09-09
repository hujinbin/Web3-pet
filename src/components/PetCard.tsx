import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Tag, Space, Button, Statistic, Row, Col, Avatar, Progress, Tooltip } from 'antd';
import { HeartOutlined, ThunderboltOutlined, CalendarOutlined, IdcardOutlined, StarOutlined, TrophyOutlined } from '@ant-design/icons';

interface PetCardProps {
  pet: any;
  onBreed?: () => void;
  showActions?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onBreed, showActions = false }) => {
  // 计算宠物年龄
  const ageInDays = Math.floor((Date.now() - pet.birthTime) / (1000 * 60 * 60 * 24));
  
  // 根据稀有度设置颜色和经验值
  const rarityInfo: { [key: string]: {color: string, expMultiplier: number} } = {
    common: {color: '#8c8c8c', expMultiplier: 1},
    uncommon: {color: '#52c41a', expMultiplier: 1.2},
    rare: {color: '#1890ff', expMultiplier: 1.5},
    epic: {color: '#722ed1', expMultiplier: 2},
    legendary: {color: '#faad14', expMultiplier: 3}
  };
  
  // 根据类型设置图标和颜色
  const typeInfo: { [key: string]: {icon: React.ReactNode, color: string} } = {
    dog: {icon: '🐕', color: '#91caff'},
    cat: {icon: '🐈', color: '#d3adf7'},
    bird: {icon: '🐦', color: '#b7eb8f'},
    rabbit: {icon: '🐇', color: '#ffccc7'},
    dragon: {icon: '🐉', color: '#ffe58f'}
  };
  
  // 计算经验值进度
  const expProgress = Math.min(100, Math.floor((pet.experience / (pet.level * 100)) * 100));
  
  // 计算宠物属性总和
  const totalStats = (pet.strength || 0) + (pet.agility || 0) + (pet.intelligence || 0) + (pet.vitality || 0);
  
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
      style={{ borderRadius: 8, overflow: 'hidden' }}
      bodyStyle={{ padding: 16 }}
      cover={
        <div style={{ position: 'relative' }}>
          <img 
            src={pet.imageUrl} 
            alt={`宠物 ${pet.name}`} 
            style={{ 
              width: '100%', 
              height: 200, 
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
          />
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)',
          }} />
          <Tooltip title={`${pet.type} 类型`}>
            <Avatar 
              style={{ 
                position: 'absolute', 
                top: 8, 
                left: 8, 
                background: typeInfo[pet.type]?.color || '#1890ff',
                fontSize: '18px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {typeInfo[pet.type]?.icon || pet.type.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
          <div style={{ 
            position: 'absolute', 
            bottom: 8, 
            left: 8, 
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Tag color={rarityTagColors[pet.rarity] || 'default'} style={{ margin: 0 }}>
              {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
            </Tag>
            <Tooltip title={`总属性值: ${totalStats}`}>
              <Tag icon={<TrophyOutlined />} color="processing" style={{ margin: 0 }}>
                {totalStats}
              </Tag>
            </Tooltip>
          </div>
        </div>
      }
      actions={showActions ? [
        <Link to={`/pet/${pet.id}`} key="details">
          <Button type="text">查看详情</Button>
        </Link>,
        pet.canBreed && (
          <Button 
            type="text" 
            onClick={onBreed} 
            key="breed"
            icon={<HeartOutlined />}
            style={{ color: '#eb2f96' }}
          >
            繁殖
          </Button>
        )
      ].filter(Boolean) : [
        <Link to={`/pet/${pet.id}`} key="details">
          <Button type="text">查看详情</Button>
        </Link>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
          <Col>
            <Title level={4} style={{ margin: 0, fontSize: 18 }}>{pet.name}</Title>
          </Col>
          <Col>
            <Space>
              <Tooltip title={`等级 ${pet.level}`}>
                <Tag color="gold" icon={<StarOutlined />}>{pet.level}</Tag>
              </Tooltip>
            </Space>
          </Col>
        </Row>
        
        <Tooltip title={`经验值: ${pet.experience || 0}/${pet.level * 100}`}>
          <Progress 
            percent={expProgress} 
            size="small" 
            showInfo={false} 
            strokeColor={rarityInfo[pet.rarity]?.color || '#1890ff'}
            style={{ marginBottom: 16 }}
          />
        </Tooltip>
      </div>
      
      <Row gutter={[12, 16]}>
        <Col span={12}>
          <Statistic 
            title={<Text type="secondary" style={{ fontSize: 12 }}>等级</Text>} 
            value={pet.level} 
            prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />} 
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title={<Text type="secondary" style={{ fontSize: 12 }}>年龄</Text>} 
            value={`${ageInDays}天`} 
            prefix={<CalendarOutlined style={{ color: '#1890ff' }} />} 
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title={<Text type="secondary" style={{ fontSize: 12 }}>ID</Text>} 
            value={`#${pet.id.toString().padStart(4, '0')}`} 
            prefix={<IdcardOutlined style={{ color: '#722ed1' }} />} 
            valueStyle={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </Col>
        <Col span={12}>
          <Statistic 
            title={<Text type="secondary" style={{ fontSize: 12 }}>可繁殖</Text>} 
            value={pet.canBreed ? '是' : '否'} 
            prefix={<HeartOutlined style={{ color: pet.canBreed ? '#eb2f96' : '#d9d9d9' }} />} 
            valueStyle={{ 
              fontSize: '14px', 
              fontWeight: 'bold',
              color: pet.canBreed ? '#eb2f96' : 'inherit'
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default PetCard;