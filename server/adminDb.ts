// Server Database, Admin, Authentication & Store Management Service
import fs from 'fs';
import path from 'path';
import { CardTier, StoreProduct, PurchaseRecord, StoreCategory, ItemRarity } from '../src/types/game';
import { openPackReward } from '../src/data/players';

export interface DbUser {
  id: string;
  accountId: string; // Permanent Unique ID e.g. GX-849271
  username: string;
  email?: string;
  googleId?: string;
  passwordHash: string;
  role: 'admin' | 'player';
  coins: number;
  bids: number;
  points: number; // Rank Points
  avatar: string;
  inventory: string[];
  purchaseHistory: PurchaseRecord[];
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  createdAt: number;
  lastLogin: number;
}

export interface MatchLog {
  id: string;
  roomCode: string;
  hostName: string;
  guestName: string;
  score: string;
  winner: string;
  timestamp: number;
}

export interface AdminActionLog {
  id: string;
  adminId: string;
  action: string;
  targetAccountId?: string;
  targetUsername?: string;
  details: string;
  timestamp: number;
}

// Initial 7-Category Store Catalog
export const INITIAL_STORE_PRODUCTS: StoreProduct[] = [
  // 1. 🪙 Coins Packages
  {
    id: 'coins_500',
    name: 'Bronze Coins Pouch',
    nameAr: 'حزمة كوينز برونزية (500 كوينز)',
    category: 'coins',
    price: 500,
    rarity: 'common',
    description: 'Grant 500 Coins directly to your account',
    descriptionAr: 'رصيد 500 كوينز للاستخدام في فتح الحزم وشراء عناصر المتجر الفاخرة.',
    image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=300&q=80',
    icon: 'Coins',
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 42
  },
  {
    id: 'coins_1500',
    name: 'Silver Coins Chest',
    nameAr: 'صندوق كوينز فضي (1500 كوينز)',
    category: 'coins',
    price: 1500,
    rarity: 'rare',
    description: 'Grant 1500 Coins with a 15% bonus value',
    descriptionAr: 'رصيد 1500 كوينز مثالي لاقتناء حزم النخبة وإطارات الشات الحصرية.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80',
    icon: 'Sparkles',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 95
  },
  {
    id: 'coins_3500',
    name: 'Golden Coins Vault',
    nameAr: 'خزينة كوينز ذهبية (3500 كوينز)',
    category: 'coins',
    price: 3500,
    rarity: 'epic',
    description: 'Grant 3500 Coins for true football masters',
    descriptionAr: 'خزينة ذهبية ضخمة تمنحك 3500 كوينز لشراء كل ما ترغب به في GOALIX.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
    icon: 'Crown',
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 28
  },

  // 2. 🎁 Packs (3D Boxes)
  {
    id: 'pack_weekly',
    name: 'Weekly Booster Pack',
    nameAr: 'حزمة الأسبوع (Weekly Pack)',
    category: 'packs',
    price: 50,
    rarity: 'common',
    description: '77-85 OVR Current Season Top Stars',
    descriptionAr: 'نجوم الدوريات الكبرى المتألقون هذا الأسبوع بتقييم 77 إلى 85 OVR.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
    tier: 'WEEKLY',
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 140
  },
  {
    id: 'pack_elite',
    name: 'Elite Rush Vault',
    nameAr: 'نخبة العالم (Elite Rush Pack)',
    category: 'packs',
    price: 250,
    rarity: 'epic',
    description: '86-95 OVR World-Class Superstars',
    descriptionAr: 'صفوة نجوم العالم وأبرز المرشحين للكرة الذهبية بتقييم 86 إلى 95 OVR.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80',
    tier: 'ELITE',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 215
  },
  {
    id: 'pack_icon',
    name: 'Icon Legacy Masterpiece',
    nameAr: 'أساطير المستديرة (Icon Legacy Pack)',
    category: 'packs',
    price: 500,
    rarity: 'legendary',
    description: '96-105 OVR All-Time Legendary Icons',
    descriptionAr: 'أعظم أساطير كرة القدم عبر التاريخ (بيليه، مارادونا، زيدان، رونالدينيو).',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=300&q=80',
    tier: 'ICON',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 180
  },

  // 3. 💬 Chat Messages
  {
    id: 'chat_hattrick',
    name: 'Hattrick Hero Message',
    nameAr: 'شعار: هاتريك تاريخي يا كابتن! ⚽⚽⚽',
    category: 'chat_messages',
    price: 80,
    rarity: 'common',
    description: 'Celebrate scoring or winning rounds with flair',
    descriptionAr: 'عبارة صوتية ونصية حماسية تظهر في شات الغرفة عند تسجيل الأهداف.',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 52
  },
  {
    id: 'chat_guardiola',
    name: 'Tactical Genius Message',
    nameAr: 'شعار: تكتيك جوارديولا لا يرحم! 🧠',
    category: 'chat_messages',
    price: 100,
    rarity: 'rare',
    description: 'Assert tactical dominance in online matches',
    descriptionAr: 'استفزاز تكتيكي راقٍ يؤكد تفوق خطتك وقراءتك لأسئلة المنافس.',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 39
  },
  {
    id: 'chat_crossbar',
    name: 'Crossbar Luck Message',
    nameAr: 'شعار: القائم والعارضة أصدقائي اليوم! 🥅',
    category: 'chat_messages',
    price: 90,
    rarity: 'common',
    description: 'Use when surviving close calls or simulation saves',
    descriptionAr: 'شعار شات خفيف الظل يظهر عند تفادي الهزائم بفارق ضئيل.',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 31
  },
  {
    id: 'chat_remontada',
    name: 'Last Minute Remontada',
    nameAr: 'شعار: ريمونتادا في الثواني الأخيرة! ⏳🔥',
    category: 'chat_messages',
    price: 120,
    rarity: 'epic',
    description: 'Epic comeback shoutout in live rooms',
    descriptionAr: 'رسالة نارية عند قلب النتيجة في الجولات الحاسمة للمباراة.',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 68
  },

  // 4. ✨ Chat Effects
  {
    id: 'effect_fire',
    name: 'Blazing Aura Effect',
    nameAr: 'تأثير: شعلة اللهب المتوهجة (Blazing Aura)',
    category: 'chat_effects',
    price: 300,
    rarity: 'epic',
    description: 'Glow messages with fiery animated embers in room chat',
    descriptionAr: 'يحول رسائلك في الشات إلى لهب متقد بألوان برتقالية نارية متوهجة.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 84
  },
  {
    id: 'effect_thunder',
    name: 'Thunderbolt Spark',
    nameAr: 'تأثير: الصاعقة الكهربائية (Thunder Spark)',
    category: 'chat_effects',
    price: 350,
    rarity: 'epic',
    description: 'Electric blue storm ripples across your messages',
    descriptionAr: 'صواعق زرقاء سايبرانية تحيط باسمك ورسائلك داخل غرف اللعب.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 46
  },
  {
    id: 'effect_royal_crown',
    name: 'Royal Gold Crown Effect',
    nameAr: 'تأثير: التاج الملكي المذهب (Royal Gold)',
    category: 'chat_effects',
    price: 450,
    rarity: 'legendary',
    description: 'Golden royal glow and crown particle effects',
    descriptionAr: 'تاج ملكي ذهبي يلمع فوق كل رسالة مع بريق ذهبي فاخر.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 62
  },

  // 5. 🖼️ Profile Items
  {
    id: 'frame_gold_24k',
    name: '24K Gold Champion Frame',
    nameAr: 'إطار الأساطير الذهبي 24K (Champion Frame)',
    category: 'profile_items',
    price: 400,
    rarity: 'legendary',
    description: 'Gleaming 24K gold border around your profile avatar',
    descriptionAr: 'إطار ذهبي نقي ثلاثي الأبعاد يحيط بصورتك الشخصية في كل مكان باللعبة.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 77
  },
  {
    id: 'frame_cyber_neon',
    name: 'Cyberpunk Neon Ring',
    nameAr: 'إطار السايبربانك النيون (Neon Ring Frame)',
    category: 'profile_items',
    price: 350,
    rarity: 'rare',
    description: 'Futuristic cyan and magenta pulsing avatar frame',
    descriptionAr: 'حلقة نيون زرقاء سماوية تنبض حول صورتك الشخصية.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 51
  },
  {
    id: 'bg_wembley',
    name: 'Wembley Night Stadium Backdrop',
    nameAr: 'خلفية: ستاد ويمبلي الليلي (Wembley Night)',
    category: 'profile_items',
    price: 250,
    rarity: 'rare',
    description: 'Illuminated Wembley pitch background for your profile',
    descriptionAr: 'خلفية مهيبة لأضواء ستاد ويمبلي الشهير تتصدر ملفك الشخصي.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 38
  },
  {
    id: 'badge_goat',
    name: 'GOAT Certified Crest',
    nameAr: 'شارة: بطل القرن الكروي (GOAT Certified)',
    category: 'profile_items',
    price: 500,
    rarity: 'legendary',
    description: 'Official crest proving absolute football supremacy',
    descriptionAr: 'وسام رسمي يظهر بجانب اسمك يؤكد تصنيفك كأحد أعظم المدربين.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isNew: false,
    isActive: true,
    purchasedCount: 44
  },

  // 6. 🏆 Special Items
  {
    id: 'title_tactician',
    name: 'Master Tactician Title',
    nameAr: 'لقب: الأستاذ التكتيكي (Tactical Master)',
    category: 'special_items',
    price: 300,
    rarity: 'rare',
    description: 'Exclusive title displayed below your username in rooms',
    descriptionAr: 'لقب فخري يظهر تحت اسمك في الغرف وجداول الترتيب.',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: false,
    isActive: true,
    purchasedCount: 29
  },
  {
    id: 'shield_clasico',
    name: 'El Clasico Honorary Shield',
    nameAr: 'درع الكلاسيكو الفخري (El Clasico Shield)',
    category: 'special_items',
    price: 400,
    rarity: 'epic',
    description: 'Commemorative shield badge for your collection showcase',
    descriptionAr: 'درع تذكاري نادٍ مخصص للمدربين ذوي الخبرة التكتيكية.',
    image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=300&q=80',
    isFeatured: false,
    isNew: true,
    isActive: true,
    purchasedCount: 22
  },

  // 7. 🔥 Limited Items
  {
    id: 'limited_founder_2026',
    name: 'GOALIX 2026 Founder Edition',
    nameAr: 'شارة المؤسس الذهبية GOALIX 2026 (Founder Edition)',
    category: 'limited_items',
    price: 800,
    rarity: 'mythic',
    description: 'Ultra rare permanent commemorative badge for early supporters',
    descriptionAr: 'إصدار محدود ونادر جداً يمنحك شارة المؤسس الذهبية المعتمدة لعام 2026.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isLimited: true,
    isNew: true,
    isActive: true,
    purchasedCount: 16,
    stock: 50
  },
  {
    id: 'limited_secret_icon',
    name: 'Secret Mythic Voucher',
    nameAr: 'قسيمة أسطورة سرية خارقة (Mythic Icon Pass)',
    category: 'limited_items',
    price: 1000,
    rarity: 'mythic',
    description: 'Direct ticket granting guaranteed 100+ OVR Icon Legend',
    descriptionAr: 'تذكرة حصرية مضمونة تمنحك لاعباً أسطورياً خارقاً بتقييم يفوق 100 OVR فوراً.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80',
    isFeatured: true,
    isLimited: true,
    isNew: false,
    isActive: true,
    purchasedCount: 12,
    stock: 25
  }
];

