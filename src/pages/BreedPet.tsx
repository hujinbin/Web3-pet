import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Input, 
  Alert, 
  Spin, 
  Empty, 
  Divider,
  Modal,
  Result,
  Tooltip,
  Badge
} from 'antd';
import { 
  HeartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  GoldOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import CoinDisplay from '../components/CoinDisplay';

const { Title, Paragraph, Text } = Typography;

interface BreedPetPageProps {}

const BreedPetPage: React.FC<BreedPetPageProps> = () => {
  const { pets, loading, error } = useSelector((state: RootState) => state.pet);
  const { account, petCoinBalance } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [selectedPet1, setSelectedPet1] = useState<number | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<number | null>(null);
  const [childName, setChildName] = useState('');
  const [breedingError, setBreedingError] = useState<string | null>(null);
  const [breedingSuccess, setBreedingSuccess] = useState(false);
  const [breeding, setBreeding] = useState(false);
  const [breedingFee] = useState<string>('0');
  const [newPetId, setNewPetId] = useState<number | null>(null);

  // 注释或删除所有 petBreedingContract 相关逻辑，页面仅保留 UI 展示和本地状态逻辑

  // 处理宠物选择
  const handlePetSelect = (petId: number) => {
    if (selectedPet1 === petId) {
      setSelectedPet1(null);
    } else if (selectedPet2 === petId) {
      setSelectedPet2(null);
    } else if (!selectedPet1) {
      setSelectedPet1(petId);
    } else if (!selectedPet2 && petId !== selectedPet1) {
      setSelectedPet2(petId);
    }
  };

  // 处理繁殖提交
  const handleBreedSubmit = async () => {
    if (!selectedPet1 || !selectedPet2 || !account) {
      setBreedingError('请选择两只不同的宠物并输入子代名称');
      return;
    }
    
    if (!childName.trim()) {
      setBreedingError('请为子代宠物起一个名字');
      return;
    }

    // 检查金币余额
    if (Number(petCoinBalance) < Number(breedingFee)) {
      setBreedingError(`金币不足，繁殖需要 ${breedingFee} 金币，当前余额 ${petCoinBalance} 金币`);
      return;
    }

    setBreeding(true);
    setBreedingError(null);

    try {
      // 模拟繁殖过程
      setTimeout(() => {
        setNewPetId(Date.now()); // 使用当前时间戳模拟新宠物ID
        setBreedingSuccess(true);
        
        // 更新金币余额
        dispatch({ type: 'web3/getPetCoinBalance' });
        
        // 重置选择
        setChildName('');
      }, 2000);
    } catch (err: unknown) {
      setBreedingError((err as Error).message || '繁殖失败，请稍后再试');
    } finally {
      setBreeding(false);
    }
  };

  // 渲染宠物列表
  const renderPetList = () => {
    if (loading) {
      return <Spin size="large" tip="加载宠物中..." />;
    }

    if (!pets || pets.length === 0) {
      return (
        <Empty
          description="你还没有宠物，请先领养宠物"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/adopt')}>
            去领养宠物
          </Button>
        </Empty>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {pets.map(pet => (
          <Col xs={24} sm={12} md={8} lg={6} key={pet.id}>
            <Card
              hoverable
              style={{ 
                borderColor: selectedPet1 === pet.id || selectedPet2 === pet.id ? '#1890ff' : undefined,
                borderWidth: selectedPet1 === pet.id || selectedPet2 === pet.id ? '2px' : '1px'
              }}
              cover={
                <div style={{ position: 'relative' }}>
                  <img 
                    alt={pet.name} 
                    src={pet.imageUrl} 
                    style={{ height: '200px', objectFit: 'cover' }} 
                  />
                  {selectedPet1 === pet.id && (
                    <Badge 
                      count="宠物1" 
                      style={{ backgroundColor: '#1890ff' }}
                      offset={[-5, 5]}
                    />
                  )}
                  {selectedPet2 === pet.id && (
                    <Badge 
                      count="宠物2" 
                      style={{ backgroundColor: '#52c41a' }}
                      offset={[-5, 5]}
                    />
                  )}
                </div>
              }
              onClick={() => handlePetSelect(pet.id)}
            >
              <Card.Meta
                title={pet.name}
                description={
                  <div>
                    <div>类型: {pet.type}</div>
                    <div>等级: {pet.level}</div>
                    <div style={{ marginTop: '8px' }}>
                      {pet.canBreed ? (
                        <Text type="success">
                          <CheckCircleOutlined /> 可以繁殖
                        </Text>
                      ) : (
                        <Text type="warning">
                          <ClockCircleOutlined /> 冷却中
                        </Text>
                      )}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };
  // 渲染繁殖表单
  const renderBreedingForm = () => {
    if (!selectedPet1 || !selectedPet2) {
      return (
        <Alert
          message="请选择两只宠物"
          description="请从下方列表中选择两只不同的宠物进行繁殖"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    const pet1 = pets.find(p => p.id === selectedPet1);
    const pet2 = pets.find(p => p.id === selectedPet2);

    if (!pet1 || !pet2) return null;

    return (
      <div>
        <Divider>已选择的宠物</Divider>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card title="宠物 1" bordered>
              <Card.Meta
                avatar={<img src={pet1.imageUrl} alt={pet1.name} style={{ width: 60, height: 60, borderRadius: '50%' }} />}
                title={pet1.name}
                description={`类型: ${pet1.type} | 等级: ${pet1.level}`}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="宠物 2" bordered>
              <Card.Meta
                avatar={<img src={pet2.imageUrl} alt={pet2.name} style={{ width: 60, height: 60, borderRadius: '50%' }} />}
                title={pet2.name}
                description={`类型: ${pet2.type} | 等级: ${pet2.level}`}
              />
            </Card>
          </Col>
        </Row>

        <Card title="繁殖信息" bordered style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="请为子代宠物起个名字"
              value={childName}
              onChange={e => setChildName(e.target.value)}
              prefix={<HeartOutlined />}
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text>繁殖费用:</Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GoldOutlined style={{ color: '#FFD700', marginRight: 8 }} />
                <Text strong>{breedingFee} 金币</Text>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>当前余额:</Text>
              <div>
                <CoinDisplay 
                  value={Number(petCoinBalance)} 
                  sufficient={Number(petCoinBalance) >= Number(breedingFee)} 
                />
              </div>
            </div>
          </div>

          {Number(petCoinBalance) < Number(breedingFee) && (
            <Alert
              message="金币不足"
              description={
                <span>
                  繁殖需要 {breedingFee} 金币，当前余额 {petCoinBalance} 金币。
                  <Button type="link" onClick={() => navigate('/signin')}>
                    去签到获取金币
                  </Button>
                </span>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Button
            type="primary"
            block
            onClick={handleBreedSubmit}
            loading={breeding}
            disabled={!childName.trim() || Number(petCoinBalance) < Number(breedingFee)}
          >
            <HeartOutlined /> 繁殖宠物
          </Button>
        </Card>
      </div>
    );
  };

  // 渲染成功弹窗
  const renderSuccessModal = () => {
    return (
      <Modal
        open={breedingSuccess}
        footer={null}
        closable={false}
        width={500}
      >
        <Result
          status="success"
          title="繁殖成功！"
          subTitle={`恭喜你获得了一只新宠物！宠物ID: ${newPetId}`}
          extra={[
            <Button 
              type="primary" 
              key="dashboard" 
              onClick={() => navigate('/')}
            >
              返回仪表盘
            </Button>,
            <Button 
              key="continue" 
              onClick={() => {
                setBreedingSuccess(false);
                setSelectedPet1(null);
                setSelectedPet2(null);
                setNewPetId(null);
              }}
            >
              继续繁殖
            </Button>,
          ]}
        />
      </Modal>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <HeartOutlined style={{ marginRight: 8 }} />
        宠物繁殖
      </Title>
      
      <Paragraph>
        选择两只不同的宠物进行繁殖，创造一个全新的宠物！
        <Tooltip title="繁殖会消耗金币，并且宠物繁殖后需要冷却24小时才能再次繁殖">
          <QuestionCircleOutlined style={{ marginLeft: 8 }} />
        </Tooltip>
      </Paragraph>

      {error && (
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {breedingError && (
        <Alert
          message="繁殖错误"
          description={breedingError}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setBreedingError(null)}
        />
      )}

      {renderBreedingForm()}
      {renderSuccessModal()}

      <Divider>我的宠物</Divider>
      {renderPetList()}
    </div>
  );
};

export default BreedPetPage;