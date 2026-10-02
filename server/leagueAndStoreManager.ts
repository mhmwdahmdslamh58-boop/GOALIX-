import fs from 'fs';
import path from 'path';
import {
  CoinTransactionRecord,
  GameId,
  GameMode,
  GoalixLeagueMatchRecord,
  GoalixLeagueStandingRow,
  PackRarityTier,
  PackTierId,
  PendingGrantItem,
  QuickChatCategory,
  QuickChatMessageItem,
  SantraChestTier,
  SecurityLogEntry,
  StoreProductItem,
  StorePurchaseRequest,
  StoreSectionType,
  SyncedPlayerAccount,
  TopUpPackageItem,
  TopUpTransactionRecord,
} from '../src/types/game';

export const OWNER_EMAIL = 'm7hmoud654654@gmail.com';

interface PersistedPlatformData {
  players: Record<string, SyncedPlayerAccount>;
  roomMatches: GoalixLeagueMatchRecord[];
  rewardedMatchIds: string[];
  processedIdempotencyKeys: string[];
  storeProducts: StoreProductItem[];
  quickChatCatalog: QuickChatMessageItem[];
  purchaseRequests: StorePurchaseRequest[];
  coinTransactions: CoinTransactionRecord[];
  securityLogs: SecurityLogEntry[];
  topUpPackages: TopUpPackageItem[];
  topUpTransactions: TopUpTransactionRecord[];
  pendingGrants: Record<string, PendingGrantItem[]>;
}

const DEFAULT_QUICK_CHAT_CATALOG: QuickChatMessageItem[] = [
  { id: 'msg_salam_1', textAr: 'بالتوفيق يا نجم 🤝', category: 'SALAM', categoryLabelAr: 'سلام وتحية', priceCoins: 50, rarity: 'Common', enabled: true, isStarterOwned: true },
  { id: 'msg_start_1', textAr: 'بدأنا يا معلم ⚽', category: 'START', categoryLabelAr: 'بداية المباراة', priceCoins: 50, rarity: 'Common', enabled: true, isStarterOwned: true },
  { id: 'msg_challenge_1', textAr: 'يلا يا نجم 🔥', category: 'CHALLENGE', categoryLabelAr: 'تحدي وحماس', priceCoins: 60, rarity: 'Common', enabled: true, isStarterOwned: true },
  { id: 'msg_respect_1', textAr: 'ركز يا كابتن 👏', category: 'RESPECT', categoryLabelAr: 'احترام وتركيز', priceCoins: 60, rarity: 'Common', enabled: true, isStarterOwned: true },
  { id: 'msg_fun_1', textAr: 'شد حيلك 😂', category: 'FUN', categoryLabelAr: 'هزار', priceCoins: 120, rarity: 'Common', enabled: true },
  { id: 'msg_fun_2', textAr: 'إيه اللي طلعلك ده 😂', category: 'FUN', categoryLabelAr: 'هزار', priceCoins: 140, rarity: 'Rare', enabled: true },
  { id: 'msg_fun_3', textAr: 'متستعجلش 😂', category: 'FUN', categoryLabelAr: 'هزار', priceCoins: 130, rarity: 'Common', enabled: true },
  { id: 'msg_taunt_1', textAr: 'استنى بس 😏', category: 'TAUNT', categoryLabelAr: 'غيظ واستفزاز رياضي', priceCoins: 180, rarity: 'Rare', enabled: true },
  { id: 'msg_taunt_2', textAr: 'مش هتعدي كده 😎', category: 'CONFIDENCE', categoryLabelAr: 'ثقة', priceCoins: 200, rarity: 'Rare', featured: true, enabled: true },
  { id: 'msg_taunt_3', textAr: 'لسه الماتش طويل ⏳', category: 'CHALLENGE', categoryLabelAr: 'تحدي', priceCoins: 150, rarity: 'Common', enabled: true },
  { id: 'msg_good_1', textAr: 'يا ابن اللعيبة 😎', category: 'GOOD_PLAYER', categoryLabelAr: 'لاعب قوي', priceCoins: 220, rarity: 'Epic', featured: true, enabled: true },
  { id: 'msg_good_2', textAr: 'اللاعب ده جامد أوي 🔥', category: 'GOOD_PLAYER', categoryLabelAr: 'لاعب قوي', priceCoins: 210, rarity: 'Epic', enabled: true },
  { id: 'msg_good_3', textAr: 'يا فاجر 🔥', category: 'SPECIAL', categoryLabelAr: 'رسائل مميزة', priceCoins: 300, rarity: 'Legendary', featured: true, enabled: true },
  { id: 'msg_react_1', textAr: 'إيه الحلاوة دي؟ ✨', category: 'REACTION', categoryLabelAr: 'ردود فعل', priceCoins: 160, rarity: 'Rare', enabled: true },
  { id: 'msg_react_2', textAr: 'دي لقطة جامدة 🎯', category: 'GOAL', categoryLabelAr: 'بعد الهدف', priceCoins: 180, rarity: 'Rare', enabled: true },
  { id: 'msg_react_3', textAr: 'يا نهار أبيض! 😱', category: 'REACTION', categoryLabelAr: 'ردود فعل', priceCoins: 170, rarity: 'Rare', enabled: true },
  { id: 'msg_luck_1', textAr: 'يا سلام على الحظ 😂', category: 'LUCK', categoryLabelAr: 'حظ', priceCoins: 160, rarity: 'Rare', enabled: true },
  { id: 'msg_luck_2', textAr: 'ده أنت محظوظ النهارده 🍀', category: 'LUCK', categoryLabelAr: 'حظ', priceCoins: 175, rarity: 'Rare', enabled: true },
  { id: 'msg_luck_3', textAr: 'إيه الحظ ده؟ 🎲', category: 'BAD_PLAYER', categoryLabelAr: 'لاعب ضعيف / حظ', priceCoins: 150, rarity: 'Common', enabled: true },
  { id: 'msg_late_1', textAr: 'الموضوع سخن 🔥', category: 'LATE', categoryLabelAr: 'حماس وتأخير', priceCoins: 190, rarity: 'Epic', enabled: true },
];

