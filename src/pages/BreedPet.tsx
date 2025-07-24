import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { breedPets } from '../store/petSlice';
import { ethers } from 'ethers';
import PetCard from '../components/PetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { RootState } from '../store/store';

interface BreedPetPageProps {
  contract: ethers.Contract | null;
}

const BreedPetPage: React.FC<BreedPetPageProps> = ({ contract }) => {
  const { pets, loading, error } = useSelector((state: RootState) => state.pet);
  const { account } = useSelector((state: RootState) => state.web3);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [selectedPet1, setSelectedPet1] = useState<number | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<number | null>(null);
  const [breedingError, setBreedingError] = useState<string | null>(null);
  const [breedingSuccess, setBreedingSuccess] = useState<string | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);

  // 检查宠物是否可以繁殖
  const canBreed = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.canBreed || false;
  };

  // 处理宠物选择
  const handlePetSelect = (petId: number) => {
    if (!selectedPet1) {
      setSelectedPet1(petId);
      setSelectedPet2(null);
    } else if (!selectedPet2 && petId !== selectedPet1) {
      setSelectedPet2(petId);
    } else if (selectedPet1 === petId) {
      setSelectedPet1(null);
    } else if (selectedPet2 === petId) {
      setSelectedPet2(null);
    }
  };

  // 处理繁殖提交
  const handleBreedSubmit = async () => {
    if (!selectedPet1 || !selectedPet2 || !contract) {
      setBreedingError('请选择两只不同的宠物进行繁殖');
      return;
    }

    if (!canBreed(selectedPet1) || !canBreed(selectedPet2)) {
      setBreedingError('所选宠物无法繁殖。请确保它们都可以繁殖且冷却时间已过。');
      return;
    }

    try {
      setIsBreeding(true);
      setBreedingError(null);
      setBreedingSuccess(null);

      // 执行繁殖
      const result = await dispatch(breedPets({ petId1: selectedPet1, petId2: selectedPet2 }));
      
      if (breedPets.fulfilled.match(result)) {
        setBreedingSuccess(result.payload.message);
        // 重置选择
        setSelectedPet1(null);
        setSelectedPet2(null);
        
        // 5秒后返回仪表盘
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else {
        setBreedingError(result.error.message);
      }
    } catch (err: any) {
      setBreedingError(err.message);
    } finally {
      setIsBreeding(false);
    }
  };

  // 渲染选择的宠物
  const renderSelectedPets = () => {
    if (!selectedPet1 && !selectedPet2) {
      return <p className="text-gray-500 text-center py-4">请选择两只宠物进行繁殖</p>;
    }

    const pet1 = pets.find(p => p.id === selectedPet1);
    const pet2 = pets.find(p => p.id === selectedPet2);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {selectedPet1 && pet1 && (
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-primary">
            <h3 className="font-bold text-lg mb-2">选择的宠物 1</h3>
            <PetCard pet={pet1} />
            <button 
              onClick={() => setSelectedPet1(null)} 
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all duration-300"
            >
              取消选择
            </button>
          </div>
        )}
        {selectedPet2 && pet2 && (
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-primary">
            <h3 className="font-bold text-lg mb-2">选择的宠物 2</h3>
            <PetCard pet={pet2} />
            <button 
              onClick={() => setSelectedPet2(null)} 
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all duration-300"
            >
              取消选择
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-primary">宠物繁殖中心</h2>
      
      {loading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>错误:</strong> {error}
        </div>
      )}
      
      {breedingError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>繁殖错误:</strong> {breedingError}
        </div>
      )}
      
      {breedingSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功:</strong> {breedingSuccess}
        </div>
      )}
      
      {/* 已选择的宠物 */}
      {renderSelectedPets()}
      
      {/* 宠物列表 */}
      <h3 className="text-xl font-bold mb-4">你的宠物</h3>
      
      {pets.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-4">你还没有任何宠物。请先领养或购买宠物。</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn-primary"
          >
            返回首页
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pets.map(pet => (
            <div 
              key={pet.id} 
              onClick={() => handlePetSelect(pet.id)}
              className={`cursor-pointer ${selectedPet1 === pet.id || selectedPet2 === pet.id ? 'ring-4 ring-primary' : ''}`}
            >
              <PetCard 
                pet={pet} 
                onBreed={canBreed(pet.id) ? () => handlePetSelect(pet.id) : undefined}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* 繁殖按钮 */}
      {selectedPet1 && selectedPet2 && (
        <div className="mt-8 text-center">
          <button 
            onClick={handleBreedSubmit} 
            className="btn-secondary px-8 py-3 text-lg"
            disabled={isBreeding}
          >
            {isBreeding ? (
              <>
                <i className="fa fa-spinner fa-spin mr-2"></i>繁殖中...
              </>
            ) : (
              <>
                <i className="fa fa-heart mr-2"></i>开始繁殖
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BreedPetPage;    