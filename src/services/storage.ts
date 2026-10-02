import { 
  Player, 
  UserProfile, 
  FormationType, 
  GameId, 
  PastWinnerMedal, 
  SantraChestTier, 
  SantraChestItem, 
  PackTierId, 
  OwnedPackItem, 
  ActivityLogItem,
  AppSettings,
  PendingGrantItem
} from '../types/game';
import { INITIAL_PLAYERS, getAllPlayers, generateSantraChestReward, SantraChestRewardResult } from '../data/players';
import { sounds } from './audio';

const PROFILE_KEY = 'goalix_user_profile_v1';
const SQUAD_KEY = 'goalix_squad_v1';
const FORMATION_KEY = 'goalix_formation_v1';
const COLLECTION_KEY = 'goalix_collection_v1';
const COMPLETED_MATCHES_KEY = 'goalix_completed_matches_v1';
const APPLIED_GRANTS_KEY = 'goalix_applied_grants_v1';

function deriveNumericAccountId(seedId: string): string {
  let hash = 0;
  for (let i = 0; i < seedId.length; i++) {
    hash = (hash * 31 + seedId.charCodeAt(i)) >>> 0;
  }
  const sixDigits = (100000 + (hash % 900000)).toString();
  return `GX-${sixDigits}`;
}

export const OWNER_EMAIL = 'm7hmoud654654@gmail.com';

export function isOwnerAccount(profile?: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.role === 'OWNER') return true;
  if (profile.email && profile.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return true;
  }
  return false;
}

export async function copyAccountIdToClipboard(accountId: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(accountId);
      return true;
    }
  } catch {
    // Fallback below for mobile webviews / iframes
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = accountId;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}

export function logoutCurrentGoalixAccount(): UserProfile {
  const current = getOrCreateUserProfile();
  const updated: UserProfile = {
    ...current,
    email: undefined,
    role: 'PLAYER',
    profileCompleted: false,
  };
  saveUserProfile(updated);
  return updated;
}

export function getFormattedAccountId(profile: UserProfile): string {
  if (profile.accountId) {
    if (profile.accountId.startsWith('GX-')) return profile.accountId;
    if (profile.accountId.startsWith('GLX-')) return profile.accountId.replace('GLX-', 'GX-');
  }
  return deriveNumericAccountId(profile.id || 'goalix');
}

export interface RankTierInfo {
  titleEn: string;
  titleAr: string;
  minPoints: number;
  nextPoints: number;
  color: string;
  badgeIcon: string;
}

export function getRankTierInfo(rankPoints: number): RankTierInfo {
  const pts = Math.max(0, rankPoints || 0);
  if (pts >= 75) {
    return { titleEn: 'GOALIX LEGEND', titleAr: 'أسطورة GOALIX', minPoints: 75, nextPoints: 150, color: 'text-yellow-300', badgeIcon: '👑' };
  }
  if (pts >= 45) {
    return { titleEn: 'ELITE MASTER', titleAr: 'نخبة المحترفين', minPoints: 45, nextPoints: 75, color: 'text-amber-400', badgeIcon: '💎' };
  }
  if (pts >= 25) {
    return { titleEn: 'GOLD CAPTAIN', titleAr: 'القائد الذهبي', minPoints: 25, nextPoints: 45, color: 'text-amber-300', badgeIcon: '🏆' };
  }
  if (pts >= 12) {
    return { titleEn: 'SILVER PRO', titleAr: 'محترف فضي', minPoints: 12, nextPoints: 25, color: 'text-zinc-200', badgeIcon: '🛡️' };
  }
  if (pts >= 5) {
    return { titleEn: 'BRONZE I', titleAr: 'برونزي I', minPoints: 5, nextPoints: 12, color: 'text-amber-600', badgeIcon: '⚔️' };
  }
  return { titleEn: 'BRONZE III', titleAr: 'برونزي III', minPoints: 0, nextPoints: 5, color: 'text-amber-700', badgeIcon: '⚽' };
}

