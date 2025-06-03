
import React from 'react';

interface GameControlsProps {
  onEndTurn: () => void;
  onOpenDiplomacy: () => void;
  isDelegated: boolean;
  onToggleDelegate: () => void;
  disableNormalControls: boolean; // Combined disable flag from App.tsx
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onEndTurn, 
  onOpenDiplomacy, 
  isDelegated, 
  onToggleDelegate,
  disableNormalControls
}) => {
  return (
    <div className="bg-gray-800 p-3 shadow-inner sticky bottom-0 z-10">
      <div className="container mx-auto flex justify-center items-center space-x-2 sm:space-x-4">
        <button
          onClick={onToggleDelegate}
          className={`font-bold py-3 px-4 sm:px-6 rounded-lg shadow transition-colors text-xs sm:text-sm
                      ${isDelegated ? 'bg-purple-500 hover:bg-purple-700 text-white' 
                                     : 'bg-gray-600 hover:bg-gray-500 text-white'}
                      ${disableNormalControls ? 'opacity-50 cursor-not-allowed' : ''} 
                      `}
          aria-label={isDelegated ? "위임 비활성화" : "위임 활성화"}
          disabled={disableNormalControls} 
        >
          {isDelegated ? '위임 중 (해제)' : '위임'}
        </button>
        <button
          onClick={onOpenDiplomacy}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          aria-label="외교 메뉴 열기"
          disabled={disableNormalControls}
        >
          외교
        </button>
        <button
          onClick={onEndTurn}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 sm:px-6 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          aria-label="턴 종료"
          disabled={disableNormalControls}
        >
          턴 종료
        </button>
      </div>
    </div>
  );
};

export default GameControls;
