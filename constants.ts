
import { RawFactionData, RawRegionData, BuildingType, Region, Faction } from './types';

export const FACTIONS_DATA: RawFactionData[] = [
  { id: 'cao_cao', name: '조조', leader: '조조', color: 'bg-red-700', textColor: 'text-white', initialMoney: 2000, initialFood: 2000, initialTroops: 5000 },
  { id: 'yuan_shao', name: '원소', leader: '원소', color: 'bg-yellow-500', textColor: 'text-gray-900', initialMoney: 1800, initialFood: 1800, initialTroops: 4000 },
  { id: 'liu_bei', name: '유비', leader: '유비', color: 'bg-green-600', textColor: 'text-white', initialMoney: 1000, initialFood: 1000, initialTroops: 2500 },
  { id: 'sun_quan', name: '손권', leader: '손권', color: 'bg-blue-600', textColor: 'text-white', initialMoney: 1500, initialFood: 1500, initialTroops: 3000 },
];

export const REGIONS_DATA: RawRegionData[] = [
  // 기주 (冀州 - Jizhou) - 원소
  { id: 'jizhou_ye', name: '업', province: '기주', initialOwnerId: 'yuan_shao', baseMoneyIncome: 120, baseFoodIncome: 100, initialDevelopmentLevel: 1, uiPosition: { row: 1, col: 3 } },
  { id: 'jizhou_nanpi', name: '남피', province: '기주', initialOwnerId: 'yuan_shao', baseMoneyIncome: 100, baseFoodIncome: 90, initialDevelopmentLevel: 0, uiPosition: { row: 1, col: 4 } },
  { id: 'jizhou_pingyuan', name: '평원', province: '기주', baseMoneyIncome: 90, baseFoodIncome: 80, initialDevelopmentLevel: 0, uiPosition: { row: 2, col: 4 } }, // Initially neutral

  // 연주 (兗州 - Yanzhou) - 조조
  { id: 'yanzhou_xuchang', name: '허창', province: '연주', initialOwnerId: 'cao_cao', baseMoneyIncome: 130, baseFoodIncome: 110, initialDevelopmentLevel: 1, uiPosition: { row: 3, col: 3 } },
  { id: 'yanzhou_chenliu', name: '진류', province: '연주', initialOwnerId: 'cao_cao', baseMoneyIncome: 110, baseFoodIncome: 90, initialDevelopmentLevel: 0, uiPosition: { row: 3, col: 2 } },
  { id: 'yanzhou_puyang', name: '복양', province: '연주', baseMoneyIncome: 100, baseFoodIncome: 85, initialDevelopmentLevel: 0, uiPosition: { row: 2, col: 3 } }, // Initially neutral

  // 예주 (豫州 - Yuzhou) - 유비 (small start)
  { id: 'yuzhou_runan', name: '여남', province: '예주', baseMoneyIncome: 95, baseFoodIncome: 80, initialDevelopmentLevel: 0, uiPosition: { row: 4, col: 3 } }, // Neutral
  { id: 'yuzhou_xiaopei', name: '소패', province: '예주', initialOwnerId: 'liu_bei', baseMoneyIncome: 80, baseFoodIncome: 70, initialDevelopmentLevel: 0, uiPosition: { row: 4, col: 2 } },

  // 서주 (徐州 - Xuzhou)
  { id: 'xuzhou_xiapi', name: '하비', province: '서주', baseMoneyIncome: 110, baseFoodIncome: 95, initialDevelopmentLevel: 0, uiPosition: { row: 4, col: 4 } },
  { id: 'xuzhou_pengcheng', name: '팽성', province: '서주', baseMoneyIncome: 100, baseFoodIncome: 90, initialDevelopmentLevel: 0, uiPosition: { row: 3, col: 4 } },

  // 청주 (青州 - Qingzhou)
  { id: 'qingzhou_linzi', name: '임치', province: '청주', baseMoneyIncome: 90, baseFoodIncome: 75, initialDevelopmentLevel: 0, uiPosition: { row: 2, col: 5 } },
  { id: 'qingzhou_beihai', name: '북해', province: '청주', baseMoneyIncome: 85, baseFoodIncome: 70, initialDevelopmentLevel: 0, uiPosition: { row: 1, col: 5 } },

  // 유주 (幽州 - Youzhou)
  { id: 'youzhou_ji', name: '계', province: '유주', baseMoneyIncome: 100, baseFoodIncome: 80, initialDevelopmentLevel: 0, uiPosition: { row: 1, col: 2 } },
  { id: 'youzhou_xiangping', name: '양평', province: '유주', baseMoneyIncome: 80, baseFoodIncome: 60, initialDevelopmentLevel: 0, uiPosition: { row: 1, col: 1 } },

  // 병주 (并州 - Bingzhou)
  { id: 'bingzhou_jinyang', name: '진양', province: '병주', baseMoneyIncome: 95, baseFoodIncome: 85, initialDevelopmentLevel: 0, uiPosition: { row: 2, col: 1 } },
  { id: 'bingzhou_shangdang', name: '상당', province: '병주', baseMoneyIncome: 85, baseFoodIncome: 75, initialDevelopmentLevel: 0, uiPosition: { row: 2, col: 2 } },

  // 옹주 (雍州 - Yongzhou)
  { id: 'yongzhou_changan', name: '장안', province: '옹주', baseMoneyIncome: 150, baseFoodIncome: 120, initialDevelopmentLevel: 1, uiPosition: { row: 3, col: 1 } }, // Important city
  { id: 'yongzhou_tianshui', name: '천수', province: '옹주', baseMoneyIncome: 90, baseFoodIncome: 80, initialDevelopmentLevel: 0, uiPosition: { row: 4, col: 1 } },

  // 양주 (揚州 - Yangzhou) - 손권
  { id: 'yangzhou_jianye', name: '건업', province: '양주', initialOwnerId: 'sun_quan', baseMoneyIncome: 140, baseFoodIncome: 115, initialDevelopmentLevel: 1, uiPosition: { row: 5, col: 4 } },
  { id: 'yangzhou_wu', name: '오군', province: '양주', initialOwnerId: 'sun_quan', baseMoneyIncome: 110, baseFoodIncome: 90, initialDevelopmentLevel: 0, uiPosition: { row: 5, col: 5 } },
  { id: 'yangzhou_kuaiji', name: '회계', province: '양주', initialOwnerId: 'sun_quan', baseMoneyIncome: 100, baseFoodIncome: 85, initialDevelopmentLevel: 0, uiPosition: { row: 6, col: 5 } },
  { id: 'yangzhou_lujiang', name: '여강', province: '양주', baseMoneyIncome: 90, baseFoodIncome: 75, initialDevelopmentLevel: 0, uiPosition: { row: 5, col: 3 } },

  // 형주 (荊州 - Jingzhou)
  { id: 'jingzhou_xiangyang', name: '양양', province: '형주', baseMoneyIncome: 130, baseFoodIncome: 100, initialDevelopmentLevel: 1, uiPosition: { row: 5, col: 2 } },
  { id: 'jingzhou_jiangling', name: '강릉', province: '형주', baseMoneyIncome: 120, baseFoodIncome: 95, initialDevelopmentLevel: 0, uiPosition: { row: 6, col: 2 } },
  { id: 'jingzhou_jiangxia', name: '강하', province: '형주', baseMoneyIncome: 100, baseFoodIncome: 80, initialDevelopmentLevel: 0, uiPosition: { row: 6, col: 3 } },
  { id: 'jingzhou_changsha', name: '장사', province: '형주', baseMoneyIncome: 110, baseFoodIncome: 90, initialDevelopmentLevel: 0, uiPosition: { row: 7, col: 3 } },
  { id: 'jingzhou_lingling', name: '영릉', province: '형주', baseMoneyIncome: 85, baseFoodIncome: 70, initialDevelopmentLevel: 0, uiPosition: { row: 7, col: 2 } },

  // 익주 (益州 - Yizhou)
  { id: 'yizhou_chengdu', name: '성도', province: '익주', baseMoneyIncome: 140, baseFoodIncome: 110, initialDevelopmentLevel: 1, uiPosition: { row: 5, col: 1 } },
  { id: 'yizhou_zitong', name: '자동', province: '익주', baseMoneyIncome: 90, baseFoodIncome: 75, initialDevelopmentLevel: 0, uiPosition: { row: 6, col: 1 } },
  { id: 'yizhou_hanzhong', name: '한중', province: '익주', baseMoneyIncome: 100, baseFoodIncome: 85, initialDevelopmentLevel: 0, uiPosition: { row: 4, col: 0 } }, // Adding one more to reach 31
];