export function getOrCreateUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      let updated = false;

      if (!parsed.accountId || (!parsed.accountId.startsWith('GX-') && !parsed.accountId.startsWith('GLX-'))) {
        parsed.accountId = deriveNumericAccountId(parsed.id || `usr_${Date.now()}`);
        updated = true;
      } else if (parsed.accountId.startsWith('GLX-')) {
        parsed.accountId = parsed.accountId.replace('GLX-', 'GX-');
        updated = true;
      }
      if (typeof parsed.coins !== 'number' || isNaN(parsed.coins) || parsed.coins < 0) {
        parsed.coins = Math.max(0, parsed.coins || 0);
        updated = true;
      }
      if (typeof parsed.bids !== 'number') {
        parsed.bids = 15;
        updated = true;
      }
      if (typeof parsed.rankPoints !== 'number') {
        parsed.rankPoints = (parsed.matchesWon || 0) * 3;
        updated = true;
      }
      if (typeof parsed.matchesDrawn !== 'number') {
        parsed.matchesDrawn = 0;
        updated = true;
      }
      if (typeof parsed.matchesLost !== 'number') {
        parsed.matchesLost = Math.max(0, (parsed.matchesPlayed || 0) - (parsed.matchesWon || 0) - (parsed.matchesDrawn || 0));
        updated = true;
      }
      if (typeof parsed.memoryXiWins !== 'number') {
        parsed.memoryXiWins = 0;
        updated = true;
      }
      if (typeof parsed.squadMatchWins !== 'number') {
        parsed.squadMatchWins = 0;
        updated = true;
      }
      if (!parsed.avatar || parsed.avatar.includes('images.unsplash.com')) {
        parsed.avatar = '/players/icon_zidane.jpg';
        updated = true;
      }
      if (!parsed.pastMedals) {
        parsed.pastMedals = [
          { id: 'm_season0', title: 'درع أساطير الإطلاق', season: 'الموسم 1', type: 'gold', date: '2026-09-01' }
        ];
        updated = true;
      }
      if (!parsed.unlockedReactions) {
        parsed.unlockedReactions = ['🔥', '👏', '⚽', '👑', '⚡'];
        updated = true;
      }
      if (!Array.isArray(parsed.claimedRewards)) {
        parsed.claimedRewards = [];
        updated = true;
      }
      if (!Array.isArray(parsed.ownedPacks)) {
        parsed.ownedPacks = [];
        updated = true;
      }
      if (!Array.isArray(parsed.santraChests)) {
        parsed.santraChests = [
          {
            id: 'starter_chest_gold',
            tier: 'Gold',
            sourceAr: 'هدية انطلاق منصة سانترا',
            createdAt: Date.now()
          }
        ];
        updated = true;
      }
      if (!Array.isArray(parsed.recentActivity)) {
        parsed.recentActivity = [
          {
            id: 'act_welcome',
            type: 'reward',
            titleAr: 'انطلاق مسيرتك في GOALIX',
            subtitleAr: 'حصلت على الرصيد الافتتاحي وصندوق سانترا الذهبي',
            coinsDelta: 150,
            rankPointsDelta: 0,
            timestamp: Date.now()
          }
        ];
        updated = true;
      }
      if (!parsed.settings) {
        parsed.settings = {
          soundEnabled: true,
          musicEnabled: false,
          effectsEnabled: true,
          notificationsEnabled: true,
          language: 'ar'
        };
        updated = true;
      }

      if (updated) {
        saveUserProfile(parsed);
      }
      return parsed;
    }
  } catch {
    // Ignore error
  }

  const generatedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const defaultProfile: UserProfile = {
    id: generatedId,
    accountId: deriveNumericAccountId(generatedId),
    username: 'كابتن جواليكس',
    avatar: '/players/icon_zidane.jpg',
    coins: 150, // Starting grant of 150 Coins
    bids: 15,
    rankPoints: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesDrawn: 0,
    matchesLost: 0,
    statArenaWins: 0,
    santraWins: 0,
    memoryXiWins: 0,
    squadMatchWins: 0,
    bestRank: 11,
    pastMedals: [
      { id: 'm_season0', title: 'درع أساطير الإطلاق', season: 'الموسم 1', type: 'gold', date: '2026-09-01' }
    ],
    unlockedReactions: ['🔥', '👏', '⚽', '👑', '⚡'],
    claimedRewards: [],
    ownedPacks: [],
    santraChests: [
      {
        id: 'starter_chest_gold',
        tier: 'Gold',
        sourceAr: 'هدية انطلاق منصة سانترا',
        createdAt: Date.now()
      },
      {
        id: 'starter_chest_bronze',
        tier: 'Bronze',
        sourceAr: 'صندوق تدريب سانترا',
        createdAt: Date.now()
      }
    ],
    recentActivity: [
      {
        id: 'act_welcome',
        type: 'reward',
        titleAr: 'انطلاق مسيرتك في GOALIX',
        subtitleAr: 'تم استلام 150 كوينز وصندوقي سانترا 3D',
        coinsDelta: 150,
        rankPointsDelta: 0,
        timestamp: Date.now()
      }
    ],
    settings: {
      soundEnabled: true,
      musicEnabled: false,
      effectsEnabled: true,
      notificationsEnabled: true,
      language: 'ar'
    },
    createdAt: Date.now()
  };

  saveUserProfile(defaultProfile);
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    profile.coins = Math.max(0, Math.round(profile.coins || 0));
    profile.rankPoints = Math.max(0, Math.round(profile.rankPoints || 0));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage error
  }
}

export function appendActivity(
  profile: UserProfile,
  item: Omit<ActivityLogItem, 'id' | 'timestamp'>
): void {
  const entry: ActivityLogItem = {
    ...item,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now()
  };
  profile.recentActivity = [entry, ...(profile.recentActivity || [])].slice(0, 30);
}

