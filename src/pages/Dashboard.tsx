import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPets } from '../store/petSlice';
import { connectContract } from '../store/web3Slice';
import type { RootState } from '../store/store';
import PetCard from '../components/PetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Card, Empty, Spin, Alert } from 'antd';
import { PlusOutlined, HeartOutlined } from '@ant-design/icons';

// 合约地址（需要替换为实际部署的合约地址）
const CONTRACT_ADDRESS = '0xYourContractAddress';

interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { pets, loading, error } = useSelector((state: RootState) => state.pet);
  const { contract, account } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();

  useEffect(() => {
    // 连接合约
    if (account && !contract) {
      dispatch(connectContract(CONTRACT_ADDRESS));
    }
    
    // 获取宠物列表
    if (contract && account) {
      dispatch(fetchUserPets());
    }
  }, [contract, account, dispatch]);

  const { Title, Paragraph } = Typography;

  return (
    <div style={{ padding: '24px' }}>
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
      
      {loading && (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Spin size="large" />
        </div>
      )}
      
      {error && (
        <Alert message="错误" description={error} type="error" showIcon style={{ marginBottom: 24 }} />
      )}
      
      {!loading && pets.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 24 }}>
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
          {pets.map(pet => (
            <Col xs={24} sm={12} lg={8} xl={6} key={pet.id}>
              <PetCard 
                pet={pet} 
                onBreed={() => {}}
                showActions={true}
              />
            </Col>
          ))}
        </Row>
      )}
      
      <Card style={{ marginTop: 48 }}>
        <Title level={3}>宠物繁殖中心</Title>
        <Paragraph type="secondary">
          使用两只宠物进行繁殖，创造独特的后代。繁殖需要支付少量ETH作为手续费。
        </Paragraph>
        <Link to="/breed">
          <Button type="default" icon={<HeartOutlined />}>
            前往繁殖中心
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default DashboardPage;