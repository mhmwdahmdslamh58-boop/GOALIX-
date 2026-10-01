import { Player, UserProfile, FormationType, GameId, PastWinnerMedal } from '../types/game';
import { INITIAL_PLAYERS } from '../data/players';

const PROFILE_KEY = 'goalix_user_profile_v1';
const SQUAD_KEY = 'goalix_squad_v1';
const FORMATION_KEY = 'goalix_formation_v1';
const COLLECTION_KEY = 'goalix_collection_v1';
const COMPLETED_MATCHES_KEY = 'goalix_completed_matches_v1';

export function getOrCreateUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      // Migration: Ensure bids and memoryXiWins exist
      let updated = false;
      if (typeof parsed.bids !== 'number') {
        parsed.bids = 15; // Starting grant of 15 Bids
        updated = true;
      }
      if (typeof parsed.memoryXiWins !== 'number') {
        parsed.memoryXiWins = 0;
        updated = true;
      }
      if (!parsed.pastMedals) {
        parsed.pastMedals = [
          { id: 'm_season0', title: 'درع أساطير الإطلاق', season: 'الموسم 0', type: 'gold', date: '2026-09-01' }
        ];
        updated = true;
      }
      if (!parsed.unlockedReactions) {
        parsed.unlockedReactions = ['🔥', '👏', '⚽', '👑', '⚡'];
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

  const defaultProfile: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: 'كابتن جواليكس',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    coins: 50, // Starting grant for 50 Coins
    bids: 15,  // Starting grant for 15 Bids (enough for Elite Pack)
    matchesPlayed: 0,
    matchesWon: 0,
    statArenaWins: 0,
    santraWins: 0,
    memoryXiWins: 0,
    bestRank: 12,
    pastMedals: [
      { id: 'm_season0', title: 'درع أساطير الإطلاق', season: 'الموسم 0', type: 'gold', date: '2026-09-01' }
    ],
    unlockedReactions: ['🔥', '👏', '⚽', '👑', '⚡'],
    createdAt: Date.now()
  };

  saveUserProfile(defaultProfile);
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage error
  }
}

export function addCoinsToUser(amount: number): UserProfile {
  const profile = getOrCreateUserProfile();
  profile.coins = Math.max(0, profile.coins + amount);
  saveUserProfile(profile);
  return profile;
}

export function deductCoinsFromUser(amount: number): boolean {
  const profile = getOrCreateUserProfile();
  if (profile.coins < amount) return false;
  profile.coins -= amount;
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

/**
 * Exchange Coins for Bids: 10 Coins = 1 Bid
 */
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

// ================= MATCH RESULT & COINS REWARDS =================
export interface RecordMatchParams {
  matchId: string;
  gameId: GameId;
  isOnline: boolean;
  outcome: 'win' | 'loss' | 'draw';
}

/**
 * Authoritative Economic Reward / Penalty Rule:
 * Offline: Win = +5 Coins
 * Online Rooms: Win = +20 Coins
 * Loss (Offline or Online): -5 Coins (clamped to 0)
 * Draw: 0 Coins
 * Duplicate prevention: Checks matchId to guarantee no double awards.
 */
export function recordMatchOutcome(params: RecordMatchParams): { coinsChanged: number; updatedProfile: UserProfile } {
  const { matchId, gameId, isOnline, outcome } = params;
  const profile = getOrCreateUserProfile();

  // Deduplication check
  let completedSet: string[] = [];
  try {
    const raw = localStorage.getItem(COMPLETED_MATCHES_KEY);
    if (raw) completedSet = JSON.parse(raw);
  } catch {}

  if (completedSet.includes(matchId)) {
    // Already credited! Prevent duplicate.
    return { coinsChanged: 0, updatedProfile: profile };
  }

  let coinsDelta = 0;
  if (outcome === 'win') {
    coinsDelta = isOnline ? 20 : 5;
  } else if (outcome === 'loss') {
    coinsDelta = -5;
  } else {
    coinsDelta = 0;
  }

  profile.matchesPlayed += 1;
  if (outcome === 'win') {
    profile.matchesWon += 1;
    if (gameId === 'stat_arena') profile.statArenaWins += 1;
    if (gameId === 'santra') profile.santraWins += 1;
    if (gameId === 'memory_xi') profile.memoryXiWins = (profile.memoryXiWins || 0) + 1;
  }

  profile.coins = Math.max(0, profile.coins + coinsDelta);
  saveUserProfile(profile);

  // Record matchId
  completedSet.push(matchId);
  try {
    localStorage.setItem(COMPLETED_MATCHES_KEY, JSON.stringify(completedSet.slice(-100)));
  } catch {}

  return { coinsChanged: coinsDelta, updatedProfile: profile };
}

export function getUserCollection(): Player[] {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (raw) {
      const list: Player[] = JSON.parse(raw);
      // Synchronize real images with canonical player database
      let modified = false;
      const synced = list.map(p => {
        const canonical = INITIAL_PLAYERS.find(c => c.id === p.id);
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

  // Initial starter collection
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
    // Plus a marquee elite star to start with!
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

export function addPlayerToCollection(player: Player): void {
  const collection = getUserCollection();
  if (!collection.some(p => p.id === player.id)) {
    collection.push(player);
    saveUserCollection(collection);
  }
}

export function getUserSquad(): (Player | null)[] {
  try {
    const raw = localStorage.getItem(SQUAD_KEY);
    if (raw) {
      const list: (Player | null)[] = JSON.parse(raw);
      let modified = false;
      const synced = list.map(p => {
        if (!p) return null;
        const canonical = INITIAL_PLAYERS.find(c => c.id === p.id);
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
