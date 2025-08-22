import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserPets } from '../store/petSlice';
import { connectContract } from '../store/web3Slice';
import type { RootState } from '../store/store';
import PetCard from '../components/PetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';

// 合约地址（需要替换为实际部署的合约地址）
const CONTRACT_ADDRESS = '0xYourContractAddress';

interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { pets, loading, error } = useSelector((state: RootState) => state.pet);
  const { contract, account } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();

  useEffect(() => {
    // 连接合约
    if (account && !contract) {
      dispatch(connectContract(CONTRACT_ADDRESS));
    }
    
    // 获取宠物列表
    if (contract && account) {
      dispatch(fetchUserPets());
    }
  }, [contract, account, dispatch]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-primary">你的宠物</h2>
          <p className="text-gray-600">管理和培育你的数字宠物</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/adopt">
            <button className="btn-accent flex items-center">
              <i className="fa fa-plus mr-2"></i>领养新宠物
            </button>
          </Link>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}
      
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {pets.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="mb-4 text-6xl text-gray-300">
            <i className="fa fa-paw"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">还没有宠物</h3>
          <p className="text-gray-600 mb-6">点击下方按钮领养你的第一只宠物</p>
          <Link to="/adopt">
            <button className="btn-accent px-8 py-3">
              <i className="fa fa-heart mr-2"></i>领养宠物
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map(pet => (
            <PetCard 
              key={pet.id} 
              pet={pet} 
              onBreed={() => {}}
              showActions={true}
            />
          ))}
        </div>
      )}
      
      <div className="mt-12 bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-xl mb-4 text-primary">宠物繁殖中心</h3>
        <p className="text-gray-600 mb-4">使用两只宠物进行繁殖，创造独特的后代。繁殖需要支付少量ETH作为手续费。</p>
        <Link to="/breed">
          <button className="btn-secondary">
            <i className="fa fa-heart mr-2"></i>前往繁殖中心
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;