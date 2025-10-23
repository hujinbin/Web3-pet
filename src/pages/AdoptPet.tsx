import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { adoptPet } from '../store/petSlice';
import type { RootState } from '../store/store';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Alert, 
  Spin, 
  List, 
  Row, 
  Col, 
  Radio,
  Tooltip,
  Steps,
  Avatar
} from 'antd';
import { 
  HeartOutlined, 
  CheckCircleOutlined, 
  GiftOutlined, 
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  GoldOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

interface AdoptPetPageProps { [key: string]: unknown }

const AdoptPetPage: React.FC<AdoptPetPageProps> = () => {
  const { loading, error, adopting } = useSelector((state: RootState) => state.pet);
  const { account, contract, petCoinBalance } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();
  
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [adoptionSuccess, setAdoptionSuccess] = useState(false);
  const [form] = Form.useForm();
  const [adoptionFee, setAdoptionFee] = useState<string>('0');

  const { Title, Paragraph, Text } = Typography;

  // 获取领养费用
  useEffect(() => {
    if (contract) {
      const getAdoptionFee = async () => {
        try {
          const fee = await contract.methods.getAdoptionFee().call();
          setAdoptionFee(fee);
        } catch (error) {
          console.error('获取领养费用失败:', error);
        }
      };
      
      getAdoptionFee();
    }
  }, [contract]);

  // 宠物类型选项
  const petTypes = [
    { value: 'dog', label: '狗狗', icon: '🐕', description: '忠诚友善，活泼好动' },
    { value: 'cat', label: '猫咪', icon: '🐈', description: '优雅独立，聪明机敏' },
    { value: 'bird', label: '鸟儿', icon: '🐦', description: '自由飞翔，歌声悦耳' },
    { value: 'rabbit', label: '兔子', icon: '🐇', description: '温顺可爱，跳跃敏捷' },
    { value: 'dragon', label: '龙', icon: '🐉', description: '神秘强大，稀有珍贵' }
  ];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPetName(e.target.value);
  };

  const handleAdopt = async () => {
    if (!petName.trim()) {
      return;
    }

    try {
      await dispatch<any>(adoptPet({ name: petName.trim(), petType }));
      setAdoptionSuccess(true);
      setPetName('');
      form.resetFields();
      
      // 3秒后返回首页
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      // 错误处理已在redux中完成
    }
  };

  const adoptionSteps = [
    {
      title: '选择宠物类型',
      description: '选择你喜欢的宠物类型',
      icon: <GiftOutlined />
    },
    {
      title: '命名宠物',
      description: '为你的宠物起一个独特的名字',
      icon: <StarOutlined />
    },
    {
      title: '确认领养',
      description: `需要 ${adoptionFee} 金币`,
      icon: <GoldOutlined />
    }
  ];

  const adoptionBenefits = [
    {
      title: '独特DNA',
      description: '每个宠物都有唯一的DNA和属性',
      icon: <ThunderboltOutlined style={{ color: '#1890ff' }} />
    },
    {
      title: '繁殖能力',
      description: '宠物可以繁殖，产生具有父母特征的新宠物',
      icon: <HeartOutlined style={{ color: '#eb2f96' }} />
    },
    {
      title: '成长升级',
      description: '宠物可以升级，提升属性和能力',
      icon: <StarOutlined style={{ color: '#faad14' }} />
    },
    {
      title: '安全保障',
      description: '基于区块链技术，确保宠物所有权安全',
      icon: <SafetyOutlined style={{ color: '#52c41a' }} />
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 页面头部横幅 */}
      <Card 
        style={{ 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        <Row align="middle" justify="center">
          <Col xs={24} md={16} style={{ textAlign: 'center' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
              <HeartOutlined style={{ marginRight: '12px' }} />
              领养你的专属宠物
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: 0 }}>
              在区块链世界中，每个宠物都是独一无二的数字生命
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* 领养步骤 */}
      <Card title="领养流程" style={{ marginBottom: '24px' }}>
        <Steps
          current={adoptionSuccess ? 3 : (petName ? 2 : (petType ? 1 : 0))}
          items={adoptionSteps}
          style={{ marginBottom: '24px' }}
        />
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧：领养表单 */}
        <Col xs={24} lg={14}>
          <Card title="宠物领养表单" style={{ height: 'fit-content' }}>
            {adoptionSuccess ? (
              <Alert
                message="领养成功！"
                description="恭喜你成功领养了一只可爱的宠物！正在跳转到首页..."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginBottom: '16px' }}
              />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAdopt}
                initialValues={{ petType: 'dog' }}
              >
                {/* 金币余额显示 */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>领养费用: </Text>
                    <Text type="warning" style={{ fontSize: '16px' }}>
                      {adoptionFee} <GoldOutlined style={{ color: '#FFD700' }} />
                    </Text>
                  </div>
                  <div>
                    <Text strong>我的金币: </Text>
                    <Text style={{ fontSize: '16px', color: Number(petCoinBalance) < Number(adoptionFee) ? '#ff4d4f' : '#52c41a' }}>
                      {petCoinBalance} <GoldOutlined style={{ color: '#FFD700' }} />
                    </Text>
                    {Number(petCoinBalance) < Number(adoptionFee) && (
                      <Tooltip title="金币不足，请先签到获取金币">
                        <QuestionCircleOutlined style={{ marginLeft: '5px', color: '#ff4d4f' }} />
                      </Tooltip>
                    )}
                  </div>
                </div>
                
                {/* 宠物类型选择 */}
                <Form.Item
                  label="选择宠物类型"
                  name="petType"
                  rules={[{ required: true, message: '请选择宠物类型' }]}
                >
                  <Radio.Group 
                    value={petType} 
                    onChange={(e) => setPetType(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Row gutter={[16, 16]}>
                      {petTypes.map((type) => (
                        <Col xs={12} sm={8} key={type.value}>
                          <Radio.Button 
                            value={type.value} 
                            style={{ 
                              width: '100%', 
                              height: 'auto', 
                              padding: '12px',
                              textAlign: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                                {type.icon}
                              </div>
                              <div style={{ fontWeight: 'bold' }}>{type.label}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {type.description}
                              </div>
                            </div>
                          </Radio.Button>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                </Form.Item>

                {/* 宠物命名 */}
                <Form.Item
                  label="为你的宠物起名"
                  name="petName"
                  rules={[
                    { required: true, message: '请为你的宠物起一个名字' },
                    { min: 2, message: '宠物名字至少需要2个字符' },
                    { max: 20, message: '宠物名字不能超过20个字符' }
                  ]}
                >
                  <Input
                    placeholder="输入宠物名字..."
                    value={petName}
                    onChange={handleNameChange}
                    size="large"
                    prefix={<StarOutlined />}
                  />
                </Form.Item>

                {/* 错误提示 */}
                {error && (
                  <Alert
                    message="领养失败"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                )}

                {/* 领养按钮 */}
                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    loading={adopting}
                    disabled={!account || !contract || !petName.trim()}
                    onClick={handleAdopt}
                    style={{ width: '100%', height: '48px' }}
                    icon={<HeartOutlined />}
                  >
                    {adopting ? '领养中...' : '立即领养'}
                  </Button>
                </Form.Item>

                {!account && (
                  <Alert
                    message="请先连接钱包"
                    description="你需要连接MetaMask钱包才能领养宠物"
                    type="warning"
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                )}

                {Number(petCoinBalance) < Number(adoptionFee) && account && (
                  <Alert
                    message="金币不足"
                    description={
                      <span>
                        领养宠物需要 {adoptionFee} 金币，当前余额 {petCoinBalance} 金币。
                        <Button type="link" href="/daily-signin" style={{ padding: 0 }}>
                          去签到获取金币 →
                        </Button>
                      </span>
                    }
                    type="error"
                    showIcon
                    style={{ marginTop: '16px', marginBottom: '16px' }}
                  />
                )}
              </Form>
            )}
          </Card>
        </Col>

        {/* 右侧：领养须知和好处 */}
        <Col xs={24} lg={10}>
          {/* 领养好处 */}
          <Card title="领养宠物的好处" style={{ marginBottom: '24px' }}>
            <List
              dataSource={adoptionBenefits}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* 领养须知 */}
          <Card title="领养须知" style={{ marginBottom: '24px' }}>
            <List
              size="small"
              dataSource={[
                '每次领养需要支付少量ETH作为gas费用',
                '宠物名字一旦确定无法修改，请谨慎选择',
                '每个宠物都有独特的DNA和属性',
                '宠物可以通过繁殖产生后代',
                '请确保钱包中有足够的ETH余额',
                '领养成功后，宠物将立即出现在你的收藏中'
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <Text>
                    <span style={{ color: '#1890ff', marginRight: '8px' }}>
                      {index + 1}.
                    </span>
                    {item}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 加载状态 */}
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(255,255,255,0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Spin size="large" tip="正在处理中..." />
        </div>
      )}
    </div>
  );
};

export default AdoptPetPage;