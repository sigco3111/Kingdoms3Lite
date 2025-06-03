
import React from 'react';
import { Region, Faction } from '../types';

interface RegionGridProps {
  regions: Region[];
  factions: Faction[];
  onRegionSelect: (regionId: string) => void;
}

const RegionGrid: React.FC<RegionGridProps> = ({ regions, factions, onRegionSelect }) => {
  // Determine grid size
  let maxRow = 0;
  let maxCol = 0;
  regions.forEach(r => {
    if (r.uiPosition) {
      if (r.uiPosition.row > maxRow) maxRow = r.uiPosition.row;
      if (r.uiPosition.col > maxCol) maxCol = r.uiPosition.col;
    }
  });
  const gridRows = maxRow + 1;
  const gridCols = maxCol + 1;

  const gridCells: (Region | null)[][] = Array(gridRows).fill(null).map(() => Array(gridCols).fill(null));
  regions.forEach(region => {
    if (region.uiPosition) {
      gridCells[region.uiPosition.row][region.uiPosition.col] = region;
    }
  });
  
  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">천하 지도</h2>
      <div 
        className="grid bg-white overflow-auto aspect-[4/3]"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, 
          gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
          gap: '0px' // Set gap to 0px to remove all spacing
        }}
      >
        {gridCells.flat().map((region, index) => {
          if (!region) {
            // Removed min-h-[60px] from empty cells
            return <div key={`empty-${index}`} className="bg-gray-300 rounded-sm"></div>; 
          }
          const owner = region.ownerId ? factions.find(f => f.id === region.ownerId) : null;
          const bgColor = owner ? owner.color : 'bg-gray-400';
          const textColor = owner ? owner.textColor : 'text-gray-800';
          
          return (
            <button
              key={region.id}
              onClick={() => onRegionSelect(region.id)}
              // Removed focus:ring-2 focus:ring-yellow-500 and min-h-[60px]
              className={`p-1.5 rounded-sm flex flex-col items-center justify-center text-center ${bgColor} ${textColor} transition-all duration-150 ease-in-out focus:outline-none`}
              title={`${region.name} (${region.province})`}
            >
              <span className="text-xs font-semibold leading-tight">{region.name}</span>
              <span className="text-[10px] leading-tight opacity-80">{region.province}</span>
            </button>
          );
        })}
      </div>
       <div className="mt-4 text-xs text-gray-500 text-center">지도에서 지역을 클릭하여 상세 정보를 확인하고 개발할 수 있습니다.</div>
    </div>
  );
};

export default RegionGrid;
