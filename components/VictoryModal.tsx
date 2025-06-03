
import React from 'react';
import { Faction } from '../types';

interface VictoryModalProps {
  winner: Faction;
  turnNumber: number;
  year: number;
  month: number;
  onStartNewGame: () => void; // Added prop
}

const VictoryModal: React.FC<VictoryModalProps> = ({ winner, turnNumber, year, month, onStartNewGame }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center border-t-8 ${winner.color.replace('bg-', 'border-')}`}>
        <h1 className="text-4xl font-bold mb-4">승리!</h1>
        <div className={`text-2xl font-semibold ${winner.textColor} ${winner.color} px-3 py-1 rounded-md inline-block mb-6`}>
          {winner.name} ({winner.leader})
        </div>
        <p className="text-lg text-gray-700 mb-2">
          {winner.name} 세력이 천하를 통일했습니다!
        </p>
        <p className="text-gray-600 mb-6">
          {year}년 {month}월, 제 {turnNumber}턴에 위업을 달성했습니다.
        </p>
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

export default VictoryModal;
