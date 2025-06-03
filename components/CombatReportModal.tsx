
import React, { useState, useEffect, useMemo } from 'react';
import { CombatReportData, CombatRoundData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface CombatReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: CombatReportData;
  autoAdvanceDelay: number;
  isDelegated: boolean; 
  onToggleDelegate: () => void; // Added prop
}

const getHexColor = (tailwindColor: string): string => {
    const colorMappings: { [key: string]: string } = {
        'bg-red-700': '#B91C1C', 
        'bg-yellow-500': '#F59E0B', 
        'bg-green-600': '#059669', 
        'bg-blue-600': '#2563EB',
        'bg-gray-400': '#9CA3AF',
    };
    return colorMappings[tailwindColor] || tailwindColor.replace('bg-', '#') || '#CCCCCC'; 
};

const getRoundOutcomeSummary = (round: CombatRoundData, attackerName: string, defenderName: string): string => {
    const attackerWinLog = round.log.find(l => l.includes(`${attackerName} 라운드 승리`));
    if (attackerWinLog) return `${attackerName} 승리`;

    const defenderWinLog = round.log.find(l => l.includes(`${defenderName} 승리`));
    if (defenderWinLog) return `${defenderName} 승리`;
    
    const drawLog = round.log.find(l => l.includes("라운드 무승부"));
    if (drawLog) return "무승부";

    if (round.attackerStrengthThisRound > round.defenderStrengthThisRound) return `${attackerName} 우세`;
    if (round.defenderStrengthThisRound > round.attackerStrengthThisRound) return `${defenderName} 우세`;
    
    return "교전 중"; 
};


