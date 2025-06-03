
import React, { useState, useEffect, useCallback } from 'react';
import { Faction, Region, GameState, RawFactionData, RawRegionData, DiplomaticStatus, FactionRelation, CombatReportData, CombatRoundData, Building, BuildingType } from './types';
import { 
  FACTIONS_DATA, REGIONS_DATA, DEVELOPMENT_COST, MAX_DEVELOPMENT_LEVEL_DEFAULT, 
  VICTORY_REGIONS_COUNT, INITIAL_YEAR, LOG_MAX_ENTRIES,
  NEUTRAL_GARRISON_MULTIPLIER, RECRUIT_COST_PER_TROOP, RECRUIT_MAX_FOOD_FACTOR,
  COMBAT_DICE_SIDES, COMBAT_DICE_EFFECT_SCALE,
  MAX_COMBAT_ROUNDS, MORALE_INITIAL_DEFAULT, MORALE_MINIMUM, MORALE_RETREAT_THRESHOLD,
  MORALE_LOSS_FACTOR_PERCENT_TROOPS_LOST_ROUND, MORALE_WIN_ROUND_BONUS, MORALE_LOSE_ROUND_PENALTY,
  CASUALTY_RATIO_ROUND_LOSER_BASE, CASUALTY_RATIO_ROUND_WINNER_BASE,
  CASUALTY_RATIO_STRENGTH_DIFF_IMPACT, MAX_STRENGTH_ADVANTAGE_RATIO_FOR_CASUALTIES, CASUALTY_NEUTRAL_FACTOR,
  AI_ATTACK_THRESHOLD_RATIO, AI_RECRUIT_MONEY_MIN_THRESHOLD, AI_RECRUIT_PERCENTAGE,
  INITIAL_RELATIONS_SCORE, MIN_RELATIONS_SCORE, MAX_RELATIONS_SCORE,
  GIFT_VALUE_SMALL, GIFT_VALUE_MEDIUM, GIFT_VALUE_LARGE,
  GIFT_RELATION_BONUS_SMALL, GIFT_RELATION_BONUS_MEDIUM, GIFT_RELATION_BONUS_LARGE,
  GIFT_COOLDOWN_TURNS, DECLARE_WAR_PENALTY, DECLARE_WAR_ON_ALLY_PENALTY,
  BREAK_ALLIANCE_PENALTY, FORM_ALLIANCE_BONUS, OFFER_PEACE_BONUS_ON_ACCEPT,
  AI_WILLING_TO_ALLY_THRESHOLD, AI_LIKELY_TO_DECLARE_WAR_THRESHOLD, AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD,
  AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD,
  SEQUENTIAL_ROUND_AUTO_ADVANCE_DELAY,
  MAX_BUILDING_SLOTS_DEFAULT, BUILDING_DEFINITIONS, MAX_BUILDING_LEVEL,
  PUBLIC_ORDER_DEFAULT, PUBLIC_ORDER_MIN, PUBLIC_ORDER_MAX, PUBLIC_ORDER_CHANGE_PER_TURN_TOWARDS_DEFAULT,
  PUBLIC_ORDER_LOW_FOOD_FACTION_PENALTY, PUBLIC_ORDER_RECENTLY_CONQUERED_PENALTY, PUBLIC_ORDER_TURNS_CONSIDERED_RECENTLY_CONQUERED,
  PUBLIC_ORDER_GARRISON_BONUS_MIN_TROOPS_FACTOR, PUBLIC_ORDER_GARRISON_BONUS, PUBLIC_ORDER_NO_GARRISON_PENALTY,
  PUBLIC_ORDER_REBELLION_THRESHOLD, PUBLIC_ORDER_REBELLION_CHANCE, PUBLIC_ORDER_REBEL_TROOPS_SPAWN_FACTOR,
  PUBLIC_ORDER_LOW_INCOME_THRESHOLD, PUBLIC_ORDER_LOW_INCOME_PENALTY_FACTOR,
  PUBLIC_ORDER_HIGH_INCOME_THRESHOLD, PUBLIC_ORDER_HIGH_INCOME_BONUS_FACTOR, PUBLIC_ORDER_WAR_ADJACENT_PENALTY,
  AI_CONSIDER_ALLIANCE_STRENGTH_RATIO
} from './constants';
import Header from './components/Header';
import FactionInfoPanel from './components/FactionInfoPanel';
import RegionGrid from './components/RegionGrid';
import RegionInfoModal from './components/RegionInfoModal';
import ChartsPanel from './components/ChartsPanel';
import GameControls from './components/GameControls';
import LogPanel from './components/LogPanel';
import VictoryModal from './components/VictoryModal';
import FactionSelectionScreen from './components/FactionSelectionScreen';
import GameOverModal from './components/GameOverModal';
import DiplomacyModal from './components/DiplomacyModal';
import DiplomaticFeedbackModal from './components/DiplomaticFeedbackModal';
import CombatReportModal from './components/CombatReportModal'; 
import AdvisorPanel from './components/SequentialRoundDisplayModal'; // Renamed import for AdvisorPanel
import HistoricalEventsPanel from './components/HistoricalEventsPanel'; // Added import

const SAVE_GAME_KEY = 'samgukjiLiteSaveGameData';

const getAdjacentRegions = (regionId: string, allRegions: Region[]): Region[] => {
  const sourceRegion = allRegions.find(r => r.id === regionId);
  if (!sourceRegion || !sourceRegion.uiPosition) return [];

  const adjacent: Region[] = [];
  const { row: r1, col: c1 } = sourceRegion.uiPosition;

  for (const targetRegion of allRegions) {
    if (targetRegion.id === regionId || !targetRegion.uiPosition) continue;
    const { row: r2, col: c2 } = targetRegion.uiPosition;
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
      adjacent.push(targetRegion);
    }
  }
  return adjacent;
};

const getYearMonthFromTurn = (turnNumber: number, initialYear: number): { year: number, month: number } => {
  const totalMonthsElapsed = turnNumber - 1;
  const year = initialYear + Math.floor(totalMonthsElapsed / 12);
  const month = (totalMonthsElapsed % 12) + 1;
  return { year, month };
};


