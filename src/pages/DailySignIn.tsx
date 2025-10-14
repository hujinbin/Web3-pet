import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Typography, Row, Col, Statistic, Alert, Spin, Calendar, Badge, Modal, Result } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, FireOutlined, GiftOutlined, GoldOutlined, TrophyOutlined } from '@ant-design/icons';
import type { RootState } from '../store/store';
import CoinDisplay from '../components/CoinDisplay';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;

interface DailySignInProps {}

const DailySignIn: React.FC<DailySignInProps> = () => {
  const dispatch = useDispatch();
  const { account, petCoinContract, petCoinBalance } = useSelector((state: RootState) => state.web3);
  
  const [loading, setLoading] = useState(false);
  const [canSignIn, setCanSignIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastSignIn, setLastSignIn] = useState(0);
  const [signInModalVisible, setSignInModalVisible] = useState(false);
  const [signInReward, setSignInReward] = useState(0);
  const [error, setError] = useState('');
  
  // 基础奖励和最大连续签到奖励
  const [baseReward, setBaseReward] = useState(10);
  const [maxStreakBonus, setMaxStreakBonus] = useState(50);
  
  // 获取签到信息
  useEffect(() => {
    if (petCoinContract && account) {
      fetchSignInInfo();
      checkCanSignIn();
      fetchRewardInfo();
    }
  }, [petCoinContract, account]);
  
  // 获取签到信息
  const fetchSignInInfo = async () => {
    try {
      const signInInfo = await petCoinContract.methods.getSignInInfo(account).call();
      setLastSignIn(Number(signInInfo.lastSignIn));
      setStreak(Number(signInInfo.streak));
    } catch (error) {
      console.error('获取签到信息失败:', error);
    }
  };
  
  // 检查今天是否可以签到
  const checkCanSignIn = async () => {
    try {
      const canSignInToday = await petCoinContract.methods.canSignInToday(account).call();
      setCanSignIn(canSignInToday);
    } catch (error) {
      console.error('检查签到状态失败:', error);
    }
  };
  
  // 获取奖励信息
  const fetchRewardInfo = async () => {
    try {
      const baseSignInReward = await petCoinContract.methods.baseSignInReward().call();
      const maxBonus = await petCoinContract.methods.maxStreakBonus().call();
      setBaseReward(Number(baseSignInReward));
      setMaxStreakBonus(Number(maxBonus));
    } catch (error) {
      console.error('获取奖励信息失败:', error);
    }
  };
  
  // 计算当前可获得的奖励
  const calculateReward = () => {
    const streakBonus = Math.min((streak) * 2, maxStreakBonus);
    return baseReward + streakBonus;
  };
  
  // 处理签到
  const handleSignIn = async () => {
    if (!petCoinContract || !account) {
      setError('请先连接钱包');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const tx = await petCoinContract.methods.signIn().send({ from: account });
      const reward = calculateReward();
      setSignInReward(reward);
      setSignInModalVisible(true);
      
      // 更新状态
      fetchSignInInfo();
      checkCanSignIn();
      
      // 更新金币余额
      dispatch({ type: 'web3/getPetCoinBalance' });
    } catch (error: any) {
      setError(error.message || '签到失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 日历单元格渲染
  const dateCellRender = (date: moment.Moment) => {
    const day = date.date();
    const month = date.month();
    const year = date.year();
    
    // 今天日期
    const today = moment();
    const isToday = date.isSame(today, 'day');
    
    // 上次签到日期
    const lastSignInDate = moment.unix(lastSignIn);
    const isLastSignIn = date.isSame(lastSignInDate, 'day');
    
    // 判断是否是过去的日期
    const isPast = date.isBefore(today, 'day');
    
    // 判断是否是连续签到的日期
    const isInStreak = isPast && 
      date.isAfter(moment().subtract(streak, 'days'), 'day') && 
      !date.isAfter(lastSignInDate, 'day');
    
    if (isLastSignIn) {
      return <Badge color="green" text={<CheckCircleOutlined style={{ color: 'green' }} />} />;
    } else if (isInStreak) {
      return <Badge color="blue" text={<FireOutlined style={{ color: 'orange' }} />} />;
    } else if (isToday && canSignIn) {
      return <Badge color="red" text={<GiftOutlined style={{ color: 'red' }} />} />;
    }
    
    return null;
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CalendarOutlined /> 每日签到
      </Title>
      <Paragraph>每天签到可以获得金币奖励，连续签到可以获得额外奖励！</Paragraph>
      
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="签到日历" style={{ marginBottom: '24px' }}>
            <Calendar fullscreen={false} dateCellRender={dateCellRender} />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="我的签到" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="连续签到" 
                  value={streak} 
                  suffix="天" 
                  prefix={<FireOutlined style={{ color: streak > 5 ? 'orange' : 'grey' }} />} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="今日奖励" 
                  value={calculateReward()} 
                  prefix={<GoldOutlined style={{ color: '#FFD700' }} />} 
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: '24px' }}>
              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<CheckCircleOutlined />} 
                onClick={handleSignIn}
                disabled={!canSignIn || !account}
                loading={loading}
              >
                {canSignIn ? '立即签到' : '今日已签到'}
              </Button>
              
              {!account && (
                <Alert
                  message="请先连接钱包"
                  description="你需要连接MetaMask钱包才能签到"
                  type="warning"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}
              
              {error && (
                <Alert
                  message="签到失败"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              )}
            </div>
          </Card>
          
          <Card title="签到规则">
            <ul style={{ paddingLeft: '20px' }}>
              <li>每日签到可获得基础奖励 {baseReward} 金币</li>
              <li>连续签到每天额外奖励 2 金币</li>
              <li>连续签到奖励最高可达 {maxStreakBonus} 金币</li>
              <li>断签会重置连续签到天数</li>
              <li>金币可用于领养和繁殖宠物</li>
            </ul>
          </Card>
        </Col>
      </Row>
      
      {/* 签到成功弹窗 */}
      <Modal
        title="签到成功"
        open={signInModalVisible}
        footer={[
          <Button key="close" type="primary" onClick={() => setSignInModalVisible(false)}>
            确定
          </Button>
        ]}
        onCancel={() => setSignInModalVisible(false)}
      >
        <Result
          status="success"
          title={`恭喜获得 ${signInReward} 金币！`}
          subTitle={`你已连续签到 ${streak} 天`}
          icon={<TrophyOutlined style={{ color: '#FFD700' }} />}
        />
      </Modal>
      
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
          <Spin size="large" tip="签到中..." />
        </div>
      )}
    </div>
  );
};

export default DailySignIn;