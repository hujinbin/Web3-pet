import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { adoptPet } from '../store/petSlice';
import type { RootState } from '../store/store';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface AdoptPetPageProps {}

const AdoptPetPage: React.FC<AdoptPetPageProps> = () => {
  const { loading, error, adopting } = useSelector((state: RootState) => state.pet);
  const { account, contract } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();
  
  const [petName, setPetName] = useState('');
  const [adoptionSuccess, setAdoptionSuccess] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPetName(e.target.value);
  };

  const handleAdopt = async () => {
    if (!petName.trim()) {
      return;
    }

    try {
      await dispatch(adoptPet(petName));
      setAdoptionSuccess(true);
      setPetName('');
      
      // 3秒后返回首页
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      // 错误处理已在redux中完成
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">领养新宠物</h2>
      
      {loading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}
      
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {adoptionSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功!</strong> 你的新宠物已经领养成功！
        </div>
      )}
      
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="mb-4">
          <label htmlFor="petName" className="block text-gray-700 font-medium mb-2">给你的宠物起个名字:</label>
          <input
            type="text"
            id="petName"
            value={petName}
            onChange={handleNameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="输入宠物名字"
          />
        </div>
        
        <button
          onClick={handleAdopt}
          className="w-full btn-accent"
          disabled={!petName.trim() || adopting || !account || !contract}
        >
          {adopting ? (
            <>
              <i className="fa fa-spinner fa-spin mr-2"></i>领养中...
            </>
          ) : (
            <>
              <i className="fa fa-heart mr-2"></i>领养宠物
            </>
          )}
        </button>
      </div>
      
      <div className="mt-6 bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-lg mb-3">领养须知</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
            <span>领养需要支付少量ETH作为手续费</span>
          </li>
          <li className="flex items-start">
            <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
            <span>每个宠物都有唯一的DNA和属性</span>
          </li>
          <li className="flex items-start">
            <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
            <span>宠物可以繁殖，产生具有父母特征的新宠物</span>
          </li>
          <li className="flex items-start">
            <i className="fa fa-check-circle text-green-500 mt-1 mr-2"></i>
            <span>宠物可以升级，提升属性和能力</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdoptPetPage;    