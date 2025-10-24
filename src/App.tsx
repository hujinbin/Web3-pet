import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import Dashboard from './pages/Dashboard';
import PetDetail from './pages/PetDetail';
import BreedPet from './pages/BreedPet';
import AdoptPet from './pages/AdoptPet';
import LoginRegister from './pages/LoginRegister';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Layout, Spin, Alert, ConfigProvider, theme } from 'antd';
import type { Contract } from 'web3-eth-contract';
import type { AbiItem } from 'web3-utils';

function App() {
  const { loading, error } = useSelector((state: RootState) => state.web3);
  const { Content } = Layout;

  // mock 合约对象
  const mockContract = {} as unknown as Contract<AbiItem[]>;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          {/* 导航栏 */}
          <Navbar />

          {/* 加载指示器 */}
          {loading && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 1000, 
              background: 'rgba(0, 0, 0, 0.5)' 
            }}>
              <Spin size="large" />
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div style={{ 
              position: 'fixed', 
              top: 80, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 1000, 
              width: '100%', 
              maxWidth: 500 
            }}>
              <Alert message="错误" description={error} type="error" showIcon closable />
            </div>
          )}

          {/* 主内容 */}
          <Content style={{ 
            padding: '24px', 
            maxWidth: 1200, 
            margin: '0 auto', 
            width: '100%' 
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pet/:id" element={<PetDetail contract={mockContract} />} />
              <Route path="/breed" element={<BreedPet />} />
              <Route path="/adopt" element={<AdoptPet />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Content>

          {/* 页脚 */}
          <Footer />
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;