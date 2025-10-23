import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPets } from '../store/petSlice';
import { connectContract } from '../store/web3Slice';
import type { RootState } from '../store/store';
import PetCard from '../components/PetCard';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Card, Empty, Spin, Alert, Statistic, Carousel, Divider, Badge, Space, Tag } from 'antd';
import { PlusOutlined, HeartOutlined, TrophyOutlined, FireOutlined, ThunderboltOutlined, ShoppingOutlined } from '@ant-design/icons';

// 合约地址（需要替换为实际部署的合约地址）
const CONTRACT_ADDRESS = '0xYourContractAddress';

interface DashboardPageProps { [key: string]: unknown }

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { pets, loading, error } = useSelector((state: RootState) => state.pet);
  const { contract, account } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // 连接合约
    if (account && !contract) {
      dispatch<any>(connectContract(CONTRACT_ADDRESS));
    }
    
    // 获取宠物列表
    if (contract && account) {
      dispatch<any>(fetchUserPets());
    }
  }, [contract, account, dispatch]);

  const { Title, Paragraph, Text } = Typography;
  
  // 模拟一些统计数据
  const stats = {
    totalPets: pets.length,
    rarePets: pets.filter(pet => pet.rarity === 'rare' || pet.rarity === 'epic' || pet.rarity === 'legendary').length,
    breedingReady: pets.filter(pet => pet.canBreed).length,
    totalValue: pets.length * 0.05
  };
  
  // 轮播图内容
  const carouselItems = [
    {
      title: '宠物繁殖活动',
      description: '参与本周的繁殖活动，有机会获得稀有宠物！',
      buttonText: '了解详情',
      buttonLink: '/breed',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'
    },
    {
      title: '新手礼包',
      description: '新用户可以免费领取一只初级宠物，开始您的养成之旅！',
      buttonText: '立即领取',
      buttonLink: '/adopt',
      color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    {
      title: '宠物竞技场',
      description: '让您的宠物与其他玩家的宠物一较高下，赢取丰厚奖励！',
      buttonText: '即将上线',
      buttonLink: '#',
      color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    }
  ];

  return (
    <div>
      {/* 欢迎横幅 */}
      <Carousel autoplay effect="fade" style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
        {carouselItems.map((item, index) => (
          <div key={index}>
            <div style={{ 
              height: 240, 
              background: item.color,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>{item.title}</Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16, marginBottom: 24 }}>
                {item.description}
              </Paragraph>
              <Link to={item.buttonLink}>
                <Button type="primary" size="large" ghost>
                  {item.buttonText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 统计数据 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic 
              title="总宠物数量" 
              value={stats.totalPets} 
              prefix={<TrophyOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic 
              title="稀有宠物" 
              value={stats.rarePets} 
              prefix={<FireOutlined style={{ color: '#722ed1' }} />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic 
              title="可繁殖宠物" 
              value={stats.breedingReady} 
              prefix={<HeartOutlined style={{ color: '#eb2f96' }} />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic 
              title="总价值 (ETH)" 
              value={stats.totalValue} 
              precision={2} 
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />} 
            />
          </Card>
        </Col>
      </Row>

      {/* 宠物列表标题 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ marginBottom: 8 }}>你的宠物</Title>
          <Paragraph type="secondary">管理和培育你的数字宠物</Paragraph>
        </Col>
        <Col>
          <Link to="/adopt">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              领养新宠物
            </Button>
          </Link>
        </Col>
      </Row>
      
      {/* 宠物分类标签 */}
      <div style={{ marginBottom: 24 }}>
        <Space size="middle">
          <Tag 
            color={activeTab === 'all' ? 'blue' : 'default'} 
            style={{ padding: '4px 16px', cursor: 'pointer' }}
            onClick={() => setActiveTab('all')}
          >
            全部
          </Tag>
          <Tag 
            color={activeTab === 'rare' ? 'purple' : 'default'} 
            style={{ padding: '4px 16px', cursor: 'pointer' }}
            onClick={() => setActiveTab('rare')}
          >
            稀有
          </Tag>
          <Tag 
            color={activeTab === 'breeding' ? 'pink' : 'default'} 
            style={{ padding: '4px 16px', cursor: 'pointer' }}
            onClick={() => setActiveTab('breeding')}
          >
            可繁殖
          </Tag>
        </Space>
      </div>
      
      {/* 加载状态 */}
      {loading && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}
      
      {/* 错误信息 */}
      {error && (
        <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />
      )}
      
      {/* 空状态 */}
      {!loading && pets.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48, borderRadius: 12 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <Title level={4}>还没有宠物</Title>
                <Paragraph type="secondary">点击下方按钮领养你的第一只宠物</Paragraph>
              </span>
            }
          >
            <Link to="/adopt">
              <Button type="primary" icon={<HeartOutlined />} size="large">
                领养宠物
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          {pets
            .filter(pet => {
              if (activeTab === 'all') return true;
              if (activeTab === 'rare') return ['rare', 'epic', 'legendary'].includes(pet.rarity);
              if (activeTab === 'breeding') return pet.canBreed;
              return true;
            })
            .map(pet => (
              <Col xs={24} sm={12} lg={8} xl={6} key={pet.id}>
                <Badge.Ribbon 
                  text={pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)} 
                  color={pet.rarity === 'legendary' ? 'gold' : pet.rarity === 'epic' ? 'purple' : pet.rarity === 'rare' ? 'blue' : 'default'}
                  style={{ display: pet.rarity === 'common' ? 'none' : 'block' }}
                >
                  <PetCard 
                    pet={pet} 
                    onBreed={() => {}}
                    showActions={true}
                  />
                </Badge.Ribbon>
              </Col>
          ))}
        </Row>
      )}
      
      <Divider style={{ margin: '48px 0 24px' }} />
      
      {/* 功能卡片 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>宠物繁殖中心</Title>}
            extra={<Link to="/breed"><Button type="primary" icon={<HeartOutlined />}>前往</Button></Link>}
            style={{ height: '100%' }}
          >
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              使用两只宠物进行繁殖，创造独特的后代。繁殖需要支付少量ETH作为手续费。
            </Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li><Text>组合不同稀有度的宠物获得更好的后代</Text></li>
              <li><Text>每次繁殖有机会获得稀有特性</Text></li>
              <li><Text>繁殖后需要等待冷却时间</Text></li>
            </ul>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>宠物市场</Title>}
            extra={<Link to="/marketplace"><Button type="primary" icon={<ShoppingOutlined />}>前往</Button></Link>}
            style={{ height: '100%' }}
          >
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              在市场上购买、出售和交易宠物。发现稀有宠物或出售您培育的宠物。
            </Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li><Text>浏览其他玩家出售的宠物</Text></li>
              <li><Text>设置价格出售您的宠物</Text></li>
              <li><Text>参与宠物拍卖获取稀有宠物</Text></li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;