class AdminDatabase {
  private users: Map<string, DbUser> = new Map();
  private products: Map<string, StoreProduct> = new Map();
  private matchLogs: MatchLog[] = [];
  private adminLogs: AdminActionLog[] = [];
  private dbFilePath: string = path.resolve('server_db_store.json');

  constructor() {
    this.initDefaultProducts();
    this.loadFromDisk();
    this.ensureAdminUser();
    this.migrateAccountIds();
  }

  private initDefaultProducts() {
    INITIAL_STORE_PRODUCTS.forEach(p => {
      this.products.set(p.id, { ...p });
    });
  }

  private generateAccountId(): string {
    let id: string;
    do {
      // 6 digits format: GX-XXXXXX
      const rand = Math.floor(100000 + Math.random() * 900000);
      id = `GX-${rand}`;
    } while (Array.from(this.users.values()).some(u => u.accountId === id));
    return id;
  }

  private migrateAccountIds() {
    let modified = false;
    this.users.forEach(user => {
      if (!user.accountId) {
        user.accountId = this.generateAccountId();
        modified = true;
      }
      if (!Array.isArray(user.inventory)) {
        user.inventory = [];
        modified = true;
      }
      if (!Array.isArray(user.purchaseHistory)) {
        user.purchaseHistory = [];
        modified = true;
      }
      if (typeof user.matchesDrawn !== 'number') {
        user.matchesDrawn = 0;
        modified = true;
      }
      if (typeof user.matchesLost !== 'number') {
        user.matchesLost = Math.max(0, user.matchesPlayed - user.matchesWon);
        modified = true;
      }
    });
    if (modified) {
      this.saveToDisk();
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach((u: DbUser) => this.users.set(u.id, u));
        }
        if (data.products && Array.isArray(data.products)) {
          data.products.forEach((p: StoreProduct) => this.products.set(p.id, p));
        }
        if (data.matchLogs && Array.isArray(data.matchLogs)) {
          this.matchLogs = data.matchLogs;
        }
        if (data.adminLogs && Array.isArray(data.adminLogs)) {
          this.adminLogs = data.adminLogs;
        }
      }
    } catch {
      // Memory fallback
    }
  }

  public saveToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        products: Array.from(this.products.values()),
        matchLogs: this.matchLogs.slice(-200),
        adminLogs: this.adminLogs.slice(-200),
        lastBackup: Date.now()
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Disk write error handled
    }
  }

  private ensureAdminUser() {
    const adminId = 'dev_mahmoud_salama';
    if (!this.users.has(adminId)) {
      this.users.set(adminId, {
        id: adminId,
        accountId: 'GX-999999',
        username: 'محمود أحمد سلامة',
        email: 'admin@goalix.pro',
        passwordHash: 'salama2026',
        role: 'admin',
        coins: 99999,
        bids: 999,
        points: 99,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        inventory: ['frame_gold_24k', 'effect_royal_crown', 'badge_goat', 'limited_founder_2026'],
        purchaseHistory: [],
        matchesPlayed: 35,
        matchesWon: 33,
        matchesDrawn: 2,
        matchesLost: 0,
        createdAt: 1700000000000,
        lastLogin: Date.now()
      });
      this.saveToDisk();
    }
  }

  // ================= USER ACCOUNT MANAGEMENT =================
  public registerUser(username: string, passwordHash: string, avatar?: string, email?: string): DbUser {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      throw new Error('يرجى إدخال اسم المدرب');
    }

    const existing = Array.from(this.users.values()).find(
      u => u.username.trim().toLowerCase() === cleanUsername.toLowerCase()
    );
    if (existing) {
      throw new Error('اسم المستخدم مسجل بالفعل، يرجى اختيار اسم آخر أو تسجيل الدخول');
    }

    const newUser: DbUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accountId: this.generateAccountId(),
      username: cleanUsername,
      email,
      passwordHash: passwordHash || '123456',
      role: 'player',
      coins: 100, // Welcome grant
      bids: 20,
      points: 0,
      avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      inventory: [],
      purchaseHistory: [],
      matchesPlayed: 0,
      matchesWon: 0,
      matchesDrawn: 0,
      matchesLost: 0,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }

  public authenticate(usernameOrAccountId: string, passwordHash: string): DbUser | null {
    const query = usernameOrAccountId.trim().toLowerCase();

    // Check developer bypass
    if (
      query === 'محمود أحمد سلامة' || 
      query === 'محمود سلامه' || 
      query === 'admin' || 
      query === 'salama' ||
      query === 'gx-999999'
    ) {
      if (passwordHash === 'salama2026' || passwordHash === 'admin' || passwordHash === '123456') {
        const admin = this.users.get('dev_mahmoud_salama');
        if (admin) {
          admin.lastLogin = Date.now();
          return admin;
        }
      }
    }

    const user = Array.from(this.users.values()).find(
      u => (u.username.trim().toLowerCase() === query || u.accountId.toLowerCase() === query) &&
           u.passwordHash === passwordHash
    );

    if (user) {
      user.lastLogin = Date.now();
      this.saveToDisk();
      return user;
    }
    return null;
  }

  /**
   * Google Sign-In & Instant Account Linking
   */
  public handleGoogleLogin(data: { googleId: string; email: string; name: string; avatar?: string }): DbUser {
    const { googleId, email, name, avatar } = data;

    // 1. Look up by googleId or email
    let user = Array.from(this.users.values()).find(
      u => (u.googleId && u.googleId === googleId) || (u.email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (user) {
      user.lastLogin = Date.now();
      if (!user.googleId) user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      this.saveToDisk();
      return user;
    }

    // 2. Otherwise auto-register new account with unique username
    let chosenUsername = (name || email.split('@')[0] || 'كابتن جواليكس').trim();
    let collision = Array.from(this.users.values()).some(
      u => u.username.toLowerCase() === chosenUsername.toLowerCase()
    );
    if (collision) {
      chosenUsername = `${chosenUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const newUser: DbUser = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      accountId: this.generateAccountId(),
      username: chosenUsername,
      email: email.toLowerCase(),
      googleId,
      passwordHash: 'google_oauth_auth',
      role: 'player',
      coins: 150, // Welcome bonus for Google players
      bids: 25,
      points: 0,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      inventory: [],
      purchaseHistory: [],
      matchesPlayed: 0,
      matchesWon: 0,
      matchesDrawn: 0,
      matchesLost: 0,
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }

  public updateUsername(userId: string, newUsername: string): DbUser {
    const user = this.users.get(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    const clean = newUsername.trim();
    if (!clean) throw new Error('يرجى إدخال اسم مستخدم صالح');

    // Check if taken by someone else
    const collision = Array.from(this.users.values()).find(
      u => u.id !== userId && u.username.trim().toLowerCase() === clean.toLowerCase()
    );
    if (collision) {
      throw new Error(`الاسم "${clean}" مستخدم بالفعل من قبل مدرب آخر! يرجى اختيار اسم فريد.`);
    }

    user.username = clean;
    this.saveToDisk();
    return user;
  }

  public updateAvatar(userId: string, avatarUrl: string): DbUser {
    const user = this.users.get(userId);
    if (!user) throw new Error('المستخدم غير موجود');
    user.avatar = avatarUrl.trim();
    this.saveToDisk();
    return user;
  }

  public getUser(idOrAccountId: string): DbUser | undefined {
    // Lookup by user ID
    if (this.users.has(idOrAccountId)) {
      return this.users.get(idOrAccountId);
    }
    // Lookup by Account ID (e.g. GX-849271) or Username
    const query = idOrAccountId.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      u => u.accountId.toLowerCase() === query || u.username.toLowerCase() === query
    );
  }

  public getAllUsers(): DbUser[] {
    return Array.from(this.users.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  // ================= STORE & SERVER-SIDE PURCHASES =================
  public getStoreProducts(category?: StoreCategory): StoreProduct[] {
    const list = Array.from(this.products.values()).filter(p => p.isActive !== false);
    if (category) {
      return list.filter(p => p.category === category);
    }
    return list;
  }

  public getProductById(id: string): StoreProduct | undefined {
    return this.products.get(id);
  }

  /**
   * Authoritative Server-Side Purchase Transaction
   */
  public purchaseProduct(userId: string, productId: string): { 
    success: boolean; 
    user: DbUser; 
    purchase: PurchaseRecord; 
    rewardPlayer?: any; 
  } {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود على السيرفر');
    }

    const product = this.products.get(productId);
    if (!product || product.isActive === false) {
      throw new Error('هذا المنتج غير متاح حالياً في المتجر');
    }

    // Check if item is non-consumable and already owned
    const nonConsumableCategories: StoreCategory[] = ['chat_effects', 'profile_items', 'special_items', 'limited_items'];
    if (nonConsumableCategories.includes(product.category) && user.inventory?.includes(productId)) {
      throw new Error('✓ هذا العنصر مملوك لك بالفعل!');
    }

    // Verify Server-Side Coins Balance
    if (user.coins < product.price) {
      throw new Error(`Coins غير كافية لإتمام الشراء (المطلوب: ${product.price} كوينز · رصيدك الحالي: ${user.coins})`);
    }

    // Deduct coins on the server
    user.coins -= product.price;

    // Add to user's server inventory if not already in it
    if (!user.inventory.includes(productId)) {
      user.inventory.push(productId);
    }

    product.purchasedCount = (product.purchasedCount || 0) + 1;

    let rewardPlayer: any = null;
    if (product.category === 'packs' && product.tier) {
      // Roll player card on server
      rewardPlayer = openPackReward(product.tier);
    }

    // Create persistent transaction record
    const purchase: PurchaseRecord = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user.id,
      accountId: user.accountId,
      username: user.username,
      productId: product.id,
      productName: product.nameAr,
      category: product.category,
      price: product.price,
      timestamp: Date.now(),
      status: 'completed'
    };

    if (!Array.isArray(user.purchaseHistory)) {
      user.purchaseHistory = [];
    }
    user.purchaseHistory.unshift(purchase);

    this.saveToDisk();

    return {
      success: true,
      user,
      purchase,
      rewardPlayer
    };
  }

  // ================= ADMIN CONTROLS =================
  public createStoreProduct(productData: Omit<StoreProduct, 'id' | 'purchasedCount'> & { id?: string }): StoreProduct {
    const id = productData.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: StoreProduct = {
      ...productData,
      id,
      purchasedCount: 0,
      isActive: true
    };
    this.products.set(id, newProduct);
    this.saveToDisk();
    return newProduct;
  }

  public updateStoreProduct(id: string, updates: Partial<StoreProduct>): StoreProduct {
    const product = this.products.get(id);
    if (!product) throw new Error('المنتج غير موجود');
    Object.assign(product, updates);
    this.saveToDisk();
    return product;
  }

  public deleteStoreProduct(id: string): boolean {
    const product = this.products.get(id);
    if (!product) return false;
    product.isActive = false; // Soft delete / deactivate
    this.saveToDisk();
    return true;
  }

  public adjustUserCoins(
    targetUserIdOrAccountId: string, 
    coinsDelta: number, 
    adminId: string, 
    reason: string = 'تعديل إداري'
  ): DbUser {
    const user = this.getUser(targetUserIdOrAccountId);
    if (!user) throw new Error('اللاعب غير موجود');

    user.coins = Math.max(0, user.coins + coinsDelta);

    this.adminLogs.unshift({
      id: `adm_${Date.now()}`,
      adminId,
      action: coinsDelta >= 0 ? 'ADD_COINS' : 'DEDUCT_COINS',
      targetAccountId: user.accountId,
      targetUsername: user.username,
      details: `${coinsDelta >= 0 ? '+' : ''}${coinsDelta} كوينز · السبب: ${reason}`,
      timestamp: Date.now()
    });

    this.saveToDisk();
    return user;
  }

  public updateUserCoinsAndPoints(
    userId: string, 
    coinsDelta: number, 
    pointsDelta: number, 
    bidsDelta: number = 0
  ): DbUser {
    const user = this.users.get(userId) || this.getUser(userId);
    if (!user) throw new Error('المستخدم غير موجود');

    user.coins = Math.max(0, user.coins + coinsDelta);
    user.points = Math.max(0, user.points + pointsDelta);
    user.bids = Math.max(0, user.bids + bidsDelta);
    this.saveToDisk();
    return user;
  }

  public addMatchLog(roomCode: string, hostName: string, guestName: string, score: string, winner: string) {
    this.matchLogs.unshift({
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomCode,
      hostName,
      guestName,
      score,
      winner,
      timestamp: Date.now()
    });
    this.saveToDisk();
  }

  public getGlobalPurchases(): PurchaseRecord[] {
    const all: PurchaseRecord[] = [];
    this.users.forEach(u => {
      if (Array.isArray(u.purchaseHistory)) {
        all.push(...u.purchaseHistory);
      }
    });
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
  }

  public getDatabaseSnapshot() {
    return {
      totalUsers: this.users.size,
      users: Array.from(this.users.values()).map(u => ({
        id: u.id,
        accountId: u.accountId,
        username: u.username,
        role: u.role,
        coins: u.coins,
        bids: u.bids,
        points: u.points,
        inventoryCount: u.inventory?.length || 0,
        matchesPlayed: u.matchesPlayed,
        matchesWon: u.matchesWon,
        matchesDrawn: u.matchesDrawn,
        matchesLost: u.matchesLost,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      })),
      products: Array.from(this.products.values()),
      recentPurchases: this.getGlobalPurchases().slice(0, 30),
      matchLogs: this.matchLogs.slice(0, 30),
      adminLogs: this.adminLogs.slice(0, 30),
      serverUptime: process.uptime(),
      timestamp: Date.now()
    };
  }
}

export const adminDb = new AdminDatabase();