export const DEVELOPMENT_COST = 500; // Cost for general "Develop Region" action
export const MAX_DEVELOPMENT_LEVEL_DEFAULT = 5;
export const VICTORY_REGIONS_COUNT = Math.ceil(REGIONS_DATA.length / 2) +1; 
export const INITIAL_YEAR = 189;
export const LOG_MAX_ENTRIES = 20; 

// Recruitment Constants
export const NEUTRAL_GARRISON_MULTIPLIER = 30; 
export const RECRUIT_COST_PER_TROOP = 1; 
export const RECRUIT_MAX_FOOD_FACTOR = 0.5; // Base factor, can be boosted by Barracks

// Combat Constants
export const COMBAT_DICE_SIDES = 6; 
export const COMBAT_DICE_EFFECT_SCALE = 0.1; 

export const MAX_COMBAT_ROUNDS = 10;
export const MORALE_INITIAL_DEFAULT = 100;
export const MORALE_MINIMUM = 0;
export const MORALE_RETREAT_THRESHOLD = 25; 
export const MORALE_LOSS_FACTOR_PERCENT_TROOPS_LOST_ROUND = 0.3; 
export const MORALE_WIN_ROUND_BONUS = 5;
export const MORALE_LOSE_ROUND_PENALTY = 8; 

