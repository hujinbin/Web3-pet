import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import Dashboard from './pages/Dashboard';
import PetDetail from './pages/PetDetail';
import BreedPet from './pages/BreedPet';
import AdoptPet from './pages/AdoptPet';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const { loading, error } = useSelector((state: RootState) => state.web3);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* 导航栏 */}
        <Navbar />

        {/* 加载指示器 */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <LoadingSpinner size="xl" />
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* 主内容 */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/breed" element={<BreedPet />} />
            <Route path="/adopt" element={<AdoptPet />} />
          </Routes>
        </main>

        {/* 页脚 */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;    