export function addCoinsToUser(amount: number, reasonAr?: string): UserProfile {
  const profile = getOrCreateUserProfile();
  profile.coins = Math.max(0, profile.coins + amount);
  if (reasonAr && amount !== 0) {
    appendActivity(profile, {
      type: 'reward',
      titleAr: reasonAr,
      subtitleAr: `تحديث رصيد الكوينز (${amount > 0 ? `+${amount}` : amount})`,
      coinsDelta: amount,
      rankPointsDelta: 0
    });
  }
  saveUserProfile(profile);
  return profile;
}

export function deductCoinsFromUser(amount: number): boolean {
  if (amount <= 0) return true;
  const profile = getOrCreateUserProfile();
  if (profile.coins < amount) return false;
  profile.coins = Math.max(0, profile.coins - amount);
  saveUserProfile(profile);
  return true;
}

// ================= BIDS CURRENCY SYSTEM =================
export function addBidsToUser(amount: number): UserProfile {
  const profile = getOrCreateUserProfile();
  profile.bids = Math.max(0, (profile.bids || 0) + amount);
  saveUserProfile(profile);
  return profile;
}

export function deductBidsFromUser(amount: number): boolean {
  const profile = getOrCreateUserProfile();
  const currentBids = profile.bids || 0;
  if (currentBids < amount) return false;
  profile.bids = currentBids - amount;
  saveUserProfile(profile);
  return true;
}

export function exchangeCoinsForBids(coinsToSpend: number): { success: boolean; bidsGained: number; error?: string } {
  if (coinsToSpend < 10) {
    return { success: false, bidsGained: 0, error: 'الحد الأدنى للتحويل هو 10 كوينز' };
  }
  const bidsGained = Math.floor(coinsToSpend / 10);
  const actualCoinsDeducted = bidsGained * 10;

  const profile = getOrCreateUserProfile();
  if (profile.coins < actualCoinsDeducted) {
    return { success: false, bidsGained: 0, error: 'رصيد الكوينز غير كافٍ' };
  }

  profile.coins -= actualCoinsDeducted;
  profile.bids = (profile.bids || 0) + bidsGained;
  saveUserProfile(profile);

  return { success: true, bidsGained };
}

// ================= MATCH RESULT, COINS & RANK POINTS SYSTEM =================
export interface RecordMatchParams {
  matchId: string;
  gameId: GameId;
  isOnline: boolean;
  isSquadTrial3Day?: boolean;
  outcome: 'win' | 'loss' | 'draw';
  customCoinsReward?: number;
  awardSantraChest?: SantraChestTier;
}

/**
 * Authoritative Match Outcome & Rank Points Rule:
 * Rank Points:
 * - Multiplayer Rooms (isOnline === true): WIN = +3 RP, DRAW = +1 RP, LOSS = 0 RP
 * - AI / Practice / Trial (isOnline === false): 0 RP (never affects Multiplayer Ranking)
 *
 * Coins:
 * - AI Match (isOnline === false && !isSquadTrial3Day): Max 5 Coins on Win, 2 on Draw, 0 on Loss
 * - 3-Day My Squad Trial (isSquadTrial3Day === true): 20 Coins on Win, 5 on Draw, 0 on Loss
 * - Multiplayer Room (isOnline === true): 25 Coins on Win, 10 on Draw, 5 on Loss
 * - Deduplicated by matchId so double clicks or refresh never award twice!
 */
