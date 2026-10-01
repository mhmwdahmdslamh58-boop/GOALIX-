export type PositionType = 'GK' | 'DEF' | 'MID' | 'ATT';

export type CardTier = 'WEEKLY' | 'ELITE' | 'ICON';

export interface PlayerStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  club: string;
  position: PositionType;
  detailedPosition?: string;
  ovr: number;
  cardType: CardTier;
  stats: PlayerStats;
  season: string;
  league: string;
  image: string;
  clubLogo?: string;
  flag?: string;
}

export type StatCategory = 
  | 'Goals'
  | 'Assists'
  | 'Appearances'
  | 'Clean sheets'
  | 'Trophies'
  | 'International appearances'
  | 'Transfer fees'
  | 'Age'
  | 'World Cup'
  | 'Champions League'
  | 'League statistics'
  | 'National team statistics'
  | 'Goalkeeper statistics'
  | 'Defender statistics'
  | 'Records';

export interface StatQuestion {
  id: string;
  question: string;
  correctAnswer: number;
  player: string;
  playerId?: string;
  season: string;
  statisticType: string;
  category: StatCategory;
  difficulty: 'Rookie' | 'Pro' | 'Elite' | 'Legend';
  source: string;
  position: PositionType;
  hint?: string;
  playerImage?: string;
}

export type GameMode = 'quick_five' | 'full_eleven';

export type GameId = 'stat_arena' | 'santra' | 'memory_xi';

export type FormationType = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2';

export interface SquadSlot {
  index: number;
  position: PositionType;
  label: string;
  x: number; // percentage on pitch (0-100)
  y: number; // percentage on pitch (0-100)
  player: Player | null;
}

export interface PastWinnerMedal {
  id: string;
  title: string;
  season: string;
  type: 'gold' | 'silver' | 'bronze';
  date: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  coins: number;
  bids: number; // Currency specifically for Store Packs
  matchesPlayed: number;
  matchesWon: number;
  statArenaWins: number;
  santraWins: number;
  memoryXiWins: number;
  bestRank?: number;
  pastMedals?: PastWinnerMedal[];
  unlockedReactions?: string[];
  createdAt: number;
}

export interface MemoryXiGuess {
  input: string;
  matchedPlayer: Player | null;
  isCorrect: boolean;
  timestamp: number;
}

export interface MemoryXiRoundResult {
  roundIndex: number; // 0, 1, 2, or 3+ for tie-break
  isTieBreak: boolean;
  formation: Player[]; // 11 unique players (1 GK, 4 DEF, 3 MID, 3 ATT)
  p1Guesses: MemoryXiGuess[];
  p2Guesses: MemoryXiGuess[];
  p1Score: number;
  p2Score: number;
}

export interface PackDefinition {
  id: CardTier;
  name: string;
  price: number;
  priceBids: number; // Price in Bids
  minOvr: number;
  maxOvr: number;
  description: string;
  accentColor: string;
  bgGradient: string;
  featuredPlayers: string[];
}

export type CpuDifficulty = 'Rookie' | 'Pro' | 'Elite' | 'Legend';

export interface RoomParticipant {
  id: string;
  name: string;
  ready: boolean;
  score: number;
  diffSum: number;
  currentAnswer?: number | null;
  currentBoxSelection?: number | null;
  memoryGuesses?: string[];
  memoryScore?: number;
  squad: Player[];
  connected: boolean;
}

export type RoomPhase = 
  | 'WAITING'
  | 'SELECTING_SETTINGS'
  | 'READY'
  | 'QUESTION_ACTIVE'
  | 'ANSWER_REVEAL'
  | 'MYSTERY_SELECTION'
  | 'MYSTERY_REVEAL'
  | 'MEMORY_FORMATION_VIEW'
  | 'MEMORY_ANSWERING'
  | 'MEMORY_ROUND_RESULT'
  | 'SQUAD_COMPARISON'
  | 'SIMULATION'
  | 'MATCH_FINISHED';

export interface OnlineRoomState {
  code: string;
  hostId: string;
  gameId: GameId;
  mode: GameMode;
  phase: RoomPhase;
  currentRoundIndex: number;
  totalRounds: number;
  positionOrder: PositionType[];
  participants: {
    host: RoomParticipant;
    guest?: RoomParticipant;
  };
  currentQuestion?: StatQuestion;
  currentRoundClubs?: string[];
  memoryFormation?: Player[];
  memoryFormationExpiresAt?: number;
  memoryRoundHistory?: { roundIndex: number; hostScore: number; guestScore: number }[];
  isTieBreak?: boolean;
  lastRoundWinner?: 'host' | 'guest' | 'tie' | null;
  lastRoundLoserReward?: {
    recipientId: string;
    player: Player;
  } | null;
  matchAdvantage?: {
    leaderId: string;
    score: string; // e.g. "1-0"
  };
  simulationResult?: {
    hostGoals: number;
    guestGoals: number;
    winnerId: string | 'draw';
  };
  updatedAt: number;
}

export interface MatchSimEvent {
  minute: number;
  type: 
    | 'goal' 
    | 'save' 
    | 'shot' 
    | 'tackle' 
    | 'pass' 
    | 'foul' 
    | 'yellow_card' 
    | 'red_card' 
    | 'corner' 
    | 'free_kick' 
    | 'offside' 
    | 'penalty' 
    | 'var' 
    | 'substitution' 
    | 'injury';
  team: 'p1' | 'p2';
  descriptionAr: string;
  playerName?: string;
  playerImage?: string;
  assisterName?: string;
  chainSteps?: string[];
  ballCoords?: { x: number; y: number };
}

export interface MatchSimStats {
  possessionP1: number;
  possessionP2: number;
  shotsP1: number;
  shotsP2: number;
  shotsOnTargetP1: number;
  shotsOnTargetP2: number;
  savesP1: number;
  savesP2: number;
  cornersP1: number;
  cornersP2: number;
  foulsP1: number;
  foulsP2: number;
}
