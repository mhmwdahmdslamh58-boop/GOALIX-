export interface RankedPlayer {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  points: number; // 3 for win, 1 for draw, 0 for loss
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  winRate: number;
  streak: string;
  badge?: string;
  countryFlag?: string;
  lastUpdated: number;
  isCurrentUser?: boolean;
}

export interface RankingResponse {
  players: RankedPlayer[];
  currentUser?: RankedPlayer;
  totalPlayers: number;
  lastUpdated: number;
}

const API_BASE = '/api';

export async function fetchOnlineRanking(userId?: string): Promise<RankingResponse> {
  const url = userId 
    ? `${API_BASE}/ranking?userId=${encodeURIComponent(userId)}`
    : `${API_BASE}/ranking`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('فشل جلب جدول ترتيب الدوري');
  }
  return res.json();
}

export async function syncUserRankingProfile(
  userId: string, 
  username: string, 
  avatar?: string
): Promise<RankedPlayer> {
  const res = await fetch(`${API_BASE}/ranking/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, username, avatar })
  });
  if (!res.ok) {
    throw new Error('فشل مزامنة الملف الشخصي مع جدول الترتيب');
  }
  return res.json();
}
