
import React from 'react';
import { Faction, Region } from '../types';

interface GameOverModalProps {
  playerFaction: Faction | null;
  allFactions: Faction[];
  allRegions: Region[];
  turnNumber: number;
  year: number;
  month: number;
  onStartNewGame: () => void; // Added prop
}

const GameOverModal: React.FC<GameOverModalProps> = ({ playerFaction, allFactions, allRegions, turnNumber, year, month, onStartNewGame }) => {
  const getFactionRegionCount = (factionId: string | null) => {
    if (!factionId) return 0; 
    return allRegions.filter(r => r.ownerId === factionId).length;
  };
  
  const neutralRegionCount = allRegions.filter(r => r.ownerId === null).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-xl text-center border-t-8 ${playerFaction ? playerFaction.color.replace('bg-', 'border-') : 'border-gray-500'}`}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">게임 종료</h1>
        
        {playerFaction && (
          <p className="text-lg text-gray-700 mb-2">
            <span className={`${playerFaction.textColor} ${playerFaction.color} px-2 py-1 rounded`}>{playerFaction.name}</span> 세력이 <span className="font-semibold">{year}년 {month}월, 제 {turnNumber}턴</span>에 멸망했습니다.
          </p>
        )}
        {!playerFaction && (
           <p className="text-lg text-gray-700 mb-2">
            게임이 <span className="font-semibold">{year}년 {month}월, 제 {turnNumber}턴</span>에 종료되었습니다.
          </p>
        )}

        <div className="my-6 text-left space-y-4 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-md border">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">최종 세력 현황:</h3>
                <ul className="text-sm space-y-1">
                {allFactions.map(f => (
                    <li key={f.id} className={`p-1.5 rounded ${f.eliminated ? 'opacity-70' : ''}`}>
                    <span className={`${f.textColor} ${f.color} px-1.5 py-0.5 rounded-sm font-semibold`}>{f.name}</span>:
                    <span className="ml-2">💰{f.money.toLocaleString()}</span>
                    <span className="ml-2">🌾{f.food.toLocaleString()}</span>
                    <span className="ml-2">⚔️{f.troops.toLocaleString()}</span>
                    <span className="ml-2">🏞️{getFactionRegionCount(f.id)}개</span>
                    {f.eliminated && <span className="ml-1.5 text-red-600 font-semibold">(멸망)</span>}
                    </li>
                ))}
                </ul>
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">최종 영토 분포:</h3>
                 <ul className="text-sm space-y-1">
                    {allFactions.filter(f => !f.eliminated && getFactionRegionCount(f.id) > 0).map(f => (
                         <li key={`territory-${f.id}`} className="p-1.5 rounded">
                            <span className={`${f.textColor} ${f.color} px-1.5 py-0.5 rounded-sm font-semibold`}>{f.name}</span>:
                            <span className="ml-2">{getFactionRegionCount(f.id)}개 지역</span>
                        </li>
                    ))}
                    {neutralRegionCount > 0 && (
                         <li className="p-1.5 rounded">
                            <span className="bg-gray-400 text-gray-800 px-1.5 py-0.5 rounded-sm font-semibold">중립</span>:
                            <span className="ml-2">{neutralRegionCount}개 지역</span>
                        </li>
                    )}
                 </ul>
            </div>
        </div>
        
        <button
          onClick={onStartNewGame} // Changed from window.location.reload()
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
        >
          새 게임 시작
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