export function recordMatchOutcome(params: RecordMatchParams): {
  coinsChanged: number;
  rankPointsChanged: number;
  chestAwarded?: SantraChestItem;
  updatedProfile: UserProfile;
} {
  const { matchId, gameId, isOnline, isSquadTrial3Day, outcome, customCoinsReward, awardSantraChest } = params;
  const profile = getOrCreateUserProfile();

  // Deduplication check
  let completedSet: string[] = [];
  try {
    const raw = localStorage.getItem(COMPLETED_MATCHES_KEY);
    if (raw) completedSet = JSON.parse(raw);
  } catch {}

  if (completedSet.includes(matchId)) {
    return { coinsChanged: 0, rankPointsChanged: 0, updatedProfile: profile };
  }

  // Strict Rank Points rule: Only Multiplayer Rooms (isOnline === true) award Rank Points!
  const rankPointsDelta = isOnline ? (outcome === 'win' ? 3 : outcome === 'draw' ? 1 : 0) : 0;

  let coinsDelta = 0;
  if (isOnline) {
    if (typeof customCoinsReward === 'number') {
      coinsDelta = Math.max(0, customCoinsReward);
    } else {
      coinsDelta = outcome === 'win' ? 25 : outcome === 'draw' ? 10 : 5;
    }
  } else if (isSquadTrial3Day) {
    coinsDelta = outcome === 'win' ? 20 : outcome === 'draw' ? 5 : 0;
    profile.lastSquadTrialAt = Date.now();
  } else {
    // AI Match: Maximum Reward = 5 Coins
    const rawAiReward =
      typeof customCoinsReward === 'number'
        ? customCoinsReward
        : outcome === 'win'
        ? 5
        : outcome === 'draw'
        ? 2
        : 0;
    coinsDelta = Math.min(5, Math.max(0, rawAiReward));
  }

  if (isOnline) {
    profile.matchesPlayed = (profile.matchesPlayed || 0) + 1;
    if (outcome === 'win') {
      profile.matchesWon = (profile.matchesWon || 0) + 1;
      if (gameId === 'stat_arena') profile.statArenaWins = (profile.statArenaWins || 0) + 1;
      if (gameId === 'santra') profile.santraWins = (profile.santraWins || 0) + 1;
      if (gameId === 'memory_xi') profile.memoryXiWins = (profile.memoryXiWins || 0) + 1;
      if (gameId === 'squad_match') profile.squadMatchWins = (profile.squadMatchWins || 0) + 1;
    } else if (outcome === 'draw') {
      profile.matchesDrawn = (profile.matchesDrawn || 0) + 1;
    } else {
      profile.matchesLost = (profile.matchesLost || 0) + 1;
    }
  }

  profile.coins = Math.max(0, profile.coins + coinsDelta);
  profile.rankPoints = Math.max(0, (profile.rankPoints || 0) + rankPointsDelta);

  // Award Santra Chest if applicable
  let chestAwarded: SantraChestItem | undefined;
  if (awardSantraChest) {
    chestAwarded = {
      id: `chest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tier: awardSantraChest,
      sourceAr: gameId === 'santra' ? 'مكافأة مباراة سانترا' : 'مكافأة الفوز بالمباراة',
      createdAt: Date.now()
    };
    profile.santraChests = [chestAwarded, ...(profile.santraChests || [])];
  }

  const gameNameMap: Record<GameId, string> = {
    stat_arena: 'STAT ARENA',
    santra: 'SANTRA',
    memory_xi: 'MEMORY XI',
    squad_match: 'محاكاة التشكيلة التكتيكية'
  };

  const outcomeAr = outcome === 'win' ? 'فوز بالمباراة 🏆' : outcome === 'draw' ? 'تعادل بالمباراة 🤝' : 'نهاية المباراة ⚽';

  appendActivity(profile, {
    type: 'match',
    titleAr: `${outcomeAr} في ${gameNameMap[gameId]}`,
    subtitleAr: `النقاط: +${rankPointsDelta} RP · الكوينز: ${coinsDelta >= 0 ? `+${coinsDelta}` : coinsDelta}`,
    coinsDelta,
    rankPointsDelta
  });

  saveUserProfile(profile);

  completedSet.push(matchId);
  try {
    localStorage.setItem(COMPLETED_MATCHES_KEY, JSON.stringify(completedSet.slice(-150)));
  } catch {}

  return { coinsChanged: coinsDelta, rankPointsChanged: rankPointsDelta, chestAwarded, updatedProfile: profile };
}

// ================= SANTRA 3D CHESTS SYSTEM =================
export function addSantraChestToUser(tier: SantraChestTier, sourceAr: string): { chest: SantraChestItem; updatedProfile: UserProfile } {
  const profile = getOrCreateUserProfile();
  const chest: SantraChestItem = {
    id: `chest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tier,
    sourceAr,
    createdAt: Date.now()
  };
  profile.santraChests = [chest, ...(profile.santraChests || [])];
  saveUserProfile(profile);
  return { chest, updatedProfile: profile };
}

export function buySantraChestWithCoins(tier: SantraChestTier, priceCoins: number): {
  success: boolean;
  error?: string;
  chest?: SantraChestItem;
  updatedProfile: UserProfile;
} {
  const profile = getOrCreateUserProfile();
  if (profile.coins < priceCoins) {
    return {
      success: false,
      error: `رصيدك الحالي (${profile.coins} كوينز) غير كافٍ لشراء صندوق ${tier} (${priceCoins} كوينز).`,
      updatedProfile: profile
    };
  }
  profile.coins = Math.max(0, profile.coins - priceCoins);
  const chest: SantraChestItem = {
    id: `chest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tier,
    sourceAr: `شراء من خزينة صناديق سانترا 3D`,
    createdAt: Date.now()
  };
  profile.santraChests = [chest, ...(profile.santraChests || [])];
  appendActivity(profile, {
    type: 'chest',
    titleAr: `شراء صندوق سانترا 3D (${tier})`,
    subtitleAr: `تم خصم ${priceCoins} كوينز وإضافة الصندوق للخزينة`,
    coinsDelta: -priceCoins,
    rankPointsDelta: 0
  });
  saveUserProfile(profile);
  return { success: true, chest, updatedProfile: profile };
}

export function openAndClaimSantraChest(chestId: string): {
  success: boolean;
  error?: string;
  reward?: SantraChestRewardResult;
  updatedProfile: UserProfile;
} {
  const profile = getOrCreateUserProfile();
  const chests = profile.santraChests || [];
  const targetIdx = chests.findIndex(c => c.id === chestId);
  if (targetIdx === -1) {
    return {
      success: false,
      error: 'هذا الصندوق تم فتحه واستلامه مسبقاً!',
      updatedProfile: profile
    };
  }

  const chest = chests[targetIdx];
  const reward = generateSantraChestReward(chest.tier);

  // Remove chest from inventory so it can never be claimed twice
  profile.santraChests = chests.filter(c => c.id !== chestId);
  // Add coins and player
  profile.coins = Math.max(0, profile.coins + reward.coinsAwarded);
  addPlayerToCollection(reward.playerAwarded);

  appendActivity(profile, {
    type: 'chest',
    titleAr: `فتح صندوق سانترا 3D (${chest.tier})`,
    subtitleAr: `حصلت على ${reward.playerAwarded.name} (${reward.playerAwarded.ovr} OVR) + ${reward.coinsAwarded} كوينز`,
    coinsDelta: reward.coinsAwarded,
    rankPointsDelta: 0
  });

  saveUserProfile(profile);
  return { success: true, reward, updatedProfile: profile };
}

// ================= PACKS PURCHASE & INVENTORY SYSTEM =================
export function purchasePackWithCoins(
  packTier: PackTierId,
  nameAr: string,
  priceCoins: number,
  saveForLater: boolean = false
): {
  success: boolean;
  error?: string;
  ownedPack?: OwnedPackItem;
  updatedProfile: UserProfile;
} {
  const profile = getOrCreateUserProfile();
  if (priceCoins < 0 || profile.coins < priceCoins) {
    return {
      success: false,
      error: `عذراً، رصيدك الحالي (${profile.coins} كوينز) لا يكفي لشراء ${nameAr} (${priceCoins} كوينز).`,
      updatedProfile: profile
    };
  }

  profile.coins = Math.max(0, profile.coins - priceCoins);

  let ownedPack: OwnedPackItem | undefined;
  if (saveForLater) {
    ownedPack = {
      id: `pack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      packTier,
      nameAr,
      createdAt: Date.now()
    };
    profile.ownedPacks = [ownedPack, ...(profile.ownedPacks || [])];
  }

  appendActivity(profile, {
    type: 'pack',
    titleAr: saveForLater ? `شراء وحفظ ${nameAr}` : `شراء وفتح ${nameAr}`,
    subtitleAr: `تم خصم ${priceCoins} كوينز بنجاح`,
    coinsDelta: -priceCoins,
    rankPointsDelta: 0
  });

  saveUserProfile(profile);
  return { success: true, ownedPack, updatedProfile: profile };
}

