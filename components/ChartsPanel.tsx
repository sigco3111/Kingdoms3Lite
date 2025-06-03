
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Faction, Region } from '../types';

interface ChartsPanelProps {
  factions: Faction[];
  regions: Region[];
}

const ChartsPanel: React.FC<ChartsPanelProps> = ({ factions, regions }) => {
  const resourceData = factions.map(f => ({
    name: f.name,
    금: f.money,
    식량: f.food,
    병력: f.troops,
    // fill: f.color.replace('bg-', '#'), // This fill is not directly used by Bar components here
  }));

  const totalRegions = regions.length;
  const neutralRegionsCount = regions.filter(r => r.ownerId === null).length;
  
  const territoryPieData = [
    ...factions.map(f => ({
        name: f.name,
        value: regions.filter(r => r.ownerId === f.id).length,
        // Corrected logic: remove '#' from specific color replacements as 'bg-' to '#' already adds it.
        fill: f.color.replace('bg-', '#') 
                   .replace('yellow-500', 'FBBF24') 
                   .replace('red-700', 'DC2626') 
                   .replace('green-600', '16A34A') 
                   .replace('blue-600', '2563EB'),
    })).filter(d => d.value > 0), // Only include factions with territory
    ...(neutralRegionsCount > 0 ? [{ name: '중립', value: neutralRegionsCount, fill: '#A0AEC0' }] : []) // Gray for neutral
  ];


  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">세력 자원 현황</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={resourceData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="금" fill="#FBBF24" name="금" />
            <Bar dataKey="식량" fill="#34D399" name="식량" />
            <Bar dataKey="병력" fill="#EF4444" name="병력" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">영토 분포 (총 {totalRegions}개)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie 
              data={territoryPieData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={60} 
              labelLine={false} 
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
            >
                {territoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
            <Tooltip formatter={(value, name, entry) => [`${value}개 지역`, entry.payload.name]} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartsPanel;
