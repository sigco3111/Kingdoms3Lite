
import React from 'react';
import { Faction, Region } from '../types';

interface FactionInfoPanelProps {
  factions: Faction[];
  regions: Region[];
}

const FactionInfoPanel: React.FC<FactionInfoPanelProps> = ({ factions, regions }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3 border-b pb-2 text-gray-700">세력 정보</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {factions.map(faction => {
          const controlledRegions = regions.filter(r => r.ownerId === faction.id).length;
          // Simplified elimination check: faction.eliminated is the source of truth
          const isEliminated = faction.eliminated; 

          return (
            <div key={faction.id} className={`p-3 rounded border-l-4 ${faction.color.replace('bg-', 'border-')} flex flex-col ${isEliminated ? 'opacity-60' : ''}`}>
              <div className={`flex justify-between items-center mb-1`}>
                <h3 className={`text-base font-bold ${faction.textColor} ${faction.color} px-2 py-0.5 rounded-sm inline-flex items-center`}>
                  {faction.name}
                  {isEliminated && <span className="text-xs opacity-90 ml-1.5">(멸망)</span>}
                </h3>
                {!isEliminated && <span className="text-xs text-gray-500">({faction.leader})</span>}
              </div>
              <p className="text-xs text-gray-600 mt-1">💰 금: {faction.money.toLocaleString()}</p>
              <p className="text-xs text-gray-600">🌾 식량: {faction.food.toLocaleString()}</p>
              <p className="text-xs text-gray-600">⚔️ 병력: {faction.troops.toLocaleString()}</p>
              <p className="text-xs text-gray-600">🏞️ 영토: {controlledRegions}개</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FactionInfoPanel;