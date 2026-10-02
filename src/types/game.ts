export type PositionType = 'GK' | 'DEF' | 'MID' | 'ATT';

export type CardTier = 'WEEKLY' | 'ELITE' | 'ICON';

export type PackRarityTier = 'Common' | 'Rare' | 'Epic' | 'Legendary';

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

export type GameId = 'stat_arena' | 'santra' | 'memory_xi' | 'squad_match';

export type FormationType = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2';

export type SantraChestTier = 'Bronze' | 'Silver' | 'Gold' | 'Elite' | 'Legendary';

export interface SantraChestItem {
  id: string;
  tier: SantraChestTier;
  sourceAr: string;
  createdAt: number;
}

export type PackTierId = 'BRONZE' | 'WEEKLY' | 'GOLD' | 'ELITE' | 'ICON';

export interface OwnedPackItem {
  id: string;
  packTier: PackTierId;
  nameAr: string;
  rarity?: PackRarityTier;
  createdAt: number;
}

export interface ActivityLogItem {
  id: string;
  type: 'match' | 'pack' | 'chest' | 'reward' | 'topup' | 'purchase';
  titleAr: string;
  subtitleAr: string;
  coinsDelta: number;
  rankPointsDelta: number;
  timestamp: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  effectsEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'ar' | 'en';
}

export interface SquadSlot {
  index: number;
  position: PositionType;
  label: string;
  x: number;
  y: number;
  player: Player | null;
}

export interface PastWinnerMedal {
  id: string;
  title: string;
  season: string;
  type: 'gold' | 'silver' | 'bronze';
  date: string;
}

// ==================== CHAT MESSAGES & STORE CATEGORIES ====================

export type QuickChatCategory =
  | 'SALAM'
  | 'FUN'
  | 'TAUNT'
  | 'CHALLENGE'
  | 'LATE'
  | 'LUCK'
  | 'GOOD_PLAYER'
  | 'BAD_PLAYER'
  | 'CELEBRATION'
  | 'CONFIDENCE'
  | 'RESPECT'
  | 'REACTION'
  | 'WIN'
  | 'LOSE'
  | 'GOAL'
  | 'START'
  | 'SPECIAL';

export interface QuickChatMessageItem {
  id: string;
  textAr: string;
  category: QuickChatCategory;
  categoryLabelAr: string;
  priceCoins: number;
  rarity: PackRarityTier;
  featured?: boolean;
  enabled: boolean;
  isStarterOwned?: boolean;
}

export type StoreSectionType =
  | 'PACKS'
  | 'CHAT'
  | 'CHAT_EFFECTS'
  | 'PROFILE_ITEMS'
  | 'SPECIAL_ITEMS'
  | 'LIMITED';

export interface StoreProductItem {
  id: string;
  section: StoreSectionType;
  nameAr: string;
  descriptionAr: string;
  priceCoins: number;
  rarity: PackRarityTier;
  packTier?: PackTierId;
  chatMessageId?: string;
  effectStyle?: string;
  badgeTextAr?: string;
  minOvr?: number;
  featured: boolean;
  limited: boolean;
  enabled: boolean;
  hidden: boolean;
}