// Casualty Ratios per round
export const CASUALTY_RATIO_ROUND_LOSER_BASE = 0.10; 
export const CASUALTY_RATIO_ROUND_WINNER_BASE = 0.03; 
export const CASUALTY_RATIO_STRENGTH_DIFF_IMPACT = 0.15; 
export const MAX_STRENGTH_ADVANTAGE_RATIO_FOR_CASUALTIES = 2.0; 
export const CASUALTY_NEUTRAL_FACTOR = 1.5; 

// AI Constants
export const AI_ATTACK_THRESHOLD_RATIO = 1.3; 
export const AI_RECRUIT_MONEY_MIN_THRESHOLD = 500; 
export const AI_RECRUIT_PERCENTAGE = 0.75; 

// Diplomacy Constants
export const INITIAL_RELATIONS_SCORE = 0;
export const MIN_RELATIONS_SCORE = -100;
export const MAX_RELATIONS_SCORE = 100;

export const GIFT_VALUE_SMALL = 200;
export const GIFT_VALUE_MEDIUM = 500;
export const GIFT_VALUE_LARGE = 1000;
export const GIFT_RELATION_BONUS_SMALL = 5;
export const GIFT_RELATION_BONUS_MEDIUM = 12;
export const GIFT_RELATION_BONUS_LARGE = 25;
export const GIFT_COOLDOWN_TURNS = 3; 

export const DECLARE_WAR_PENALTY = -40;
export const DECLARE_WAR_ON_ALLY_PENALTY = -75; 
export const BREAK_ALLIANCE_PENALTY = -50;
export const FORM_ALLIANCE_BONUS = +30;
export const OFFER_PEACE_BONUS_ON_ACCEPT = +20; 

export const AI_WILLING_TO_ALLY_THRESHOLD = 30; 
export const AI_WILLING_TO_ACCEPT_PEACE_THRESHOLD = -20; 
export const AI_LIKELY_TO_DECLARE_WAR_THRESHOLD = -50; 
export const AI_CONSIDER_ALLIANCE_STRENGTH_RATIO = 0.7; 
export const AI_PEACE_OFFER_WAR_WEARINESS_THRESHOLD = 5;

export const SEQUENTIAL_ROUND_AUTO_ADVANCE_DELAY = 1000;

// Building System Constants
export const MAX_BUILDING_SLOTS_DEFAULT = 3;
export const MAX_BUILDING_LEVEL = 3;

export const BUILDING_DEFINITIONS: {
  [key in BuildingType]: {
    name: string;
    description: string;
    cost: (currentLevel: number) => { money: number; food?: number }; // Cost to build (level 0 to 1) or upgrade (level N to N+1)
    effects: (level: number, region?: Region, owner?: Faction) => { // region and owner might be needed for complex effects
      moneyBonus?: number;
      foodBonus?: number;
      maxRecruitsBonus?: number; 
      recruitCostModifier?: number; 
      defenseBonus?: number; 
      publicOrderChangePerTurn?: number; // Flat PO change per turn if this building exists
    };
    maxLevel?: number;
  }
} = {
  market: {
    name: '시장',
    description: '금 수입을 증가시킵니다.',
    cost: (currentLevel: number) => ({ money: 300 + currentLevel * 250 }),
    effects: (level: number) => ({ moneyBonus: 60 * level }),
    maxLevel: MAX_BUILDING_LEVEL,
  },
  farm: {
    name: '농지',
    description: '식량 수입을 증가시킵니다.',
    cost: (currentLevel: number) => ({ money: 200 + currentLevel * 150, food: 50 + currentLevel * 50 }),
    effects: (level: number) => ({ foodBonus: 50 * level }),
    maxLevel: MAX_BUILDING_LEVEL,
  },
  barracks: {
    name: '병영',
    description: `최대 징병 가능 인원을 늘리고 (+200/레벨), 징병 비용을 감소(2%/레벨)시키며, 공공 질서를 향상(+1/레벨)시킵니다.`,
    cost: (currentLevel: number) => ({ money: 400 + currentLevel * 300 }),
    effects: (level: number) => ({
      maxRecruitsBonus: 200 * level,
      recruitCostModifier: 1 - (0.02 * level),
      publicOrderChangePerTurn: 1 * level,
    }),
    maxLevel: MAX_BUILDING_LEVEL,
  },
  wall: {
    name: '성벽',
    description: `지역 방어 전투 시 수비측 전투력을 강화(5%/레벨)하고, 공공 질서를 향상(+1/레벨)시킵니다.`,
    cost: (currentLevel: number) => ({ money: 500 + currentLevel * 350 }),
    effects: (level: number) => ({
      defenseBonus: 0.05 * level,
      publicOrderChangePerTurn: 1 * level,
    }),
    maxLevel: MAX_BUILDING_LEVEL,
  },
};

