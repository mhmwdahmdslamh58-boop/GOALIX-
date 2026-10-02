import {
  OnlineRoomState,
  GameId,
  GameMode,
  UserProfile,
  GoalixLeagueStandingRow,
  GoalixLeagueMatchRecord,
  TopUpPackageItem,
  TopUpTransactionRecord,
  SyncedPlayerAccount,
  PendingGrantItem,
  PackTierId,
  SantraChestTier,
  RoomVisibilityType,
  RoomTimerDuration,
  StoreProductItem,
  QuickChatMessageItem,
  StorePurchaseRequest,
  CoinTransactionRecord,
  SecurityLogEntry,
} from '../types/game';

const API_BASE = '/api';

// ==================== AUTH & PROFILE ONBOARDING ====================

export async function googleLoginWithServer(params: {
  email: string;
  googleDisplayName?: string;
  existingClientId?: string;
}): Promise<{
  account: SyncedPlayerAccount;
  isNewUser: boolean;
}> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تسجيل الدخول باستخدام Google');
  }
  return res.json();
}

export async function completeProfileSetupWithServer(params: {
  userId: string;
  email?: string;
  username: string;
  avatarDataUrl: string;
}): Promise<{ account: SyncedPlayerAccount }> {
  const res = await fetch(`${API_BASE}/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'تعذر حفظ الملف الشخصي');
  }
  return res.json();
}

// ==================== MULTIPLAYER ROOMS (2 PLAYERS ONLY, NO BOTS) ====================

export async function fetchWaitingRooms(): Promise<OnlineRoomState[]> {
  try {
    const res = await fetch(`${API_BASE}/rooms`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function startRoomByHost(code: string, hostId: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل بدء المباراة');
  }
  return res.json();
}

export async function createOnlineRoom(
  hostId: string,
  hostName: string,
  gameId: GameId,
  mode: GameMode,
  roomType: RoomVisibilityType = 'PUBLIC',
  timerSeconds: RoomTimerDuration = 30,
  chatEnabled = true
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hostId,
      hostName,
      gameId,
      mode,
      roomType,
      timerSeconds,
      chatEnabled,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل في إنشاء الغرفة');
  }
  return res.json();
}

export async function joinOnlineRoom(
  code: string,
  guestId: string,
  guestName: string
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim().toUpperCase(), guestId, guestName }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل في الانضمام للغرفة');
  }
  return res.json();
}

export async function fetchRoomState(code: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code.trim().toUpperCase())}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'الغرفة غير موجودة');
  }
  return res.json();
}

export async function setRoomReady(
  code: string,
  userId: string,
  ready: boolean
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ready }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تحديث حالة الاستعداد');
  }
  return res.json();
}

export async function updateRoomGame(
  code: string,
  hostId: string,
  gameId: GameId,
  mode: GameMode,
  timerSeconds?: RoomTimerDuration,
  chatEnabled?: boolean
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/select-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, gameId, mode, timerSeconds, chatEnabled }),
  });
  if (!res.ok) throw new Error('فشل تغيير إعدادات اللعبة');
  return res.json();
}

export async function sendRoomQuickChatMessage(
  code: string,
  userId: string,
  messageId: string
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, messageId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل إرسال الرسالة');
  }
  return res.json();
}

export async function sendStatAnswer(
  code: string,
  userId: string,
  answer: number
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/stat-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, answer }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل إرسال الإجابة');
  }
  return res.json();
}

export async function sendSantraBox(
  code: string,
  userId: string,
  boxIndex: number
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/santra-box`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, boxIndex }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل اختيار الصندوق');
  }
  return res.json();
}

export async function advanceRoomRound(code: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/next-round`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('فشل الانتقال للجولة التالية');
  return res.json();
}

export async function startRoomSimulation(code: string): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/start-simulation`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('فشل بدء محاكاة المباراة');
  return res.json();
}

export async function finishRoomMatch(
  code: string,
  hostGoals: number,
  guestGoals: number
): Promise<OnlineRoomState> {
  const res = await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/finish-match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostGoals, guestGoals }),
  });
  if (!res.ok) throw new Error('فشل تسجيل نتيجة المباراة');
  return res.json();
}

export async function leaveOnlineRoom(code: string, userId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/rooms/${encodeURIComponent(code)}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch {
    // Ignore network error on exit
  }
}

