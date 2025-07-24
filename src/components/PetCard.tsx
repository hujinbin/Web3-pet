import React from 'react';
import { Link } from 'react-router-dom';
import { Pet } from '../store/petSlice';

interface PetCardProps {
  pet: Pet;
  onBreed?: (petId: number) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onBreed }) => {
  // 计算宠物等级（简化版）
  const level = Math.floor(pet.experience / 100) + 1;

  // 计算稀有度类名
  const rarityClass = () => {
    switch (pet.rarity) {
      case 1: return 'bg-gray-100 border-gray-200'; // 普通
      case 2: return 'bg-green-50 border-green-200'; // 稀有
      case 3: return 'bg-blue-50 border-blue-200'; // 史诗
      case 4: return 'bg-purple-50 border-purple-200'; // 传说
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  // 计算稀有度标签
  const rarityLabel = () => {
    switch (pet.rarity) {
      case 1: return '普通';
      case 2: return '稀有';
      case 3: return '史诗';
      case 4: return '传说';
      default: return '普通';
    }
  };

  // 计算稀有度颜色
  const rarityColor = () => {
    switch (pet.rarity) {
      case 1: return 'text-gray-600';
      case 2: return 'text-green-600';
      case 3: return 'text-blue-600';
      case 4: return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`pet-card ${rarityClass()} border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
      <div className="relative">
        {/* 宠物图片 */}
        <img 
          src={pet.imageUrl || 'https://picsum.photos/seed/pet' + pet.id + '/300/200'} 
          alt={`宠物 #${pet.id}`} 
          className="w-full h-48 object-cover"
        />
        
        {/* 宠物ID和稀有度 */}
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center">
          <span className="mr-2">#{pet.id}</span>
          <span className={`${rarityColor()} font-bold`}>{rarityLabel()}</span>
        </div>
        
        {/* 宠物等级 */}
        <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white">
          Lv.{level}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate">{pet.name || `宠物 #${pet.id}`}</h3>
        
        {/* 宠物属性 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-100 rounded p-2">
            <div className="text-xs text-gray-500">力量</div>
            <div className="font-medium">{pet.strength}</div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-xs text-gray-500">敏捷</div>
            <div className="font-medium">{pet.speed}</div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-xs text-gray-500">智力</div>
            <div className="font-medium">{pet.intelligence}</div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-xs text-gray-500">生命值</div>
            <div className="font-medium">{pet.health}</div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Link to={`/pet/${pet.id}`} className="btn-primary flex-1">
            查看详情
          </Link>
          {onBreed && (
            <button onClick={() => onBreed(pet.id)} className="btn-secondary flex-1">
              繁殖
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetCard;    