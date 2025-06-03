
import React from 'react';

interface LogPanelProps {
  logs: string[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2 border-b pb-2 text-gray-700">게임 기록</h2>
      <ul className="space-y-1 h-48 overflow-y-auto text-sm text-gray-600">
        {logs.map((log, index) => (
          <li key={index} className="border-b border-gray-200 py-1 last:border-b-0">
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogPanel;
    