/**
 * Connects to the room's real-time Server-Sent Events (SSE) stream.
 * Automatically falls back to polling if SSE encounters an error.
 */
export function subscribeToRoomUpdates(
  code: string,
  onUpdate: (state: OnlineRoomState) => void,
  onError?: (err: Error) => void
): () => void {
  const cleanCode = code.trim().toUpperCase();
  let eventSource: EventSource | null = null;
  let pollingInterval: NodeJS.Timeout | null = null;
  let isClosed = false;

  const startPolling = () => {
    if (pollingInterval || isClosed) return;
    pollingInterval = setInterval(async () => {
      try {
        const state = await fetchRoomState(cleanCode);
        if (!isClosed) onUpdate(state);
      } catch (err) {
        if (!isClosed && onError && err instanceof Error) onError(err);
      }
    }, 1200);
  };

  try {
    eventSource = new EventSource(`${API_BASE}/rooms/${encodeURIComponent(cleanCode)}/stream`);

    eventSource.onmessage = (event) => {
      if (isClosed) return;
      try {
        const state = JSON.parse(event.data) as OnlineRoomState;
        onUpdate(state);
      } catch {
        // Ignored keepalive or unparseable
      }
    };

    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      startPolling();
    };
  } catch {
    startPolling();
  }

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}

// ==================== GOALIX LEAGUE, REWARDS & TOP-UP STORE APIS ====================

export async function syncPlayerAccountWithServer(
  profile: UserProfile,
  squadOvr = 85,
  ownedCardsCount = 14,
  ackGrantIds?: string[]
): Promise<{
  account: SyncedPlayerAccount;
  pendingGrants: PendingGrantItem[];
} | null> {
  try {
    const res = await fetch(`${API_BASE}/players/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: profile.id,
        accountId: profile.accountId,
        email: profile.email,
        profileCompleted: profile.profileCompleted,
        username: profile.username,
        avatar: profile.avatar,
        coins: profile.coins,
        rankPoints: profile.rankPoints ?? 0,
        squadOvr,
        matchesPlayed: profile.matchesPlayed || 0,
        matchesWon: profile.matchesWon || 0,
        matchesDrawn: profile.matchesDrawn || 0,
        matchesLost: profile.matchesLost || 0,
        ownedCardsCount,
        ackGrantIds,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function recordAiMatchRewardApi(params: {
  userId: string;
  matchId: string;
  gameId: GameId;
  outcome: 'win' | 'draw' | 'loss';
}): Promise<{
  coinsAwarded: number;
  newBalance: number;
  rewardTransactionId: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/rewards/ai-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function executeSquadTrialMatchApi(params: {
  userId: string;
  matchId: string;
  outcome: 'win' | 'draw' | 'loss';
}): Promise<{
  coinsAwarded: number;
  newBalance: number;
  nextAvailableAt: number;
  rewardTransactionId: string;
}> {
  const res = await fetch(`${API_BASE}/rewards/squad-trial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'تجربة التشكيلة غير متاحة حاليًا');
  }
  return res.json();
}

export interface GoalixLeagueStandingsResponse {
  daily: GoalixLeagueStandingRow[];
  weekly: GoalixLeagueStandingRow[];
  recentMatches: GoalixLeagueMatchRecord[];
  dailyResetAt: number;
  weeklyResetAt: number;
  totalRegisteredPlayers: number;
}

export async function fetchGoalixLeagueStandings(): Promise<GoalixLeagueStandingsResponse> {
  const res = await fetch(`${API_BASE}/league/standings`);
  if (!res.ok) {
    throw new Error('تعذر تحميل جدول دوري جولكس');
  }
  return res.json();
}

export async function fetchStoreState(): Promise<{
  packages: TopUpPackageItem[];
  transactions: TopUpTransactionRecord[];
  players: SyncedPlayerAccount[];
  products: StoreProductItem[];
  chatMessages: QuickChatMessageItem[];
}> {
  const res = await fetch(`${API_BASE}/store/state`);
  if (!res.ok) {
    throw new Error('تعذر تحميل بيانات المتجر');
  }
  return res.json();
}

export async function fetchStoreCatalogAndMessages(): Promise<{
  products: StoreProductItem[];
  chatMessages: QuickChatMessageItem[];
}> {
  const res = await fetch(`${API_BASE}/store/catalog`);
  if (!res.ok) {
    return { products: [], chatMessages: [] };
  }
  return res.json();
}