export function consumeSavedPack(packId: string): {
  success: boolean;
  pack?: OwnedPackItem;
  updatedProfile: UserProfile;
} {
  const profile = getOrCreateUserProfile();
  const list = profile.ownedPacks || [];
  const found = list.find(p => p.id === packId);
  if (!found) {
    return { success: false, updatedProfile: profile };
  }
  profile.ownedPacks = list.filter(p => p.id !== packId);
  saveUserProfile(profile);
  return { success: true, pack: found, updatedProfile: profile };
}

// ================= CLAIMABLE REWARDS & MILESTONES SYSTEM =================
export interface GoalixRewardDefinition {
  id: string;
  titleAr: string;
  descriptionAr: string;
  coinsReward: number;
  chestReward?: SantraChestTier;
  packReward?: PackTierId;
  checkEligible: (profile: UserProfile, collectionCount: number) => boolean;
  getProgressText: (profile: UserProfile, collectionCount: number) => string;
}

export const REWARDS_CATALOG: GoalixRewardDefinition[] = [
  {
    id: 'rw_daily_kickoff',
    titleAr: 'مكافأة الدخول اليومي',
    descriptionAr: 'استلم منحة الكوينز اليومية وصندوق سانترا برونزي مجاناً',
    coinsReward: 50,
    chestReward: 'Bronze',
    checkEligible: () => true,
    getProgressText: () => 'جاهزة للاستلام الآن'
  },
  {
    id: 'rw_first_match',
    titleAr: 'خوض أول مباراة تنافسية',
    descriptionAr: 'العب مباراة واحدة على الأقل في أي لعبة داخل GOALIX',
    coinsReward: 60,
    chestReward: 'Silver',
    checkEligible: (p) => (p.matchesPlayed || 0) >= 1,
    getProgressText: (p) => `${Math.min(1, p.matchesPlayed || 0)} / 1 مباراة`
  },
  {
    id: 'rw_first_victory',
    titleAr: 'الانتصار الأول',
    descriptionAr: 'حقق فوزك الأول في أي طور لعب واكسب 100 كوينز وصندوق ذهبي',
    coinsReward: 100,
    chestReward: 'Gold',
    checkEligible: (p) => (p.matchesWon || 0) >= 1,
    getProgressText: (p) => `${Math.min(1, p.matchesWon || 0)} / 1 فوز`
  },
  {
    id: 'rw_santra_master',
    titleAr: 'خبير درافت سانترا',
    descriptionAr: 'حقق الفوز في لعبة SANTRA واحصل على صندوق نخبة 3D',
    coinsReward: 120,
    chestReward: 'Elite',
    checkEligible: (p) => (p.santraWins || 0) >= 1,
    getProgressText: (p) => `${Math.min(1, p.santraWins || 0)} / 1 فوز في سانترا`
  },
  {
    id: 'rw_collector_14',
    titleAr: 'جامع النجوم (14 لاعباً)',
    descriptionAr: 'اجمع 14 لاعباً أو أكثر في مجموعتك الكروية',
    coinsReward: 90,
    packReward: 'WEEKLY',
    checkEligible: (_p, colCount) => colCount >= 14,
    getProgressText: (_p, colCount) => `${Math.min(14, colCount)} / 14 لاعباً`
  },
  {
    id: 'rw_rank_points_9',
    titleAr: 'الوصول إلى 9 نقاط تصنيف (Rank Points)',
    descriptionAr: 'اجمع 9 نقاط تصنيف من الفوز أو التعادل في المباريات',
    coinsReward: 150,
    chestReward: 'Legendary',
    checkEligible: (p) => (p.rankPoints || 0) >= 9,
    getProgressText: (p) => `${Math.min(9, p.rankPoints || 0)} / 9 Rank Points`
  }
];

