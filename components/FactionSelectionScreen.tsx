
import React from 'react';
import { RawFactionData } from '../types';

interface FactionSelectionScreenProps {
  factionsData: RawFactionData[];
  onSelectFaction: (factionId: string) => void;
  savedGameAvailable?: boolean;
  onLoadSavedGame?: () => void;
}

const FactionSelectionScreen: React.FC<FactionSelectionScreenProps> = ({ 
  factionsData, 
  onSelectFaction,
  savedGameAvailable,
  onLoadSavedGame 
}) => {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4 selection:bg-yellow-300 selection:text-yellow-900">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-4xl w-full">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            삼국지 Lite: <span className="text-blue-600">세력 선택</span>
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">천하통일의 대업을 함께할 세력을 선택하십시오!</p>
        </header>

        {savedGameAvailable && onLoadSavedGame && (
          <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">저장된 게임 발견!</h3>
            <p className="text-base text-blue-600 mb-3">이전에 진행하던 게임을 이어서 하시겠습니까?</p>
            <button
              onClick={onLoadSavedGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              aria-label="저장된 게임 이어하기"
            >
              이어하기
            </button>
            <p className="text-xs text-gray-500 mt-3">또는 아래에서 새 세력을 선택하여 새로 시작할 수 있습니다.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {factionsData.map((faction) => {
            const buttonTextColorClass = faction.color.includes('yellow-500') ? 'text-yellow-400' : faction.color.replace('bg-', 'text-');
            const buttonBgColorClass = faction.color.includes('yellow-500') ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50';
            const ringColorFocusClass = faction.color.includes('yellow-500') ? 'focus:ring-yellow-400' :
                                        faction.color.includes('red-700') ? 'focus:ring-red-400' :
                                        faction.color.includes('green-600') ? 'focus:ring-green-400' :
                                        faction.color.includes('blue-600') ? 'focus:ring-blue-400' : 'focus:ring-gray-400';


            return (
              <button
                key={faction.id}
                onClick={() => onSelectFaction(faction.id)}
                className={`p-5 rounded-lg shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl focus:outline-none focus:ring-4 ${ringColorFocusClass} focus:ring-opacity-75 ${faction.color} ${faction.textColor} flex flex-col text-left h-full group`}
                aria-label={`${faction.name} 세력 선택`}
              >
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-1">{faction.name}</h2>
                  <p className="text-sm opacity-90 mb-3">(군주: {faction.leader})</p>
                  
                  <div className="text-xs space-y-0.5 opacity-80 mb-4">
                    <p>💰 초기 자금: {faction.initialMoney.toLocaleString()}</p>
                    <p>🌾 초기 식량: {faction.initialFood.toLocaleString()}</p>
                    <p>⚔️ 초기 병력: {faction.initialTroops.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-auto text-center">
                  <span 
                    className={`inline-block ${buttonBgColorClass} ${buttonTextColorClass} px-6 py-2 rounded-md font-semibold text-sm shadow-sm group-hover:scale-105 transform transition-transform duration-150`}
                  >
                    이 세력으로 시작
                  </span>
                </div>
              </button>
            );
          })}
        </div>
         <footer className="text-center text-gray-500 mt-8 text-xs sm:text-sm">
            각 세력은 고유한 시작 조건과 강점을 가지고 있습니다. 신중하게 선택하세요!
          </footer>
      </div>
    </div>
  );
};

export default FactionSelectionScreen;
