import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getPetInfo } from '../store/petSlice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import type { RootState } from '../store/store';

interface PetDetailPageProps {
  contract: any; // 使用web3合约类型
}

const PetDetail: React.FC<PetDetailPageProps> = ({ contract }) => {
  const { petId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { pet, loading, error } = useSelector((state: RootState) => state.pet);
  const { account, web3 } = useSelector((state: RootState) => state.web3);
  
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  useEffect(() => {
    if (contract && petId) {
      dispatch(getPetInfo({ contract, petId: parseInt(petId) }));
    }
  }, [contract, petId, dispatch]);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // 计算宠物年龄
  const calculateAge = (birthTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const ageInSeconds = now - birthTime;
    
    if (ageInSeconds < 60) {
      return `${ageInSeconds} 秒`;
    } else if (ageInSeconds < 3600) {
      return `${Math.floor(ageInSeconds / 60)} 分钟`;
    } else if (ageInSeconds < 86400) {
      return `${Math.floor(ageInSeconds / 3600)} 小时`;
    } else {
      return `${Math.floor(ageInSeconds / 86400)} 天`;
    }
  };

  // 处理宠物转移
  const handleTransfer = async () => {
    if (!contract || !petId || !account || !web3) {
      setTransferError('请先连接钱包');
      return;
    }
    
    if (!transferAddress) {
      setTransferError('请输入接收地址');
      return;
    }
    
    if (!web3.utils.isAddress(transferAddress)) {
      setTransferError('无效的以太坊地址');
      return;
    }
    
    try {
      setIsTransferring(true);
      setTransferError('');
      setTransferSuccess('');
      
      // 调用智能合约的transferFrom方法
      const tx = await contract.methods.transferFrom(
        account,
        transferAddress,
        parseInt(petId)
      ).send({ from: account });
      
      setTransferSuccess('宠物转移成功！');
      
      // 3秒后返回宠物列表
      setTimeout(() => {
        navigate('/pets');
      }, 3000);
    } catch (error: any) {
      console.error('转移失败:', error);
      if (error.message && error.message.includes('User denied transaction signature')) {
        setTransferError('用户拒绝了交易签名');
      } else {
        setTransferError('转移失败: ' + error.message);
      }
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">宠物详情</h1>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
          >
            <i className="fa fa-arrow-left mr-2"></i> 返回
          </button>
        </div>
        
        {loading && (
          <div className="flex justify-center my-16">
            <LoadingSpinner />
          </div>
        )}
        
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} />
          </div>
        )}
        
        {pet && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 宠物图片 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-6 flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-full bg-white shadow-inner flex items-center justify-center">
                      {/* 宠物图片 */}
                      <img 
                        src={`https://picsum.photos/seed/${pet.dna.toString()}/200/200`} 
                        alt={`宠物 ${pet.name}`} 
                        className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                    
                    {/* 宠物稀有度徽章 */}
                    <div className="absolute -top-3 -right-3 bg-accent text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold">{pet.rarity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{pet.name}</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      ID: {pet.id}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">类型</p>
                      <p className="font-medium">{pet.type}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">等级</p>
                      <p className="font-medium">{pet.level}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">经验值</p>
                      <p className="font-medium">{pet.experience}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">年龄</p>
                      <p className="font-medium">{calculateAge(pet.birthTime)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-500 mb-1">出生日期</p>
                    <p className="font-medium">{formatTimestamp(pet.birthTime)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">DNA</p>
                    <p className="font-medium text-sm truncate">{pet.dna.toString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 宠物详情和操作 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <i className="fa fa-info-circle text-primary mr-2"></i>宠物信息
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">宠物描述</h4>
                    <p className="text-gray-600">
                      这是一只{pet.rarity}级别的{pet.type}宠物，拥有独特的基因组合。它出生于{formatTimestamp(pet.birthTime)}，
                      自出生以来已经积累了{pet.experience}点经验值，目前处于{pet.level}级。
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">繁殖状态</h4>
                    <div className="flex items-center">
                      {pet.canBreed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <i className="fa fa-check-circle mr-1"></i> 可以繁殖
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <i className="fa fa-clock-o mr-1"></i> 冷却中
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!pet.canBreed && (
                    <div>
                      <h4 className="font-medium mb-2">繁殖冷却时间</h4>
                      <p className="text-gray-600">
                        这只宠物需要更多时间恢复体力才能再次繁殖。
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">宠物能力</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">力量</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 font-medium">{Math.floor(Math.random() * 80) + 20}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">速度</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 font-medium">{Math.floor(Math.random() * 80) + 20}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">智力</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 font-medium">{Math.floor(Math.random() * 80) + 20}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">耐力</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}></div>
                        </div>
                        <p className="text-xs text-right mt-1 font-medium">{Math.floor(Math.random() * 80) + 20}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 宠物操作 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <i className="fa fa-cog text-primary mr-2"></i>宠物操作
                </h3>
                
                {/* 繁殖按钮 */}
                {pet.canBreed && (
                  <button 
                    onClick={() => navigate(`/breed?parent=${pet.id}`)} 
                    className="w-full btn-secondary mb-4 flex items-center justify-center"
                  >
                    <i className="fa fa-heart mr-2"></i> 选择此宠物进行繁殖
                  </button>
                )}
                
                {/* 转移宠物表单 */}
                <div>
                  <h4 className="font-medium mb-3">转移宠物</h4>
                  
                  {transferError && (
                    <div className="mb-3">
                      <ErrorMessage message={transferError} onClose={() => setTransferError('')} />
                    </div>
                  )}
                  
                  {transferSuccess && (
                    <div className="mb-3 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                      <div className="flex items-center">
                        <i className="fa fa-check-circle mr-2"></i>
                        <span>{transferSuccess}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-3">
                    <div>
                      <label htmlFor="transferAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        接收地址
                      </label>
                      <input 
                        type="text" 
                        id="transferAddress" 
                        value={transferAddress}
                        onChange={(e) => setTransferAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="输入以太坊地址"
                      />
                    </div>
                    
                    <button 
                      onClick={handleTransfer} 
                      className="btn-primary"
                      disabled={isTransferring}
                    >
                      {isTransferring ? (
                        <>
                          <i className="fa fa-spinner fa-spin mr-2"></i> 处理中...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-exchange mr-2"></i> 转移宠物
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default PetDetail;