export function getRewardProgress(
  profile: UserProfile,
  reward: GoalixRewardDefinition
): { unlocked: boolean; claimed: boolean; current: number; target: number; progressText: string } {
  const collectionCount = getUserCollection().length;
  const unlocked = reward.checkEligible(profile, collectionCount);
  const claimed = (profile.claimedRewards || []).includes(reward.id);
  const progressText = reward.getProgressText(profile, collectionCount);

  let current = unlocked ? 1 : 0;
  let target = 1;
  if (reward.id === 'rw_collector_14') {
    current = Math.min(14, collectionCount);
    target = 14;
  } else if (reward.id === 'rw_rank_points_9') {
    current = Math.min(9, profile.rankPoints || 0);
    target = 9;
  } else if (reward.id === 'rw_first_match') {
    current = Math.min(1, profile.matchesPlayed || 0);
    target = 1;
  } else if (reward.id === 'rw_first_victory') {
    current = Math.min(1, profile.matchesWon || 0);
    target = 1;
  } else if (reward.id === 'rw_santra_master') {
    current = Math.min(1, profile.santraWins || 0);
    target = 1;
  }

  return { unlocked, claimed, current, target, progressText };
}

export const getUserProfile = getOrCreateUserProfile;
export const addCoins = addCoinsToUser;
export const deductCoins = deductCoinsFromUser;
export const addSantraChest = addSantraChestToUser;

export function claimUserReward(rewardId: string): {
  success: boolean;
  error?: string;
  updatedProfile: UserProfile;
} {
  const profile = getOrCreateUserProfile();
  const collection = getUserCollection();
  const rewardDef = REWARDS_CATALOG.find(r => r.id === rewardId);

  if (!rewardDef) {
    return { success: false, error: 'المكافأة غير موجودة', updatedProfile: profile };
  }

  const claimed = profile.claimedRewards || [];
  if (claimed.includes(rewardId)) {
    return { success: false, error: 'تم استلام هذه المكافأة مسبقاً!', updatedProfile: profile };
  }

  if (!rewardDef.checkEligible(profile, collection.length)) {
    return { success: false, error: 'لم تستوفِ شروط استلام هذه المكافأة بعد', updatedProfile: profile };
  }

  // Mark claimed first
  profile.claimedRewards = [...claimed, rewardId];
  profile.coins = Math.max(0, profile.coins + rewardDef.coinsReward);

  if (rewardDef.chestReward) {
    const newChest: SantraChestItem = {
      id: `chest_rw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tier: rewardDef.chestReward,
      sourceAr: rewardDef.titleAr,
      createdAt: Date.now()
    };
    profile.santraChests = [newChest, ...(profile.santraChests || [])];
  }

  if (rewardDef.packReward) {
    const newPack: OwnedPackItem = {
      id: `pack_rw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      packTier: rewardDef.packReward,
      nameAr: `حزمة مكافأة (${rewardDef.packReward})`,
      createdAt: Date.now()
    };
    profile.ownedPacks = [newPack, ...(profile.ownedPacks || [])];
  }

  appendActivity(profile, {
    type: 'reward',
    titleAr: `استلام مكافأة: ${rewardDef.titleAr}`,
    subtitleAr: `+${rewardDef.coinsReward} كوينز${rewardDef.chestReward ? ` + صندوق ${rewardDef.chestReward}` : ''}`,
    coinsDelta: rewardDef.coinsReward,
    rankPointsDelta: 0
  });

  saveUserProfile(profile);
  return { success: true, updatedProfile: profile };
}