export async function createStorePurchaseRequestApi(params: {
  userId: string;
  productId: string;
  idempotencyKey?: string;
}): Promise<{ request: StorePurchaseRequest }> {
  const res = await fetch(`${API_BASE}/store/purchase-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل إرسال طلب الشراء');
  }
  return res.json();
}

export async function fetchUserPurchaseRequestsApi(
  userId: string
): Promise<{ requests: StorePurchaseRequest[] }> {
  const res = await fetch(`${API_BASE}/store/purchase-requests/${encodeURIComponent(userId)}`);
  if (!res.ok) return { requests: [] };
  return res.json();
}

export async function searchServerPlayers(query: string): Promise<SyncedPlayerAccount[]> {
  const res = await fetch(`${API_BASE}/players/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function executeOwnerTopUpRequest(params: {
  ownerUserId?: string;
  ownerEmail?: string;
  targetQueryId: string;
  operation: 'add' | 'set' | 'deduct';
  coinsAmount: number;
  packageId?: string;
  packageNameAr?: string;
  bonusPackTier?: PackTierId;
  bonusChestTier?: SantraChestTier;
  noteAr?: string;
}): Promise<{
  player: SyncedPlayerAccount;
  transaction: TopUpTransactionRecord;
  grant: PendingGrantItem;
}> {
  const res = await fetch(`${API_BASE}/store/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل تنفيذ عملية الشحن');
  }
  return res.json();
}

export async function saveTopUpPackageRequest(
  pkg: TopUpPackageItem
): Promise<{ packages: TopUpPackageItem[] }> {
  const res = await fetch(`${API_BASE}/store/packages/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pkg),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حفظ الباقة');
  }
  return res.json();
}

export async function deleteTopUpPackageRequest(
  packageId: string
): Promise<{ packages: TopUpPackageItem[] }> {
  const res = await fetch(`${API_BASE}/store/packages/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حذف الباقة');
  }
  return res.json();
}

// ==================== OWNER ADMIN CONTROL CENTER APIS ====================

export interface OwnerAdminDashboardData {
  users: SyncedPlayerAccount[];
  purchaseRequests: StorePurchaseRequest[];
  storeProducts: StoreProductItem[];
  quickChatCatalog: QuickChatMessageItem[];
  coinTransactions: CoinTransactionRecord[];
  securityLogs: SecurityLogEntry[];
  roomMatches: GoalixLeagueMatchRecord[];
  topUpPackages: TopUpPackageItem[];
  topUpTransactions: TopUpTransactionRecord[];
}

export async function fetchOwnerAdminDashboard(
  ownerUserId: string,
  ownerEmail?: string
): Promise<OwnerAdminDashboardData> {
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerUserId, ownerEmail }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || '403 Access Denied');
  }
  return res.json();
}

export async function reviewPurchaseRequestApi(params: {
  ownerUserId: string;
  ownerEmail?: string;
  requestId: string;
  decision: 'APPROVE' | 'REJECT';
}): Promise<{ request: StorePurchaseRequest }> {
  const res = await fetch(`${API_BASE}/admin/purchase-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل معالجة طلب الشراء');
  }
  return res.json();
}

export async function saveStoreProductApi(params: {
  ownerUserId: string;
  ownerEmail?: string;
  product: Partial<StoreProductItem>;
}): Promise<{ products: StoreProductItem[] }> {
  const res = await fetch(`${API_BASE}/admin/products/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حفظ المنتج');
  }
  return res.json();
}

export async function deleteStoreProductApi(params: {
  ownerUserId: string;
  ownerEmail?: string;
  productId: string;
}): Promise<{ products: StoreProductItem[] }> {
  const res = await fetch(`${API_BASE}/admin/products/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حذف المنتج');
  }
  return res.json();
}

export async function saveQuickChatItemApi(params: {
  ownerUserId: string;
  ownerEmail?: string;
  item: Partial<QuickChatMessageItem>;
}): Promise<{ chatMessages: QuickChatMessageItem[] }> {
  const res = await fetch(`${API_BASE}/admin/chat-items/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حفظ الرسالة');
  }
  return res.json();
}

export async function deleteQuickChatItemApi(params: {
  ownerUserId: string;
  ownerEmail?: string;
  messageId: string;
}): Promise<{ chatMessages: QuickChatMessageItem[] }> {
  const res = await fetch(`${API_BASE}/admin/chat-items/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'فشل حذف الرسالة');
  }
  return res.json();
}
