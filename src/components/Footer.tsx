import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { TwitterOutlined, GithubOutlined, LinkedinOutlined, MediumOutlined } from '@ant-design/icons';

const Footer: React.FC = () => {
  const { Footer } = Layout;
  const { Title, Text, Link: TextLink } = Typography;

  return (
    <Footer style={{ background: '#001529', padding: '48px 24px 24px', marginTop: 60 }}>
      <Row gutter={[48, 32]}>
        <Col xs={24} sm={24} md={6} lg={6}>
          <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>Web3 Pet World</Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            拥有、繁殖和饲养区块链上的独特数字宠物
          </Text>
        </Col>
        
        <Col xs={24} sm={12} md={6} lg={6}>
          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>快速链接</Title>
          <Space direction="vertical" size="small">
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="/">首页</TextLink>
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="/pets">我的宠物</TextLink>
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="/breed">繁殖中心</TextLink>
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="/marketplace">市场</TextLink>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={6} lg={6}>
          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>资源</Title>
          <Space direction="vertical" size="small">
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="#">帮助中心</TextLink>
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="#">开发者文档</TextLink>
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="#">社区论坛</TextLink>
            <TextLink style={{ color: 'rgba(255, 255, 255, 0.65)' }} href="#">白皮书</TextLink>
          </Space>
        </Col>
        
        <Col xs={24} sm={24} md={6} lg={6}>
          <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>联系我们</Title>
          <Space size="middle" style={{ marginBottom: 16 }}>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 20 }}>
              <TwitterOutlined />
            </a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 20 }}>
              <GithubOutlined />
            </a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 20 }}>
              <LinkedinOutlined />
            </a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 20 }}>
              <MediumOutlined />
            </a>
          </Space>
          <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            邮箱: contact@web3petworld.com
          </Text>
        </Col>
      </Row>
      
      <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '24px 0' }} />
      
      <div style={{ textAlign: 'center' }}>
        <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>&copy; 2025 Web3 Pet World. 保留所有权利。</Text>
      </div>
    </Footer>
  );
};

export default Footer;