// ================= COLLECTION & SQUAD STORAGE =================
export function getUserCollection(): Player[] {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (raw) {
      const list: Player[] = JSON.parse(raw);
      const allCanonical = getAllPlayers();
      let modified = false;
      const synced = list.map(p => {
        const canonical = allCanonical.find(c => c.id === p.id);
        if (canonical && (p.image !== canonical.image || !p.image)) {
          modified = true;
          return { ...p, image: canonical.image, ovr: canonical.ovr, stats: canonical.stats };
        }
        return p;
      });
      if (modified) {
        saveUserCollection(synced);
      }
      return synced;
    }
  } catch {
    // Ignore error
  }

  const starters = [
    INITIAL_PLAYERS.find(p => p.id === 'wk_raya') || INITIAL_PLAYERS[0],
    INITIAL_PLAYERS.find(p => p.id === 'wk_saliba') || INITIAL_PLAYERS[1],
    INITIAL_PLAYERS.find(p => p.id === 'wk_bastoni') || INITIAL_PLAYERS[2],
    INITIAL_PLAYERS.find(p => p.id === 'wk_kounde') || INITIAL_PLAYERS[3],
    INITIAL_PLAYERS.find(p => p.id === 'wk_dimarco') || INITIAL_PLAYERS[4],
    INITIAL_PLAYERS.find(p => p.id === 'wk_barella') || INITIAL_PLAYERS[5],
    INITIAL_PLAYERS.find(p => p.id === 'wk_pedri') || INITIAL_PLAYERS[6],
    INITIAL_PLAYERS.find(p => p.id === 'wk_musiala') || INITIAL_PLAYERS[7],
    INITIAL_PLAYERS.find(p => p.id === 'wk_saka') || INITIAL_PLAYERS[8],
    INITIAL_PLAYERS.find(p => p.id === 'wk_lautaro') || INITIAL_PLAYERS[9],
    INITIAL_PLAYERS.find(p => p.id === 'wk_kane') || INITIAL_PLAYERS[10],
    INITIAL_PLAYERS.find(p => p.id === 'elite_bellingham') || INITIAL_PLAYERS[11]
  ];

  saveUserCollection(starters);
  return starters;
}

export function saveUserCollection(players: Player[]): void {
  try {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(players));
  } catch {
    // Error
  }
}

export function addPlayerToCollection(player: Player): boolean {
  const collection = getUserCollection();
  const alreadyOwned = collection.some(p => p.id === player.id);
  if (!alreadyOwned) {
    collection.unshift(player);
    saveUserCollection(collection);
    return true;
  }
  return false;
}

export function getUserSquad(): (Player | null)[] {
  try {
    const raw = localStorage.getItem(SQUAD_KEY);
    if (raw) {
      const list: (Player | null)[] = JSON.parse(raw);
      const allCanonical = getAllPlayers();
      let modified = false;
      const synced = list.map(p => {
        if (!p) return null;
        const canonical = allCanonical.find(c => c.id === p.id);
        if (canonical && (p.image !== canonical.image || !p.image)) {
          modified = true;
          return { ...p, image: canonical.image, ovr: canonical.ovr, stats: canonical.stats };
        }
        return p;
      });
      if (modified) {
        saveUserSquad(synced);
      }
      return synced;
    }
  } catch {
    // Error
  }

  const collection = getUserCollection();
  const starters: (Player | null)[] = [
    collection.find(p => p.position === 'GK') || null,
    collection.find(p => p.position === 'DEF' && p.id === 'wk_dimarco') || collection.find(p => p.position === 'DEF') || null,
    collection.find(p => p.position === 'DEF' && p.id === 'wk_saliba') || null,
    collection.find(p => p.position === 'DEF' && p.id === 'wk_bastoni') || null,
    collection.find(p => p.position === 'DEF' && p.id === 'wk_kounde') || null,
    collection.find(p => p.position === 'MID' && p.id === 'wk_barella') || collection.find(p => p.position === 'MID') || null,
    collection.find(p => p.position === 'MID' && p.id === 'wk_pedri') || null,
    collection.find(p => p.position === 'MID' && p.id === 'elite_bellingham') || null,
    collection.find(p => p.position === 'ATT' && p.id === 'wk_saka') || collection.find(p => p.position === 'ATT') || null,
    collection.find(p => p.position === 'ATT' && p.id === 'wk_kane') || null,
    collection.find(p => p.position === 'ATT' && p.id === 'wk_lautaro') || null
  ];

  saveUserSquad(starters);
  return starters;
}

