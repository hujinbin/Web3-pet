import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Button, 
  Typography, 
  Collapse,
  Form,
  Select,
  Space,
  Result,
  Alert,
  Input,
  Divider
} from 'antd';
import { 
  BugOutlined,
  RocketOutlined
} from '@ant-design/icons';
import type { RootState } from '../store/store';
import * as testFunctions from '../utils/testFunctions';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// 定义 TestResult 类型
interface TestResult {
  success: boolean;
  message?: string;
  balance?: string;
  consecutiveDays?: string;
  petId?: string;
  petName?: string;
  petType?: string;
  childId?: string;
  childName?: string;
  petCoin?: { success: boolean; message: string };
  petAdoption?: { success: boolean; message: string };
  pet?: { success: boolean; message: string };
  petBreeding?: { success: boolean; message: string };
}

// Web3State 类型补充 petBreedingContract 属性
interface Web3State {
  petBreedingContract?: unknown;
  // ...其他属性...
}

const TestPage: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    account, 
    petCoinContract, 
    petAdoptionContract, 
    petBreedingContract,
    petCoinBalance
  } = useSelector((state: RootState) => state.web3);
  const { pets } = useSelector((state: RootState) => state.pet);

  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [contractsResult, setContractsResult] = useState<TestResult | null>(null);
  const [signInResult, setSignInResult] = useState<TestResult | null>(null);
  const [adoptionResult, setAdoptionResult] = useState<TestResult | null>(null);
  const [breedingResult, setBreedingResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    connection: false,
    contracts: false,
    signIn: false,
    adoption: false,
    breeding: false
  });

  // 合约地址
  const [contractAddresses, setContractAddresses] = useState({
    petAddress: localStorage.getItem('petAddress') || '',
    petCoinAddress: localStorage.getItem('petCoinAddress') || '',
    petAdoptionAddress: localStorage.getItem('petAdoptionAddress') || '',
    petBreedingAddress: localStorage.getItem('petBreedingAddress') || ''
  });

  // 测试连接
  const handleTestConnection = async () => {
    setLoading(prev => ({ ...prev, connection: true }));
    try {
      const result = await testFunctions.testConnection();
      setConnectionResult(result);
      
      if (result.success) {
        // 更新Redux状态
        dispatch({ type: 'web3/checkAccount' });
      }
    } catch (error: any) {
      setConnectionResult({
        success: false,
        message: `测试连接出错: ${error.message}`
      });
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  // 测试合约连接
  const handleTestContracts = async () => {
    setLoading(prev => ({ ...prev, contracts: true }));
    try {
      const result = await testFunctions.testContracts(contractAddresses);
      setContractsResult(result);
      
      if (result.petCoin?.success) {
        // 更新Redux状态
        dispatch({ type: 'web3/connectPetCoinContract', payload: contractAddresses.petCoinAddress });
        dispatch({ type: 'web3/getPetCoinBalance' });
      }
      
      if (result.petAdoption?.success) {
        dispatch({ type: 'web3/connectPetAdoptionContract', payload: contractAddresses.petAdoptionAddress });
      }
      
      if (result.pet?.success && result.petBreeding?.success) {
        dispatch({ type: 'web3/connectContract', payload: contractAddresses.petAddress });
        dispatch({ type: 'pet/fetchPets' });
      }
      
      // 保存合约地址到本地存储
      localStorage.setItem('petAddress', contractAddresses.petAddress);
      localStorage.setItem('petCoinAddress', contractAddresses.petCoinAddress);
      localStorage.setItem('petAdoptionAddress', contractAddresses.petAdoptionAddress);
      localStorage.setItem('petBreedingAddress', contractAddresses.petBreedingAddress);
    } catch (error: any) {
      setContractsResult({
        success: false,
        message: `测试合约连接出错: ${error.message}`
      });
    } finally {
      setLoading(prev => ({ ...prev, contracts: false }));
    }
  };

  // 测试签到
  const handleTestSignIn = async () => {
    if (!petCoinContract || !account) {
      setSignInResult({
        success: false,
        message: 'PetCoin合约或账户未初始化，请先测试连接和合约'
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, signIn: true }));
    try {
      const result = await testFunctions.testSignIn(petCoinContract, account);
      setSignInResult(result);
      
      if (result.success) {
        // 更新Redux状态
        dispatch({ type: 'web3/getPetCoinBalance' });
      }
    } catch (error: any) {
      setSignInResult({
        success: false,
        message: `测试签到出错: ${error.message}`
      });
    } finally {
      setLoading(prev => ({ ...prev, signIn: false }));
    }
  };

  // 测试领养
  const handleTestAdoption = async (values: { petName: string, petType: string }) => {
    if (!petAdoptionContract || !petCoinContract || !account) {
      setAdoptionResult({
        success: false,
        message: '合约或账户未初始化，请先测试连接和合约'
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, adoption: true }));
    try {
      const result = await testFunctions.testAdoption(
        petAdoptionContract, 
        petCoinContract, 
        account, 
        values.petName, 
        values.petType
      );
      setAdoptionResult(result);
      
      if (result.success) {
        // 更新Redux状态
        dispatch({ type: 'web3/getPetCoinBalance' });
        dispatch({ type: 'pet/fetchPets' });
      }
    } catch (error: any) {
      setAdoptionResult({
        success: false,
        message: `测试领养出错: ${error.message}`
      });
    } finally {
      setLoading(prev => ({ ...prev, adoption: false }));
    }
  };

  // 测试繁殖
  const handleTestBreeding = async (values: { petId1: number, petId2: number, childName: string }) => {
    if (!petBreedingContract || !petCoinContract || !account) {
      setBreedingResult({
        success: false,
        message: '合约或账户未初始化，请先测试连接和合约'
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, breeding: true }));
    try {
      const result = await testFunctions.testBreeding(
        petBreedingContract, 
        petCoinContract, 
        account, 
        values.petId1, 
        values.petId2, 
        values.childName
      );
      setBreedingResult(result);
      
      if (result.success) {
        // 更新Redux状态
        dispatch({ type: 'web3/getPetCoinBalance' });
        dispatch({ type: 'pet/fetchPets' });
      }
    } catch (error: any) {
      setBreedingResult({
        success: false,
        message: `测试繁殖出错: ${error.message}`
      });
    } finally {
      setLoading(prev => ({ ...prev, breeding: false }));
    }
  };

  // 渲染测试结果
  const renderTestResult = (result: TestResult | null, type: string) => {
    if (!result) return null;
    
    return (
      <Alert
        message={result.success ? '测试成功' : '测试失败'}
        description={
          <div>
            <p>{result.message}</p>
            {type === 'signIn' && result.success && (
              <>
                <p>金币余额: {result.balance}</p>
                <p>连续签到天数: {result.consecutiveDays}</p>
              </>
            )}
            {type === 'adoption' && result.success && (
              <>
                <p>宠物ID: {result.petId}</p>
                <p>宠物名称: {result.petName}</p>
                <p>宠物类型: {result.petType}</p>
              </>
            )}
            {type === 'breeding' && result.success && (
              <>
                <p>子代宠物ID: {result.childId}</p>
                <p>子代宠物名称: {result.childName}</p>
              </>
            )}
          </div>
        }
        type={result.success ? 'success' : 'error'}
        showIcon
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BugOutlined style={{ marginRight: 8 }} />
        功能测试页面
      </Title>
      
      <Paragraph>
        此页面用于测试Web3-Pet应用的各项功能，包括Web3连接、合约连接、签到、领养和繁殖功能。
      </Paragraph>

      <Collapse defaultActiveKey={['1']}>
        <Panel header="1. 测试Web3连接" key="1">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={handleTestConnection}
              loading={loading.connection}
            >
              测试连接
            </Button>
            {renderTestResult(connectionResult, 'connection')}
          </Space>
        </Panel>

        <Panel header="2. 测试合约连接" key="2">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="vertical">
              <Form.Item label="Pet合约地址">
                <Input 
                  value={contractAddresses.petAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContractAddresses(prev => ({ ...prev, petAddress: e.target.value }))}
                  placeholder="输入Pet合约地址"
                />
              </Form.Item>
              <Form.Item label="PetCoin合约地址">
                <Input 
                  value={contractAddresses.petCoinAddress}
                  onChange={e => setContractAddresses(prev => ({ ...prev, petCoinAddress: e.target.value }))}
                  placeholder="输入PetCoin合约地址"
                />
              </Form.Item>
              <Form.Item label="PetAdoption合约地址">
                <Input 
                  value={contractAddresses.petAdoptionAddress}
                  onChange={e => setContractAddresses(prev => ({ ...prev, petAdoptionAddress: e.target.value }))}
                  placeholder="输入PetAdoption合约地址"
                />
              </Form.Item>
              <Form.Item label="PetBreeding合约地址">
                <Input 
                  value={contractAddresses.petBreedingAddress}
                  onChange={e => setContractAddresses(prev => ({ ...prev, petBreedingAddress: e.target.value }))}
                  placeholder="输入PetBreeding合约地址"
                />
              </Form.Item>
              <Button 
                type="primary" 
                onClick={handleTestContracts}
                loading={loading.contracts}
              >
                测试合约连接
              </Button>
            </Form>
            
            {contractsResult && (
              <div style={{ marginTop: 16 }}>
                {contractsResult.pet && (
                  <Alert
                    message="Pet合约"
                    description={contractsResult.pet.message}
                    type={contractsResult.pet.success ? 'success' : 'error'}
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                )}
                {contractsResult.petCoin && (
                  <Alert
                    message="PetCoin合约"
                    description={contractsResult.petCoin.message}
                    type={contractsResult.petCoin.success ? 'success' : 'error'}
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                )}
                {contractsResult.petAdoption && (
                  <Alert
                    message="PetAdoption合约"
                    description={contractsResult.petAdoption.message}
                    type={contractsResult.petAdoption.success ? 'success' : 'error'}
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                )}
                {contractsResult.petBreeding && (
                  <Alert
                    message="PetBreeding合约"
                    description={contractsResult.petBreeding.message}
                    type={contractsResult.petBreeding.success ? 'success' : 'error'}
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                )}
              </div>
            )}
          </Space>
        </Panel>

        <Panel header="3. 测试签到功能" key="3">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>当前金币余额: {petCoinBalance || '未知'}</Text>
            </div>
            <Button 
              type="primary" 
              onClick={handleTestSignIn}
              loading={loading.signIn}
              disabled={!petCoinContract || !account}
            >
              测试签到
            </Button>
            {renderTestResult(signInResult, 'signIn')}
          </Space>
        </Panel>

        <Panel header="4. 测试领养功能" key="4">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>当前金币余额: {petCoinBalance || '未知'}</Text>
            </div>
            <Form 
              layout="vertical"
              onFinish={handleTestAdoption}
            >
              <Form.Item 
                label="宠物名称" 
                name="petName"
                rules={[{ required: true, message: '请输入宠物名称' }]}
              >
                <Input placeholder="输入宠物名称" />
              </Form.Item>
              <Form.Item 
                label="宠物类型" 
                name="petType"
                rules={[{ required: true, message: '请选择宠物类型' }]}
              >
                <Select placeholder="选择宠物类型">
                  <Option value="cat">猫</Option>
                  <Option value="dog">狗</Option>
                  <Option value="rabbit">兔子</Option>
                  <Option value="bird">鸟</Option>
                </Select>
              </Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading.adoption}
                disabled={!petAdoptionContract || !petCoinContract || !account}
              >
                测试领养
              </Button>
            </Form>
            {renderTestResult(adoptionResult, 'adoption')}
          </Space>
        </Panel>

        <Panel header="5. 测试繁殖功能" key="5">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>当前金币余额: {petCoinBalance || '未知'}</Text>
            </div>
            {pets && pets.length >= 2 ? (
              <Form 
                layout="vertical"
                onFinish={handleTestBreeding}
              >
                <Form.Item 
                  label="选择宠物1" 
                  name="petId1"
                  rules={[{ required: true, message: '请选择宠物1' }]}
                >
                  <Select placeholder="选择宠物1">
                    {pets.map(pet => (
                      <Option key={pet.id} value={pet.id}>
                        {pet.name} (ID: {pet.id}, 类型: {pet.type})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item 
                  label="选择宠物2" 
                  name="petId2"
                  rules={[{ required: true, message: '请选择宠物2' }]}
                >
                  <Select placeholder="选择宠物2">
                    {pets.map(pet => (
                      <Option key={pet.id} value={pet.id}>
                        {pet.name} (ID: {pet.id}, 类型: {pet.type})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item 
                  label="子代宠物名称" 
                  name="childName"
                  rules={[{ required: true, message: '请输入子代宠物名称' }]}
                >
                  <Input placeholder="输入子代宠物名称" />
                </Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading.breeding}
                  disabled={!petBreedingContract || !petCoinContract || !account}
                >
                  测试繁殖
                </Button>
              </Form>
            ) : (
              <Alert
                message="宠物数量不足"
                description="繁殖功能需要至少两只宠物，请先领养宠物"
                type="warning"
                showIcon
              />
            )}
            {renderTestResult(breedingResult, 'breeding')}
          </Space>
        </Panel>
      </Collapse>

      <Divider />
      
      <Result
        icon={<RocketOutlined />}
        title="测试完成后，您可以返回主应用继续使用"
        extra={
          <Button type="primary" href="/">
            返回主页
          </Button>
        }
      />
    </div>
  );
};

export default TestPage;