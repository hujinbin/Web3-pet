import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchUserPets } from '../store/petSlice';
import { Row, Col, Typography, Empty, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import PetCard from '../components/PetCard';

const Pets: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pets, loading } = useSelector((state: RootState) => state.pet);
  const { account, contract } = useSelector((state: RootState) => state.web3);
  const { Title, Text } = Typography;

  useEffect(() => {
    if (account && contract) {
      dispatch(fetchUserPets());
    }
  }, [account, contract, dispatch]);

  return (
    <div>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Title level={2} style={{ marginBottom: 0 }}>我的宠物</Title>
        <Text type="secondary">查看并管理你拥有的宠物，进入详情或前往繁殖中心。</Text>
      </Space>

      {!account || !contract ? (
        <div style={{ padding: 48 }}>
          <Empty description="请连接钱包并加载合约后查看宠物" />
        </div>
      ) : pets.length === 0 && !loading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Empty description="你还没有宠物，去领养一只吧！" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/adopt')}>前往领养</Button>
        </div>
      ) : (
        <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
          {pets.map(pet => (
            <Col key={pet.id} xs={24} sm={12} md={8} lg={6}>
              <PetCard pet={pet} showActions />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Pets;

