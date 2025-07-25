import React from 'react';
import { Link } from 'react-router-dom';

interface PetCardProps {
  pet: any;
  onBreed?: () => void;
  showActions?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onBreed, showActions = false }) => {
  // 计算宠物年龄
  const ageInDays = Math.floor((Date.now() - pet.birthTime) / (1000 * 60 * 60 * 24));
  
  // 根据稀有度设置颜色
  const rarityColors: { [key: string]: string } = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  };
  
  // 根据类型设置图标
  const typeIcons: { [key: string]: string } = {
    dog: 'fa-dog',
    cat: 'fa-cat',
    bird: 'fa-dove',
    rabbit: 'fa-rabbit',
    dragon: 'fa-dragon'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <img 
          src={pet.imageUrl} 
          alt={`宠物 ${pet.name}`} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full px-3 py-1 text-sm font-medium">
          <i className={`fa ${typeIcons[pet.type] || 'fa-paw'} mr-1`}></i>
          {pet.type}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{pet.name}</h3>
          <span className={`text-xs font-medium ${rarityColors[pet.rarity] || 'text-gray-600'}`}>
            {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center">
            <i className="fa fa-bolt text-yellow-500 mr-1"></i>
            <span>等级: {pet.level}</span>
          </div>
          <div className="flex items-center">
            <i className="fa fa-calendar text-blue-500 mr-1"></i>
            <span>年龄: {ageInDays}天</span>
          </div>
          <div className="flex items-center">
            <i className="fa fa-id-card text-purple-500 mr-1"></i>
            <span>ID: #{pet.id}</span>
          </div>
          <div className="flex items-center">
            <i className="fa fa-heart text-red-500 mr-1"></i>
            <span>可繁殖: {pet.canBreed ? '是' : '否'}</span>
          </div>
        </div>
        
        {showActions ? (
          <div className="flex space-x-2">
            <Link to={`/pet/${pet.id}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg transition-all duration-300">
              查看详情
            </Link>
            {pet.canBreed && (
              <button 
                onClick={onBreed} 
                className="flex-1 bg-primary hover:bg-primary/90 text-white text-center py-2 px-4 rounded-lg transition-all duration-300"
              >
                繁殖
              </button>
            )}
          </div>
        ) : (
          <Link to={`/pet/${pet.id}`} className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg transition-all duration-300">
            查看详情
          </Link>
        )}
      </div>
    </div>
  );
};

export default PetCard;    