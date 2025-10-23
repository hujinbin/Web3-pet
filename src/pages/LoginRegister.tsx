import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

// 假设有 web3 合约实例 userContract
// import { userContract } from '../web3/userContract';

const LoginRegister: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 注册
  const handleRegister = async () => {
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      // const tx = await userContract.methods.registerUser(username, hashPassword(password)).send();
      // 假代码：模拟注册成功
      setTimeout(() => {
        message.success('注册成功，请登录');
        setTab('login');
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      message.error('注册失败：' + err.message);
      setLoading(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      // const user = await userContract.methods.getUser(username).call();
      // if (user.passwordHash === hashPassword(password)) {
      //   message.success('登录成功');
      //   navigate('/');
      // } else {
      //   message.error('密码错误');
      // }
      // 假代码：模拟登录成功
      setTimeout(() => {
        message.success('登录成功');
        navigate('/');
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      message.error('登录失败：' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <Card style={{ width: 350 }}>
        <Tabs activeKey={tab} onChange={key => setTab(key as 'login' | 'register')} centered>
          <Tabs.TabPane tab="登录" key="login" />
          <Tabs.TabPane tab="注册" key="register" />
        </Tabs>
        <Input
          size="large"
          placeholder="用户名"
          prefix={<UserOutlined />}
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          size="large"
          placeholder="密码"
          prefix={<LockOutlined />}
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ marginBottom: 24 }}
        />
        {tab === 'login' ? (
          <Button type="primary" block loading={loading} onClick={handleLogin}>
            登录
          </Button>
        ) : (
          <Button type="primary" block loading={loading} onClick={handleRegister}>
            注册
          </Button>
        )}
      </Card>
    </div>
  );
};

export default LoginRegister;
