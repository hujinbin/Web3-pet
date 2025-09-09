import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { Layout, Menu, Button, Typography, Avatar, Drawer, Space, Grid } from 'antd';
import { HomeOutlined, HeartOutlined, ShoppingOutlined, UserOutlined, MenuOutlined, WalletOutlined } from '@ant-design/icons';

const Navbar: React.FC = () => {
  const { account } = useSelector((state: RootState) => state.web3);
  const [visible, setVisible] = useState(false);
  const { Header } = Layout;
  const { Title, Text } = Typography;
  const { useBreakpoint } = Grid;  
  const screens = useBreakpoint();

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', link: '/' },
    { key: 'pets', icon: <UserOutlined />, label: '我的宠物', link: '/pets' },
    { key: 'breed', icon: <HeartOutlined />, label: '繁殖中心', link: '/breed' },
    { key: 'marketplace', icon: <ShoppingOutlined />, label: '市场', link: '/marketplace' },
  ];

  return (
    <Header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1, 
      width: '100%', 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>Web3 Pet World</Title>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {screens.md ? (
          <Menu 
            mode="horizontal" 
            style={{ border: 'none', background: 'transparent' }}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.link}>{item.label}</Link>
            }))}
          />
        ) : null}
        
        <Space size={16}>
          {account ? (
            <Button type="text" icon={<UserOutlined />} style={{ display: 'flex', alignItems: 'center' }}>
              <Text ellipsis style={{ maxWidth: 120 }}>{account}</Text>
            </Button>
          ) : (
            <Link to="/connect">
              <Button type="primary" icon={<WalletOutlined />}>连接钱包</Button>
            </Link>
          )}
          
          {!screens.md && (
            <Button 
              type="text" 
              icon={<MenuOutlined />} 
              onClick={showDrawer}
            />
          )}
        </Space>
      </div>
      
      <Drawer 
        title="菜单" 
        placement="right" 
        onClose={onClose} 
        open={visible}
      >
        <Menu 
          mode="vertical"
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.link}>{item.label}</Link>,
            onClick: onClose
          }))}
        />
      </Drawer>
    </Header>
  );
};

export default Navbar;