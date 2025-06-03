
import React, { useState, useEffect } from 'react';
import { ADVISOR_TIPS } from '../constants';

interface AdvisorPanelProps {
  turnNumber: number;
}

const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ turnNumber }) => {
  const [currentTip, setCurrentTip] = useState<string>('');

  useEffect(() => {
    if (ADVISOR_TIPS.length > 0) {
      // Cycle through tips based on turn number
      const tipIndex = (turnNumber - 1) % ADVISOR_TIPS.length;
      setCurrentTip(ADVISOR_TIPS[tipIndex]);
    }
  }, [turnNumber]);

  if (!currentTip || turnNumber === 0) {
    // Don't render if no tip is set or before the first turn
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1 flex items-center">
        <span role="img" aria-label="Scroll emoji" className="mr-2 text-xl">📜</span>
        오늘의 조언
      </h2>
      <p className="text-sm text-gray-600 italic leading-relaxed">{currentTip}</p>
    </div>
  );
};

export default AdvisorPanel;