const App: React.FC = () => {
  const [selectedPlayerFactionId, setSelectedPlayerFactionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isDelegated, setIsDelegated] = useState<boolean>(false);

  const [combatReportQueue, setCombatReportQueue] = useState<CombatReportData[]>([]);
  const [currentCombatReport, setCurrentCombatReport] = useState<CombatReportData | null>(null);
  const [isCombatReportModalVisible, setIsCombatReportModalVisible] = useState<boolean>(false);

  const [initialSaveDataCheck, setInitialSaveDataCheck] = useState(false);
  const [savedGameAvailable, setSavedGameAvailable] = useState(false);


  const addLogEntry = useCallback((entry: string, currentLog?: string[]) => {
    const newLog = [entry, ...(currentLog || gameState?.log || []).slice(0, LOG_MAX_ENTRIES - 1)];
    if (gameState && !gameState.gameOver && !currentLog) { 
        setGameState(prev => prev ? {...prev, log: newLog} : null);
    }
    return newLog;
  }, [gameState]);

  useEffect(() => { // Check for saved game on initial mount
    if (!initialSaveDataCheck) {
        try {
            const savedData = localStorage.getItem(SAVE_GAME_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed && parsed.gameState && parsed.selectedPlayerFactionId !== undefined) {
                    setSavedGameAvailable(true);
                } else {
                    localStorage.removeItem(SAVE_GAME_KEY); // Invalid data
                }
            }
        } catch (error) {
            console.error("저장된 게임 확인 중 오류:", error);
            localStorage.removeItem(SAVE_GAME_KEY); // Corrupted data
        }
        setInitialSaveDataCheck(true);
    }
  }, [initialSaveDataCheck]);

  const handleLoadSavedGame = useCallback(() => {
    try {
        const savedDataString = localStorage.getItem(SAVE_GAME_KEY);
        if (savedDataString) {
            const savedData = JSON.parse(savedDataString);
            if (savedData.gameState && savedData.selectedPlayerFactionId !== undefined) {
                setGameState({
                    ...savedData.gameState,
                    log: addLogEntry("저장된 게임을 불러왔습니다.", savedData.gameState.log || [])
                });
                setSelectedPlayerFactionId(savedData.selectedPlayerFactionId);
                setIsDelegated(savedData.isDelegated || false);
                setSavedGameAvailable(false); 
                return true;
            }
        }
    } catch (error) {
        console.error("게임 불러오기 실패:", error);
        localStorage.removeItem(SAVE_GAME_KEY);
        setSavedGameAvailable(false);
        alert("저장된 게임을 불러오는 데 실패했습니다. 새 게임을 시작합니다.");
    }
    return false;
  }, [addLogEntry]);


  useEffect(() => {
    if (gameState?.gameOver || isCombatReportModalVisible) {
        return; 
    }

    if (combatReportQueue.length > 0 && !currentCombatReport) {
        const nextReport = combatReportQueue[0]; 
        setCurrentCombatReport(nextReport);
        setIsCombatReportModalVisible(true);
    }
  }, [combatReportQueue, currentCombatReport, isCombatReportModalVisible, gameState?.gameOver]);


  const handleCloseCombatReportModal = useCallback(() => {
    setIsCombatReportModalVisible(false);
    setCurrentCombatReport(null);
    setCombatReportQueue(prev => prev.slice(1)); 
  }, []);


  const handleFactionSelect = useCallback((factionId: string) => {
    localStorage.removeItem(SAVE_GAME_KEY); // Clear old save when starting new
    setSavedGameAvailable(false);

    const rawFactionsData = FACTIONS_DATA;
    const initialFactions: Faction[] = rawFactionsData.map((fd: RawFactionData) => ({
      ...fd,
      money: fd.initialMoney,
      food: fd.initialFood,
      troops: fd.initialTroops,
      eliminated: false,
      relations: {}, 
    }));

    for (let i = 0; i < initialFactions.length; i++) {
      for (let j = 0; j < initialFactions.length; j++) {
        if (i === j) continue; 
        const factionAId = initialFactions[i].id;
        const factionBId = initialFactions[j].id;
        initialFactions[i].relations[factionBId] = {
          score: INITIAL_RELATIONS_SCORE,
          status: 'peace',
        };
      }
    }

    const initialRegions: Region[] = REGIONS_DATA.map((rd: RawRegionData) => ({
      ...rd,
      ownerId: rd.initialOwnerId === undefined ? null : rd.initialOwnerId,
      developmentLevel: rd.initialDevelopmentLevel,
      maxDevelopmentLevel: rd.maxDevelopmentLevel || MAX_DEVELOPMENT_LEVEL_DEFAULT,
      adjacentRegions: rd.adjacentRegions || [], 
      uiPosition: rd.uiPosition,
      maxBuildingSlots: rd.initialMaxBuildingSlots || MAX_BUILDING_SLOTS_DEFAULT,
      buildings: Array(rd.initialMaxBuildingSlots || MAX_BUILDING_SLOTS_DEFAULT).fill(null),
      publicOrder: PUBLIC_ORDER_DEFAULT,
      turnsSinceConquest: 0,
    }));

    const playerFactionIndex = initialFactions.findIndex(f => f.id === factionId);
    if (playerFactionIndex === -1) {
        console.error("Selected faction not found.");
        return; 
    }
    const selectedFaction = initialFactions[playerFactionIndex];
    const {year, month} = getYearMonthFromTurn(1, INITIAL_YEAR);
    const initialLog = [`${year}년 ${month}월, ${selectedFaction.name} 세력으로 천하통일을 시작합니다!`];

    setGameState({
      factions: initialFactions,
      regions: initialRegions,
      currentTurnFactionIndex: playerFactionIndex, 
      turnNumber: 1,
      selectedRegionId: null,
      log: initialLog,
      gameOver: false,
      winner: null,
      gameOverReason: null, 
      eliminatedPlayerFactionId: null,
      isDiplomacyModalOpen: false,
      diplomacyTargetFactionIdForGift: null,
      diplomaticFeedback: null,
    });
    setSelectedPlayerFactionId(factionId);
    setIsDelegated(false);
    setCombatReportQueue([]); 
    setCurrentCombatReport(null);
    setIsCombatReportModalVisible(false);
  }, []);

  const handleStartNewGame = useCallback(() => {
    localStorage.removeItem(SAVE_GAME_KEY); // Clear save on starting a new game from victory/gameover
    setSelectedPlayerFactionId(null);
    setGameState(null);
    setIsDelegated(false);
    setCombatReportQueue([]);
    setCurrentCombatReport(null);
    setIsCombatReportModalVisible(false);
    setSavedGameAvailable(false); 
    setInitialSaveDataCheck(false); // Re-check for save next time (though it's just cleared)
  }, []);
  
  // Auto-saving effect
  useEffect(() => {
    if (gameState && gameState.turnNumber > 0 && selectedPlayerFactionId && initialSaveDataCheck && !savedGameAvailable) {
        if (gameState.gameOver) {
            localStorage.removeItem(SAVE_GAME_KEY);
            // console.log("게임 종료, 자동 저장 데이터 삭제됨."); 
            // No need to addLogEntry here as game over state handles UI
            return;
        }

        const saveData = {
            gameState,
            selectedPlayerFactionId,
            isDelegated,
        };
        try {
            localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveData));
            // console.log(`게임 상태 자동 저장 완료 (턴 ${gameState.turnNumber})`); // Silent save
        } catch (error) {
            console.error("게임 저장 실패:", error);
        }
    }
  }, [gameState, selectedPlayerFactionId, isDelegated, initialSaveDataCheck, savedGameAvailable]);


  const mainUiDisabled = isCombatReportModalVisible || gameState?.gameOver;

  const handleSelectRegion = useCallback((regionId: string) => {
    if (mainUiDisabled || (isDelegated && gameState?.factions[gameState.currentTurnFactionIndex].id === selectedPlayerFactionId)) return; 
    setGameState(prev => prev ? { ...prev, selectedRegionId: regionId, isDiplomacyModalOpen: false } : null);
  }, [mainUiDisabled, isDelegated, gameState]);

  const handleCloseModal = useCallback(() => {
    setGameState(prev => prev ? { ...prev, selectedRegionId: null, isDiplomacyModalOpen: false, diplomacyTargetFactionIdForGift: null } : null);
  }, []);

  const handleOpenDiplomacyModal = useCallback(() => {
    if (mainUiDisabled || isDelegated) return; 
    setGameState(prev => prev ? { ...prev, isDiplomacyModalOpen: true, selectedRegionId: null } : null);
  }, [mainUiDisabled, isDelegated]);
  
  const handleCloseDiplomacyModal = useCallback(() => {
    setGameState(prev => prev ? { ...prev, isDiplomacyModalOpen: false, diplomacyTargetFactionIdForGift: null } : null);
  }, []);

  const handleCloseDiplomaticFeedbackModal = useCallback(() => {
    setGameState(prev => prev ? { ...prev, diplomaticFeedback: null } : null);
  }, []);

  const handleToggleDelegate = useCallback(() => {
    setIsDelegated(prev => {
      const newDelegationState = !prev;
      if (gameState) {
         // Use addLogEntry directly for immediate update and to avoid stale closure issues with setGameState's callback
         const newLog = addLogEntry(`위임 모드가 ${newDelegationState ? '활성화' : '비활성화'}되었습니다.`, gameState.log);
         setGameState(g => g ? {...g, log: newLog} : null);
      }
      return newDelegationState;
    });
  }, [addLogEntry, gameState]);


  const updateRelationScore = (factionAId: string, factionBId: string, change: number, factions: Faction[]): Faction[] => {
    return factions.map(f => {
      if (f.id === factionAId) {
        const currentRelation = f.relations[factionBId];
        return {
          ...f,
          relations: {
            ...f.relations,
            [factionBId]: {
              ...currentRelation,
              score: Math.max(MIN_RELATIONS_SCORE, Math.min(MAX_RELATIONS_SCORE, currentRelation.score + change)),
            },
          },
        };
      }
      if (f.id === factionBId) {
        const currentRelation = f.relations[factionAId];
        return {
          ...f,
          relations: {
            ...f.relations,
            [factionAId]: {
              ...currentRelation,
              score: Math.max(MIN_RELATIONS_SCORE, Math.min(MAX_RELATIONS_SCORE, currentRelation.score + change)),
            },
          },
        };
      }
      return f;
    });
  };

  const setDiplomaticStatus = (factionAId: string, factionBId: string, status: DiplomaticStatus, factions: Faction[]): Faction[] => {
    let newFactions = [...factions];
    const factionAIndex = newFactions.findIndex(f => f.id === factionAId);
    const factionBIndex = newFactions.findIndex(f => f.id === factionBId);

    if (factionAIndex !== -1 && factionBIndex !== -1) {
      newFactions[factionAIndex].relations[factionBId].status = status;
      newFactions[factionBIndex].relations[factionAId].status = status;
      if (status === 'war') {
        newFactions[factionAIndex].relations[factionBId].turnsAtWar = 0;
        newFactions[factionBIndex].relations[factionAId].turnsAtWar = 0;
        newFactions[factionAIndex].relations[factionBId].turnsAllied = undefined;
        newFactions[factionBIndex].relations[factionAId].turnsAllied = undefined;
      } else if (status === 'alliance') {
        newFactions[factionAIndex].relations[factionBId].turnsAllied = 0;
        newFactions[factionBIndex].relations[factionAId].turnsAllied = 0;
        newFactions[factionAIndex].relations[factionBId].turnsAtWar = undefined;
        newFactions[factionBIndex].relations[factionAId].turnsAtWar = undefined;
      } else { 
        newFactions[factionAIndex].relations[factionBId].turnsAtWar = undefined;
        newFactions[factionBIndex].relations[factionAId].turnsAtWar = undefined;
        newFactions[factionAIndex].relations[factionBId].turnsAllied = undefined;
        newFactions[factionBIndex].relations[factionAId].turnsAllied = undefined;
      }
    }
    return newFactions;
  };

  const handleDiplomaticAction = useCallback((action: string, targetFactionId: string, payload?: any) => {
    if (mainUiDisabled || isDelegated) return;

    setGameState(prev => {
      if (!prev || !selectedPlayerFactionId) return null;
      let newFactions = [...prev.factions];
      let currentLog = [...prev.log];
      let newDiplomaticFeedback: GameState['diplomaticFeedback'] = null;

      const playerFaction = newFactions.find(f => f.id === selectedPlayerFactionId)!;
      const targetFaction = newFactions.find(f => f.id === targetFactionId)!;

      switch (action) {
        case 'send_gift':
          const amount = payload as number;
          let bonus = 0;
          if (amount === GIFT_VALUE_SMALL) bonus = GIFT_RELATION_BONUS_SMALL;
          else if (amount === GIFT_VALUE_MEDIUM) bonus = GIFT_RELATION_BONUS_MEDIUM;
          else if (amount === GIFT_VALUE_LARGE) bonus = GIFT_RELATION_BONUS_LARGE;

          if (playerFaction.money >= amount && bonus > 0) {
             const currentTurn = prev.turnNumber;
             const lastGift = playerFaction.relations[targetFactionId].lastGiftTurn;
             if (lastGift && currentTurn - lastGift < GIFT_COOLDOWN_TURNS) {
                 bonus = Math.floor(bonus / 2);
             }

            newFactions = newFactions.map(f => f.id === playerFaction.id ? {...f, money: f.money - amount} : f);
            newFactions = updateRelationScore(playerFaction.id, targetFaction.id, bonus, newFactions);
            newFactions.find(f=>f.id === playerFaction.id)!.relations[targetFactionId].lastGiftTurn = currentTurn;

            currentLog = addLogEntry(`${playerFaction.name}이(가) ${targetFaction.name}에게 금 ${amount}을(를) 선물했습니다. (관계 ${bonus > 0 ? '+' : ''}${bonus})`, currentLog);
          } else {
            currentLog = addLogEntry(`${playerFaction.name}: ${targetFaction.name}에게 선물할 자금이 부족하거나 유효하지 않은 금액입니다.`, currentLog);
          }
          break;

        case 'declare_war':
          const currentStatusDW = playerFaction.relations[targetFactionId].status;
          if (currentStatusDW === 'war') break; 

          newFactions = setDiplomaticStatus(playerFaction.id, targetFaction.id, 'war', newFactions);
          let warPenalty = DECLARE_WAR_PENALTY;
          if (currentStatusDW === 'alliance') {
            warPenalty += DECLARE_WAR_ON_ALLY_PENALTY; 
            currentLog = addLogEntry(`${playerFaction.name}이(가) 동맹 ${targetFaction.name}을(를) 배신하고 전쟁을 선포했습니다!`, currentLog);
          } else {
            currentLog = addLogEntry(`${playerFaction.name}이(가) ${targetFaction.name}에게 전쟁을 선포했습니다!`, currentLog);
          }
          newFactions = updateRelationScore(playerFaction.id, targetFaction.id, warPenalty, newFactions);
          break;

        case 'offer_peace':
          if (playerFaction.relations[targetFactionId].status !== 'war') break;
          currentLog = addLogEntry(`${playerFaction.name}이(가) ${targetFaction.name}에게 평화를 제안합니다...`, currentLog);
          
          const targetRelationToPlayerPeace = targetFaction.relations[playerFaction.id];
          const willAIAcceptPeace = targetRelationToPlayerPeace.score > AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD || 
                                     (targetRelationToPlayerPeace.turnsAtWar || 0) >= AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD;

          if (willAIAcceptPeace) {
            newFactions = setDiplomaticStatus(playerFaction.id, targetFaction.id, 'peace', newFactions);
            newFactions = updateRelationScore(playerFaction.id, targetFaction.id, OFFER_PEACE_BONUS_ON_ACCEPT, newFactions);
            currentLog = addLogEntry(`${targetFaction.name}이(가) 평화 제안을 수락했습니다!`, currentLog);
          } else {
            currentLog = addLogEntry(`${targetFaction.name}이(가) 평화 제안을 거절했습니다.`, currentLog);
            let reason = `${targetFaction.name}은(는) 아직 평화를 원하지 않습니다.`;
            if (targetRelationToPlayerPeace.score <= AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD && (targetRelationToPlayerPeace.turnsAtWar || 0) < AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD) {
                 reason = `${targetFaction.name}은(는) 우리와의 관계(${targetRelationToPlayerPeace.score})가 너무 나쁘거나(${AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD}점 초과 필요), 전쟁 지속 기간(${(targetRelationToPlayerPeace.turnsAtWar || 0)}턴)이 짧아(${AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD}턴 이상 필요) 평화 제안을 거절했습니다.`;
            }
            newDiplomaticFeedback = { isOpen: true, message: reason };
          }
          break;

        case 'offer_alliance':
          if (playerFaction.relations[targetFactionId].status !== 'peace') break;
          currentLog = addLogEntry(`${playerFaction.name}이(가) ${targetFaction.name}에게 동맹을 제안합니다...`, currentLog);
          
          const targetRelationToPlayerAlliance = targetFaction.relations[playerFaction.id];
          const willAIAcceptAlliance = targetRelationToPlayerAlliance.score >= AI_WILLING_TO_ALLY_THRESHOLD;

          if (willAIAcceptAlliance) {
            newFactions = setDiplomaticStatus(playerFaction.id, targetFaction.id, 'alliance', newFactions);
            newFactions = updateRelationScore(playerFaction.id, targetFaction.id, FORM_ALLIANCE_BONUS, newFactions);
            currentLog = addLogEntry(`${targetFaction.name}이(가) 동맹 제안을 수락했습니다!`, currentLog);
          } else {
            currentLog = addLogEntry(`${targetFaction.name}이(가) 동맹 제안을 거절했습니다.`, currentLog);
            const reason = `${targetFaction.name}은(는) 우리와의 관계(${targetRelationToPlayerAlliance.score})가 동맹을 맺을 만큼 충분히 높지 않아(${AI_WILLING_TO_ALLY_THRESHOLD}점 필요) 제안을 거절했습니다.`;
            newDiplomaticFeedback = { isOpen: true, message: reason };
          }
          break;
        
        case 'break_alliance':
          if (playerFaction.relations[targetFactionId].status !== 'alliance') break;
          newFactions = setDiplomaticStatus(playerFaction.id, targetFaction.id, 'peace', newFactions);
          newFactions = updateRelationScore(playerFaction.id, targetFaction.id, BREAK_ALLIANCE_PENALTY, newFactions);
          currentLog = addLogEntry(`${playerFaction.name}이(가) ${targetFaction.name}과의 동맹을 파기했습니다.`, currentLog);
          break;
      }
      return { 
        ...prev, 
        factions: newFactions, 
        log: currentLog, 
        diplomacyTargetFactionIdForGift: null,
        diplomaticFeedback: newDiplomaticFeedback 
      };
    });
  }, [mainUiDisabled, selectedPlayerFactionId, addLogEntry, isDelegated]);


  const handleDevelopRegion = useCallback((regionId: string) => {
    if (mainUiDisabled || isDelegated) return;
    setGameState(prev => {
      if (!prev) return null;
      const currentFaction = prev.factions[prev.currentTurnFactionIndex];
      const region = prev.regions.find(r => r.id === regionId);

      if (!region || region.ownerId !== currentFaction.id || region.developmentLevel >= region.maxDevelopmentLevel) return prev;

      if (currentFaction.money >= DEVELOPMENT_COST) {
        const updatedFactions = prev.factions.map(f => 
          f.id === currentFaction.id ? { ...f, money: f.money - DEVELOPMENT_COST } : f
        );
        const updatedRegions = prev.regions.map(r =>
          r.id === regionId ? { ...r, developmentLevel: r.developmentLevel + 1 } : r
        );
        const logEntry = `${currentFaction.name} 세력이 ${region.name} 지역을 개발했습니다. (개발도: ${region.developmentLevel + 1})`;
        return {
          ...prev,
          factions: updatedFactions,
          regions: updatedRegions,
          log: addLogEntry(logEntry, prev.log),
        };
      } else {
        const newLog = addLogEntry(`${currentFaction.name} 세력: ${region.name} 개발 자금 부족! (필요: ${DEVELOPMENT_COST} 금)`, prev.log);
        return {...prev, log: newLog};
      }
    });
  }, [mainUiDisabled, addLogEntry, isDelegated]);

  const handleRecruitTroops = useCallback((regionId: string, troopsToRecruit: number) => {
    if (mainUiDisabled || isDelegated) return;
    setGameState(prev => {
      if (!prev) return null;
      const currentFaction = prev.factions[prev.currentTurnFactionIndex];
      const region = prev.regions.find(r => r.id === regionId);

      if (!region || region.ownerId !== currentFaction.id || troopsToRecruit <= 0) return prev;

      let maxRecruitsByFood = Math.floor(region.baseFoodIncome * RECRUIT_MAX_FOOD_FACTOR);
      let currentRecruitCostModifier = 1.0;

      region.buildings.forEach(building => {
        if (building?.type === 'barracks' && building.level > 0) {
          const effects = BUILDING_DEFINITIONS.barracks.effects(building.level);
          if (effects.maxRecruitsBonus) maxRecruitsByFood += effects.maxRecruitsBonus;
          if (effects.recruitCostModifier) currentRecruitCostModifier *= effects.recruitCostModifier;
        }
      });
      
      const finalCostPerTroop = RECRUIT_COST_PER_TROOP * currentRecruitCostModifier;
      const totalCost = troopsToRecruit * finalCostPerTroop;

      if (troopsToRecruit > maxRecruitsByFood) {
        let newLog = addLogEntry(`${currentFaction.name}: ${region.name}에서 식량 및 병영 시설 부족으로 최대 ${maxRecruitsByFood}명만 징병 가능합니다.`, prev.log);
        return {...prev, log: newLog};
      }
      if (currentFaction.money < totalCost) {
        let newLog = addLogEntry(`${currentFaction.name}: ${region.name} 징병 자금 부족! (필요: ${totalCost.toFixed(0)} 금)`, prev.log);
        return {...prev, log: newLog};
      }

      const updatedFactions = prev.factions.map(f =>
        f.id === currentFaction.id ? { ...f, money: f.money - totalCost, troops: f.troops + troopsToRecruit } : f
      );
      const logEntry = `${currentFaction.name} 세력이 ${region.name}에서 ${troopsToRecruit.toLocaleString()}명 징병 (비용: ${totalCost.toFixed(0)} 금). 총 병력: ${(currentFaction.troops + troopsToRecruit).toLocaleString()}.`;
      return {
        ...prev,
        factions: updatedFactions,
        log: addLogEntry(logEntry, prev.log),
      };
    });
  }, [addLogEntry, mainUiDisabled, isDelegated]);

  const handleConstructBuilding = useCallback((regionId: string, slotIndex: number, type: BuildingType) => {
    if (mainUiDisabled || isDelegated) return;
    setGameState(prev => {
      if (!prev) return null;
      const currentFaction = prev.factions[prev.currentTurnFactionIndex];
      const region = prev.regions.find(r => r.id === regionId);
      const buildingDef = BUILDING_DEFINITIONS[type];

      if (!region || region.ownerId !== currentFaction.id || !buildingDef || slotIndex < 0 || slotIndex >= region.maxBuildingSlots || region.buildings[slotIndex] !== null) {
        return prev;
      }

      const cost = buildingDef.cost(0); 
      if (currentFaction.money < cost.money || (cost.food && currentFaction.food < cost.food)) {
        addLogEntry(`${currentFaction.name}: ${buildingDef.name} 건설 자원 부족!`, prev.log);
        return prev;
      }

      const newFactions = prev.factions.map(f => 
        f.id === currentFaction.id ? { ...f, money: f.money - cost.money, food: f.food - (cost.food || 0) } : f
      );
      const newRegions = prev.regions.map(r => {
        if (r.id === regionId) {
          const updatedBuildings = [...r.buildings];
          updatedBuildings[slotIndex] = { type, level: 1 };
          return { ...r, buildings: updatedBuildings };
        }
        return r;
      });
      
      const logEntry = `${currentFaction.name}이(가) ${region.name}에 ${buildingDef.name} (Lv.1) 건설 완료.`;
      return { ...prev, factions: newFactions, regions: newRegions, log: addLogEntry(logEntry, prev.log) };
    });
  }, [addLogEntry, mainUiDisabled, isDelegated]);

  const handleUpgradeBuilding = useCallback((regionId: string, slotIndex: number) => {
    if (mainUiDisabled || isDelegated) return;
    setGameState(prev => {
      if (!prev) return null;
      const currentFaction = prev.factions[prev.currentTurnFactionIndex];
      const region = prev.regions.find(r => r.id === regionId);
      
      if (!region || region.ownerId !== currentFaction.id || slotIndex < 0 || slotIndex >= region.maxBuildingSlots || !region.buildings[slotIndex]) {
        return prev;
      }

      const building = region.buildings[slotIndex]!;
      const buildingDef = BUILDING_DEFINITIONS[building.type];
      const maxLevel = buildingDef.maxLevel || MAX_BUILDING_LEVEL;

      if (building.level >= maxLevel) return prev;

      const cost = buildingDef.cost(building.level); 
      if (currentFaction.money < cost.money || (cost.food && currentFaction.food < cost.food)) {
        addLogEntry(`${currentFaction.name}: ${buildingDef.name} 업그레이드 자원 부족!`, prev.log);
        return prev;
      }

      const newFactions = prev.factions.map(f => 
        f.id === currentFaction.id ? { ...f, money: f.money - cost.money, food: f.food - (cost.food || 0) } : f
      );
      const newRegions = prev.regions.map(r => {
        if (r.id === regionId) {
          const updatedBuildings = [...r.buildings];
          updatedBuildings[slotIndex] = { ...building, level: building.level + 1 };
          return { ...r, buildings: updatedBuildings };
        }
        return r;
      });
      
      const logEntry = `${currentFaction.name}이(가) ${region.name}의 ${buildingDef.name}을(를) Lv.${building.level + 1}(으)로 업그레이드.`;
      return { ...prev, factions: newFactions, regions: newRegions, log: addLogEntry(logEntry, prev.log) };
    });
  }, [addLogEntry, mainUiDisabled, isDelegated]);

  const handleDemolishBuilding = useCallback((regionId: string, slotIndex: number) => {
    if (mainUiDisabled || isDelegated) return;
     setGameState(prev => {
      if (!prev) return null;
      const region = prev.regions.find(r => r.id === regionId);
      if (!region || !region.buildings[slotIndex]) return prev;

      const buildingName = BUILDING_DEFINITIONS[region.buildings[slotIndex]!.type].name;
      const currentFaction = prev.factions[prev.currentTurnFactionIndex];
      
      const newRegions = prev.regions.map(r => {
        if (r.id === regionId) {
          const updatedBuildings = [...r.buildings];
          updatedBuildings[slotIndex] = null;
          return { ...r, buildings: updatedBuildings };
        }
        return r;
      });
      const logEntry = `${currentFaction.name}이(가) ${region.name}의 ${buildingName} 철거 완료.`;
      return { ...prev, regions: newRegions, log: addLogEntry(logEntry, prev.log) };
    });
  }, [addLogEntry, mainUiDisabled, isDelegated]);


  const performCombatSimulation = useCallback((
      attackerFaction: Faction,
      initialAttackerTroops: number,
      defenderFaction: Faction | null, 
      initialDefenderTroops: number,
      defenderIsNeutral: boolean,
      targetRegion: Region, 
      currentLogRef: { log: string[] } 
    ): {
      report: CombatReportData,
      finalAttackerTroops: number,
      finalDefenderTroops: number,
      logEntries: string[] 
    } => {

    let currentAttackerTroops = initialAttackerTroops;
    let currentDefenderTroops = initialDefenderTroops;
    let attackerMorale = MORALE_INITIAL_DEFAULT;
    let defenderMorale = MORALE_INITIAL_DEFAULT;

    const roundsData: CombatRoundData[] = [];
    const battleSummaryLog: string[] = []; 
    let combatContinues = true;
    let overallOutcome: CombatReportData['outcome'] = 'defender_wins';

    const defenderDisplayName = defenderFaction ? defenderFaction.name : '중립군';

    battleSummaryLog.push(`전투 시작: ${attackerFaction.name} (${initialAttackerTroops.toLocaleString()}명, 사기 ${attackerMorale}) vs ${targetRegion.name} (${defenderDisplayName} ${initialDefenderTroops.toLocaleString()}명, 사기 ${defenderMorale})`);

    let wallDefenseBonus = 0;
    if (!defenderIsNeutral) { 
      targetRegion.buildings.forEach(b => {
        if (b?.type === 'wall' && b.level > 0) {
          wallDefenseBonus += BUILDING_DEFINITIONS.wall.effects(b.level).defenseBonus || 0;
        }
      });
      if (wallDefenseBonus > 0) battleSummaryLog.push(`${targetRegion.name}의 성벽이 방어에 기여합니다! (보너스: ${(wallDefenseBonus * 100).toFixed(0)}%)`);
    }


    for (let roundNum = 1; roundNum <= MAX_COMBAT_ROUNDS && combatContinues; roundNum++) {
      const roundLog: string[] = [];
      if (currentAttackerTroops <= 0 || currentDefenderTroops <= 0) {
        combatContinues = false;
        break;
      }

      const attackerDice = Math.floor(Math.random() * COMBAT_DICE_SIDES) + 1;
      const defenderDice = Math.floor(Math.random() * COMBAT_DICE_SIDES) + 1;

      const attackerBaseStrength = currentAttackerTroops;
      let defenderBaseStrength = currentDefenderTroops;
      if(wallDefenseBonus > 0) defenderBaseStrength *= (1 + wallDefenseBonus);


      const attackerStrengthThisRound = Math.floor(attackerBaseStrength * (1 + (attackerDice * COMBAT_DICE_EFFECT_SCALE / COMBAT_DICE_SIDES)));
      const defenderStrengthThisRound = Math.floor(defenderBaseStrength * (1 + (defenderDice * COMBAT_DICE_EFFECT_SCALE / COMBAT_DICE_SIDES)));
      
      roundLog.push(`라운드 ${roundNum} - 주사위: ${attackerFaction.name} ${attackerDice}, ${defenderDisplayName} ${defenderDice}.`);
      roundLog.push(`전투력: ${attackerFaction.name} ${attackerStrengthThisRound.toLocaleString()}, ${defenderDisplayName} ${defenderStrengthThisRound.toLocaleString()}.`);

      let attackerCasualtiesThisRound = 0;
      let defenderCasualtiesThisRound = 0;
      let attackerMoraleChange = 0;
      let defenderMoraleChange = 0;

      if (attackerStrengthThisRound > defenderStrengthThisRound) { 
        const strengthAdvantageRatio = Math.min(MAX_STRENGTH_ADVANTAGE_RATIO_FOR_CASUALTIES, (attackerStrengthThisRound - defenderStrengthThisRound) / (defenderStrengthThisRound || 1));
        let baseDefenderLoss = CASUALTY_RATIO_ROUND_LOSER_BASE;
        if(defenderIsNeutral) baseDefenderLoss *= CASUALTY_NEUTRAL_FACTOR;

        defenderCasualtiesThisRound = Math.floor(currentDefenderTroops * (baseDefenderLoss + strengthAdvantageRatio * CASUALTY_RATIO_STRENGTH_DIFF_IMPACT));
        attackerCasualtiesThisRound = Math.floor(currentAttackerTroops * CASUALTY_RATIO_ROUND_WINNER_BASE);
        
        attackerMoraleChange += MORALE_WIN_ROUND_BONUS;
        defenderMoraleChange -= MORALE_LOSE_ROUND_PENALTY;
        roundLog.push(`${attackerFaction.name} 라운드 승리.`);
      } else if (defenderStrengthThisRound > attackerStrengthThisRound) { 
        const strengthAdvantageRatio = Math.min(MAX_STRENGTH_ADVANTAGE_RATIO_FOR_CASUALTIES, (defenderStrengthThisRound - attackerStrengthThisRound) / (attackerStrengthThisRound || 1));
        
        attackerCasualtiesThisRound = Math.floor(currentAttackerTroops * (CASUALTY_RATIO_ROUND_LOSER_BASE + strengthAdvantageRatio * CASUALTY_RATIO_STRENGTH_DIFF_IMPACT));
        defenderCasualtiesThisRound = Math.floor(currentDefenderTroops * CASUALTY_RATIO_ROUND_WINNER_BASE);
        if(defenderIsNeutral) defenderCasualtiesThisRound = Math.floor(defenderCasualtiesThisRound / CASUALTY_NEUTRAL_FACTOR);


        defenderMoraleChange += MORALE_WIN_ROUND_BONUS;
        attackerMoraleChange -= MORALE_LOSE_ROUND_PENALTY;
        roundLog.push(`${defenderDisplayName} 라운드 승리.`);
      } else { 
        attackerCasualtiesThisRound = Math.floor(currentAttackerTroops * (CASUALTY_RATIO_ROUND_LOSER_BASE / 2)); 
        defenderCasualtiesThisRound = Math.floor(currentDefenderTroops * (CASUALTY_RATIO_ROUND_LOSER_BASE / 2));
        if(defenderIsNeutral) defenderCasualtiesThisRound = Math.floor(defenderCasualtiesThisRound * CASUALTY_NEUTRAL_FACTOR);
        roundLog.push(`라운드 무승부.`);
      }
      
      attackerCasualtiesThisRound = Math.min(attackerCasualtiesThisRound, currentAttackerTroops);
      defenderCasualtiesThisRound = Math.min(defenderCasualtiesThisRound, currentDefenderTroops);
      roundLog.push(`피해: ${attackerFaction.name} -${attackerCasualtiesThisRound.toLocaleString()}, ${defenderDisplayName} -${defenderCasualtiesThisRound.toLocaleString()}.`);


      if (currentAttackerTroops > 0) attackerMoraleChange -= Math.floor((attackerCasualtiesThisRound / currentAttackerTroops) * 100 * MORALE_LOSS_FACTOR_PERCENT_TROOPS_LOST_ROUND);
      if (currentDefenderTroops > 0) defenderMoraleChange -= Math.floor((defenderCasualtiesThisRound / currentDefenderTroops) * 100 * MORALE_LOSS_FACTOR_PERCENT_TROOPS_LOST_ROUND);

      currentAttackerTroops -= attackerCasualtiesThisRound;
      currentDefenderTroops -= defenderCasualtiesThisRound;
      attackerMorale = Math.max(MORALE_MINIMUM, Math.min(MORALE_INITIAL_DEFAULT, attackerMorale + attackerMoraleChange));
      defenderMorale = Math.max(MORALE_MINIMUM, Math.min(MORALE_INITIAL_DEFAULT, defenderMorale + defenderMoraleChange));
      
      roundLog.push(`사기: ${attackerFaction.name} ${attackerMorale} (${attackerMoraleChange >= 0 ? '+' : ''}${attackerMoraleChange}), ${defenderDisplayName} ${defenderMorale} (${defenderMoraleChange >= 0 ? '+' : ''}${defenderMoraleChange}).`);
      roundLog.push(`잔존 병력: ${attackerFaction.name} ${currentAttackerTroops.toLocaleString()}, ${defenderDisplayName} ${currentDefenderTroops.toLocaleString()}.`);

      roundsData.push({ 
          roundNumber: roundNum, attackerDice, defenderDice, 
          attackerStrengthThisRound, defenderStrengthThisRound,
          attackerCasualtiesThisRound, defenderCasualtiesThisRound, 
          attackerMoraleChange, defenderMoraleChange,
          attackerMoraleAfterRound: attackerMorale, defenderMoraleAfterRound: defenderMorale,
          log: roundLog 
      });

      if (currentDefenderTroops <= 0) {
        battleSummaryLog.push(`${defenderDisplayName} 병력 전멸! ${attackerFaction.name} 승리!`);
        overallOutcome = 'attacker_wins'; combatContinues = false;
      } else if (currentAttackerTroops <= 0) {
        battleSummaryLog.push(`${attackerFaction.name} 병력 전멸! ${defenderDisplayName} 방어 성공!`);
        overallOutcome = 'defender_wins'; combatContinues = false;
      } else if (defenderMorale <= MORALE_RETREAT_THRESHOLD) {
        battleSummaryLog.push(`${defenderDisplayName} 사기 저하로 후퇴! ${attackerFaction.name} 승리!`);
        overallOutcome = 'attacker_wins'; combatContinues = false;
      } else if (attackerMorale <= MORALE_RETREAT_THRESHOLD) {
        battleSummaryLog.push(`${attackerFaction.name} 사기 저하로 후퇴! ${defenderDisplayName} 방어 성공!`);
        overallOutcome = 'defender_wins'; combatContinues = false;
      }
    }

    if (combatContinues) { 
      battleSummaryLog.push(`최대 라운드(${MAX_COMBAT_ROUNDS}) 도달. 최종 결과 판정.`);
      if (currentAttackerTroops > currentDefenderTroops) overallOutcome = 'attacker_wins';
      else if (currentDefenderTroops > currentAttackerTroops) overallOutcome = 'defender_wins';
      else if (attackerMorale > defenderMorale) overallOutcome = 'attacker_wins';
      else if (defenderMorale > attackerMorale) overallOutcome = 'defender_wins';
      else overallOutcome = 'defender_wins'; 

      if (overallOutcome === 'attacker_wins') battleSummaryLog.push(`${attackerFaction.name} 우세승!`);
      else battleSummaryLog.push(`${defenderDisplayName} 우세승으로 방어 성공!`);
    }
    
    const totalAttackerLosses = initialAttackerTroops - currentAttackerTroops;
    const totalDefenderLosses = initialDefenderTroops - currentDefenderTroops;

    currentLogRef.log = addLogEntry(`${attackerFaction.name} vs ${defenderDisplayName} 전투 (${targetRegion.name}): ${overallOutcome === 'attacker_wins' ? attackerFaction.name + ' 승리' : defenderDisplayName + ' 승리'}. 손실: ${attackerFaction.name} ${totalAttackerLosses}, ${defenderDisplayName} ${totalDefenderLosses}.`, currentLogRef.log);


    return {
      report: {
        attackerFactionName: attackerFaction.name,
        attackerColor: attackerFaction.color,
        attackerTextColor: attackerFaction.textColor,
        defenderFactionName: defenderDisplayName,
        defenderColor: defenderFaction ? defenderFaction.color : 'bg-gray-400',
        defenderTextColor: defenderFaction ? defenderFaction.textColor : 'text-gray-800',
        attackerInitialTroops: initialAttackerTroops,
        defenderInitialTroops: initialDefenderTroops,
        initialAttackerMorale: MORALE_INITIAL_DEFAULT,
        initialDefenderMorale: MORALE_INITIAL_DEFAULT,
        rounds: roundsData,
        attackerLosses: totalAttackerLosses,
        defenderLosses: totalDefenderLosses,
        attackerRemainingTroops: currentAttackerTroops,
        defenderRemainingTroops: currentDefenderTroops,
        finalAttackerMorale: attackerMorale,
        finalDefenderMorale: defenderMorale,
        targetRegionName: targetRegion.name,
        outcome: overallOutcome,
        combatLog: battleSummaryLog,
      },
      finalAttackerTroops: currentAttackerTroops,
      finalDefenderTroops: currentDefenderTroops,
      logEntries: battleSummaryLog, 
    };
  }, [addLogEntry]); 


  const handleAttackRegion = useCallback((attackerBaseRegionId: string, targetRegionId: string) => {
    if (mainUiDisabled || (isDelegated && gameState?.factions[gameState.currentTurnFactionIndex].id === selectedPlayerFactionId)) return;

    setGameState(prev => {
      if (!prev || !selectedPlayerFactionId ) return null;
      let currentLogSnapshot = [...prev.log]; 
      
      let newFactions = [...prev.factions];
      const attackerFaction = newFactions.find(f => f.id === selectedPlayerFactionId)!;
      const targetRegion = prev.regions.find(r => r.id === targetRegionId);

      if (!targetRegion) return prev; 
      if (targetRegion.ownerId === attackerFaction.id) {
        currentLogSnapshot = addLogEntry("자신의 영토는 공격할 수 없습니다.", currentLogSnapshot);
        return {...prev, log: currentLogSnapshot };
      }
      if (attackerFaction.troops <= 0) {
         currentLogSnapshot = addLogEntry(`${attackerFaction.name}: 병력이 없어 공격할 수 없습니다.`, currentLogSnapshot);
         return {...prev, log: currentLogSnapshot };
      }

      let newRegions = [...prev.regions];
      
      if (targetRegion.ownerId) {
        const targetOwnerFaction = newFactions.find(f => f.id === targetRegion.ownerId)!;
        const currentRelation = attackerFaction.relations[targetOwnerFaction.id];
        if (currentRelation.status === 'alliance') {
          newFactions = setDiplomaticStatus(attackerFaction.id, targetOwnerFaction.id, 'war', newFactions);
          newFactions = updateRelationScore(attackerFaction.id, targetOwnerFaction.id, DECLARE_WAR_ON_ALLY_PENALTY + BREAK_ALLIANCE_PENALTY, newFactions);
          currentLogSnapshot = addLogEntry(`${attackerFaction.name}이(가) 동맹 ${targetOwnerFaction.name}의 영토 ${targetRegion.name}을(를) 공격! 동맹이 파기되고 전쟁이 선포됩니다!`, currentLogSnapshot);
        } else if (currentRelation.status === 'peace') {
          newFactions = setDiplomaticStatus(attackerFaction.id, targetOwnerFaction.id, 'war', newFactions);
          newFactions = updateRelationScore(attackerFaction.id, targetOwnerFaction.id, DECLARE_WAR_PENALTY, newFactions);
          currentLogSnapshot = addLogEntry(`${attackerFaction.name}이(가) ${targetOwnerFaction.name}의 영토 ${targetRegion.name}을(를) 공격! 전쟁이 선포됩니다!`, currentLogSnapshot);
        }
      }
      
      const initialAttackerTroops = attackerFaction.troops;
      let defenderFaction: Faction | null = null;
      let initialDefenderTroops = 0;
      let defenderIsNeutral = false;

      if (targetRegion.ownerId) {
        defenderFaction = newFactions.find(f => f.id === targetRegion.ownerId) || null;
        if (defenderFaction) initialDefenderTroops = defenderFaction.troops;
      } else {
        defenderIsNeutral = true;
        initialDefenderTroops = Math.floor(targetRegion.baseMoneyIncome * NEUTRAL_GARRISON_MULTIPLIER);
         targetRegion.buildings.forEach(b => {
            if (b?.type === 'wall' && b.level > 0) { 
                 initialDefenderTroops += (b.level * targetRegion.baseMoneyIncome * 0.5);
            }
        });
      }
      
      const logRef = { log: currentLogSnapshot };
      const combatResult = performCombatSimulation(
        attackerFaction, initialAttackerTroops, 
        defenderFaction, initialDefenderTroops, defenderIsNeutral, 
        targetRegion, logRef
      );
      currentLogSnapshot = logRef.log; 

      newFactions = newFactions.map(f => {
        if (f.id === attackerFaction.id) {
          return { ...f, troops: combatResult.finalAttackerTroops };
        }
        if (defenderFaction && f.id === defenderFaction.id) {
          return { ...f, troops: combatResult.finalDefenderTroops };
        }
        return f;
      });

      if (combatResult.report.outcome === 'attacker_wins') {
        newRegions = newRegions.map(r => {
            if (r.id === targetRegionId) {
                return { ...r, ownerId: attackerFaction.id, turnsSinceConquest: 0, publicOrder: Math.floor(PUBLIC_ORDER_DEFAULT / 2) }; 
            }
            return r;
        });
      }
      
      setCombatReportQueue(prevQ => [...prevQ, combatResult.report]);

      return {
        ...prev,
        factions: newFactions,
        regions: newRegions,
        log: currentLogSnapshot,
        selectedRegionId: null, 
      };
    });
  }, [addLogEntry, mainUiDisabled, selectedPlayerFactionId, performCombatSimulation, isDelegated, gameState]);

  const runAIStrategicTurn = useCallback((
    aiFaction: Faction,
    currentFactions: Faction[],
    currentRegions: Region[],
    currentLog: string[],
    currentTurnNumber: number
  ): {
    updatedFactions: Faction[];
    updatedRegions: Region[];
    updatedLog: string[];
    generatedCombatReports: CombatReportData[];
  } => {
    let newFactions = [...currentFactions];
    let newRegions = [...currentRegions];
    let logEntriesForThisAITurn = [...currentLog];
    const newCombatReports: CombatReportData[] = [];

    const addAITurnLog = (entry: string) => {
        logEntriesForThisAITurn = addLogEntry(entry, logEntriesForThisAITurn);
    };
    
    let currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;
    if (currentAIFactionState.eliminated) {
        return { updatedFactions: newFactions, updatedRegions: newRegions, updatedLog: logEntriesForThisAITurn, generatedCombatReports: newCombatReports };
    }

    addAITurnLog(`--- ${currentAIFactionState.name} 세력 AI 처리 (${isDelegated && currentAIFactionState.id === selectedPlayerFactionId ? "위임됨" : "CPU"}) ---`);

    // 1. AI Diplomacy
    for (const otherFaction of newFactions) {
        if (otherFaction.id === currentAIFactionState.id || otherFaction.eliminated) continue;
        const relationWithOther = currentAIFactionState.relations[otherFaction.id];

        if (relationWithOther.status === 'peace' && relationWithOther.score < AI_LIKELY_TO_DECLARE_WAR_THRESHOLD) {
            if (currentAIFactionState.troops > otherFaction.troops * AI_ATTACK_THRESHOLD_RATIO * 0.8) {
                newFactions = setDiplomaticStatus(currentAIFactionState.id, otherFaction.id, 'war', newFactions);
                newFactions = updateRelationScore(currentAIFactionState.id, otherFaction.id, DECLARE_WAR_PENALTY, newFactions);
                addAITurnLog(`${currentAIFactionState.name}이(가) ${otherFaction.name}에게 전쟁을 선포했습니다!`);
                currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;
            }
        }
        if (relationWithOther.status === 'war' &&
            ((relationWithOther.turnsAtWar || 0) >= AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD || relationWithOther.score > AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD - 10 || currentAIFactionState.troops < otherFaction.troops * 0.7)) {
                addAITurnLog(`${currentAIFactionState.name}이(가) ${otherFaction.name}에게 평화를 제안합니다.`);
                const targetAIFactionRelationToCurrentAI = otherFaction.relations[currentAIFactionState.id];
                const targetWillAcceptPeace = targetAIFactionRelationToCurrentAI.score > AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD ||
                                              (targetAIFactionRelationToCurrentAI.turnsAtWar || 0) >= AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD;
                if (targetWillAcceptPeace) {
                    newFactions = setDiplomaticStatus(currentAIFactionState.id, otherFaction.id, 'peace', newFactions);
                    newFactions = updateRelationScore(currentAIFactionState.id, otherFaction.id, OFFER_PEACE_BONUS_ON_ACCEPT, newFactions);
                    addAITurnLog(`${currentAIFactionState.name}과 ${otherFaction.name}이 평화 협정을 맺었습니다.`);
                    currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;
                } else {
                    addAITurnLog(`${otherFaction.name}이(가) ${currentAIFactionState.name}의 평화 제안을 거절했습니다.`);
                }
        }
        if (relationWithOther.status === 'peace' && relationWithOther.score >= AI_WILLING_TO_ALLY_THRESHOLD) {
             const playerControlledRegions = newRegions.filter(r => r.ownerId === currentAIFactionState.id).length;
             const targetControlledRegions = newRegions.filter(r => r.ownerId === otherFaction.id).length;
             if (playerControlledRegions < targetControlledRegions * AI_CONSIDER_ALLIANCE_STRENGTH_RATIO || targetControlledRegions < playerControlledRegions * AI_CONSIDER_ALLIANCE_STRENGTH_RATIO * 1.5) {
                addAITurnLog(`${currentAIFactionState.name}이(가) ${otherFaction.name}에게 동맹을 제안합니다.`);
                const targetWillAcceptAlliance = otherFaction.relations[currentAIFactionState.id].score >= AI_WILLING_TO_ALLY_THRESHOLD; 
                if (targetWillAcceptAlliance) {
                    newFactions = setDiplomaticStatus(currentAIFactionState.id, otherFaction.id, 'alliance', newFactions);
                    newFactions = updateRelationScore(currentAIFactionState.id, otherFaction.id, FORM_ALLIANCE_BONUS, newFactions);
                    addAITurnLog(`${currentAIFactionState.name}과(와) ${otherFaction.name}이(가) 동맹을 맺었습니다!`);
                    currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;
                } else {
                     addAITurnLog(`${otherFaction.name}이(가) ${currentAIFactionState.name}의 동맹 제안을 거절했습니다.`);
                }
             }
        }
    }
    currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;

    const ownedRegions = newRegions.filter(r => r.ownerId === currentAIFactionState.id);
    if (!currentAIFactionState.eliminated) {
        const developableRegions = ownedRegions
            .filter(r => r.developmentLevel < r.maxDevelopmentLevel)
            .sort((a, b) => b.baseMoneyIncome - a.baseMoneyIncome);
        if (developableRegions.length > 0 && currentAIFactionState.money >= DEVELOPMENT_COST) {
            currentAIFactionState.money -= DEVELOPMENT_COST;
            const regionToDevelop = developableRegions[0]; // Develop the highest income one
            const regionIndexInNewRegions = newRegions.findIndex(r => r.id === regionToDevelop.id);
            if (regionIndexInNewRegions !== -1) {
                newRegions[regionIndexInNewRegions].developmentLevel++;
                addAITurnLog(`${currentAIFactionState.name}이(가) ${newRegions[regionIndexInNewRegions].name} 지역 개발.`);
            }
        }
        for (const ownedRegion of ownedRegions) {
             const regionIndex = newRegions.findIndex(r => r.id === ownedRegion.id);
             if (regionIndex === -1) continue;

             for (let slotIndex = 0; slotIndex < newRegions[regionIndex].maxBuildingSlots; slotIndex++) {
                const buildingInSlot = newRegions[regionIndex].buildings[slotIndex];
                if (buildingInSlot) { 
                    const def = BUILDING_DEFINITIONS[buildingInSlot.type];
                    if (buildingInSlot.level < (def.maxLevel || MAX_BUILDING_LEVEL)) {
                        const cost = def.cost(buildingInSlot.level);
                        if (currentAIFactionState.money >= cost.money && (!cost.food || currentAIFactionState.food >= cost.food)) {
                            currentAIFactionState.money -= cost.money;
                            if(cost.food) currentAIFactionState.food -= cost.food;
                            newRegions[regionIndex].buildings[slotIndex]!.level++;
                            addAITurnLog(`${currentAIFactionState.name}: ${ownedRegion.name}에 ${def.name} Lv.${newRegions[regionIndex].buildings[slotIndex]!.level} 업그레이드.`);
                            break; 
                        }
                    }
                } else { 
                    const buildingTypesToConsider: BuildingType[] = ['market', 'farm', 'barracks', 'wall']; 
                    for (const typeToBuild of buildingTypesToConsider) {
                        const def = BUILDING_DEFINITIONS[typeToBuild];
                        const cost = def.cost(0);
                         if (currentAIFactionState.money >= cost.money && (!cost.food || currentAIFactionState.food >= cost.food)) {
                            currentAIFactionState.money -= cost.money;
                            if(cost.food) currentAIFactionState.food -= cost.food;
                            newRegions[regionIndex].buildings[slotIndex] = { type: typeToBuild, level: 1 };
                            addAITurnLog(`${currentAIFactionState.name}: ${ownedRegion.name}에 ${def.name} Lv.1 건설.`);
                            break; 
                        }
                    }
                    if (newRegions[regionIndex].buildings[slotIndex]) break; 
                }
             }
             if (ownedRegions.some(r => newRegions.find(nr => nr.id === r.id)!.buildings.some(b => b && b.level > 0 && b.level === 1))) { 
                break; 
             }
        }
    }
    newFactions = newFactions.map(f => f.id === currentAIFactionState.id ? currentAIFactionState : f);
    currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;

    if (!currentAIFactionState.eliminated && currentAIFactionState.money > AI_RECRUIT_MONEY_MIN_THRESHOLD) {
        for (const ownedRegion of ownedRegions) {
            let maxRecruitsByFoodAI = Math.floor(ownedRegion.baseFoodIncome * RECRUIT_MAX_FOOD_FACTOR);
            let currentRecruitCostModifierAI = 1.0;
            ownedRegion.buildings.forEach(b => {
                if (b?.type === 'barracks' && b.level > 0) {
                     maxRecruitsByFoodAI += BUILDING_DEFINITIONS.barracks.effects(b.level).maxRecruitsBonus || 0;
                     currentRecruitCostModifierAI *= (BUILDING_DEFINITIONS.barracks.effects(b.level).recruitCostModifier || 1);
                }
            });
            const recruitsToAttempt = Math.floor(maxRecruitsByFoodAI * AI_RECRUIT_PERCENTAGE);

            if (recruitsToAttempt > 0) {
                const cost = recruitsToAttempt * RECRUIT_COST_PER_TROOP * currentRecruitCostModifierAI;
                if (currentAIFactionState.money >= cost) {
                    currentAIFactionState.money -= cost;
                    currentAIFactionState.troops += recruitsToAttempt;
                    addAITurnLog(`${currentAIFactionState.name}이(가) ${ownedRegion.name}에서 ${recruitsToAttempt}명 징병.`);
                    break; 
                }
            }
        }
    }
    newFactions = newFactions.map(f => f.id === currentAIFactionState.id ? currentAIFactionState : f);
    currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;

    if (!currentAIFactionState.eliminated && currentAIFactionState.troops > 0) {
        let bestTarget: { region: Region, baseRegion: Region, ratio: number } | null = null;
        for (const baseRegion of ownedRegions) {
            const adjacent = getAdjacentRegions(baseRegion.id, newRegions);
            for (const target of adjacent) {
                if (target.ownerId === currentAIFactionState.id) continue;
                if (target.ownerId && currentAIFactionState.relations[target.ownerId]?.status === 'alliance') continue;

                let targetTroops = 0;
                const targetOwnerFaction = target.ownerId ? newFactions.find(f => f.id === target.ownerId) : null;
                if (targetOwnerFaction && targetOwnerFaction.eliminated) continue;

                if (target.ownerId === null) {
                    targetTroops = Math.floor(target.baseMoneyIncome * NEUTRAL_GARRISON_MULTIPLIER);
                    target.buildings.forEach(b => { 
                        if (b?.type === 'wall' && b.level > 0) targetTroops += (b.level * target.baseMoneyIncome * 0.5);
                    });
                } else if (targetOwnerFaction) {
                    targetTroops = targetOwnerFaction.troops;
                     if (currentAIFactionState.relations[target.ownerId]?.status === 'peace') {
                        targetTroops *= 1.5; 
                    }
                }
                if (targetTroops === 0 && target.ownerId !== null) targetTroops = 100; 

                const ratio = targetTroops > 0 ? currentAIFactionState.troops / targetTroops : Infinity;
                if (ratio > AI_ATTACK_THRESHOLD_RATIO) {
                    if (!bestTarget || ratio > bestTarget.ratio) {
                        bestTarget = { region: target, baseRegion: baseRegion, ratio };
                    }
                }
            }
        }

        if (bestTarget) {
            addAITurnLog(`${currentAIFactionState.name}이(가) ${bestTarget.baseRegion.name}에서 ${bestTarget.region.name} 공격 준비!`);
            const targetOwnerId = bestTarget.region.ownerId;
            if (targetOwnerId && currentAIFactionState.relations[targetOwnerId]?.status === 'peace') {
                newFactions = setDiplomaticStatus(currentAIFactionState.id, targetOwnerId, 'war', newFactions);
                newFactions = updateRelationScore(currentAIFactionState.id, targetOwnerId, DECLARE_WAR_PENALTY, newFactions);
                addAITurnLog(`${currentAIFactionState.name}이(가) ${newFactions.find(f => f.id === targetOwnerId)!.name}에게 전쟁을 선포하고 공격합니다!`);
                currentAIFactionState = newFactions.find(f => f.id === aiFaction.id)!;
            }

            const initialAIAttackerTroops = currentAIFactionState.troops;
            let defenderFactionAI: Faction | null = null;
            let initialDefenderTroopsAI = 0;
            let defenderIsNeutralAI = false;

            if (bestTarget.region.ownerId) {
                defenderFactionAI = newFactions.find(f => f.id === bestTarget.region.ownerId) || null;
                if (defenderFactionAI) initialDefenderTroopsAI = defenderFactionAI.troops;
            } else {
                defenderIsNeutralAI = true;
                initialDefenderTroopsAI = Math.floor(bestTarget.region.baseMoneyIncome * NEUTRAL_GARRISON_MULTIPLIER);
                bestTarget.region.buildings.forEach(b => {
                    if (b?.type === 'wall' && b.level > 0) initialDefenderTroopsAI += (b.level * bestTarget!.region.baseMoneyIncome * 0.5);
                });
            }
            
            const combatLogRef = { log: logEntriesForThisAITurn };
            const aiCombatResult = performCombatSimulation(
                currentAIFactionState, initialAIAttackerTroops,
                defenderFactionAI, initialDefenderTroopsAI, defenderIsNeutralAI,
                bestTarget.region, combatLogRef
            );
            logEntriesForThisAITurn = combatLogRef.log; 
            
            currentAIFactionState.troops = aiCombatResult.finalAttackerTroops;
            if (defenderFactionAI) {
                const defFactionIdx = newFactions.findIndex(f => f.id === defenderFactionAI!.id);
                if (defFactionIdx !== -1) {
                    newFactions[defFactionIdx].troops = aiCombatResult.finalDefenderTroops;
                }
            }
             newFactions = newFactions.map(f => f.id === currentAIFactionState.id ? currentAIFactionState : f);


            if (aiCombatResult.report.outcome === 'attacker_wins') {
                const targetRegionIndex = newRegions.findIndex(r => r.id === bestTarget!.region.id);
                if (targetRegionIndex !== -1) {
                    newRegions[targetRegionIndex].ownerId = currentAIFactionState.id;
                    newRegions[targetRegionIndex].turnsSinceConquest = 0;
                    newRegions[targetRegionIndex].publicOrder = Math.floor(PUBLIC_ORDER_DEFAULT / 2);
                }
            }
            newCombatReports.push(aiCombatResult.report);
        }
    }
     newFactions = newFactions.map(f => f.id === currentAIFactionState.id ? currentAIFactionState : f);

    return { 
        updatedFactions: newFactions, 
        updatedRegions: newRegions, 
        updatedLog: logEntriesForThisAITurn, 
        generatedCombatReports: newCombatReports 
    };

  }, [addLogEntry, performCombatSimulation, selectedPlayerFactionId, isDelegated]);


  const handleEndTurn = useCallback(() => {
    if (mainUiDisabled) return;

    setGameState(prev => {
      if (!prev || !selectedPlayerFactionId) return null;

      let newFactions = [...prev.factions];
      let newRegions = [...prev.regions];
      let turnLogEntries: string[] = [...prev.log]; 
      let pendingCombatReportsThisTurn: CombatReportData[] = [];

      let newGameOver = prev.gameOver;
      let newWinner = prev.winner;
      let newGameOverReason = prev.gameOverReason;
      let newEliminatedPlayerFactionId = prev.eliminatedPlayerFactionId;

      const addGlobalTurnLog = (entry: string) => {
        turnLogEntries = addLogEntry(entry, turnLogEntries);
      };
      
      const playerFactionOriginalIndex = newFactions.findIndex(f => f.id === selectedPlayerFactionId);

      newFactions = newFactions.map(faction => {
        if (faction.eliminated) return faction;
        
        let factionMoneyIncome = 0;
        let factionFoodIncome = 0;

        newRegions = newRegions.map(region => {
          if (region.ownerId === faction.id) {
            let currentRegionMoneyIncome = region.baseMoneyIncome * (1 + region.developmentLevel * 0.1);
            let currentRegionFoodIncome = region.baseFoodIncome * (1 + region.developmentLevel * 0.1);
            let poChangeThisTurn = 0;

            region.buildings.forEach(building => {
              if (building) {
                const effects = BUILDING_DEFINITIONS[building.type].effects(building.level, region, faction);
                if (effects.moneyBonus) currentRegionMoneyIncome += effects.moneyBonus;
                if (effects.foodBonus) currentRegionFoodIncome += effects.foodBonus;
                if (effects.publicOrderChangePerTurn) poChangeThisTurn += effects.publicOrderChangePerTurn;
              }
            });
            
            if (region.turnsSinceConquest !== undefined && region.turnsSinceConquest < PUBLIC_ORDER_TURNS_CONSIDERED_RECENTLY_CONQUERED) {
              poChangeThisTurn += PUBLIC_ORDER_RECENTLY_CONQUERED_PENALTY;
              region.turnsSinceConquest!++;
            } else {
               region.turnsSinceConquest = undefined; 
            }

            const factionForTroopCount = newFactions.find(f => f.id === region.ownerId);
            const troopsInRegion = factionForTroopCount ? factionForTroopCount.troops : 0; 
            const garrisonMinThreshold = region.baseFoodIncome * PUBLIC_ORDER_GARRISON_BONUS_MIN_TROOPS_FACTOR; 
            if (troopsInRegion === 0) {
              poChangeThisTurn += PUBLIC_ORDER_NO_GARRISON_PENALTY;
            } else if (troopsInRegion >= garrisonMinThreshold) {
              poChangeThisTurn += PUBLIC_ORDER_GARRISON_BONUS;
            }

            if (faction.food < 0) { 
                poChangeThisTurn += PUBLIC_ORDER_LOW_FOOD_FACTION_PENALTY;
            }
            
            const adjacentRegionDetails = getAdjacentRegions(region.id, prev.regions);
            let atWarWithNeighbor = false;
            for (const adj of adjacentRegionDetails) {
                if (adj.ownerId && adj.ownerId !== faction.id && faction.relations[adj.ownerId]?.status === 'war') {
                    atWarWithNeighbor = true;
                    break;
                }
            }
            if (atWarWithNeighbor) {
                poChangeThisTurn += PUBLIC_ORDER_WAR_ADJACENT_PENALTY;
            }

            if (region.publicOrder < PUBLIC_ORDER_DEFAULT) {
              poChangeThisTurn += PUBLIC_ORDER_CHANGE_PER_TURN_TOWARDS_DEFAULT;
            } else if (region.publicOrder > PUBLIC_ORDER_DEFAULT) {
              poChangeThisTurn -= PUBLIC_ORDER_CHANGE_PER_TURN_TOWARDS_DEFAULT;
            }
            region.publicOrder = Math.max(PUBLIC_ORDER_MIN, Math.min(PUBLIC_ORDER_MAX, region.publicOrder + poChangeThisTurn));

            if (region.publicOrder < PUBLIC_ORDER_LOW_INCOME_THRESHOLD) {
              currentRegionMoneyIncome *= PUBLIC_ORDER_LOW_INCOME_PENALTY_FACTOR;
              currentRegionFoodIncome *= PUBLIC_ORDER_LOW_INCOME_PENALTY_FACTOR;
              if (region.publicOrder < PUBLIC_ORDER_REBELLION_THRESHOLD && Math.random() < PUBLIC_ORDER_REBELLION_CHANCE) {
                addGlobalTurnLog(`🚨 ${region.name}에서 낮은 공공 질서(${region.publicOrder})로 인해 반란 발생!`);
                region.ownerId = null; 
                region.publicOrder = PUBLIC_ORDER_DEFAULT; 
              }
            } else if (region.publicOrder > PUBLIC_ORDER_HIGH_INCOME_THRESHOLD) {
                currentRegionMoneyIncome *= PUBLIC_ORDER_HIGH_INCOME_BONUS_FACTOR;
                currentRegionFoodIncome *= PUBLIC_ORDER_HIGH_INCOME_BONUS_FACTOR;
            }

            factionMoneyIncome += Math.floor(currentRegionMoneyIncome);
            factionFoodIncome += Math.floor(currentRegionFoodIncome);
          }
          return region;
        });
        
        const updatedRelations = {...faction.relations};
        Object.keys(updatedRelations).forEach(otherFactionId => {
            if (updatedRelations[otherFactionId].status === 'war' && updatedRelations[otherFactionId].turnsAtWar !== undefined) {
                updatedRelations[otherFactionId].turnsAtWar!++;
            }
            if (updatedRelations[otherFactionId].status === 'alliance' && updatedRelations[otherFactionId].turnsAtWar !== undefined) { // Corrected this line: turnsAllied
                updatedRelations[otherFactionId].turnsAllied!++;
            }
        });

        return {
          ...faction,
          money: faction.money + factionMoneyIncome,
          food: faction.food + factionFoodIncome,
          relations: updatedRelations,
        };
      });
      
      const factionsInTurnOrder = [...newFactions.slice(playerFactionOriginalIndex), ...newFactions.slice(0, playerFactionOriginalIndex)];

      for (const currentFactionForTurn of factionsInTurnOrder) {
        if (currentFactionForTurn.eliminated) continue;

        const isPlayerCurrentFaction = currentFactionForTurn.id === selectedPlayerFactionId;
        
        if (!isPlayerCurrentFaction || (isPlayerCurrentFaction && isDelegated)) {
            const aiProcessingResult = runAIStrategicTurn(
                currentFactionForTurn,
                newFactions,
                newRegions,
                turnLogEntries,
                prev.turnNumber
            );
            newFactions = aiProcessingResult.updatedFactions;
            newRegions = aiProcessingResult.updatedRegions;
            turnLogEntries = aiProcessingResult.updatedLog;
            pendingCombatReportsThisTurn.push(...aiProcessingResult.generatedCombatReports);
        }
      }

      newFactions = newFactions.map(f => {
        if (!f.eliminated) {
          const controlledRegionsCount = newRegions.filter(r => r.ownerId === f.id).length;
          if (controlledRegionsCount === 0) { 
            addGlobalTurnLog(`${f.name} 세력이 멸망했습니다.`);
            if (f.id === selectedPlayerFactionId) {
                newGameOver = true;
                newGameOverReason = 'elimination';
                newEliminatedPlayerFactionId = selectedPlayerFactionId;
            }
            return { ...f, eliminated: true, troops: 0, money: 0, food: 0 };
          }
        }
        return f;
      });
      
      if (!newGameOver) {
        for (const faction of newFactions) {
          if (faction.eliminated) continue;
          const controlledRegionsCount = newRegions.filter(r => r.ownerId === faction.id).length;
          if (controlledRegionsCount >= VICTORY_REGIONS_COUNT && controlledRegionsCount > 0) {
            newGameOver = true;
            newWinner = faction;
            newGameOverReason = 'victory';
            addGlobalTurnLog(`${faction.name} 세력이 ${VICTORY_REGIONS_COUNT}개 지역을 점령하여 천하를 통일했습니다!`);
            break; 
          }
        }
      }
      
      const newTurnNumber = prev.turnNumber + 1;
      const {year, month} = getYearMonthFromTurn(prev.turnNumber, INITIAL_YEAR); // For current turn's end log
      const {year: nextYear, month: nextMonth} = getYearMonthFromTurn(newTurnNumber, INITIAL_YEAR); // For next turn's start log

      const playerFactionForLog = newFactions.find(f => f.id === selectedPlayerFactionId);

      if (!newGameOver && playerFactionForLog && !playerFactionForLog.eliminated) {
          let incomeLog = `${year}년 ${month}월, ${playerFactionForLog.name} 세력의 턴 종료.`;
          if (!isDelegated) {
            let playerMoneyIncomeThisTurn = 0;
            let playerFoodIncomeThisTurn = 0;
            prev.regions.filter(r => r.ownerId === playerFactionForLog.id).forEach(region => {
                let currentRegionMoneyIncome = region.baseMoneyIncome * (1 + region.developmentLevel * 0.1);
                let currentRegionFoodIncome = region.baseFoodIncome * (1 + region.developmentLevel * 0.1);
                region.buildings.forEach(b => {
                   if(b) {
                     const effects = BUILDING_DEFINITIONS[b.type].effects(b.level);
                     if(effects.moneyBonus) currentRegionMoneyIncome += effects.moneyBonus;
                     if(effects.foodBonus) currentRegionFoodIncome += effects.foodBonus;
                   }
                });
                if (region.publicOrder < PUBLIC_ORDER_LOW_INCOME_THRESHOLD) {
                    currentRegionMoneyIncome *= PUBLIC_ORDER_LOW_INCOME_PENALTY_FACTOR;
                    currentRegionFoodIncome *= PUBLIC_ORDER_LOW_INCOME_PENALTY_FACTOR;
                } else if (region.publicOrder > PUBLIC_ORDER_HIGH_INCOME_THRESHOLD) {
                    currentRegionMoneyIncome *= PUBLIC_ORDER_HIGH_INCOME_BONUS_FACTOR;
                    currentRegionFoodIncome *= PUBLIC_ORDER_HIGH_INCOME_BONUS_FACTOR;
                }
                playerMoneyIncomeThisTurn += Math.floor(currentRegionMoneyIncome);
                playerFoodIncomeThisTurn += Math.floor(currentRegionFoodIncome);
            });
             incomeLog += ` 수입: 금 ${playerMoneyIncomeThisTurn >= 0 ? '+' : ''}${playerMoneyIncomeThisTurn}, 식량 ${playerFoodIncomeThisTurn >= 0 ? '+' : ''}${playerFoodIncomeThisTurn}`;
          }
          addGlobalTurnLog(incomeLog);
          addGlobalTurnLog(`${nextYear}년 ${nextMonth}월, ${playerFactionForLog.name} 세력의 새 턴 시작. (턴 ${newTurnNumber})`);
          if (!newGameOver) { 
            addGlobalTurnLog("게임이 자동 저장되었습니다.");
          }

      } else if (newGameOver && newGameOverReason === 'elimination' && newEliminatedPlayerFactionId === playerFactionForLog?.id) {
          addGlobalTurnLog(`${playerFactionForLog.name} 세력이 멸망했습니다. 게임 종료.`);
      } else if (newGameOver && newGameOverReason === 'victory') {
           // Victory log already added in check loop
      }


      if (pendingCombatReportsThisTurn.length > 0) {
        setCombatReportQueue(prevQ => [...prevQ, ...pendingCombatReportsThisTurn]);
      }

      return {
        ...prev,
        factions: newFactions,
        regions: newRegions,
        currentTurnFactionIndex: playerFactionOriginalIndex, 
        turnNumber: newGameOver ? prev.turnNumber : newTurnNumber, 
        selectedRegionId: null,
        log: turnLogEntries.slice(0, LOG_MAX_ENTRIES),
        gameOver: newGameOver,
        winner: newWinner,
        gameOverReason: newGameOverReason,
        eliminatedPlayerFactionId: newEliminatedPlayerFactionId,
        isDiplomacyModalOpen: false, 
        diplomacyTargetFactionIdForGift: null,
        diplomaticFeedback: prev.diplomaticFeedback?.isOpen ? prev.diplomaticFeedback : null,
      };
    });
  }, [selectedPlayerFactionId, mainUiDisabled, addLogEntry, runAIStrategicTurn, isDelegated]); 

  useEffect(() => {
    if (isDelegated && gameState && !gameState.gameOver && !isCombatReportModalVisible && selectedPlayerFactionId && gameState.factions[gameState.currentTurnFactionIndex].id === selectedPlayerFactionId) {
      const timeoutId = setTimeout(() => {
        const currentLog = gameState.log;
        const newLog = addLogEntry("위임 모드: 자동으로 턴을 진행합니다.", currentLog);
        // It's better to update log via setGameState to ensure it's part of the state update transaction
        setGameState(g => g ? {...g, log: newLog} : null);
        handleEndTurn();
      }, 1000); 
      return () => clearTimeout(timeoutId);
    }
  }, [isDelegated, gameState?.turnNumber, gameState?.gameOver, isCombatReportModalVisible, selectedPlayerFactionId, gameState?.currentTurnFactionIndex, handleEndTurn, addLogEntry, gameState?.log, gameState?.factions]);


  if (!initialSaveDataCheck) {
    return <div className="fixed inset-0 bg-gray-100 flex items-center justify-center text-xl text-gray-700">게임 데이터 확인 중...</div>;
  }

  if (!selectedPlayerFactionId || !gameState) {
    return <FactionSelectionScreen 
                factionsData={FACTIONS_DATA} 
                onSelectFaction={handleFactionSelect}
                savedGameAvailable={savedGameAvailable}
                onLoadSavedGame={handleLoadSavedGame}
            />;
  }

  const currentFaction = gameState.factions[gameState.currentTurnFactionIndex];
  const selectedRegionData = gameState.selectedRegionId ? gameState.regions.find(r => r.id === gameState.selectedRegionId) : null;
  const { year, month } = getYearMonthFromTurn(gameState.turnNumber, INITIAL_YEAR);

  if (gameState.gameOver && !isCombatReportModalVisible) { 
    if (gameState.gameOverReason === 'victory' && gameState.winner) {
      return <VictoryModal winner={gameState.winner} turnNumber={gameState.turnNumber} year={year} month={month} onStartNewGame={handleStartNewGame} />;
    }
    if (gameState.gameOverReason === 'elimination' && gameState.eliminatedPlayerFactionId) {
      const eliminatedPlayerFaction = gameState.factions.find(f => f.id === gameState.eliminatedPlayerFactionId);
      return <GameOverModal 
                playerFaction={eliminatedPlayerFaction || null} 
                allFactions={gameState.factions}
                allRegions={gameState.regions}
                turnNumber={gameState.turnNumber} 
                year={year} 
                month={month}
                onStartNewGame={handleStartNewGame}
             />;
    }
    
    if (!isCombatReportModalVisible) { 
        return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white text-2xl p-4 text-center">게임 종료. 예상치 못한 상황으로 인해 게임이 종료되었습니다. 새 게임을 시작해주세요.</div>;
    }
  }
  
  const dynamicAdjacentRegions = selectedRegionData ? getAdjacentRegions(selectedRegionData.id, gameState.regions) : [];
  
  return (
    <>
      <div className={`min-h-screen flex flex-col bg-gray-200 text-gray-800 ${mainUiDisabled ? 'pointer-events-none opacity-50' : ''}`}>
        <Header currentFactionName={currentFaction.name} turnNumber={gameState.turnNumber} year={year} month={month} />
        
        <main className={`flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-4 ${mainUiDisabled ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="lg:w-1/4 flex flex-col gap-4">
            <FactionInfoPanel factions={gameState.factions} regions={gameState.regions} />
            <LogPanel logs={gameState.log} />
          </div>

          <div className="lg:w-1/2">
            <RegionGrid regions={gameState.regions} factions={gameState.factions} onRegionSelect={handleSelectRegion} />
          </div>

          <div className="lg:w-1/4 flex flex-col gap-4">
            <ChartsPanel factions={gameState.factions} regions={gameState.regions} />
            <AdvisorPanel turnNumber={gameState.turnNumber} />
            <HistoricalEventsPanel turnNumber={gameState.turnNumber} />
          </div>
        </main>
        
        <GameControls 
            onEndTurn={handleEndTurn} 
            onOpenDiplomacy={handleOpenDiplomacyModal} 
            isDelegated={isDelegated}
            onToggleDelegate={handleToggleDelegate}
            disableNormalControls={mainUiDisabled || (isDelegated && currentFaction.id === selectedPlayerFactionId)}
        />

        {selectedRegionData && !gameState.gameOver && !mainUiDisabled && (
          <RegionInfoModal
            region={selectedRegionData}
            owner={selectedRegionData.ownerId ? gameState.factions.find(f => f.id === selectedRegionData.ownerId) : null}
            currentFaction={currentFaction}
            allFactions={gameState.factions}
            allRegions={gameState.regions}
            adjacentRegions={dynamicAdjacentRegions}
            onClose={handleCloseModal}
            onDevelop={handleDevelopRegion}
            onRecruit={handleRecruitTroops}
            onAttack={handleAttackRegion}
            onConstructBuilding={handleConstructBuilding}
            onUpgradeBuilding={handleUpgradeBuilding}
            onDemolishBuilding={handleDemolishBuilding}
            developCost={DEVELOPMENT_COST}
            recruitCostPerTroop={RECRUIT_COST_PER_TROOP}
            isDelegated={isDelegated && currentFaction.id === selectedPlayerFactionId}
          />
        )}

        {gameState.isDiplomacyModalOpen && selectedPlayerFactionId && !mainUiDisabled && (
          <DiplomacyModal
            isOpen={gameState.isDiplomacyModalOpen}
            onClose={handleCloseDiplomacyModal}
            playerFaction={gameState.factions.find(f => f.id === selectedPlayerFactionId)!}
            otherFactions={gameState.factions.filter(f => f.id !== selectedPlayerFactionId && !f.eliminated)}
            onDiplomaticAction={handleDiplomaticAction}
            turnNumber={gameState.turnNumber}
            setTargetFactionForGift={(factionId) => setGameState(prev => prev ? {...prev, diplomacyTargetFactionIdForGift: factionId} : null)}
            targetFactionForGift={gameState.diplomacyTargetFactionIdForGift}
            isDelegated={isDelegated}
          />
        )}

        {gameState.diplomaticFeedback && gameState.diplomaticFeedback.isOpen && !mainUiDisabled && (
          <DiplomaticFeedbackModal
            message={gameState.diplomaticFeedback.message}
            onClose={handleCloseDiplomaticFeedbackModal}
          />
        )}
      </div>
      
      {isCombatReportModalVisible && currentCombatReport && (
        <CombatReportModal
          isOpen={isCombatReportModalVisible}
          onClose={handleCloseCombatReportModal}
          reportData={currentCombatReport}
          autoAdvanceDelay={SEQUENTIAL_ROUND_AUTO_ADVANCE_DELAY}
          isDelegated={isDelegated}
          onToggleDelegate={handleToggleDelegate}
        />
      )}
    </>
  );
};

export default App;