const CombatReportModal: React.FC<CombatReportModalProps> = ({ 
    isOpen, 
    onClose, 
    reportData, 
    autoAdvanceDelay,
    isDelegated,
    onToggleDelegate 
}) => {
  const [displayedRoundIndex, setDisplayedRoundIndex] = useState<number>(-1); 
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setDisplayedRoundIndex(-1); 
      setIsAnimating(true);
    }
  }, [isOpen, reportData]); 

  useEffect(() => {
    let timerId: number | undefined;
    if (isOpen && isAnimating && displayedRoundIndex < reportData.rounds.length) {
      timerId = window.setTimeout(() => {
        setDisplayedRoundIndex(prev => prev + 1);
      }, autoAdvanceDelay);
    } else if (isOpen && isAnimating && displayedRoundIndex === reportData.rounds.length) {
      setIsAnimating(false);
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }, [isOpen, isAnimating, displayedRoundIndex, reportData.rounds.length, autoAdvanceDelay]);

  // Effect for auto-closing when delegated and animation is done
  useEffect(() => {
    if (isOpen && !isAnimating && isDelegated) {
      const autoCloseTimer = window.setTimeout(() => {
        onClose();
      }, autoAdvanceDelay); // Give a moment to see the final result

      return () => window.clearTimeout(autoCloseTimer);
    }
  }, [isOpen, isAnimating, isDelegated, onClose, autoAdvanceDelay]);


  const handleSkipAnimation = () => {
    setIsAnimating(false);
    setDisplayedRoundIndex(reportData.rounds.length); 
  };
  
  const attackerHexColor = getHexColor(reportData.attackerColor);
  const defenderHexColor = getHexColor(reportData.defenderColor);

  const currentDisplayData = useMemo(() => {
    const attacker = {
        name: reportData.attackerFactionName,
        color: reportData.attackerColor,
        textColor: reportData.attackerTextColor,
        initialTroops: reportData.attackerInitialTroops,
        initialMorale: reportData.initialAttackerMorale,
        currentTroops: 0,
        currentMorale: 0,
        lossesThisRound: 0,
        cumulativeLosses: 0,
    };
    const defender = {
        name: reportData.defenderFactionName,
        color: reportData.defenderColor,
        textColor: reportData.defenderTextColor,
        initialTroops: reportData.defenderInitialTroops,
        initialMorale: reportData.initialDefenderMorale,
        currentTroops: 0,
        currentMorale: 0,
        lossesThisRound: 0,
        cumulativeLosses: 0,
    };

    if (displayedRoundIndex === -1) { 
        attacker.currentTroops = reportData.attackerInitialTroops;
        attacker.currentMorale = reportData.initialAttackerMorale;
        defender.currentTroops = reportData.defenderInitialTroops;
        defender.currentMorale = reportData.initialDefenderMorale;
    } else if (displayedRoundIndex < reportData.rounds.length) { 
        const currentRound = reportData.rounds[displayedRoundIndex];
        attacker.lossesThisRound = currentRound.attackerCasualtiesThisRound;
        defender.lossesThisRound = currentRound.defenderCasualtiesThisRound;
        attacker.currentMorale = currentRound.attackerMoraleAfterRound;
        defender.currentMorale = currentRound.defenderMoraleAfterRound;

        let attLosses = 0;
        let defLosses = 0;
        for (let i = 0; i <= displayedRoundIndex; i++) {
            attLosses += reportData.rounds[i].attackerCasualtiesThisRound;
            defLosses += reportData.rounds[i].defenderCasualtiesThisRound;
        }
        attacker.cumulativeLosses = attLosses;
        defender.cumulativeLosses = defLosses;
        attacker.currentTroops = reportData.attackerInitialTroops - attLosses;
        defender.currentTroops = reportData.defenderInitialTroops - defLosses;
    } else { 
        attacker.currentTroops = reportData.attackerRemainingTroops;
        attacker.currentMorale = reportData.finalAttackerMorale;
        attacker.cumulativeLosses = reportData.attackerLosses;
        defender.currentTroops = reportData.defenderRemainingTroops;
        defender.currentMorale = reportData.finalDefenderMorale;
        defender.cumulativeLosses = reportData.defenderLosses;
    }
    return { attacker, defender };
  }, [reportData, displayedRoundIndex]);


  const chartData = useMemo(() => {
    const dataKeyForLosses = displayedRoundIndex === reportData.rounds.length ? '총 손실' : '누적 손실';
    return [
        { 
            name: reportData.attackerFactionName, 
            '초기 병력': reportData.attackerInitialTroops, 
            [dataKeyForLosses]: currentDisplayData.attacker.cumulativeLosses,
            fill: attackerHexColor
        },
        { 
            name: reportData.defenderFactionName, 
            '초기 병력': reportData.defenderInitialTroops, 
            [dataKeyForLosses]: currentDisplayData.defender.cumulativeLosses,
            fill: defenderHexColor
        },
    ];
  }, [reportData, currentDisplayData, attackerHexColor, defenderHexColor, displayedRoundIndex]);

  const outcomeMessage = reportData.outcome === 'attacker_wins' 
    ? `${reportData.attackerFactionName}의 공격 성공! ${reportData.targetRegionName} 점령!`
    : `${reportData.targetRegionName} 방어 성공! ${reportData.attackerFactionName}의 공격 격퇴.`;

  let titleStatus = "";
  if (isAnimating) {
    if (displayedRoundIndex === -1) titleStatus = "전투 준비 중...";
    else if (displayedRoundIndex < reportData.rounds.length) titleStatus = `라운드 ${displayedRoundIndex + 1} 진행 중...`;
  }
  if (!isAnimating && displayedRoundIndex === reportData.rounds.length) titleStatus = "최종 전투 결과";


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-[60]" onClick={onClose}> {/* Ensure z-index is high enough */}
      <div 
        className="bg-white p-4 sm:p-5 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3 border-b pb-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            전투 결과: {reportData.targetRegionName}
            {titleStatus && <span className="text-sm sm:text-base font-normal text-gray-600 ml-2">({titleStatus})</span>}
          </h2>
          <div className="flex items-center">
            {isAnimating && (
              <button 
                onClick={handleSkipAnimation}
                className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors mr-3"
              >
                애니메이션 건너뛰기
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl leading-none p-1" aria-label="닫기">&times;</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow pr-1.5 space-y-3 text-xs sm:text-sm custom-scrollbar"> {/* Added custom-scrollbar to main scroll area */}
          {!isAnimating && displayedRoundIndex === reportData.rounds.length && (
            <p className={`text-base sm:text-lg font-semibold text-center py-1.5 px-2.5 rounded-md ${reportData.outcome === 'attacker_wins' ? `${reportData.attackerColor} ${reportData.attackerTextColor}` : `${reportData.defenderColor} ${reportData.defenderTextColor}`}`}>
              {outcomeMessage}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-2.5 rounded-md border-l-4 ${currentDisplayData.attacker.color.replace('bg-', 'border-')} bg-gray-50`}>
              <h3 className={`text-sm sm:text-base font-semibold mb-1 ${currentDisplayData.attacker.textColor} ${currentDisplayData.attacker.color} px-1.5 py-0.5 rounded-sm inline-block`}>
                공격: {currentDisplayData.attacker.name}
              </h3>
              <p>초기 병력: {currentDisplayData.attacker.initialTroops.toLocaleString()}</p>
              <p>현재 병력: <span className="font-semibold">{currentDisplayData.attacker.currentTroops.toLocaleString()}</span></p>
              <p>현재 사기: <span className="font-semibold">{currentDisplayData.attacker.currentMorale}</span></p>
              {displayedRoundIndex >= 0 && displayedRoundIndex < reportData.rounds.length && (
                 <p className="text-red-500">이번 라운드 손실: {currentDisplayData.attacker.lossesThisRound.toLocaleString()}</p>
              )}
              <p>누적 손실: <span className="font-semibold text-red-600">{currentDisplayData.attacker.cumulativeLosses.toLocaleString()}</span></p>
            </div>
            <div className={`p-2.5 rounded-md border-l-4 ${currentDisplayData.defender.color.replace('bg-', 'border-')} bg-gray-50`}>
              <h3 className={`text-sm sm:text-base font-semibold mb-1 ${currentDisplayData.defender.textColor} ${currentDisplayData.defender.color} px-1.5 py-0.5 rounded-sm inline-block`}>
                방어: {currentDisplayData.defender.name}
              </h3>
              <p>초기 병력: {currentDisplayData.defender.initialTroops.toLocaleString()}</p>
              <p>현재 병력: <span className="font-semibold">{currentDisplayData.defender.currentTroops.toLocaleString()}</span></p>
              <p>현재 사기: <span className="font-semibold">{currentDisplayData.defender.currentMorale}</span></p>
               {displayedRoundIndex >= 0 && displayedRoundIndex < reportData.rounds.length && (
                 <p className="text-red-500">이번 라운드 손실: {currentDisplayData.defender.lossesThisRound.toLocaleString()}</p>
              )}
              <p>누적 손실: <span className="font-semibold text-red-600">{currentDisplayData.defender.cumulativeLosses.toLocaleString()}</span></p>
            </div>
          </div>
          
          <div className="p-2.5 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1.5">전투 경과 (라운드별)</h3>
            <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1 custom-scrollbar"> 
              {reportData.rounds.slice(0, displayedRoundIndex < reportData.rounds.length ? displayedRoundIndex + 1 : reportData.rounds.length).map((round: CombatRoundData, index: number) => (
                <div 
                    key={index} 
                    className={`p-2 border rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out
                                ${index === displayedRoundIndex && isAnimating ? 'ring-2 ring-blue-500 scale-102 shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs sm:text-sm font-semibold text-blue-700">라운드 {round.roundNumber}</p>
                    <p className="text-[10px] sm:text-xs italic text-gray-600">{getRoundOutcomeSummary(round, reportData.attackerFactionName, reportData.defenderFactionName)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 text-[10px] sm:text-xs">
                    <div>
                      <p className="font-medium text-gray-700 truncate" title={reportData.attackerFactionName}>{reportData.attackerFactionName}</p>
                      <p>주사위: <span className="font-semibold">{round.attackerDice}</span> | 전투력: <span className="font-semibold">{round.attackerStrengthThisRound.toLocaleString()}</span></p>
                      <p>피해: <span className="font-semibold text-red-500">{round.attackerCasualtiesThisRound.toLocaleString()}</span></p>
                      <p>사기: {round.attackerMoraleAfterRound} (<span className={round.attackerMoraleChange >= 0 ? 'text-green-500' : 'text-red-500'}>{round.attackerMoraleChange >=0 ? '+' : ''}{round.attackerMoraleChange}</span>)</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 truncate" title={reportData.defenderFactionName}>{reportData.defenderFactionName}</p>
                      <p>주사위: <span className="font-semibold">{round.defenderDice}</span> | 전투력: <span className="font-semibold">{round.defenderStrengthThisRound.toLocaleString()}</span></p>
                      <p>피해: <span className="font-semibold text-red-500">{round.defenderCasualtiesThisRound.toLocaleString()}</span></p>
                      <p>사기: {round.defenderMoraleAfterRound} (<span className={round.defenderMoraleChange >= 0 ? 'text-green-500' : 'text-red-500'}>{round.defenderMoraleChange >=0 ? '+' : ''}{round.defenderMoraleChange}</span>)</p>
                    </div>
                  </div>
                </div>
              ))}
              {displayedRoundIndex === -1 && <p className="text-xs sm:text-sm text-gray-500 text-center p-2">전투가 곧 시작됩니다...</p>}
            </div>
          </div>
          
           {!isAnimating && displayedRoundIndex === reportData.rounds.length && reportData.combatLog && reportData.combatLog.length > 0 && (
            <div className="p-2.5 bg-gray-100 rounded-md border mt-1.5">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">주요 전투 기록:</h3>
                <ul className="text-[11px] sm:text-xs text-gray-600 space-y-0.5">
                {reportData.combatLog.map((logEntry, index) => (
                    <li key={index} className="border-b border-gray-200 py-0.5 last:border-b-0">
                    {logEntry}
                    </li>
                ))}
                </ul>
            </div>
          )}

          <div className="p-2.5 bg-white rounded-md border border-gray-200 mt-1.5">
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1.5 text-center">병력 변화 요약</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 9 }} allowDataOverflow={true} domain={[0, 'dataMax + 100']}/>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} 명`, name]}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                  itemStyle={{ fontSize: '11px' }}
                  wrapperStyle={{ fontSize: '11px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="초기 병력" name="초기 병력" barSize={25}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-initial-${index}`} fill={entry.fill} fillOpacity={0.5}/>
                    ))}
                </Bar>
                <Bar dataKey={displayedRoundIndex === reportData.rounds.length ? '총 손실' : '누적 손실'} name={displayedRoundIndex === reportData.rounds.length ? '총 손실' : '누적 손실'} barSize={25}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-lost-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <button
            onClick={onToggleDelegate}
            className={`font-semibold py-2 px-4 rounded-md shadow-md transition-colors text-sm
                        ${isDelegated ? 'bg-purple-500 hover:bg-purple-700 text-white' 
                                       : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
            aria-label={isDelegated ? "위임 비활성화" : "위임 활성화"}
          >
            {isDelegated ? '위임 중 (해제)' : '위임'}
          </button>
          <button
            onClick={onClose}
            disabled={isAnimating && !isDelegated} 
            className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 text-sm
                        ${(isAnimating && !isDelegated) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            확인
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default CombatReportModal;
