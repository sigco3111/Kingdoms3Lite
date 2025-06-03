
import React, { useState } from 'react';
import { Faction, DiplomaticStatus } from '../types';
import { 
    GIFT_VALUE_SMALL, GIFT_VALUE_MEDIUM, GIFT_VALUE_LARGE, 
    GIFT_RELATION_BONUS_SMALL, GIFT_RELATION_BONUS_MEDIUM, GIFT_RELATION_BONUS_LARGE,
    GIFT_COOLDOWN_TURNS
} from '../constants';


interface DiplomacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerFaction: Faction;
  otherFactions: Faction[];
  onDiplomaticAction: (action: string, targetFactionId: string, payload?: any) => void;
  turnNumber: number;
  setTargetFactionForGift: (factionId: string | null) => void;
  targetFactionForGift: string | null;
  isDelegated: boolean; // Added for delegation mode
}

const DiplomacyModal: React.FC<DiplomacyModalProps> = ({
  isOpen,
  onClose,
  playerFaction,
  otherFactions,
  onDiplomaticAction,
  turnNumber,
  setTargetFactionForGift,
  targetFactionForGift,
  isDelegated
}) => {
  const [giftAmount, setGiftAmount] = useState<number>(GIFT_VALUE_SMALL);

  if (!isOpen) return null;

  const getRelationDisplay = (score: number): { text: string, colorClass: string } => {
    if (score <= -50) return { text: `적대 (${score})`, colorClass: 'text-red-500' };
    if (score < 0) return { text: `불화 (${score})`, colorClass: 'text-orange-500' };
    if (score === 0) return { text: `중립 (${score})`, colorClass: 'text-gray-700' };
    if (score < 50) return { text: `우호 (${score})`, colorClass: 'text-green-500' };
    return { text: `맹방 (${score})`, colorClass: 'text-emerald-600' };
  };

  const getStatusDisplay = (status: DiplomaticStatus): string => {
    switch (status) {
      case 'war': return '전쟁 중';
      case 'peace': return '평화';
      case 'alliance': return '동맹';
      default: return '알 수 없음';
    }
  };

  const handleSendGiftAction = () => {
    if (targetFactionForGift) {
        onDiplomaticAction('send_gift', targetFactionForGift, giftAmount);
        setTargetFactionForGift(null); 
    }
  };
  
  const canSendGiftCheck = (targetFactionId: string) => {
    const lastGiftTurn = playerFaction.relations[targetFactionId]?.lastGiftTurn;
    if (lastGiftTurn && (turnNumber - lastGiftTurn < GIFT_COOLDOWN_TURNS) ) {
        return playerFaction.money >= GIFT_VALUE_SMALL;
    }
    return playerFaction.money >= GIFT_VALUE_SMALL;
  };

  const getGiftButtonTextDisplay = (targetFactionId: string) => {
    const lastGiftTurn = playerFaction.relations[targetFactionId]?.lastGiftTurn;
    if (lastGiftTurn && (turnNumber - lastGiftTurn < GIFT_COOLDOWN_TURNS) ) {
        const turnsLeft = GIFT_COOLDOWN_TURNS - (turnNumber - lastGiftTurn);
        return `선물 (대기 ${turnsLeft}턴)`;
    }
    return '선물 보내기';
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">외교 관계</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl leading-none p-1" aria-label="닫기">&times;</button>
        </div>

        {targetFactionForGift && (() => {
            const target = otherFactions.find(f => f.id === targetFactionForGift);
            if (!target) return null;
            return (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={() => setTargetFactionForGift(null)}>
                 <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold mb-3 text-center">선물 보내기: {target.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">현재 보유 금: {playerFaction.money.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mb-3">선물은 관계를 개선하지만, 너무 자주 보내면 효과가 감소합니다.</p>
                    <div className="space-y-2 mb-4">
                        {[GIFT_VALUE_SMALL, GIFT_VALUE_MEDIUM, GIFT_VALUE_LARGE].map(val => (
                            <button 
                                key={val}
                                onClick={() => setGiftAmount(val)}
                                disabled={playerFaction.money < val || isDelegated}
                                className={`w-full p-2 rounded border text-sm ${giftAmount === val ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} ${(playerFaction.money < val || isDelegated) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                금 {val.toLocaleString()} (관계 +{val === GIFT_VALUE_SMALL ? GIFT_RELATION_BONUS_SMALL : val === GIFT_VALUE_MEDIUM ? GIFT_RELATION_BONUS_MEDIUM : GIFT_RELATION_BONUS_LARGE})
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setTargetFactionForGift(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm" disabled={isDelegated}>취소</button>
                        <button 
                            onClick={handleSendGiftAction} 
                            disabled={playerFaction.money < giftAmount || isDelegated}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                        >
                            보내기
                        </button>
                    </div>
                 </div>
            </div>
            );
        })()}


        <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {otherFactions.map(faction => {
            const relation = playerFaction.relations[faction.id];
            if (!relation) return null; 

            const relationDisplay = getRelationDisplay(relation.score);
            const statusDisplay = getStatusDisplay(relation.status);

            return (
              <div key={faction.id} className={`p-3 rounded-md border-l-4 ${faction.color.replace('bg-', 'border-')} bg-gray-50`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-lg font-semibold ${faction.textColor} ${faction.color} px-2 py-0.5 rounded-sm inline-block`}>{faction.name} <span className="text-xs opacity-80">({faction.leader})</span></h3>
                  <div className="text-right">
                     <p className={`text-sm font-medium ${relationDisplay.colorClass}`}>{relationDisplay.text}</p>
                     <p className="text-xs text-gray-500">{statusDisplay}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                  <button
                    onClick={() => setTargetFactionForGift(faction.id)}
                    disabled={!canSendGiftCheck(faction.id) || isDelegated}
                    className="px-2 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:bg-gray-300 disabled:opacity-70 transition-colors"
                  >
                    {getGiftButtonTextDisplay(faction.id)}
                  </button>

                  {relation.status === 'peace' && (
                    <button
                      onClick={() => onDiplomaticAction('offer_alliance', faction.id)}
                      disabled={isDelegated}
                      className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:bg-gray-300 disabled:opacity-70"
                    >
                      동맹 제안
                    </button>
                  )}
                  {relation.status === 'alliance' && (
                    <button
                      onClick={() => onDiplomaticAction('break_alliance', faction.id)}
                      disabled={isDelegated}
                      className="px-2 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors disabled:bg-gray-300 disabled:opacity-70"
                    >
                      동맹 파기
                    </button>
                  )}
                   {relation.status === 'war' && (
                    <button
                      onClick={() => onDiplomaticAction('offer_peace', faction.id)}
                      disabled={isDelegated}
                      className="px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:bg-gray-300 disabled:opacity-70"
                    >
                      평화 제안
                    </button>
                  )}
                  {relation.status !== 'war' && (
                    <button
                      onClick={() => onDiplomaticAction('declare_war', faction.id)}
                      disabled={isDelegated}
                      className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:bg-gray-300 disabled:opacity-70"
                    >
                      전쟁 선포
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
         {isDelegated && (
            <p className="text-center text-purple-600 font-semibold mt-3 text-sm">위임 모드 활성화 중에는 외교 조작이 불가능합니다.</p>
        )}
      </div>
    </div>
  );
};

export default DiplomacyModal;