export type PurchaseRequestStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export interface StorePurchaseRequest {
  id: string;
  userId: string;
  accountId: string;
  username: string;
  productId: string;
  productNameAr: string;
  productSection: StoreSectionType;
  priceCoins: number;
  status: PurchaseRequestStatus;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export interface CoinTransactionRecord {
  id: string;
  userId: string;
  accountId: string;
  username: string;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  reason: string;
  timestamp: number;
}

export interface SecurityLogEntry {
  id: string;
  userId: string;
  accountId?: string;
  email?: string;
  action: string;
  status: 'ALLOWED' | 'DENIED_403' | 'DUPLICATE_BLOCKED' | 'INVALID_REQUEST';
  details: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  accountId?: string; // Unique immutable ID e.g. GX-849271
  email?: string;
  role?: 'OWNER' | 'PLAYER';
  profileCompleted?: boolean;
  username: string;
  avatar: string;
  coins: number;
  bids: number;
  rankPoints: number; // Multiplayer Rooms Only: WIN = +3, DRAW = +1, LOSS = 0
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  statArenaWins: number;
  santraWins: number;
  memoryXiWins: number;
  squadMatchWins?: number;
  bestRank?: number;
  pastMedals?: PastWinnerMedal[];
  unlockedReactions?: string[];
  ownedChatIds?: string[];
  ownedCosmetics?: string[];
  claimedRewards?: string[];
  ownedPacks?: OwnedPackItem[];
  santraChests?: SantraChestItem[];
  recentActivity?: ActivityLogItem[];
  lastSquadTrialAt?: number; // Server-enforced 3-day cooldown for My Squad vs AI
  settings?: AppSettings;
  createdAt: number;
}

export interface GoalixLeagueMatchRecord {
  id: string;
  rewardTransactionId?: string;
  roomCode: string;
  gameId: GameId;
  mode: GameMode;
  hostId: string;
  hostAccountId?: string;
  hostName: string;
  hostSquadOvr: number;
  guestId: string;
  guestAccountId?: string;
  guestName: string;
  guestSquadOvr: number;
  hostGoals: number;
  guestGoals: number;
  winnerId: string | 'draw';
  timestamp: number;
}

export interface GoalixLeagueStandingRow {
  playerId: string;
  accountId: string;
  playerName: string;
  avatar?: string;
  squadOvr: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  lastPlayedAt: number;
}

export interface TopUpPackageItem {
  id: string;
  nameAr: string;
  coinsAmount: number;
  bonusCoins: number;
  bonusPackTier?: PackTierId;
  bonusChestTier?: SantraChestTier;
  priceTextAr: string;
  badgeAr?: string;
  theme: 'bronze' | 'silver' | 'gold' | 'elite' | 'royal';
}

export interface TopUpTransactionRecord {
  id: string;
  targetPlayerId: string;
  targetAccountId: string;
  targetPlayerName: string;
  operation: 'add' | 'set' | 'deduct';
  coinsDelta: number;
  previousBalance: number;
  newBalance: number;
  packageId?: string;
  packageNameAr: string;
  bonusPackTier?: PackTierId;
  bonusChestTier?: SantraChestTier;
  noteAr?: string;
  timestamp: number;
}

export interface PendingGrantItem {
  id: string;
  operation: 'add' | 'set' | 'deduct';
  coinsAmount: number;
  packageNameAr: string;
  bonusPackTier?: PackTierId;
  bonusChestTier?: SantraChestTier;
  noteAr?: string;
  timestamp: number;
}

export interface SyncedPlayerAccount {
  id: string;
  accountId: string;
  email?: string;
  role?: 'OWNER' | 'PLAYER';
  profileCompleted?: boolean;
  username: string;
  avatar?: string;
  coins: number;
  rankPoints: number;
  squadOvr: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  ownedCardsCount: number;
  ownedPacks?: OwnedPackItem[];
  ownedChatIds?: string[];
  ownedCosmetics?: string[];
  lastSquadTrialAt?: number;
  updatedAt: number;
}

export interface MemoryXiGuess {
  input: string;
  matchedPlayer: Player | null;
  isCorrect: boolean;
  timestamp: number;
}

export interface MemoryXiRoundResult {
  roundIndex: number;
  isTieBreak: boolean;
  formation: Player[];
  p1Guesses: MemoryXiGuess[];
  p2Guesses: MemoryXiGuess[];
  p1Score: number;
  p2Score: number;
}

export interface PackDefinition {
  id: CardTier;
  name: string;
  price: number;
  priceBids: number;
  minOvr: number;
  maxOvr: number;
  description: string;
  accentColor: string;
  bgGradient: string;
  featuredPlayers: string[];
}

export type CpuDifficulty = 'Rookie' | 'Pro' | 'Elite' | 'Legend';

export interface RoomChatMessageEvent {
  id: string;
  senderId: string;
  senderName: string;
  messageId: string;
  textAr: string;
  category: QuickChatCategory;
  timestamp: number;
}

export interface RoomParticipant {
  id: string;
  accountId?: string;
  name: string;
  avatar?: string;
  ready: boolean;
  score: number;
  diffSum: number;
  currentAnswer?: number | null;
  currentBoxSelection?: number | null;
  memoryGuesses?: string[];
  memoryScore?: number;
  squad: Player[];
  messagesSentCount: number; // Max 6 per match enforced Server-Side
  lastMessageAt: number; // 15s cooldown enforced Server-Side
  connected: boolean;
}

export type RoomPhase =
  | 'WAITING'
  | 'PLAYER_2_JOINED'
  | 'SELECTING_SETTINGS'
  | 'READY'
  | 'QUESTION_ACTIVE'
  | 'ANSWER_REVEAL'
  | 'MYSTERY_SELECTION'
  | 'MYSTERY_REVEAL'
  | 'MEMORY_FORMATION_VIEW'
  | 'MEMORY_ANSWERING'
  | 'MEMORY_ROUND_RESULT'
  | 'LINEUPS'
  | 'SQUAD_COMPARISON'
  | 'SIMULATION'
  | 'RESULT'
  | 'MATCH_FINISHED'
  | 'COMPLETED';

export type RoomVisibilityType = 'PUBLIC' | 'PRIVATE';
export type RoomTimerDuration = 15 | 30 | 45 | 60;

export interface OnlineRoomState {
  code: string;
  hostId: string;
  gameId: GameId;
  mode: GameMode;
  roomType: RoomVisibilityType;
  timerSeconds: RoomTimerDuration;
  chatEnabled: boolean;
  roundDeadlineAt?: number; // Server-side timer deadline timestamp
  phase: RoomPhase;
  currentRoundIndex: number;
  totalRounds: number;
  positionOrder: PositionType[];
  participants: {
    host: RoomParticipant;
    guest?: RoomParticipant;
  };
  chatMessages: RoomChatMessageEvent[];
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
    score: string;
  };
  simulationResult?: {
    matchId: string;
    rewardTransactionId: string;
    hostGoals: number;
    guestGoals: number;
    winnerId: string | 'draw';
    hostCoinsAwarded: number;
    guestCoinsAwarded: number;
    hostRpDelta: number;
    guestRpDelta: number;
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
  attacksP1?: number;
  attacksP2?: number;
  chancesP1?: number;
  chancesP2?: number;
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
  yellowCardsP1?: number;
  yellowCardsP2?: number;
  redCardsP1?: number;
  redCardsP2?: number;
}
