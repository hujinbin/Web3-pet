import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const Navbar: React.FC = () => {
  const { account } = useSelector((state: RootState) => state.web3);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 transition-all duration-300" 
         style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-primary text-2xl font-bold">Web3 Pet World</div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
            <i className="fa fa-home mr-1"></i> 首页
          </Link>
          <Link to="/pets" className="text-gray-700 hover:text-primary transition-colors">
            <i className="fa fa-paw mr-1"></i> 我的宠物
          </Link>
          <Link to="/breed" className="text-gray-700 hover:text-primary transition-colors">
            <i className="fa fa-heart mr-1"></i> 繁殖中心
          </Link>
          <Link to="/marketplace" className="text-gray-700 hover:text-primary transition-colors">
            <i className="fa fa-shopping-bag mr-1"></i> 市场
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {account ? (
            <div className="flex items-center">
              <div className="bg-gray-100 px-4 py-2 rounded-full text-sm flex items-center">
                <i className="fa fa-user-circle text-primary mr-2"></i>
                <span className="truncate max-w-[120px]">{account}</span>
              </div>
            </div>
          ) : (
            <Link to="/connect" className="btn-primary">
              <i className="fa fa-wallet mr-2"></i> 连接钱包
            </Link>
          )}
          
          <button className="md:hidden text-gray-700 focus:outline-none">
            <i className="fa fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;    