// Public Order System Constants
export const PUBLIC_ORDER_DEFAULT = 70;
export const PUBLIC_ORDER_MIN = 0;
export const PUBLIC_ORDER_MAX = 100;
export const PUBLIC_ORDER_CHANGE_PER_TURN_TOWARDS_DEFAULT = 1; // How much it tries to return to default
export const PUBLIC_ORDER_LOW_FOOD_FACTION_PENALTY = -5; // If faction's total food is < 0
export const PUBLIC_ORDER_RECENTLY_CONQUERED_PENALTY = -10;
export const PUBLIC_ORDER_TURNS_CONSIDERED_RECENTLY_CONQUERED = 3;
export const PUBLIC_ORDER_GARRISON_BONUS_MIN_TROOPS_FACTOR = 0.5; // Min troops in region (factor of baseFoodIncome) for PO bonus
export const PUBLIC_ORDER_GARRISON_BONUS = 3;
export const PUBLIC_ORDER_NO_GARRISON_PENALTY = -3; // If troops in region are 0
export const PUBLIC_ORDER_WAR_ADJACENT_PENALTY = -2; // If at war and adjacent to an enemy region

export const PUBLIC_ORDER_REBELLION_THRESHOLD = 25;
export const PUBLIC_ORDER_REBELLION_CHANCE = 0.3; // 30% chance if below threshold
export const PUBLIC_ORDER_REBEL_TROOPS_SPAWN_FACTOR = 0.5; // Factor of region's base food income

export const PUBLIC_ORDER_LOW_INCOME_THRESHOLD = 50; 
export const PUBLIC_ORDER_LOW_INCOME_PENALTY_FACTOR = 0.5; // Income multiplied by this
export const PUBLIC_ORDER_HIGH_INCOME_THRESHOLD = 85;
export const PUBLIC_ORDER_HIGH_INCOME_BONUS_FACTOR = 1.1; // Income multiplied by this

// Advisor Panel Constants
export const ADVISOR_TIPS: string[] = [
  "지역 개발은 장기적인 성장의 밑거름입니다.",
  "강력한 동맹은 때로는 천군만마보다 낫습니다.",
  "병력만으로는 천하를 얻을 수 없습니다. 민심을 얻으십시오.",
  "삼국 시대에는 수많은 영웅호걸이 등장했습니다.",
  "정보는 곧 힘입니다. 주변 정세를 파악하세요.",
  "농지는 식량 생산의 핵심입니다. 꾸준히 관리하세요.",
  "시장은 금 수입을 늘려 경제를 윤택하게 합니다.",
  "병영은 강력한 군대를 육성하는 데 필수적입니다.",
  "성벽은 적의 침입으로부터 영토를 보호합니다.",
  "공공 질서가 높은 지역은 반란 위험이 낮고 수입이 증가합니다.",
  "턴마다 자동 저장이 되니 안심하고 플레이하세요!",
  "외교를 통해 적을 만들 수도, 강력한 아군을 얻을 수도 있습니다.",
  "위임 기능을 활용하여 게임을 자동으로 진행시켜보세요.",
  "모든 건물은 최대 3레벨까지 업그레이드할 수 있습니다.",
  "전쟁 중인 인접 지역은 공공 질서에 부정적인 영향을 줄 수 있습니다."
];

// Historical Events Panel Constants
export const HISTORICAL_EVENTS: string[] = [
  "황건적의 난이 평정된 지 얼마 되지 않아, 천하는 다시 혼란에 빠졌습니다.",
  "각지의 군웅들이 할거하며, 새로운 시대를 예고하고 있습니다.",
  "가뭄이 계속되어 백성들의 삶이 더욱 피폐해지고 있습니다.",
  "유명한 학자가 새로운 사상을 설파하며 제자들을 모으고 있다는 소문입니다.",
  "북방 이민족의 침입이 잦아져 국경 지역이 불안합니다.",
  "새로운 농업 기술이 발견되어 일부 지역에서 식량 생산량이 증가했습니다.",
  "역병이 돌아 많은 사람들이 고통받고 있습니다.",
  "밤하늘에 보기 드문 혜성이 나타나 백성들 사이에 여러 해석이 분분합니다.",
  "강물이 범람하여 몇몇 지역이 수해를 입었습니다.",
  "먼 서역에서 온 상인들이 진귀한 물품을 가져와 시장에 활기가 돕니다."
];