const DEFAULT_STORE_PRODUCTS: StoreProductItem[] = [
  // 1. PACKS (Luxury 3D Vault Packs)
  {
    id: 'store_pack_bronze',
    section: 'PACKS',
    nameAr: 'خزنة GOALIX البرونزية 3D (COMMON VAULT)',
    descriptionAr: 'باك ثلاثي الأبعاد بتصميم خزنة معدنية سوداء وذهبية يمنحك لاعبًا بتقييم +83 OVR.',
    priceCoins: 120,
    rarity: 'Common',
    packTier: 'BRONZE',
    minOvr: 83,
    badgeTextAr: 'COMMON 3D VAULT',
    featured: false,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_pack_weekly',
    section: 'PACKS',
    nameAr: 'خزنة المحترفين النادرة 3D (RARE VAULT)',
    descriptionAr: 'خزنة 3D مزخرفة بحواف ذهبية وانعكاسات معدنية تضمن نجمًا من الدوريات الكبرى (+85 OVR).',
    priceCoins: 250,
    rarity: 'Rare',
    packTier: 'WEEKLY',
    minOvr: 85,
    badgeTextAr: 'RARE 3D VAULT',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_pack_gold',
    section: 'PACKS',
    nameAr: 'خزنة القائد الذهبي 3D (GOLD VAULT)',
    descriptionAr: 'باك 3D فاخر بنقوش GOALIX الهندسية وإضاءة ذهبية متوهجة يضمن نجمًا (+87 OVR).',
    priceCoins: 420,
    rarity: 'Rare',
    packTier: 'GOLD',
    minOvr: 87,
    badgeTextAr: 'GOLD 3D VAULT',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_pack_elite',
    section: 'PACKS',
    nameAr: 'خزنة النخبة الملحمية 3D (EPIC ELITE VAULT)',
    descriptionAr: 'خزنة ميكانيكية ثلاثية الأبعاد بطاقة متوهجة تضمن لاعب نخبة عالمي (+90 OVR).',
    priceCoins: 700,
    rarity: 'Epic',
    packTier: 'ELITE',
    minOvr: 90,
    badgeTextAr: 'EPIC 3D VAULT',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_pack_icon',
    section: 'PACKS',
    nameAr: 'خزنة الأساطير الملكية 3D (LEGENDARY GX VAULT)',
    descriptionAr: 'أفخم خزنة 3D في GOALIX! معدن أسود ملكي وتفاصيل ذهبية محفورة تضمن أسطورة خالدة (+96 OVR).',
    priceCoins: 1200,
    rarity: 'Legendary',
    packTier: 'ICON',
    minOvr: 96,
    badgeTextAr: 'LEGENDARY 3D',
    featured: true,
    limited: true,
    enabled: true,
    hidden: false,
  },

  // 2. CHAT EFFECTS
  {
    id: 'store_effect_gold_flare',
    section: 'CHAT_EFFECTS',
    nameAr: 'تأثير التوهج الذهبي لرسائل الغرف',
    descriptionAr: 'يجعل رسائلك داخل غرف اللعب تظهر بإطار ذهبي ثلاثي الأبعاد وإضاءة ملكية.',
    priceCoins: 350,
    rarity: 'Epic',
    effectStyle: 'gold_flare',
    badgeTextAr: 'تأثير شات 3D',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_effect_royal_thunder',
    section: 'CHAT_EFFECTS',
    nameAr: 'تأثير البرق التكتيكي للرسائل',
    descriptionAr: 'تأثير بصري ناري عند إرسال رسائل التحدي والاحتفال داخل الغرفة.',
    priceCoins: 450,
    rarity: 'Legendary',
    effectStyle: 'royal_thunder',
    badgeTextAr: 'تأثير أسطوري',
    featured: false,
    limited: false,
    enabled: true,
    hidden: false,
  },

  // 3. PROFILE ITEMS / COSMETICS
  {
    id: 'store_profile_frame_imperial',
    section: 'PROFILE_ITEMS',
    nameAr: 'الإطار الإمبراطوري الذهبي للملف الشخصي',
    descriptionAr: 'إطار ثلاثي الأبعاد محفور بالذهب يظهر حول صورتك في الغرف وجدول الدوري.',
    priceCoins: 500,
    rarity: 'Epic',
    badgeTextAr: 'إطار حساب',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_profile_title_tactician',
    section: 'PROFILE_ITEMS',
    nameAr: 'لقب "مهندس التكتيك الملكي"',
    descriptionAr: 'لقب رسمي يظهر تحت اسمك في غرف المنافسة ولوحة الصدارة.',
    priceCoins: 400,
    rarity: 'Rare',
    badgeTextAr: 'لقب رسمي',
    featured: false,
    limited: false,
    enabled: true,
    hidden: false,
  },

  // 4. SPECIAL ITEMS & LIMITED
  {
    id: 'store_special_vip_bundle',
    section: 'SPECIAL_ITEMS',
    nameAr: 'صندوق النخبة التكتيكي الخاص (VIP PACK + CHAT)',
    descriptionAr: 'يمنحك خزنة النخبة 3D + رسالتين مميزتين للغرف بعد موافقة الإدارة.',
    priceCoins: 950,
    rarity: 'Epic',
    packTier: 'ELITE',
    badgeTextAr: 'حزمة خاصة',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  },
  {
    id: 'store_limited_gx_founders',
    section: 'LIMITED',
    nameAr: 'خزنة المؤسسين المحدودة (FOUNDERS GX 3D)',
    descriptionAr: 'إصدار محدود جدًا مخصص لنخبة لاعبي GOALIX يضمن أسطورة ICON بتقييم +97.',
    priceCoins: 1500,
    rarity: 'Legendary',
    packTier: 'ICON',
    minOvr: 97,
    badgeTextAr: 'إصدار محدود',
    featured: true,
    limited: true,
    enabled: true,
    hidden: false,
  },
];

const DEFAULT_TOPUP_PACKAGES: TopUpPackageItem[] = [
  {
    id: 'pkg_starter_500',
    nameAr: 'باقة الانطلاق التكتيكي',
    coinsAmount: 500,
    bonusCoins: 50,
    priceTextAr: '50 ج.م / $1.99',
    badgeAr: 'اقتصادية',
    theme: 'bronze',
  },
  {
    id: 'pkg_silver_1500',
    nameAr: 'باقة المحترفين الفضية',
    coinsAmount: 1500,
    bonusCoins: 250,
    bonusPackTier: 'WEEKLY',
    priceTextAr: '120 ج.م / $4.99',
    badgeAr: 'هدية باك WEEKLY',
    theme: 'silver',
  },
  {
    id: 'pkg_gold_3500',
    nameAr: 'باقة القائد الذهبي',
    coinsAmount: 3500,
    bonusCoins: 750,
    bonusPackTier: 'GOLD',
    bonusChestTier: 'Gold',
    priceTextAr: '250 ج.م / $9.99',
    badgeAr: 'الأكثر طلباً 🔥',
    theme: 'gold',
  },
  {
    id: 'pkg_elite_8000',
    nameAr: 'باقة النخبة الأوروبية',
    coinsAmount: 8000,
    bonusCoins: 2000,
    bonusPackTier: 'ELITE',
    bonusChestTier: 'Elite',
    priceTextAr: '500 ج.م / $19.99',
    badgeAr: 'باك ELITE + صندوق 3D',
    theme: 'elite',
  },
  {
    id: 'pkg_royal_20000',
    nameAr: 'باقة خزينة الأساطير الملكية',
    coinsAmount: 20000,
    bonusCoins: 5000,
    bonusPackTier: 'ICON',
    bonusChestTier: 'Legendary',
    priceTextAr: '1000 ج.م / $39.99',
    badgeAr: 'أفخم باقة VIP 👑',
    theme: 'royal',
  },
];

export function deriveGxAccountId(seedId: string): string {
  if (seedId) {
    const upper = seedId.toUpperCase();
    if (upper.startsWith('GX-')) return upper;
    if (upper.startsWith('GLX-')) return upper.replace('GLX-', 'GX-');
  }
  let hash = 0;
  for (let i = 0; i < seedId.length; i++) {
    hash = (hash * 31 + seedId.charCodeAt(i)) >>> 0;
  }
  const sixDigits = (100000 + (hash % 900000)).toString();
  return `GX-${sixDigits}`;
}

class LeagueAndStoreManager {
  private dataFilePath: string;
  private state: PersistedPlatformData;

