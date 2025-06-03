export type DiplomaticStatus = 'war' | 'peace' | 'alliance';

export interface FactionRelation {
  score: number; // -100 (hostile) to +100 (ally)
  status: DiplomaticStatus;
  lastGiftTurn?: number; // To prevent gift spamming improving relations too quickly
  turnsAtWar?: number;
  turnsAllied?: number;
}

export interface Faction {
  id: string;
  name: string;
  leader: string;
  color: string;
  textColor: string;
  money: number;
  food: number;
  troops: number; 
  eliminated?: boolean;
  relations: { [otherFactionId: string]: FactionRelation };
}

export type BuildingType = 'market' | 'farm' | 'barracks' | 'wall';

export interface Building {
  type: BuildingType;
  level: number;
}

export interface Region {
  id: string;
  name: string;
  province: string;
  ownerId: string | null;
  baseMoneyIncome: number;
  baseFoodIncome: number;
  developmentLevel: number; 
  maxDevelopmentLevel: number;
  adjacentRegions: string[]; 
  uiPosition?: { row: number, col: number };
  
  // Enhanced Region Management
  maxBuildingSlots: number;
  buildings: Array<Building | null>; // Array matching maxBuildingSlots
  publicOrder: number; // 0-100
  turnsSinceConquest?: number; // Tracks turns since last conquered for PO penalty
}

export interface CombatRoundData {
  roundNumber: number;
  attackerDice: number;
  defenderDice: number;
  attackerStrengthThisRound: number;
  defenderStrengthThisRound: number;
  attackerCasualtiesThisRound: number;
  defenderCasualtiesThisRound: number;
  attackerMoraleChange: number;
  defenderMoraleChange: number;
  attackerMoraleAfterRound: number;
  defenderMoraleAfterRound: number;
  log: string[]; // Log entries specific to this round
}

export interface CombatReportData {
  attackerFactionName: string;
  attackerColor: string; 
  attackerTextColor: string; 
  defenderFactionName: string;
  defenderColor: string; 
  defenderTextColor: string; 
  
  attackerInitialTroops: number;
  defenderInitialTroops: number;
  initialAttackerMorale: number;
  initialDefenderMorale: number;

  rounds: CombatRoundData[]; // Data for each combat round
  
  attackerLosses: number; // Total losses
  defenderLosses: number; // Total losses
  attackerRemainingTroops: number;
  defenderRemainingTroops: number;
  finalAttackerMorale: number;
  finalDefenderMorale: number;
  
  targetRegionName: string;
  outcome: 'attacker_wins' | 'defender_wins';
  combatLog: string[]; // High-level summary log for the modal (e.g., retreat, annihilation)
}


export interface GameState {
  factions: Faction[];
  regions: Region[];
  currentTurnFactionIndex: number;
  turnNumber: number;
  selectedRegionId: string | null;
  log: string[];
  gameOver: boolean;
  winner: Faction | null;
  gameOverReason: 'victory' | 'elimination' | null; 
  eliminatedPlayerFactionId?: string | null; 
  isDiplomacyModalOpen?: boolean;
  diplomacyTargetFactionIdForGift?: string | null; 
  diplomaticFeedback?: {
    isOpen: boolean;
    message: string;
  } | null;
}

export interface RawFactionData {
  id: string;
  name: string;
  leader: string;
  color: string;
  textColor: string;
  initialMoney: number;
  initialFood: number;
  initialTroops: number;
}

export interface RawRegionData {
  id: string;
  name: string;
  province: string;
  initialOwnerId?: string | null;
  baseMoneyIncome: number;
  baseFoodIncome: number;
  initialDevelopmentLevel: number;
  maxDevelopmentLevel?: number;
  adjacentRegions?: string[];
  uiPosition?: { row: number, col: number };
  initialMaxBuildingSlots?: number; // For potential per-region customization
}