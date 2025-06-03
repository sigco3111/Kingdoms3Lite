
import React, { useState, useMemo } from 'react';
import { Region, Faction, BuildingType } from '../types';
import { RECRUIT_MAX_FOOD_FACTOR, NEUTRAL_GARRISON_MULTIPLIER, RECRUIT_COST_PER_TROOP, BUILDING_DEFINITIONS, MAX_BUILDING_LEVEL, PUBLIC_ORDER_REBELLION_THRESHOLD, PUBLIC_ORDER_LOW_INCOME_THRESHOLD, PUBLIC_ORDER_HIGH_INCOME_THRESHOLD } from '../constants';


interface RegionInfoModalProps {
  region: Region;
  owner: Faction | null;
  currentFaction: Faction;
  allFactions: Faction[];
  allRegions: Region[]; 
  adjacentRegions: Region[]; 
  onClose: () => void;
  onDevelop: (regionId: string) => void;
  onRecruit: (regionId: string, amount: number) => void;
  onAttack: (attackerBaseRegionId: string, targetRegionId: string) => void;
  onConstructBuilding: (regionId: string, slotIndex: number, type: BuildingType) => void;
  onUpgradeBuilding: (regionId: string, slotIndex: number) => void;
  onDemolishBuilding: (regionId: string, slotIndex: number) => void;
  developCost: number;
  recruitCostPerTroop: number;
  isDelegated: boolean; // Added for delegation mode
}