export function saveUserSquad(squad: (Player | null)[]): void {
  try {
    localStorage.setItem(SQUAD_KEY, JSON.stringify(squad));
  } catch {
    // Error
  }
}

export function getUserFormation(): FormationType {
  try {
    const raw = localStorage.getItem(FORMATION_KEY);
    if (raw) return raw as FormationType;
  } catch {
    // Error
  }
  return '4-3-3';
}

export function saveUserFormation(formation: FormationType): void {
  try {
    localStorage.setItem(FORMATION_KEY, formation);
  } catch {
    // Error
  }
}

// ================= SETTINGS & RESET SYSTEM =================
export function updateUserSettings(nextSettings: AppSettings): UserProfile {
  const profile = getOrCreateUserProfile();
  profile.settings = nextSettings;
  sounds.toggleSound(nextSettings.soundEnabled);
  sounds.toggleMusic(nextSettings.musicEnabled);
  sounds.toggleEffects(nextSettings.effectsEnabled);
  saveUserProfile(profile);
  return profile;
}

export function resetAllGoalixData(): UserProfile {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SQUAD_KEY);
    localStorage.removeItem(FORMATION_KEY);
    localStorage.removeItem(COLLECTION_KEY);
    localStorage.removeItem(COMPLETED_MATCHES_KEY);
    localStorage.removeItem('goalix_custom_players_v1');
  } catch {
    // Ignore
  }
  getUserCollection();
  getUserSquad();
  return getOrCreateUserProfile();
}

export function applyPendingServerGrants(grants: PendingGrantItem[]): {
  updatedProfile: UserProfile;
  appliedCount: number;
  lastGrantSummary: string | null;
} {
  const profile = getOrCreateUserProfile();
  if (!grants || grants.length === 0) {
    return { updatedProfile: profile, appliedCount: 0, lastGrantSummary: null };
  }

  let appliedIds: string[] = [];
  try {
    const raw = localStorage.getItem(APPLIED_GRANTS_KEY);
    if (raw) appliedIds = JSON.parse(raw);
  } catch {
    appliedIds = [];
  }

  let appliedCount = 0;
  let lastGrantSummary: string | null = null;

  for (const grant of grants) {
    if (appliedIds.includes(grant.id)) continue;
    appliedIds.push(grant.id);
    appliedCount++;

    const prevCoins = profile.coins;
    if (grant.operation === 'set') {
      profile.coins = Math.max(0, Math.floor(grant.coinsAmount));
    } else if (grant.operation === 'deduct') {
      profile.coins = Math.max(0, profile.coins - Math.floor(grant.coinsAmount));
    } else {
      profile.coins = Math.max(0, profile.coins + Math.floor(grant.coinsAmount));
    }

    const delta = profile.coins - prevCoins;

    if (grant.bonusPackTier) {
      if (!Array.isArray(profile.ownedPacks)) profile.ownedPacks = [];
      profile.ownedPacks.unshift({
        id: `pack_topup_${grant.id}`,
        packTier: grant.bonusPackTier,
        nameAr: `هدية شحن (${grant.bonusPackTier})`,
        createdAt: grant.timestamp || Date.now(),
      });
    }

    if (grant.bonusChestTier) {
      if (!Array.isArray(profile.santraChests)) profile.santraChests = [];
      profile.santraChests.unshift({
        id: `chest_topup_${grant.id}`,
        tier: grant.bonusChestTier,
        sourceAr: `هدية شحن (${grant.packageNameAr})`,
        createdAt: grant.timestamp || Date.now(),
      });
    }

    if (!Array.isArray(profile.recentActivity)) profile.recentActivity = [];
    profile.recentActivity.unshift({
      id: `act_topup_${grant.id}`,
      type: 'topup',
      titleAr: `شحن رصيد من الإدارة: ${grant.packageNameAr}`,
      subtitleAr:
        grant.noteAr ||
        `تم تحديث الرصيد (${delta >= 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()} كوينز)`,
      coinsDelta: delta,
      rankPointsDelta: 0,
      timestamp: grant.timestamp || Date.now(),
    });

    lastGrantSummary = `تم شحن حسابك بنجاح (${grant.packageNameAr})! الرصيد الجديد: ${profile.coins.toLocaleString()} كوينز`;
  }

  if (appliedCount > 0) {
    profile.recentActivity = (profile.recentActivity || []).slice(0, 35);
    saveUserProfile(profile);
    try {
      localStorage.setItem(APPLIED_GRANTS_KEY, JSON.stringify(appliedIds.slice(-200)));
    } catch {
      // Ignore
    }
  }

  return { updatedProfile: profile, appliedCount, lastGrantSummary };
}