  constructor() {
    const dir = path.resolve('server', 'data');
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {
        // Ignore
      }
    }
    this.dataFilePath = path.join(dir, 'goalix_platform_state.json');
    this.state = this.loadState();
  }

  private loadState(): PersistedPlatformData {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<PersistedPlatformData>;
        // Normalize any existing GLX- accountIds to GX-
        const players = parsed.players || {};
        Object.values(players).forEach((p) => {
          if (p.accountId && p.accountId.startsWith('GLX-')) {
            p.accountId = p.accountId.replace('GLX-', 'GX-');
          } else if (!p.accountId) {
            p.accountId = deriveGxAccountId(p.id);
          }
        });

        return {
          players,
          roomMatches: Array.isArray(parsed.roomMatches) ? parsed.roomMatches : [],
          rewardedMatchIds: Array.isArray(parsed.rewardedMatchIds) ? parsed.rewardedMatchIds : [],
          processedIdempotencyKeys: Array.isArray(parsed.processedIdempotencyKeys)
            ? parsed.processedIdempotencyKeys
            : [],
          storeProducts:
            Array.isArray(parsed.storeProducts) && parsed.storeProducts.length > 0
              ? parsed.storeProducts
              : [...DEFAULT_STORE_PRODUCTS],
          quickChatCatalog:
            Array.isArray(parsed.quickChatCatalog) && parsed.quickChatCatalog.length > 0
              ? parsed.quickChatCatalog
              : [...DEFAULT_QUICK_CHAT_CATALOG],
          purchaseRequests: Array.isArray(parsed.purchaseRequests) ? parsed.purchaseRequests : [],
          coinTransactions: Array.isArray(parsed.coinTransactions) ? parsed.coinTransactions : [],
          securityLogs: Array.isArray(parsed.securityLogs) ? parsed.securityLogs : [],
          topUpPackages:
            Array.isArray(parsed.topUpPackages) && parsed.topUpPackages.length > 0
              ? parsed.topUpPackages
              : [...DEFAULT_TOPUP_PACKAGES],
          topUpTransactions: Array.isArray(parsed.topUpTransactions)
            ? parsed.topUpTransactions
            : [],
          pendingGrants: parsed.pendingGrants || {},
        };
      }
    } catch {
      // Fallback
    }

    return {
      players: {},
      roomMatches: [],
      rewardedMatchIds: [],
      processedIdempotencyKeys: [],
      storeProducts: [...DEFAULT_STORE_PRODUCTS],
      quickChatCatalog: [...DEFAULT_QUICK_CHAT_CATALOG],
      purchaseRequests: [],
      coinTransactions: [],
      securityLogs: [],
      topUpPackages: [...DEFAULT_TOPUP_PACKAGES],
      topUpTransactions: [],
      pendingGrants: {},
    };
  }

  private saveState(): void {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch {
      // Ignore write error
    }
  }

  // ==================== SECURITY & OWNER VERIFICATION ====================

  public logSecurityEvent(params: {
    userId: string;
    accountId?: string;
    email?: string;
    action: string;
    status: 'ALLOWED' | 'DENIED_403' | 'DUPLICATE_BLOCKED' | 'INVALID_REQUEST';
    details: string;
  }): void {
    const entry: SecurityLogEntry = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId || 'anonymous',
      accountId: params.accountId,
      email: params.email,
      action: params.action,
      status: params.status,
      details: params.details,
      timestamp: Date.now(),
    };
    this.state.securityLogs.unshift(entry);
    this.state.securityLogs = this.state.securityLogs.slice(0, 250);
    this.saveState();
  }

  public verifyOwnerAuthority(userId?: string, email?: string): boolean {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === OWNER_EMAIL.toLowerCase()) {
      return true;
    }
    if (userId && this.state.players[userId]) {
      const p = this.state.players[userId];
      if (p.role === 'OWNER' || (p.email && p.email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  // ==================== AUTHENTICATION & UNIQUE PROFILE CREATION ====================

  public googleLoginAccount(params: {
    email: string;
    googleDisplayName?: string;
    existingClientId?: string;
  }): {
    account: SyncedPlayerAccount;
    isNewUser: boolean;
  } {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('يرجى إدخال بريد Google صحيح لتسجيل الدخول');
    }

    const isOwner = cleanEmail === OWNER_EMAIL.toLowerCase();

    // Check if an account with this email already exists
    let existing = Object.values(this.state.players).find(
      (p) => p.email && p.email.toLowerCase() === cleanEmail
    );

    if (!existing && params.existingClientId && this.state.players[params.existingClientId]) {
      const byClient = this.state.players[params.existingClientId];
      if (!byClient.email || byClient.email.toLowerCase() === cleanEmail) {
        existing = byClient;
      }
    }

    if (existing) {
      existing.email = cleanEmail;
      existing.role = isOwner ? 'OWNER' : 'PLAYER';
      existing.updatedAt = Date.now();
      this.state.players[existing.id] = existing;
      this.saveState();
      return {
        account: existing,
        isNewUser: !existing.profileCompleted,
      };
    }

    // Create brand-new account
    const newId =
      params.existingClientId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let candidateAccountId = deriveGxAccountId(cleanEmail + '_' + newId);
    while (
      Object.values(this.state.players).some(
        (p) => p.accountId.toUpperCase() === candidateAccountId.toUpperCase()
      )
    ) {
      candidateAccountId = `GX-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const starterChatIds = this.state.quickChatCatalog
      .filter((m) => m.isStarterOwned)
      .map((m) => m.id);

    const newAccount: SyncedPlayerAccount = {
      id: newId,
      accountId: candidateAccountId,
      email: cleanEmail,
      role: isOwner ? 'OWNER' : 'PLAYER',
      profileCompleted: false,
      username: params.googleDisplayName || '',
      avatar: '/players/icon_zidane.jpg',
      coins: 150,
      rankPoints: 0,
      squadOvr: 85,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesDrawn: 0,
      matchesLost: 0,
      ownedCardsCount: 14,
      ownedPacks: [],
      ownedChatIds: starterChatIds,
      ownedCosmetics: [],
      updatedAt: Date.now(),
    };

    this.state.players[newAccount.id] = newAccount;
    this.saveState();

    return {
      account: newAccount,
      isNewUser: true,
    };
  }

  public completeUserProfileSetup(params: {
    userId: string;
    email?: string;
    username: string;
    avatarDataUrl: string;
  }): SyncedPlayerAccount {
    const cleanUsername = (params.username || '').trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 22) {
      throw new Error('يجب أن يتكون اسم المستخدم من 3 إلى 22 حرفًا');
    }

    // Check username uniqueness across all other accounts
    const duplicateUser = Object.values(this.state.players).find(
      (p) =>
        p.id !== params.userId &&
        p.profileCompleted &&
        p.username.trim().toLowerCase() === cleanUsername.toLowerCase()
    );

    if (duplicateUser) {
      throw new Error('اسم المستخدم مستخدم بالفعل');
    }

    let account = this.state.players[params.userId];
    if (!account) {
      const loginRes = this.googleLoginAccount({
        email: params.email || `player_${Date.now()}@gmail.com`,
        existingClientId: params.userId,
      });
      account = loginRes.account;
    }

    account.username = cleanUsername;
    if (params.avatarDataUrl && params.avatarDataUrl.trim()) {
      account.avatar = params.avatarDataUrl.trim();
    }
    account.profileCompleted = true;
    if (params.email) {
      account.email = params.email.trim().toLowerCase();
      account.role =
        account.email === OWNER_EMAIL.toLowerCase() ? 'OWNER' : account.role || 'PLAYER';
    }
    account.updatedAt = Date.now();

    this.state.players[account.id] = account;
    this.saveState();
    return account;
  }

  /**
   * Syncs a player's profile from the client and returns any pending server grants.
   */
  public syncPlayerAccount(input: {
    id: string;
    accountId?: string;
    email?: string;
    username: string;
    avatar?: string;
    profileCompleted?: boolean;
    coins: number;
    rankPoints: number;
    squadOvr: number;
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    ownedCardsCount: number;
    ackGrantIds?: string[];
  }): {
    account: SyncedPlayerAccount;
    pendingGrants: PendingGrantItem[];
  } {
    const cleanAccountId = deriveGxAccountId(input.accountId || input.id);
    const existing = this.state.players[input.id];

    // Acknowledge grants that client already applied
    if (Array.isArray(input.ackGrantIds) && input.ackGrantIds.length > 0) {
      const currentGrants = this.state.pendingGrants[input.id] || [];
      this.state.pendingGrants[input.id] = currentGrants.filter(
        (g) => !input.ackGrantIds!.includes(g.id)
      );
      const accGrants = this.state.pendingGrants[cleanAccountId] || [];
      this.state.pendingGrants[cleanAccountId] = accGrants.filter(
        (g) => !input.ackGrantIds!.includes(g.id)
      );
    }

    const pendingForUser = [
      ...(this.state.pendingGrants[input.id] || []),
      ...(this.state.pendingGrants[cleanAccountId] || []),
    ];

    const emailLower = (input.email || existing?.email || '').trim().toLowerCase();
    const isOwner = emailLower === OWNER_EMAIL.toLowerCase() || existing?.role === 'OWNER';

    const starterChatIds = this.state.quickChatCatalog
      .filter((m) => m.isStarterOwned)
      .map((m) => m.id);

    const record: SyncedPlayerAccount = {
      id: input.id,
      accountId: existing?.accountId || cleanAccountId,
      email: emailLower || existing?.email,
      role: isOwner ? 'OWNER' : 'PLAYER',
      profileCompleted:
        input.profileCompleted !== undefined
          ? input.profileCompleted
          : existing?.profileCompleted ?? false,
      username: (existing?.username || input.username || 'كابتن جواليكس').trim(),
      avatar: existing?.avatar || input.avatar || '/players/icon_zidane.jpg',
      // Server authority for coins if existing record already has authoritative balance
      coins:
        existing && typeof existing.coins === 'number'
          ? existing.coins
          : typeof input.coins === 'number'
          ? Math.max(0, input.coins)
          : 150,
      rankPoints:
        existing && typeof existing.rankPoints === 'number'
          ? Math.max(existing.rankPoints, input.rankPoints || 0)
          : Math.max(0, input.rankPoints || 0),
      squadOvr: typeof input.squadOvr === 'number' ? input.squadOvr : existing?.squadOvr || 85,
      matchesPlayed: Math.max(existing?.matchesPlayed || 0, input.matchesPlayed || 0),
      matchesWon: Math.max(existing?.matchesWon || 0, input.matchesWon || 0),
      matchesDrawn: Math.max(existing?.matchesDrawn || 0, input.matchesDrawn || 0),
      matchesLost: Math.max(existing?.matchesLost || 0, input.matchesLost || 0),
      ownedCardsCount: Math.max(existing?.ownedCardsCount || 14, input.ownedCardsCount || 14),
      ownedPacks: existing?.ownedPacks || [],
      ownedChatIds:
        existing?.ownedChatIds && existing.ownedChatIds.length > 0
          ? existing.ownedChatIds
          : starterChatIds,
      ownedCosmetics: existing?.ownedCosmetics || [],
      lastSquadTrialAt: existing?.lastSquadTrialAt,
      updatedAt: Date.now(),
    };

    this.state.players[input.id] = record;
    this.saveState();

    return {
      account: record,
      pendingGrants: pendingForUser,
    };
  }

  public getPlayerByIdOrAccount(idOrAccount: string): SyncedPlayerAccount | undefined {
    const clean = (idOrAccount || '').trim().toUpperCase();
    if (this.state.players[idOrAccount]) return this.state.players[idOrAccount];
    return Object.values(this.state.players).find(
      (p) => p.id.toUpperCase() === clean || p.accountId.toUpperCase() === clean
    );
  }

  public doesPlayerOwnChatMessage(userId: string, messageId: string): QuickChatMessageItem | null {
    const msg = this.state.quickChatCatalog.find((m) => m.id === messageId && m.enabled);
    if (!msg) return null;
    if (msg.isStarterOwned) return msg;
    const player = this.state.players[userId];
    if (player && Array.isArray(player.ownedChatIds) && player.ownedChatIds.includes(messageId)) {
      return msg;
    }
    return null;
  }

  // ==================== 3-DAY MY SQUAD VS AI TRIAL COOLDOWN ====================

  public executeSquadTrialMatch(params: {
    userId: string;
    matchId: string;
    outcome: 'win' | 'draw' | 'loss';
  }): {
    coinsAwarded: number;
    newBalance: number;
    nextAvailableAt: number;
    rewardTransactionId: string;
  } {
    const player = this.state.players[params.userId];
    if (!player) {
      throw new Error('الحساب غير موجود');
    }

    if (this.state.rewardedMatchIds.includes(params.matchId)) {
      this.logSecurityEvent({
        userId: params.userId,
        accountId: player.accountId,
        action: 'SQUAD_TRIAL_REWARD',
        status: 'DUPLICATE_BLOCKED',
        details: `منع تكرار مكافأة تجربة التشكيلة (${params.matchId})`,
      });
      throw new Error('تم احتساب مكافأة هذه المباراة مسبقًا');
    }

    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (player.lastSquadTrialAt && now - player.lastSquadTrialAt < THREE_DAYS_MS) {
      const nextAt = player.lastSquadTrialAt + THREE_DAYS_MS;
      const hoursLeft = Math.ceil((nextAt - now) / (1000 * 60 * 60));
      throw new Error(`تجربة التشكيلة متاحة مرة كل 3 أيام. متبقي ${hoursLeft} ساعة.`);
    }

    const coinsAwarded = params.outcome === 'win' ? 20 : params.outcome === 'draw' ? 5 : 0;
    const before = player.coins;
    player.coins += coinsAwarded;
    player.lastSquadTrialAt = now;
    player.updatedAt = now;
    this.state.rewardedMatchIds.push(params.matchId);

    const txId = `rtx_trial_${now}_${Math.random().toString(36).substring(2, 6)}`;
    if (coinsAwarded > 0) {
      this.recordCoinTransaction({
        userId: player.id,
        accountId: player.accountId,
        username: player.username,
        amount: coinsAwarded,
        beforeBalance: before,
        afterBalance: player.coins,
        reason: 'مكافأة تجربة التشكيلة ضد الذكاء الاصطناعي (كل 3 أيام)',
      });
      this.pushPendingGrant(player.id, {
        id: txId,
        operation: 'add',
        coinsAmount: coinsAwarded,
        packageNameAr: 'مكافأة تجربة التشكيلة ضد AI',
        timestamp: now,
      });
    }

    this.saveState();
    return {
      coinsAwarded,
      newBalance: player.coins,
      nextAvailableAt: now + THREE_DAYS_MS,
      rewardTransactionId: txId,
    };
  }

  // ==================== AI MATCH REWARD (MAX 5 COINS, 0 RANK POINTS) ====================

  public recordAiMatchReward(params: {
    userId: string;
    matchId: string;
    gameId: GameId;
    outcome: 'win' | 'draw' | 'loss';
  }): {
    coinsAwarded: number;
    newBalance: number;
    rewardTransactionId: string;
  } {
    const player = this.state.players[params.userId];
    if (!player) {
      throw new Error('الحساب غير موجود');
    }

    if (this.state.rewardedMatchIds.includes(params.matchId)) {
      this.logSecurityEvent({
        userId: params.userId,
        accountId: player.accountId,
        action: 'AI_MATCH_REWARD',
        status: 'DUPLICATE_BLOCKED',
        details: `محاولة استلام مكرر لمكافأة مباراة AI (${params.matchId})`,
      });
      return {
        coinsAwarded: 0,
        newBalance: player.coins,
        rewardTransactionId: 'already_claimed',
      };
    }

    this.state.rewardedMatchIds.push(params.matchId);
    // Strict cap: AI Match Max Reward = 5 Coins, 0 Rank Points!
    const coinsAwarded = params.outcome === 'win' ? 5 : params.outcome === 'draw' ? 2 : 0;
    const before = player.coins;
    player.coins += coinsAwarded;
    player.updatedAt = Date.now();

    const txId = `rtx_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (coinsAwarded > 0) {
      this.recordCoinTransaction({
        userId: player.id,
        accountId: player.accountId,
        username: player.username,
        amount: coinsAwarded,
        beforeBalance: before,
        afterBalance: player.coins,
        reason: `مكافأة مباراة فردية ضد AI (${params.gameId}) — الحد الأقصى 5 كوينز`,
      });
    }

    this.saveState();
    return {
      coinsAwarded,
      newBalance: player.coins,
      rewardTransactionId: txId,
    };
  }

  // ==================== STORE PURCHASE REQUESTS (PENDING -> OWNER APPROVE/REJECT) ====================

  public getCatalogAndMessages(): {
    products: StoreProductItem[];
    chatMessages: QuickChatMessageItem[];
  } {
    return {
      products: this.state.storeProducts.filter((p) => !p.hidden && p.enabled),
      chatMessages: this.state.quickChatCatalog.filter((m) => m.enabled),
    };
  }

  public createStorePurchaseRequest(params: {
    userId: string;
    productId: string;
    idempotencyKey?: string;
  }): StorePurchaseRequest {
    if (
      params.idempotencyKey &&
      this.state.processedIdempotencyKeys.includes(params.idempotencyKey)
    ) {
      const existingReq = this.state.purchaseRequests.find(
        (r) => r.userId === params.userId && r.productId === params.productId && r.status === 'PENDING'
      );
      if (existingReq) return existingReq;
    }

    const player = this.state.players[params.userId];
    if (!player) {
      throw new Error('يجب تسجيل الدخول أولاً لإرسال طلب شراء');
    }

    // Look up product in storeProducts or quickChatCatalog
    let product = this.state.storeProducts.find((p) => p.id === params.productId && p.enabled);
    if (!product) {
      const chatItem = this.state.quickChatCatalog.find(
        (m) => m.id === params.productId && m.enabled
      );
      if (chatItem) {
        product = {
          id: chatItem.id,
          section: 'CHAT',
          nameAr: `رسالة غرفة: "${chatItem.textAr}"`,
          descriptionAr: `رسالة سريعة داخل الغرف (${chatItem.categoryLabelAr})`,
          priceCoins: chatItem.priceCoins,
          rarity: chatItem.rarity,
          chatMessageId: chatItem.id,
          featured: Boolean(chatItem.featured),
          limited: false,
          enabled: true,
          hidden: false,
        };
      }
    }

    if (!product || product.priceCoins <= 0) {
      throw new Error('هذا المنتج غير متاح حاليًا في المتجر');
    }

    if (player.coins < product.priceCoins) {
      throw new Error(
        `رصيد الكوينز غير كافٍ لإرسال طلب الشراء (${product.priceCoins.toLocaleString()} كوينز مطلوبة)`
      );
    }

    // Check if there is already a PENDING request for the exact same product by this user
    const existingPending = this.state.purchaseRequests.find(
      (r) =>
        r.userId === player.id &&
        r.productId === product!.id &&
        r.status === 'PENDING'
    );
    if (existingPending) {
      throw new Error('لديك طلب شراء قيد المراجعة (PENDING) لهذا المنتج بالفعل');
    }

    if (params.idempotencyKey) {
      this.state.processedIdempotencyKeys.push(params.idempotencyKey);
    }

    const reqRecord: StorePurchaseRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: player.id,
      accountId: player.accountId,
      username: player.username || 'لاعب جولكس',
      productId: product.id,
      productNameAr: product.nameAr,
      productSection: product.section,
      priceCoins: product.priceCoins, // Server-authoritative price!
      status: 'PENDING',
      createdAt: Date.now(),
    };

    this.state.purchaseRequests.unshift(reqRecord);
    this.state.purchaseRequests = this.state.purchaseRequests.slice(0, 300);
    this.saveState();
    return reqRecord;
  }

  public getUserPurchaseRequests(userId: string): StorePurchaseRequest[] {
    return this.state.purchaseRequests.filter((r) => r.userId === userId);
  }

  public reviewPurchaseRequestByOwner(params: {
    ownerUserId?: string;
    ownerEmail?: string;
    requestId: string;
    decision: 'APPROVE' | 'REJECT';
  }): StorePurchaseRequest {
    if (!this.verifyOwnerAuthority(params.ownerUserId, params.ownerEmail)) {
      this.logSecurityEvent({
        userId: params.ownerUserId || 'unknown',
        email: params.ownerEmail,
        action: 'ADMIN_REVIEW_PURCHASE',
        status: 'DENIED_403',
        details: `محاولة غير مصرح بها للموافقة على طلب شراء (${params.requestId})`,
      });
      throw new Error('403 Access Denied: صلاحية المالك مطلوبة');
    }

    const reqItem = this.state.purchaseRequests.find((r) => r.id === params.requestId);
    if (!reqItem) {
      throw new Error('طلب الشراء غير موجود');
    }
    if (reqItem.status !== 'PENDING') {
      throw new Error(`تمت معالجة هذا الطلب مسبقًا (${reqItem.status})`);
    }

    const player = this.state.players[reqItem.userId];
    if (!player) {
      throw new Error('حساب اللاعب صاحب الطلب غير موجود');
    }

    if (params.decision === 'REJECT') {
      reqItem.status = 'REJECTED';
      reqItem.reviewedAt = Date.now();
      reqItem.reviewedBy = OWNER_EMAIL;
      this.saveState();
      return reqItem;
    }

    // APPROVE -> Verify balance -> Deduct Coins -> Deliver Product -> Mark COMPLETED
    if (player.coins < reqItem.priceCoins) {
      throw new Error(
        `رصيد اللاعب الحالي (${player.coins}) أقل من سعر المنتج (${reqItem.priceCoins})`
      );
    }

    reqItem.status = 'APPROVED';
    const beforeCoins = player.coins;
    player.coins = Math.max(0, player.coins - reqItem.priceCoins);

    this.recordCoinTransaction({
      userId: player.id,
      accountId: player.accountId,
      username: player.username,
      amount: -reqItem.priceCoins,
      beforeBalance: beforeCoins,
      afterBalance: player.coins,
      reason: `شراء معتمد من الإدارة: ${reqItem.productNameAr} (${reqItem.id})`,
    });

    // Deliver product based on type
    const product = this.state.storeProducts.find((p) => p.id === reqItem.productId);
    const chatMsg = this.state.quickChatCatalog.find((m) => m.id === reqItem.productId);

    if (chatMsg || reqItem.productSection === 'CHAT') {
      const msgId = chatMsg ? chatMsg.id : product?.chatMessageId || reqItem.productId;
      if (!Array.isArray(player.ownedChatIds)) player.ownedChatIds = [];
      if (!player.ownedChatIds.includes(msgId)) {
        player.ownedChatIds.push(msgId);
      }
      this.pushPendingGrant(player.id, {
        id: `deliv_${reqItem.id}`,
        operation: 'deduct',
        coinsAmount: reqItem.priceCoins,
        packageNameAr: `تسليم رسالة غرفة: ${reqItem.productNameAr}`,
        noteAr: `تمت الموافقة على طلب الشراء وتسليم الرسالة لحسابك ✓`,
        timestamp: Date.now(),
      });
    } else if (product?.packTier || reqItem.productSection === 'PACKS' || reqItem.productSection === 'LIMITED' || reqItem.productSection === 'SPECIAL_ITEMS') {
      const packTier: PackTierId = product?.packTier || 'GOLD';
      if (!Array.isArray(player.ownedPacks)) player.ownedPacks = [];
      player.ownedPacks.unshift({
        id: `pack_${reqItem.id}`,
        packTier,
        nameAr: reqItem.productNameAr,
        rarity: product?.rarity || 'Rare',
        createdAt: Date.now(),
      });

      this.pushPendingGrant(player.id, {
        id: `deliv_${reqItem.id}`,
        operation: 'deduct',
        coinsAmount: reqItem.priceCoins,
        packageNameAr: `تسليم ${reqItem.productNameAr}`,
        bonusPackTier: packTier,
        noteAr: `وافق المالك على طلب الشراء وتم إيداع الباك في خزينتك ✓`,
        timestamp: Date.now(),
      });
    } else {
      if (!Array.isArray(player.ownedCosmetics)) player.ownedCosmetics = [];
      if (!player.ownedCosmetics.includes(reqItem.productId)) {
        player.ownedCosmetics.push(reqItem.productId);
      }
      this.pushPendingGrant(player.id, {
        id: `deliv_${reqItem.id}`,
        operation: 'deduct',
        coinsAmount: reqItem.priceCoins,
        packageNameAr: `تسليم ${reqItem.productNameAr}`,
        noteAr: `تمت الموافقة على طلب الشراء وتفعيل العنصر في حسابك ✓`,
        timestamp: Date.now(),
      });
    }

    reqItem.status = 'COMPLETED';
    reqItem.reviewedAt = Date.now();
    reqItem.reviewedBy = OWNER_EMAIL;
    player.updatedAt = Date.now();
    this.state.players[player.id] = player;
    this.saveState();
    return reqItem;
  }

  private pushPendingGrant(playerId: string, grant: PendingGrantItem): void {
    if (!this.state.pendingGrants[playerId]) {
      this.state.pendingGrants[playerId] = [];
    }
    this.state.pendingGrants[playerId].push(grant);
  }

  private recordCoinTransaction(params: {
    userId: string;
    accountId: string;
    username: string;
    amount: number;
    beforeBalance: number;
    afterBalance: number;
    reason: string;
  }): CoinTransactionRecord {
    const tx: CoinTransactionRecord = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: params.userId,
      accountId: params.accountId,
      username: params.username,
      amount: params.amount,
      beforeBalance: params.beforeBalance,
      afterBalance: params.afterBalance,
      reason: params.reason,
      timestamp: Date.now(),
    };
    this.state.coinTransactions.unshift(tx);
    this.state.coinTransactions = this.state.coinTransactions.slice(0, 300);
    return tx;
  }

  // ==================== ROOM PLAYERS & MULTIPLAYER LEAGUE ====================

  public touchRoomPlayer(playerId: string, playerName: string, squadOvr = 85): void {
    if (!playerId) return;
    const existing = this.state.players[playerId];
    if (existing) {
      existing.username = playerName || existing.username;
      if (squadOvr > 0) existing.squadOvr = squadOvr;
      existing.updatedAt = Date.now();
    } else {
      const starterChatIds = this.state.quickChatCatalog
        .filter((m) => m.isStarterOwned)
        .map((m) => m.id);
      this.state.players[playerId] = {
        id: playerId,
        accountId: deriveGxAccountId(playerId),
        username: playerName || 'لاعب جولكس',
        coins: 150,
        rankPoints: 0,
        squadOvr: squadOvr || 85,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        ownedCardsCount: 14,
        ownedChatIds: starterChatIds,
        updatedAt: Date.now(),
      };
    }
    this.saveState();
  }

  /**
   * Server-Authoritative Room Match Recording + Automatic Single-Execution Reward Distribution.
   * Win = +3 RP & +25 Coins, Draw = +1 RP & +10 Coins, Loss = 0 RP & +5 Coins.
   */
  public recordRoomMatch(params: {
    roomCode: string;
    gameId: GameId;
    mode: GameMode;
    hostId: string;
    hostName: string;
    hostSquadOvr: number;
    guestId: string;
    guestName: string;
    guestSquadOvr: number;
    hostGoals: number;
    guestGoals: number;
  }): {
    matchRecord: GoalixLeagueMatchRecord;
    hostCoinsAwarded: number;
    guestCoinsAwarded: number;
    hostRpDelta: number;
    guestRpDelta: number;
  } {
    const matchKey = `room_match_${params.roomCode}`;
    const existingMatch = this.state.roomMatches.find((m) => m.roomCode === params.roomCode);
    if (existingMatch || this.state.rewardedMatchIds.includes(matchKey)) {
      const hWon = (existingMatch?.hostGoals ?? 0) > (existingMatch?.guestGoals ?? 0);
      const gWon = (existingMatch?.guestGoals ?? 0) > (existingMatch?.hostGoals ?? 0);
      return {
        matchRecord:
          existingMatch || {
            id: matchKey,
            roomCode: params.roomCode,
            gameId: params.gameId,
            mode: params.mode,
            hostId: params.hostId,
            hostName: params.hostName,
            hostSquadOvr: params.hostSquadOvr,
            guestId: params.guestId,
            guestName: params.guestName,
            guestSquadOvr: params.guestSquadOvr,
            hostGoals: params.hostGoals,
            guestGoals: params.guestGoals,
            winnerId: hWon ? params.hostId : gWon ? params.guestId : 'draw',
            timestamp: Date.now(),
          },
        hostCoinsAwarded: hWon ? 25 : !gWon ? 10 : 5,
        guestCoinsAwarded: gWon ? 25 : !hWon ? 10 : 5,
        hostRpDelta: hWon ? 3 : !gWon ? 1 : 0,
        guestRpDelta: gWon ? 3 : !hWon ? 1 : 0,
      };
    }

    this.state.rewardedMatchIds.push(matchKey);
    this.touchRoomPlayer(params.hostId, params.hostName, params.hostSquadOvr);
    this.touchRoomPlayer(params.guestId, params.guestName, params.guestSquadOvr);

    let winnerId: string | 'draw' = 'draw';
    if (params.hostGoals > params.guestGoals) {
      winnerId = params.hostId;
    } else if (params.guestGoals > params.hostGoals) {
      winnerId = params.guestId;
    }

    const hostRpDelta = winnerId === params.hostId ? 3 : winnerId === 'draw' ? 1 : 0;
    const guestRpDelta = winnerId === params.guestId ? 3 : winnerId === 'draw' ? 1 : 0;
    const hostCoinsAwarded = winnerId === params.hostId ? 25 : winnerId === 'draw' ? 10 : 5;
    const guestCoinsAwarded = winnerId === params.guestId ? 25 : winnerId === 'draw' ? 10 : 5;

    const rewardTransactionId = `rtx_room_${params.roomCode}_${Date.now()}`;

    // Credit Host on Server
    const hostPlayer = this.state.players[params.hostId];
    if (hostPlayer) {
      const before = hostPlayer.coins;
      hostPlayer.coins += hostCoinsAwarded;
      hostPlayer.rankPoints += hostRpDelta;
      hostPlayer.matchesPlayed += 1;
      if (hostRpDelta === 3) hostPlayer.matchesWon += 1;
      else if (hostRpDelta === 1) hostPlayer.matchesDrawn += 1;
      else hostPlayer.matchesLost += 1;
      this.recordCoinTransaction({
        userId: hostPlayer.id,
        accountId: hostPlayer.accountId,
        username: hostPlayer.username,
        amount: hostCoinsAwarded,
        beforeBalance: before,
        afterBalance: hostPlayer.coins,
        reason: `مكافأة مباراة غرفة أونلاين (#${params.roomCode})`,
      });
    }

    // Credit Guest on Server
    const guestPlayer = this.state.players[params.guestId];
    if (guestPlayer) {
      const before = guestPlayer.coins;
      guestPlayer.coins += guestCoinsAwarded;
      guestPlayer.rankPoints += guestRpDelta;
      guestPlayer.matchesPlayed += 1;
      if (guestRpDelta === 3) guestPlayer.matchesWon += 1;
      else if (guestRpDelta === 1) guestPlayer.matchesDrawn += 1;
      else guestPlayer.matchesLost += 1;
      this.recordCoinTransaction({
        userId: guestPlayer.id,
        accountId: guestPlayer.accountId,
        username: guestPlayer.username,
        amount: guestCoinsAwarded,
        beforeBalance: before,
        afterBalance: guestPlayer.coins,
        reason: `مكافأة مباراة غرفة أونلاين (#${params.roomCode})`,
      });
    }

    const hostAcc = hostPlayer?.accountId || deriveGxAccountId(params.hostId);
    const guestAcc = guestPlayer?.accountId || deriveGxAccountId(params.guestId);

    const record: GoalixLeagueMatchRecord = {
      id: matchKey,
      rewardTransactionId,
      roomCode: params.roomCode,
      gameId: params.gameId,
      mode: params.mode,
      hostId: params.hostId,
      hostAccountId: hostAcc,
      hostName: params.hostName,
      hostSquadOvr: params.hostSquadOvr || 85,
      guestId: params.guestId,
      guestAccountId: guestAcc,
      guestName: params.guestName,
      guestSquadOvr: params.guestSquadOvr || 85,
      hostGoals: Math.max(0, Math.floor(params.hostGoals)),
      guestGoals: Math.max(0, Math.floor(params.guestGoals)),
      winnerId,
      timestamp: Date.now(),
    };

    this.state.roomMatches.unshift(record);
    this.state.roomMatches = this.state.roomMatches.slice(0, 500);
    this.saveState();

    return {
      matchRecord: record,
      hostCoinsAwarded,
      guestCoinsAwarded,
      hostRpDelta,
      guestRpDelta,
    };
  }

  public getLeagueStandings(): {
    daily: GoalixLeagueStandingRow[];
    weekly: GoalixLeagueStandingRow[];
    recentMatches: GoalixLeagueMatchRecord[];
    dailyResetAt: number;
    weeklyResetAt: number;
    totalRegisteredPlayers: number;
  } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dailyResetAt = startOfDay + 24 * 60 * 60 * 1000;

    const dayOfWeek = now.getDay();
    const daysSinceSaturday = (dayOfWeek + 1) % 7;
    const startOfWeek =
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      daysSinceSaturday * 24 * 60 * 60 * 1000;
    const weeklyResetAt = startOfWeek + 7 * 24 * 60 * 60 * 1000;

    const buildTable = (minTimestamp: number): GoalixLeagueStandingRow[] => {
      const map = new Map<string, GoalixLeagueStandingRow>();

      Object.values(this.state.players).forEach((p) => {
        if (!p.id || p.id.startsWith('bot_')) return;
        map.set(p.id, {
          playerId: p.id,
          accountId: p.accountId || deriveGxAccountId(p.id),
          playerName: p.username || 'لاعب جولكس',
          avatar: p.avatar,
          squadOvr: p.squadOvr || 85,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          points: 0,
          form: [],
          lastPlayedAt: p.updatedAt || 0,
        });
      });

      const periodMatches = this.state.roomMatches
        .filter((m) => m.timestamp >= minTimestamp)
        .slice()
        .reverse();

      for (const m of periodMatches) {
        if (m.hostId && !m.hostId.startsWith('bot_')) {
          if (!map.has(m.hostId)) {
            map.set(m.hostId, {
              playerId: m.hostId,
              accountId: m.hostAccountId || deriveGxAccountId(m.hostId),
              playerName: m.hostName || 'مضيف الغرفة',
              squadOvr: m.hostSquadOvr || 85,
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDiff: 0,
              points: 0,
              form: [],
              lastPlayedAt: m.timestamp,
            });
          }
          const hRow = map.get(m.hostId)!;
          hRow.playerName = m.hostName || hRow.playerName;
          if (m.hostSquadOvr) hRow.squadOvr = m.hostSquadOvr;
          hRow.played += 1;
          hRow.goalsFor += m.hostGoals;
          hRow.goalsAgainst += m.guestGoals;
          hRow.goalDiff = hRow.goalsFor - hRow.goalsAgainst;
          hRow.lastPlayedAt = Math.max(hRow.lastPlayedAt, m.timestamp);

          if (m.hostGoals > m.guestGoals) {
            hRow.wins += 1;
            hRow.points += 3;
            hRow.form.push('W');
          } else if (m.hostGoals === m.guestGoals) {
            hRow.draws += 1;
            hRow.points += 1;
            hRow.form.push('D');
          } else {
            hRow.losses += 1;
            hRow.form.push('L');
          }
          hRow.form = hRow.form.slice(-5);
        }

        if (m.guestId && !m.guestId.startsWith('bot_')) {
          if (!map.has(m.guestId)) {
            map.set(m.guestId, {
              playerId: m.guestId,
              accountId: m.guestAccountId || deriveGxAccountId(m.guestId),
              playerName: m.guestName || 'ضيف الغرفة',
              squadOvr: m.guestSquadOvr || 85,
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDiff: 0,
              points: 0,
              form: [],
              lastPlayedAt: m.timestamp,
            });
          }
          const gRow = map.get(m.guestId)!;
          gRow.playerName = m.guestName || gRow.playerName;
          if (m.guestSquadOvr) gRow.squadOvr = m.guestSquadOvr;
          gRow.played += 1;
          gRow.goalsFor += m.guestGoals;
          gRow.goalsAgainst += m.hostGoals;
          gRow.goalDiff = gRow.goalsFor - gRow.goalsAgainst;
          gRow.lastPlayedAt = Math.max(gRow.lastPlayedAt, m.timestamp);

          if (m.guestGoals > m.hostGoals) {
            gRow.wins += 1;
            gRow.points += 3;
            gRow.form.push('W');
          } else if (m.guestGoals === m.hostGoals) {
            gRow.draws += 1;
            gRow.points += 1;
            gRow.form.push('D');
          } else {
            gRow.losses += 1;
            gRow.form.push('L');
          }
          gRow.form = gRow.form.slice(-5);
        }
      }

      return Array.from(map.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.played !== a.played) return b.played - a.played;
        return b.squadOvr - a.squadOvr;
      });
    };

    return {
      daily: buildTable(startOfDay),
      weekly: buildTable(startOfWeek),
      recentMatches: this.state.roomMatches.slice(0, 25),
      dailyResetAt,
      weeklyResetAt,
      totalRegisteredPlayers: Object.keys(this.state.players).length,
    };
  }

  // ==================== OWNER ADMIN DASHBOARD & STORE MANAGEMENT ====================

  public getAdminDashboardState(ownerUserId?: string, ownerEmail?: string) {
    if (!this.verifyOwnerAuthority(ownerUserId, ownerEmail)) {
      this.logSecurityEvent({
        userId: ownerUserId || 'anonymous',
        email: ownerEmail,
        action: 'GET_ADMIN_DASHBOARD',
        status: 'DENIED_403',
        details: 'محاولة وصول غير مصرح بها إلى لوحة تحكم المالك (403 Access Denied)',
      });
      throw new Error('403 Access Denied');
    }

    return {
      users: Object.values(this.state.players).sort((a, b) => b.updatedAt - a.updatedAt),
      purchaseRequests: this.state.purchaseRequests,
      storeProducts: this.state.storeProducts,
      quickChatCatalog: this.state.quickChatCatalog,
      coinTransactions: this.state.coinTransactions.slice(0, 150),
      securityLogs: this.state.securityLogs.slice(0, 150),
      roomMatches: this.state.roomMatches.slice(0, 50),
      topUpPackages: this.state.topUpPackages,
      topUpTransactions: this.state.topUpTransactions.slice(0, 100),
    };
  }

  public saveStoreProductByOwner(params: {
    ownerUserId?: string;
    ownerEmail?: string;
    product: Partial<StoreProductItem>;
  }): StoreProductItem[] {
    if (!this.verifyOwnerAuthority(params.ownerUserId, params.ownerEmail)) {
      this.logSecurityEvent({
        userId: params.ownerUserId || 'unknown',
        email: params.ownerEmail,
        action: 'SAVE_STORE_PRODUCT',
        status: 'DENIED_403',
        details: 'محاولة تعديل منتجات المتجر بدون صلاحية المالك',
      });
      throw new Error('403 Access Denied');
    }

    const p = params.product;
    const item: StoreProductItem = {
      id: p.id || `prod_${Date.now()}`,
      section: (p.section as StoreSectionType) || 'PACKS',
      nameAr: (p.nameAr || 'منتج جديد').trim(),
      descriptionAr: (p.descriptionAr || 'منتج رسمي في متجر GOALIX').trim(),
      priceCoins: Math.max(1, Math.floor(Number(p.priceCoins) || 100)),
      rarity: (p.rarity as PackRarityTier) || 'Rare',
      packTier: p.packTier,
      chatMessageId: p.chatMessageId,
      effectStyle: p.effectStyle,
      badgeTextAr: p.badgeTextAr,
      minOvr: p.minOvr,
      featured: Boolean(p.featured),
      limited: Boolean(p.limited),
      enabled: p.enabled !== undefined ? Boolean(p.enabled) : true,
      hidden: Boolean(p.hidden),
    };

    const idx = this.state.storeProducts.findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      this.state.storeProducts[idx] = item;
    } else {
      this.state.storeProducts.unshift(item);
    }
    this.saveState();
    return this.state.storeProducts;
  }

  public deleteStoreProductByOwner(params: {
    ownerUserId?: string;
    ownerEmail?: string;
    productId: string;
  }): StoreProductItem[] {
    if (!this.verifyOwnerAuthority(params.ownerUserId, params.ownerEmail)) {
      throw new Error('403 Access Denied');
    }
    this.state.storeProducts = this.state.storeProducts.filter((p) => p.id !== params.productId);
    this.saveState();
    return this.state.storeProducts;
  }

  public saveQuickChatItemByOwner(params: {
    ownerUserId?: string;
    ownerEmail?: string;
    item: Partial<QuickChatMessageItem>;
  }): QuickChatMessageItem[] {
    if (!this.verifyOwnerAuthority(params.ownerUserId, params.ownerEmail)) {
      throw new Error('403 Access Denied');
    }
    const m = params.item;
    const entry: QuickChatMessageItem = {
      id: m.id || `msg_${Date.now()}`,
      textAr: (m.textAr || 'رسالة جديدة 🔥').trim(),
      category: (m.category as QuickChatCategory) || 'SPECIAL',
      categoryLabelAr: (m.categoryLabelAr || 'رسائل مميزة').trim(),
      priceCoins: Math.max(10, Math.floor(Number(m.priceCoins) || 150)),
      rarity: (m.rarity as PackRarityTier) || 'Rare',
      featured: Boolean(m.featured),
      enabled: m.enabled !== undefined ? Boolean(m.enabled) : true,
      isStarterOwned: Boolean(m.isStarterOwned),
    };
    const idx = this.state.quickChatCatalog.findIndex((x) => x.id === entry.id);
    if (idx >= 0) {
      this.state.quickChatCatalog[idx] = entry;
    } else {
      this.state.quickChatCatalog.push(entry);
    }
    this.saveState();
    return this.state.quickChatCatalog;
  }

  public deleteQuickChatItemByOwner(params: {
    ownerUserId?: string;
    ownerEmail?: string;
    messageId: string;
  }): QuickChatMessageItem[] {
    if (!this.verifyOwnerAuthority(params.ownerUserId, params.ownerEmail)) {
      throw new Error('403 Access Denied');
    }
    this.state.quickChatCatalog = this.state.quickChatCatalog.filter(
      (m) => m.id !== params.messageId
    );
    this.saveState();
    return this.state.quickChatCatalog;
  }

  public getStoreState(): {
    packages: TopUpPackageItem[];
    transactions: TopUpTransactionRecord[];
    players: SyncedPlayerAccount[];
    products: StoreProductItem[];
    chatMessages: QuickChatMessageItem[];
  } {
    const playersList = Object.values(this.state.players).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
    return {
      packages: this.state.topUpPackages,
      transactions: this.state.topUpTransactions.slice(0, 50),
      players: playersList,
      products: this.state.storeProducts.filter((p) => !p.hidden && p.enabled),
      chatMessages: this.state.quickChatCatalog.filter((m) => m.enabled),
    };
  }

  public searchPlayers(query: string): SyncedPlayerAccount[] {
    const clean = (query || '').trim().toUpperCase();
    const all = Object.values(this.state.players).sort((a, b) => b.updatedAt - a.updatedAt);
    if (!clean) return all;

    const digitsOnly = clean.replace(/[^0-9]/g, '');

    return all.filter((p) => {
      const accUpper = (p.accountId || '').toUpperCase();
      const idUpper = (p.id || '').toUpperCase();
      const nameUpper = (p.username || '').toUpperCase();
      if (accUpper === clean || idUpper === clean) return true;
      if (accUpper.includes(clean) || idUpper.includes(clean) || nameUpper.includes(clean)) {
        return true;
      }
      if (digitsOnly.length >= 3 && accUpper.includes(digitsOnly)) {
        return true;
      }
      return false;
    });
  }

  public executeOwnerTopUp(params: {
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
  }): {
    player: SyncedPlayerAccount;
    transaction: TopUpTransactionRecord;
    grant: PendingGrantItem;
  } {
    const rawTarget = (params.targetQueryId || '').trim();
    if (!rawTarget) {
      throw new Error('يرجى إدخال الأيدي (Account ID) الخاص باللاعب أولاً');
    }

    const amount = Math.max(0, Math.floor(Number(params.coinsAmount) || 0));
    if (params.operation !== 'set' && amount <= 0 && !params.bonusPackTier && !params.bonusChestTier) {
      throw new Error('يرجى تحديد عدد الكوينز أو اختيار باقة صالحة');
    }

    const matches = this.searchPlayers(rawTarget);
    let targetPlayer: SyncedPlayerAccount | undefined = matches.find(
      (p) =>
        p.id.toUpperCase() === rawTarget.toUpperCase() ||
        p.accountId.toUpperCase() === rawTarget.toUpperCase() ||
        p.accountId.replace('GX-', '') === rawTarget.replace(/[^0-9]/g, '')
    );

    if (!targetPlayer && matches.length > 0) {
      targetPlayer = matches[0];
    }

    if (!targetPlayer) {
      const cleanGx = deriveGxAccountId(rawTarget);
      targetPlayer = {
        id: cleanGx,
        accountId: cleanGx,
        username: `لاعب (${cleanGx})`,
        coins: 150,
        rankPoints: 0,
        squadOvr: 84,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        ownedCardsCount: 14,
        updatedAt: Date.now(),
      };
      this.state.players[targetPlayer.id] = targetPlayer;
    }

    const previousBalance = targetPlayer.coins;
    let newBalance = previousBalance;
    if (params.operation === 'set') {
      newBalance = amount;
    } else if (params.operation === 'deduct') {
      newBalance = Math.max(0, previousBalance - amount);
    } else {
      newBalance = previousBalance + amount;
    }

    const coinsDelta = newBalance - previousBalance;
    targetPlayer.coins = newBalance;
    targetPlayer.updatedAt = Date.now();
    this.state.players[targetPlayer.id] = targetPlayer;

    const packageLabel =
      params.packageNameAr ||
      (params.operation === 'set'
        ? `تعديل رصيد مباشر (${amount.toLocaleString()} كوينز)`
        : params.operation === 'deduct'
        ? `خصم إداري (${amount.toLocaleString()} كوينز)`
        : `شحن رصيد من الإدارة (${amount.toLocaleString()} كوينز)`);

    this.recordCoinTransaction({
      userId: targetPlayer.id,
      accountId: targetPlayer.accountId,
      username: targetPlayer.username,
      amount: coinsDelta,
      beforeBalance: previousBalance,
      afterBalance: newBalance,
      reason: params.noteAr || packageLabel,
    });

    const grantId = `gr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const grant: PendingGrantItem = {
      id: grantId,
      operation: params.operation,
      coinsAmount: amount,
      packageNameAr: packageLabel,
      bonusPackTier: params.bonusPackTier,
      bonusChestTier: params.bonusChestTier,
      noteAr: params.noteAr,
      timestamp: Date.now(),
    };

    this.pushPendingGrant(targetPlayer.id, grant);

    const tx: TopUpTransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      targetPlayerId: targetPlayer.id,
      targetAccountId: targetPlayer.accountId,
      targetPlayerName: targetPlayer.username,
      operation: params.operation,
      coinsDelta,
      previousBalance,
      newBalance,
      packageId: params.packageId,
      packageNameAr: packageLabel,
      bonusPackTier: params.bonusPackTier,
      bonusChestTier: params.bonusChestTier,
      noteAr: params.noteAr,
      timestamp: Date.now(),
    };

    this.state.topUpTransactions.unshift(tx);
    this.state.topUpTransactions = this.state.topUpTransactions.slice(0, 150);
    this.saveState();

    return {
      player: targetPlayer,
      transaction: tx,
      grant,
    };
  }

  public saveTopUpPackage(pkg: TopUpPackageItem): TopUpPackageItem[] {
    const cleanPkg: TopUpPackageItem = {
      id: pkg.id || `pkg_${Date.now()}`,
      nameAr: (pkg.nameAr || 'باقة شحن جولكس').trim(),
      coinsAmount: Math.max(10, Math.floor(Number(pkg.coinsAmount) || 500)),
      bonusCoins: Math.max(0, Math.floor(Number(pkg.bonusCoins) || 0)),
      bonusPackTier: pkg.bonusPackTier,
      bonusChestTier: pkg.bonusChestTier,
      priceTextAr: (pkg.priceTextAr || '100 ج.م').trim(),
      badgeAr: pkg.badgeAr?.trim() || undefined,
      theme: pkg.theme || 'gold',
    };

    const idx = this.state.topUpPackages.findIndex((p) => p.id === cleanPkg.id);
    if (idx >= 0) {
      this.state.topUpPackages[idx] = cleanPkg;
    } else {
      this.state.topUpPackages.push(cleanPkg);
    }
    this.saveState();
    return this.state.topUpPackages;
  }

  public deleteTopUpPackage(packageId: string): TopUpPackageItem[] {
    this.state.topUpPackages = this.state.topUpPackages.filter((p) => p.id !== packageId);
    if (this.state.topUpPackages.length === 0) {
      this.state.topUpPackages = [...DEFAULT_TOPUP_PACKAGES];
    }
    this.saveState();
    return this.state.topUpPackages;
  }
}

export const leagueAndStoreManager = new LeagueAndStoreManager();