const RegionInfoModal: React.FC<RegionInfoModalProps> = ({
  region, owner, currentFaction, allFactions, allRegions, adjacentRegions,
  onClose, onDevelop, onRecruit, onAttack,
  onConstructBuilding, onUpgradeBuilding, onDemolishBuilding,
  developCost,
  isDelegated
}) => {
  const [recruitAmount, setRecruitAmount] = useState('');

  const isOwnedByCurrentPlayer = region.ownerId === currentFaction.id;
  const controlsDisabledByDelegation = isDelegated && isOwnedByCurrentPlayer;
  
  const calculatedIncome = useMemo(() => {
    let money = region.baseMoneyIncome * (1 + region.developmentLevel * 0.1);
    let food = region.baseFoodIncome * (1 + region.developmentLevel * 0.1);
    region.buildings.forEach(building => {
      if (building) {
        const effects = BUILDING_DEFINITIONS[building.type].effects(building.level);
        if (effects.moneyBonus) money += effects.moneyBonus;
        if (effects.foodBonus) food += effects.foodBonus;
      }
    });
    return { money: Math.floor(money), food: Math.floor(food) };
  }, [region]);


  const canDevelop = currentFaction.money >= developCost && isOwnedByCurrentPlayer && region.developmentLevel < region.maxDevelopmentLevel;
  
  const maxRecruitable = useMemo(() => {
    if (!isOwnedByCurrentPlayer) return 0;
    let max = Math.floor(region.baseFoodIncome * RECRUIT_MAX_FOOD_FACTOR);
     region.buildings.forEach(building => {
        if (building?.type === 'barracks' && building.level > 0) {
          const effects = BUILDING_DEFINITIONS.barracks.effects(building.level);
          if (effects.maxRecruitsBonus) max += effects.maxRecruitsBonus;
        }
      });
    return max;
  }, [region, isOwnedByCurrentPlayer]);

  const recruitCostModifier = useMemo(() => {
    let modifier = 1.0;
    if (!isOwnedByCurrentPlayer) return modifier;
    region.buildings.forEach(building => {
      if (building?.type === 'barracks' && building.level > 0) {
        const effects = BUILDING_DEFINITIONS.barracks.effects(building.level);
        if (effects.recruitCostModifier) modifier *= effects.recruitCostModifier;
      }
    });
    return modifier;
  }, [region, isOwnedByCurrentPlayer]);

  const handleRecruitAction = () => {
    const amount = parseInt(recruitAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("올바른 징병 인원수를 입력하세요.");
      return;
    }
    if (amount > maxRecruitable) {
      alert(`이 지역에서는 최대 ${maxRecruitable}명까지 징병할 수 있습니다.`);
      return;
    }
    const cost = amount * RECRUIT_COST_PER_TROOP * recruitCostModifier;
    if (currentFaction.money < cost) {
      alert(`자금 부족! (필요: ${cost.toFixed(0)} 금)`);
      return;
    }
    onRecruit(region.id, amount);
    setRecruitAmount('');
  };

  const getPublicOrderStatusText = () => {
    if (region.publicOrder < PUBLIC_ORDER_REBELLION_THRESHOLD) return { text: `반란 위험 (${region.publicOrder})`, color: "text-red-600 font-bold" };
    if (region.publicOrder < PUBLIC_ORDER_LOW_INCOME_THRESHOLD) return { text: `불안정 (${region.publicOrder})`, color: "text-orange-500 font-semibold" };
    if (region.publicOrder > PUBLIC_ORDER_HIGH_INCOME_THRESHOLD) return { text: `매우 안정적 (${region.publicOrder})`, color: "text-green-600 font-semibold"};
    return { text: `안정적 (${region.publicOrder})`, color: "text-gray-700" };
  };
  const poStatus = getPublicOrderStatusText();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{region.name} <span className="text-sm sm:text-lg text-gray-600">({region.province})</span></h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none p-1">&times;</button>
        </div>

        <div className="overflow-y-auto space-y-3 text-xs sm:text-sm text-gray-700 mb-3 pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="space-y-1">
              <p>소유 세력: <span className={`font-semibold ${owner ? owner.textColor : ''} ${owner ? owner.color : 'bg-gray-400 text-gray-800'} px-1.5 py-0.5 rounded-sm`}>{owner ? owner.name : '중립'}</span></p>
              <p>💰 기본 금 수입: {region.baseMoneyIncome} (건물 포함시: {calculatedIncome.money})</p>
              <p>🌾 기본 식량 수입: {region.baseFoodIncome} (건물 포함시: {calculatedIncome.food})</p>
              <p>🛠️ 지역 개발도: {region.developmentLevel} / {region.maxDevelopmentLevel}</p>
              <p>🏞️ 공공 질서: <span className={poStatus.color}>{poStatus.text}</span></p>
            </div>

            <div>
              {(isOwnedByCurrentPlayer && adjacentRegions.length > 0) && (
                <>
                  {currentFaction.troops > 0 ? (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-1 text-sm sm:text-base">인접 지역 (가용 병력: {currentFaction.troops.toLocaleString()})</h3>
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-1 max-h-36 sm:max-h-40 overflow-y-auto text-xs sm:text-sm pr-1 custom-scrollbar">
                        {adjacentRegions.map(adjRegion => {
                          if (adjRegion.ownerId === currentFaction.id) return null;

                          const targetOwner = adjRegion.ownerId ? allFactions.find(f => f.id === adjRegion.ownerId) : null;
                          let defenderStrengthEstText: string;
                          let defenderStrengthValue = 0;
                          if (targetOwner) {
                            defenderStrengthValue = targetOwner.troops;
                          } else {
                            defenderStrengthValue = Math.floor(adjRegion.baseMoneyIncome * NEUTRAL_GARRISON_MULTIPLIER);
                            adjRegion.buildings.forEach(b => {
                              if (b?.type === 'wall' && b.level > 0) defenderStrengthValue += (b.level * adjRegion.baseMoneyIncome * 0.5);
                            });
                          }
                          defenderStrengthEstText = `병력 약 ${defenderStrengthValue.toLocaleString()}`;

                          return (
                            <li key={adjRegion.id} className="flex flex-col justify-between items-start p-1.5 bg-gray-50 rounded hover:bg-gray-100 border">
                              <div>
                                <span className="font-medium">{adjRegion.name}</span> 
                                <span className="text-[10px] text-gray-500">({targetOwner ? targetOwner.name : '중립'})</span>
                                <p className="text-[10px] text-gray-500">{defenderStrengthEstText}</p>
                              </div>
                              <button
                                onClick={() => onAttack(region.id, adjRegion.id)}
                                disabled={controlsDisabledByDelegation}
                                className="mt-1 w-full px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition-colors text-[10px] sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                공격
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-center text-xs sm:text-sm text-orange-600 font-semibold">가용 병력이 없어 인접 지역을 공격할 수 없습니다.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        
        {isOwnedByCurrentPlayer && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">지역 일반 관리</h3>
            {region.developmentLevel < region.maxDevelopmentLevel && (
              <button
                onClick={() => onDevelop(region.id)}
                disabled={!canDevelop || controlsDisabledByDelegation}
                className={`w-full mb-2 px-3 py-1.5 rounded font-semibold transition-colors text-xs sm:text-sm
                            ${(canDevelop && !controlsDisabledByDelegation) ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                지역 개발 (비용: {developCost} 금) - 기본 생산량 증가
              </button>
            )}
            {region.developmentLevel >= region.maxDevelopmentLevel && (
               <p className="text-center text-xs sm:text-sm text-green-600 font-semibold mb-2">이 지역은 최대로 개발되었습니다.</p>
            )}

            <div className="mt-2">
              <label htmlFor="recruitAmount" className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-1">징병 (최대: {maxRecruitable.toLocaleString()}명, 비용: {(RECRUIT_COST_PER_TROOP * recruitCostModifier).toFixed(2)}금/명):</label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  id="recruitAmount"
                  value={recruitAmount}
                  onChange={(e) => setRecruitAmount(e.target.value)}
                  placeholder={`0 ~ ${maxRecruitable}`}
                  min="0"
                  max={maxRecruitable}
                  disabled={controlsDisabledByDelegation}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm disabled:bg-gray-200"
                />
                <button
                  onClick={handleRecruitAction}
                  disabled={controlsDisabledByDelegation || maxRecruitable === 0 || parseInt(recruitAmount) <=0 || currentFaction.money < (parseInt(recruitAmount) * RECRUIT_COST_PER_TROOP * recruitCostModifier) }
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  징병
                </button>
              </div>
            </div>
          </div>
        )}

        {isOwnedByCurrentPlayer && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">건물 관리 (슬롯: {region.maxBuildingSlots}개)</h3>
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: region.maxBuildingSlots }).map((_, slotIndex) => {
                        const building = region.buildings[slotIndex];
                        if (building) {
                            const def = BUILDING_DEFINITIONS[building.type];
                            const canUpgrade = building.level < (def.maxLevel || MAX_BUILDING_LEVEL);
                            const upgradeCost = canUpgrade ? def.cost(building.level) : null;
                            return (
                                <div key={slotIndex} className="p-2 border rounded bg-white text-xs sm:text-sm">
                                    <p className="font-semibold">{def.name} (Lv.{building.level})</p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{def.description}</p>
                                    <div className="flex space-x-1 mt-1">
                                        {canUpgrade && (
                                            <button 
                                                onClick={() => onUpgradeBuilding(region.id, slotIndex)}
                                                disabled={controlsDisabledByDelegation || !upgradeCost || currentFaction.money < upgradeCost.money || (upgradeCost.food && currentFaction.food < upgradeCost.food)}
                                                className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                                업그레이드 (금 {upgradeCost?.money}{upgradeCost?.food ? `, 식량 ${upgradeCost.food}` : ''})
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => onDemolishBuilding(region.id, slotIndex)}
                                            disabled={controlsDisabledByDelegation}
                                            className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed">철거</button>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={slotIndex} className="p-2 border rounded bg-white text-xs sm:text-sm">
                                    <p className="font-semibold text-gray-500 mb-1">빈 슬롯 {slotIndex + 1}</p>
                                    <div className="grid grid-cols-1 gap-1">
                                        {(Object.keys(BUILDING_DEFINITIONS) as BuildingType[]).map(type => {
                                            const def = BUILDING_DEFINITIONS[type];
                                            const cost = def.cost(0); 
                                            return (
                                                <button 
                                                    key={type}
                                                    onClick={() => onConstructBuilding(region.id, slotIndex, type)}
                                                    disabled={controlsDisabledByDelegation || currentFaction.money < cost.money || (cost.food && currentFaction.food < cost.food)}
                                                    className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
                                                    title={`${def.name}: ${def.description}\n비용: 금 ${cost.money}${cost.food ? `, 식량 ${cost.food}` : ''}`}
                                                >
                                                    {def.name} 건설
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        )}

         {!isOwnedByCurrentPlayer && region.ownerId && (
           <p className="text-center text-xs sm:text-sm text-red-600 font-semibold mt-3">이 지역은 현재 세력의 소유가 아닙니다.</p>
        )}
         {controlsDisabledByDelegation && (
            <p className="text-center text-purple-600 font-semibold mt-3 text-sm">위임 모드 활성화 중에는 수동 조작이 불가능합니다.</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default RegionInfoModal;
