import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Web3 Pet World</h3>
            <p className="text-gray-400">
              拥有、繁殖和饲养区块链上的独特数字宠物
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">首页</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">我的宠物</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">繁殖中心</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">市场</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">资源</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">帮助中心</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">开发者文档</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">社区论坛</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">白皮书</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa fa-telegram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa fa-discord text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa fa-medium text-xl"></i>
              </a>
            </div>
            <p className="text-gray-400">
              邮箱: contact@web3petworld.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2025 Web3 Pet World. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;    