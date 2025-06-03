
import React, { useState, useEffect } from 'react';
import { HISTORICAL_EVENTS } from '../constants';

interface HistoricalEventsPanelProps {
  turnNumber: number;
}

const HistoricalEventsPanel: React.FC<HistoricalEventsPanelProps> = ({ turnNumber }) => {
  const [currentEvent, setCurrentEvent] = useState<string>('');

  useEffect(() => {
    if (HISTORICAL_EVENTS.length > 0) {
      // Cycle through events based on turn number
      const eventIndex = (turnNumber - 1) % HISTORICAL_EVENTS.length;
      setCurrentEvent(HISTORICAL_EVENTS[eventIndex]);
    }
  }, [turnNumber]);

  if (!currentEvent || turnNumber === 0) {
    // Don't render if no event is set or before the first turn
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1 flex items-center">
        <span role="img" aria-label="Calendar emoji" className="mr-2 text-xl">🗓️</span>
        시대의 흐름
      </h2>
      <p className="text-sm text-gray-600 italic leading-relaxed">{currentEvent}</p>
    </div>
  );
};

export default HistoricalEventsPanel;
