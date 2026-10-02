import React, { useState, useEffect, useCallback } from 'react';
import {
  PackTierId,
  Player,
  QuickChatMessageItem,
  SantraChestTier,
  StoreProductItem,
  StorePurchaseRequest,
  SyncedPlayerAccount,
  TopUpPackageItem,
  TopUpTransactionRecord,
  UserProfile,
} from '../../types/game';
import {
  openPackRewardByTier,
  generateSantraChestReward,
  SantraChestRewardResult,
} from '../../data/players';
import {
  deductCoinsFromUser,
  addCoinsToUser,
  addPlayerToCollection,
  getOrCreateUserProfile,
  getUserCollection,
  getUserSquad,
  REWARDS_CATALOG,
  getRewardProgress,
  claimUserReward,
  openAndClaimSantraChest,
  purchasePackWithCoins,
  consumeSavedPack,
  getFormattedAccountId,
  applyPendingServerGrants,
  isOwnerAccount,
  copyAccountIdToClipboard,
  saveUserProfile,
} from '../../services/storage';
import {
  fetchStoreState,
  searchServerPlayers,
  executeOwnerTopUpRequest,
  saveTopUpPackageRequest,
  deleteTopUpPackageRequest,
  syncPlayerAccountWithServer,
  createStorePurchaseRequestApi,
  fetchUserPurchaseRequestsApi,
} from '../../services/roomApi';
import { GoldButton } from '../common/GoldButton';
import { PackOpeningModal } from './PackOpeningModal';
import { OrnatePackArtwork } from './OrnatePackArtwork';
import { SantraChestOpeningModal } from '../common/SantraChest3D';
import { sounds } from '../../services/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShieldAlert,
  Star,
  Coins,
  Gift,
  Package,
  Lock,
  CheckCircle2,
  Trophy,
  Shield,
  Layers,
  Crown,
  Search,
  Copy,
  Check,
  Plus,
  Minus,
  Zap,
  UserCheck,
  History,
  Settings2,
  Trash2,
  CreditCard,
  MessageSquare,
} from 'lucide-react';

interface StoreScreenProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  initialSection?: 'packs' | 'chat' | 'chests' | 'topup' | 'owner' | 'rewards';
}

interface PackCatalogItem {
  id: PackTierId;
  nameAr: string;
  rarityLabel: string;
  price: number;
  compensation: number;
  descAr: string;
  odds: { label: string; pct: string }[];
  gradient: string;
  border: string;
  accent: string;
}

export const PACKS_2D_CATALOG: PackCatalogItem[] = [
  {
    id: 'BRONZE',
    nameAr: 'الباك البرونزي المزخرف (ROYAL BRONZE)',
    rarityLabel: 'BRONZE • 83+ OVR',
    price: 40,
    compensation: 15,
    descAr:
      'باك كروي مزخرف بنقوش عربية ملكية لتعزيز صفوف فريقك بلاعبين موثوقين في كافة المراكز.',
    odds: [
      { label: 'GOLD / SILVER (83-85)', pct: '78%' },
      { label: 'ELITE (88-90)', pct: '20%' },
      { label: 'ICON (91+)', pct: '2%' },
    ],
    gradient: 'from-amber-950/80 via-zinc-900 to-zinc-950',
    border: 'border-amber-600/60',
    accent: 'text-amber-400',
  },
  {
    id: 'WEEKLY',
    nameAr: 'باك المحترفين الفضي المزخرف (IMPERIAL SILVER)',
    rarityLabel: 'SILVER • 84+ OVR',
    price: 75,
    compensation: 30,
    descAr:
      'باك الفئة الفضية المزخرف يضمن لك محترفين من الدوريات الأوروبية الخمسة الكبرى بتقييم +84.',
    odds: [
      { label: 'WEEKLY STAR (84-87)', pct: '60%' },
      { label: 'ELITE (88-91)', pct: '35%' },
      { label: 'ICON (92+)', pct: '5%' },
    ],
    gradient: 'from-slate-800/80 via-zinc-900 to-zinc-950',
    border: 'border-slate-300/60',
    accent: 'text-slate-200',
  },
  {
    id: 'GOLD',
    nameAr: 'الباك الذهبي السلطاني المزخرف (SULTAN GOLD)',
    rarityLabel: 'GOLD • 86+ OVR',
    price: 110,
    compensation: 45,
    descAr:
      'الباك الذهبي المزخرف بنقوش التاج السلطاني! يمنحك نجوم الصف الأول مع احتمالية عالية للنخبة.',
    odds: [
      { label: 'GOLD STAR (85-88)', pct: '40%' },
      { label: 'ELITE (89-91)', pct: '48%' },
      { label: 'ICON (92+)', pct: '12%' },
    ],
    gradient: 'from-yellow-600/35 via-zinc-900 to-zinc-950',
    border: 'border-yellow-400/75',
    accent: 'text-yellow-300',
  },
  {
    id: 'ELITE',
    nameAr: 'باك النخبة الياقوتي المزخرف (CRIMSON ELITE)',
    rarityLabel: 'ELITE • 89+ OVR',
    price: 160,
    compensation: 65,
    descAr:
      'مخصص للمنافسات الكبرى! غلاف ياقوتي مزخرف بالذهب يضمن لك نجم نخبة عالمي أو أسطورة خالدة +89.',
    odds: [
      { label: 'ELITE STAR (89-95)', pct: '72%' },
      { label: 'ICON LEGEND (96-102)', pct: '28%' },
    ],
    gradient: 'from-rose-900/50 via-zinc-900 to-zinc-950',
    border: 'border-rose-400/75',
    accent: 'text-rose-300',
  },
  {
    id: 'ICON',
    nameAr: 'باك الأساطير الإمبراطوري المزخرف (DYNASTY ICON)',
    rarityLabel: 'ICON • 96+ OVR',
    price: 240,
    compensation: 100,
    descAr:
      'قمة الفخامة والزخرفة الملكية في GOALIX! يضمن لك أسطورة تاريخية خالدة (ICON) بتقييم أسطوري.',
    odds: [
      { label: 'ICON LEGEND (96-102)', pct: '85%' },
      { label: 'SUPER ELITE (92+)', pct: '15%' },
    ],
    gradient: 'from-amber-400/35 via-yellow-900/35 to-zinc-950',
    border: 'border-amber-200',
    accent: 'text-amber-200',
  },
];

const SANTRA_CHEST_SHOP: {
  tier: SantraChestTier;
  nameAr: string;
  price: number;
  descAr: string;
  oddsText: string;
  border: string;
}[] = [
  {
    tier: 'Bronze',
    nameAr: 'صندوق سانترا 3D برونزي',
    price: 35,
    descAr: 'يحتوي على بطاقة لاعب (+83 OVR) + مكافأة كوينز إضافية (15-25)',
    oddsText: 'بطاقة لاعب + كوينز مضمونة',
    border: 'border-amber-700/60',
  },
  {
    tier: 'Silver',
    nameAr: 'صندوق سانترا 3D فضي',
    price: 65,
    descAr: 'يحتوي على بطاقة محترف (+84 OVR) + مكافأة كوينز (30-45)',
    oddsText: 'محترف أوروبي + كوينز',
    border: 'border-slate-400/60',
  },
  {
    tier: 'Gold',
    nameAr: 'صندوق سانترا 3D ذهبي',
    price: 100,
    descAr: 'يحتوي على نجم ذهبي أو نخبة (+85 OVR) + مكافأة كوينز (55-80)',
    oddsText: 'نجم ذهبي/نخبة + كوينز',
    border: 'border-yellow-400/70',
  },
  {
    tier: 'Elite',
    nameAr: 'صندوق سانترا 3D نخبة (ELITE)',
    price: 150,
    descAr: 'يحتوي على نجم نخبة عالمي (+88 OVR) + مكافأة كوينز (90-130)',
    oddsText: 'نخبة/أسطورة + كوينز ضخمة',
    border: 'border-rose-400/70',
  },
  {
    tier: 'Legendary',
    nameAr: 'صندوق سانترا 3D أسطوري (LEGENDARY)',
    price: 220,
    descAr: 'أفخم صناديق سانترا 3D! يضمن أسطورة خالدة (+96 OVR) + كوينز (160-220)',
    oddsText: 'أسطورة ICON + ثروة كوينز',
    border: 'border-amber-300',
  },
];

export const StoreScreen: React.FC<StoreScreenProps> = ({
  profile,
  onUpdateProfile,
  initialSection = 'packs',
}) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'chests' | 'topup' | 'owner' | 'rewards'>(
    initialSection
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmPackItem, setConfirmPackItem] = useState<PackCatalogItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Active 2D Pack Opening Modal State
  const [openingPack, setOpeningPack] = useState<{
    pack: PackCatalogItem;
    player: Player;
    isDuplicate: boolean;
  } | null>(null);

  // Active 3D Santra Chest Opening Modal State
  const [openingChest, setOpeningChest] = useState<{
    tier: SantraChestTier;
    reward: SantraChestRewardResult;
  } | null>(null);

  // ==================== TOP-UP STORE & OWNER PANEL STATE ====================
  const [topUpPackages, setTopUpPackages] = useState<TopUpPackageItem[]>([]);
  const [transactions, setTransactions] = useState<TopUpTransactionRecord[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<SyncedPlayerAccount[]>([]);
  const [loadingStore, setLoadingStore] = useState(false);

  // Owner Recharge Search & Counter State
  const myAccountId = getFormattedAccountId(profile);
  const [searchQuery, setSearchQuery] = useState<string>(myAccountId);
  const [searchResults, setSearchResults] = useState<SyncedPlayerAccount[]>([]);
  const [selectedTargetPlayer, setSelectedTargetPlayer] = useState<SyncedPlayerAccount | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [operationMode, setOperationMode] = useState<'add' | 'set' | 'deduct'>('add');
  const [coinCounterValue, setCoinCounterValue] = useState<number>(1000);
  const [bonusPackGift, setBonusPackGift] = useState<PackTierId | ''>('');
  const [bonusChestGift, setBonusChestGift] = useState<SantraChestTier | ''>('');
  const [ownerNote, setOwnerNote] = useState<string>('');
  const [recharging, setRecharging] = useState<boolean>(false);

  // Owner Package Creator State
  const [showPackageCreator, setShowPackageCreator] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgCoins, setNewPkgCoins] = useState(2500);
  const [newPkgBonus, setNewPkgBonus] = useState(500);
  const [newPkgPriceText, setNewPkgPriceText] = useState('150 ج.م / $5.99');
  const [newPkgBadge, setNewPkgBadge] = useState('باقة خاصة');
  const [newPkgPack, setNewPkgPack] = useState<PackTierId | ''>('GOLD');
  const [newPkgChest, setNewPkgChest] = useState<SantraChestTier | ''>('');

  const triggerBanner = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3800);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3800);
    }
  };

  const refreshStoreAndSync = useCallback(async () => {
    setLoadingStore(true);
    try {
      const squad = getUserSquad().filter((p): p is Player => p !== null);
      const squadOvr =
        squad.length > 0
          ? Math.round(squad.reduce((s, p) => s + (p.ovr || 84), 0) / squad.length)
          : 84;
      const collectionCount = getUserCollection().length;

      const syncRes = await syncPlayerAccountWithServer(profile, squadOvr, collectionCount);
      if (syncRes && syncRes.pendingGrants && syncRes.pendingGrants.length > 0) {
        const applied = applyPendingServerGrants(syncRes.pendingGrants);
        if (applied.appliedCount > 0) {
          onUpdateProfile(applied.updatedProfile);
          // Acknowledge applied grants on server
          await syncPlayerAccountWithServer(
            applied.updatedProfile,
            squadOvr,
            collectionCount,
            syncRes.pendingGrants.map((g) => g.id)
          );
        }
      }

      const state = await fetchStoreState();
      setTopUpPackages(state.packages);
      setTransactions(state.transactions);
      setRegisteredPlayers(state.players);
      if (state.products) setStoreProducts(state.products);
      if (state.chatMessages) setChatCatalog(state.chatMessages);

      const reqs = await fetchUserPurchaseRequestsApi(profile.id);
      setMyPurchaseRequests(reqs.requests || []);

      // Update selectedTargetPlayer if already selected or default to current player
      setSelectedTargetPlayer((prev) => {
        if (prev) {
          const updatedTarget = state.players.find(
            (p) => p.id === prev.id || p.accountId === prev.accountId
          );
          if (updatedTarget) return updatedTarget;
        }
        const me = state.players.find(
          (p) => p.id === profile.id || p.accountId === getFormattedAccountId(profile)
        );
        return me || prev;
      });
    } catch {
      // Ignore network error
    } finally {
      setLoadingStore(false);
    }
  }, [profile, onUpdateProfile]);

  useEffect(() => {
    refreshStoreAndSync();
  }, [refreshStoreAndSync]);

  // Search players when Owner searches by ID
  const handleSearchById = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery !== undefined ? customQuery : searchQuery).trim();
    sounds.playTap();
    const results = await searchServerPlayers(q);
    setSearchResults(results);

    if (results.length > 0) {
      const exact =
        results.find(
          (p) =>
            p.accountId.toUpperCase() === q.toUpperCase() ||
            p.id.toUpperCase() === q.toUpperCase() ||
            p.accountId.replace('GLX-', '') === q.replace(/[^0-9]/g, '')
        ) || results[0];
      setSelectedTargetPlayer(exact);
    } else if (q.length >= 3) {
      // Allow Owner to charge any ID directly even if that player hasn't logged in yet
      const formattedId = q.toUpperCase().startsWith('GLX-')
        ? q.toUpperCase()
        : /^\d+$/.test(q)
        ? `GLX-${q}`
        : `GLX-${q.toUpperCase()}`;
      setSelectedTargetPlayer({
        id: formattedId,
        accountId: formattedId,
        username: `حساب لاعب (${formattedId})`,
        coins: 150,
        rankPoints: 0,
        squadOvr: 84,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        ownedCardsCount: 14,
        updatedAt: Date.now(),
      });
    }
  };

  // Select a package in Owner Panel
  const handleSelectPackageForOwner = (pkg: TopUpPackageItem) => {
    sounds.playTap();
    setSelectedPackageId(pkg.id);
    setOperationMode('add');
    setCoinCounterValue(pkg.coinsAmount + (pkg.bonusCoins || 0));
    setBonusPackGift(pkg.bonusPackTier || '');
    setBonusChestGift(pkg.bonusChestTier || '');
  };

  // Adjust counter value safely
  const adjustCoinCounter = (delta: number) => {
    sounds.playTap();
    setSelectedPackageId(null);
    setCoinCounterValue((prev) => Math.max(0, prev + delta));
  };

  // Execute Owner Recharge
  const handleExecuteOwnerRecharge = async () => {
    const targetId = selectedTargetPlayer?.accountId || searchQuery.trim();
    if (!targetId) {
      sounds.playError();
      triggerBanner('يرجى البحث عن اللاعب بالأيدي (ID) أو اختياره أولاً', true);
      return;
    }

    setRecharging(true);
    try {
      const chosenPkg = topUpPackages.find((p) => p.id === selectedPackageId);
      const res = await executeOwnerTopUpRequest({
        targetQueryId: targetId,
        operation: operationMode,
        coinsAmount: coinCounterValue,
        packageId: chosenPkg?.id,
        packageNameAr:
          chosenPkg?.nameAr ||
          (operationMode === 'add'
            ? `شحن مخصص بالعداد (+${coinCounterValue.toLocaleString()} كوينز)`
            : operationMode === 'set'
            ? `تعيين رصيد (${coinCounterValue.toLocaleString()} كوينز)`
            : `خصم رصيد (-${coinCounterValue.toLocaleString()} كوينز)`),
        bonusPackTier: bonusPackGift || undefined,
        bonusChestTier: bonusChestGift || undefined,
        noteAr: ownerNote.trim() || undefined,
      });

      sounds.playCrowdCheer();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // If the recharged player is the current local user, immediately apply the grant!
      const isMe =
        res.player.id === profile.id ||
        res.player.accountId.toUpperCase() === myAccountId.toUpperCase();

      if (isMe && res.grant) {
        const applied = applyPendingServerGrants([res.grant]);
        onUpdateProfile(applied.updatedProfile);
        await syncPlayerAccountWithServer(applied.updatedProfile, 85, getUserCollection().length, [
          res.grant.id,
        ]);
      }

      setSelectedTargetPlayer(res.player);
      setOwnerNote('');
      await refreshStoreAndSync();

      triggerBanner(
        `تم شحن حساب ${res.player.username} (${res.player.accountId}) بنجاح! الرصيد الجديد: ${res.player.coins.toLocaleString()} كوينز`,
        false
      );
    } catch (err: unknown) {
      sounds.playError();
      triggerBanner(err instanceof Error ? err.message : 'فشل تنفيذ عملية الشحن', true);
    } finally {
      setRecharging(false);
    }
  };

  // Owner: Save new Top-Up Package
  const handleSaveNewPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim() || newPkgCoins <= 0) return;
    try {
      sounds.playTap();
      const res = await saveTopUpPackageRequest({
        id: `pkg_${Date.now()}`,
        nameAr: newPkgName.trim(),
        coinsAmount: Number(newPkgCoins),
        bonusCoins: Number(newPkgBonus) || 0,
        bonusPackTier: newPkgPack || undefined,
        bonusChestTier: newPkgChest || undefined,
        priceTextAr: newPkgPriceText.trim() || '100 ج.م',
        badgeAr: newPkgBadge.trim() || undefined,
        theme: 'gold',
      });
      setTopUpPackages(res.packages);
      setShowPackageCreator(false);
      setNewPkgName('');
      sounds.playSuccess();
      triggerBanner('تمت إضافة الباقة الجديدة إلى متجر الشحن بنجاح!', false);
    } catch (err: unknown) {
      sounds.playError();
      triggerBanner(err instanceof Error ? err.message : 'فشل حفظ الباقة', true);
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    try {
      sounds.playTap();
      const res = await deleteTopUpPackageRequest(pkgId);
      setTopUpPackages(res.packages);
      triggerBanner('تم حذف الباقة من المتجر وتحديث القائمة', false);
    } catch {
      triggerBanner('تعذر حذف الباقة', true);
    }
  };

  const handleCopyMyId = async () => {
    await copyAccountIdToClipboard(myAccountId);
    sounds.playTap();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Buy Quick Chat Message directly or send Purchase Request
  const handleBuyQuickChatMessage = async (msg: QuickChatMessageItem) => {
    const ownedIds = profile.ownedChatIds || [];
    if (msg.isStarterOwned || ownedIds.includes(msg.id)) return;
    if (profile.coins < msg.priceCoins) {
      sounds.playError();
      triggerBanner(`رصيد الكوينز غير كافٍ لشراء الرسالة (${msg.priceCoins} كوينز مطلوبة)`, true);
      return;
    }

    sounds.playSuccess();
    const ok = deductCoinsFromUser(msg.priceCoins);
    if (!ok) return;
    const latest = getOrCreateUserProfile();
    latest.ownedChatIds = [...(latest.ownedChatIds || []), msg.id];
    saveUserProfile(latest);
    onUpdateProfile(latest);
    triggerBanner(`تم شراء وإضافة رسالة "${msg.textAr}" إلى مجموعتك للغرف بنجاح ✓`, false);
  };

  // Submit Store Purchase Request (PENDING -> Owner Approval)
  const handleSendPurchaseRequest = async (productId: string) => {
    try {
      sounds.playTap();
      const res = await createStorePurchaseRequestApi({
        userId: profile.id,
        productId,
        idempotencyKey: `idem_${profile.id}_${productId}_${ Math.floor(Date.now() / 10000)}`,
      });
      sounds.playSuccess();
      setMyPurchaseRequests((prev) => [res.request, ...prev]);
      triggerBanner(`تم إرسال طلب شراء (${res.request.productNameAr}) للمالك بنجاح (الحالة: PENDING)`, false);
    } catch (err: unknown) {
      sounds.playError();
      triggerBanner(err instanceof Error ? err.message : 'فشل إرسال طلب الشراء', true);
    }
  };

  // Purchase & Immediately Open 2D Pack
  const handleConfirmAndOpenPack = (pack: PackCatalogItem) => {
    setConfirmPackItem(null);
    const res = purchasePackWithCoins(pack.id, pack.nameAr, pack.price, false);
    if (!res.success) {
      sounds.playError();
      triggerBanner(
        res.error || `رصيد الكوينز غير كافٍ! تحتاج إلى ${pack.price.toLocaleString()} كوينز.`,
        true
      );
      return;
    }

    launchPackOpeningForTier(pack);
  };

  // Open an already owned pack from Vault
  const handleOpenOwnedPack = (ownedInstanceId: string, tierId: PackTierId) => {
    const consumed = consumeSavedPack(ownedInstanceId);
    if (!consumed.success) return;
    const packMeta = PACKS_2D_CATALOG.find((p) => p.id === tierId) || PACKS_2D_CATALOG[2];
    launchPackOpeningForTier(packMeta);
  };

  // Buy Pack to Vault for later opening
  const handleBuyPackToVault = (pack: PackCatalogItem) => {
    const res = purchasePackWithCoins(pack.id, pack.nameAr, pack.price, true);
    if (!res.success) {
      sounds.playError();
      triggerBanner(res.error || 'رصيد الكوينز غير كافٍ', true);
      return;
    }
    sounds.playSuccess();
    onUpdateProfile(res.updatedProfile);
    triggerBanner(`تم شراء وحفظ ${pack.nameAr} في خزينتك بنجاح!`, false);
  };

  const launchPackOpeningForTier = (pack: PackCatalogItem) => {
    const currentOwnedIds = getUserCollection().map((p) => p.id);
    const packResult = openPackRewardByTier(pack.id);
    const rewardPlayer = packResult.players[0];
    const isDup = currentOwnedIds.includes(rewardPlayer.id);

    if (isDup) {
      addCoinsToUser(pack.compensation, `تعويض تكرار بطاقة ${rewardPlayer.name}`);
    } else {
      addPlayerToCollection(rewardPlayer);
    }

    onUpdateProfile(getOrCreateUserProfile());
    setOpeningPack({
      pack,
      player: rewardPlayer,
      isDuplicate: isDup,
    });
  };

  // Open an earned 3D Santra Chest from user's vault
  const handleOpenOwnedSantraChest = (chestId: string) => {
    const targetChest = (profile.santraChests || []).find((c) => c.id === chestId);
    const res = openAndClaimSantraChest(chestId);
    if (!res.success || !res.reward) {
      sounds.playError();
      triggerBanner(res.error || 'هذا الصندوق تم فتحه مسبقًا أو غير متوفر.', true);
      return;
    }

    onUpdateProfile(res.updatedProfile);
    setOpeningChest({
      tier: targetChest?.tier || res.reward.tier,
      reward: res.reward,
    });
  };

  // Buy & Open a 3D Santra Chest from shop
  const handleBuyAndOpenSantraChest = (tier: SantraChestTier, price: number) => {
    const ok = deductCoinsFromUser(price);
    if (!ok) {
      sounds.playError();
      triggerBanner(`رصيد الكوينز غير كافٍ لشراء الصندوق (${price.toLocaleString()} كوينز).`, true);
      return;
    }

    const reward = generateSantraChestReward(tier);
    addCoinsToUser(reward.coinsAwarded, `فتح صندوق سانترا 3D (${tier})`);
    addPlayerToCollection(reward.playerAwarded);

    onUpdateProfile(getOrCreateUserProfile());
    setOpeningChest({
      tier,
      reward,
    });
  };

  // Claim a Reward Milestone
  const handleClaimMilestone = (rewardId: string) => {
    const res = claimUserReward(rewardId);
    if (!res.success) {
      sounds.playError();
      triggerBanner(res.error || 'تعذر استلام المكافأة', true);
      return;
    }
    sounds.playCrowdCheer();
    onUpdateProfile(res.updatedProfile);
    triggerBanner('تم استلام المكافأة وإضافتها لحسابك بنجاح!', false);
  };

  const ownedChests = profile.santraChests || [];
  const ownedPacks = profile.ownedPacks || [];
  const claimableRewardsCount = REWARDS_CATALOG.filter((r) => {
    const prog = getRewardProgress(profile, r);
    return prog.unlocked && !prog.claimed;
  }).length;

  const previewNewBalance = selectedTargetPlayer
    ? operationMode === 'set'
      ? coinCounterValue
      : operationMode === 'deduct'
      ? Math.max(0, selectedTargetPlayer.coins - coinCounterValue)
      : selectedTargetPlayer.coins + coinCounterValue
    : coinCounterValue;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* Header, Player ID Badge & Coins Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-black border border-amber-500/35 rounded-3xl p-5 shadow-2xl">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سوق الباكات المزخرفة ومتجر الشحن الرسمي</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">GOALIX ROYAL STORE</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            الباكات المزخرفة الملكية • صناديق سانترا 3D • متجر الشحن الفوري بالأيدي (ID)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Player Searchable ID Badge */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-amber-500/40 px-3.5 py-2 rounded-2xl">
            <div>
              <div className="text-[10px] text-zinc-400 font-bold">الأيدي الخاص بك (Player ID)</div>
              <div className="font-chakra text-sm font-black text-amber-300 tracking-wider">
                {myAccountId}
              </div>
            </div>
            <button
              onClick={handleCopyMyId}
              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 transition-all"
              title="نسخ الأيدي للشحن"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Coins Balance */}
          <div className="flex items-center gap-2.5 bg-zinc-950 border border-amber-500/45 px-4 py-2 rounded-2xl shadow-lg">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-zinc-400 font-bold">رصيد الكوينز</div>
              <div className="font-chakra text-base font-black text-amber-300 tabular-nums">
                {profile.coins.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-zinc-900/95 p-1.5 rounded-2xl border border-zinc-800">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('packs');
          }}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'packs'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>الباكات المزخرفة ({ownedPacks.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('chat');
          }}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>رسائل الغرف والعناصر</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('chests');
          }}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'chests'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>صناديق 3D ({ownedChests.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('topup');
          }}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'topup'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>متجر الشحن</span>
        </button>

        {isOwner && (
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('owner');
            }}
            className={`py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 transition-all ${
              activeTab === 'owner'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'text-amber-300/90 hover:text-amber-200 bg-amber-500/10 border border-amber-500/25'
            }`}
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span>لوحة المالك (شحن ID)</span>
          </button>
        )}

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('rewards');
          }}
          className={`py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shrink-0 transition-all ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4 shrink-0" />
          <span>المكافآت ({claimableRewardsCount})</span>
        </button>
      </div>

      {/* Feedback Banners */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ==================== TAB 1: ORNATE 2D PACKS ==================== */}
      {activeTab === 'packs' && (
        <div className="space-y-6">
          {/* Owned Packs in Vault */}
          {ownedPacks.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border-2 border-amber-500/45 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    خزينة باكاتك المزخرفة المحفوظة ({ownedPacks.length}) — جاهزة للفتح الفوري!
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {ownedPacks.map((op) => {
                  const meta =
                    PACKS_2D_CATALOG.find((p) => p.id === op.packTier) || PACKS_2D_CATALOG[2];
                  return (
                    <div
                      key={op.id}
                      className="bg-zinc-950/90 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <OrnatePackArtwork tier={op.packTier} size="sm" />
                        <div>
                          <div className="text-xs font-black text-white">{meta.nameAr}</div>
                          <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                            {meta.rarityLabel}
                          </div>
                          <div className="mt-2">
                            <GoldButton
                              size="sm"
                              onClick={() => handleOpenOwnedPack(op.id, op.packTier)}
                            >
                              قص وفتح الباك
                            </GoldButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5 Ornate Royal 2D Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PACKS_2D_CATALOG.map((pack) => (
              <div
                key={pack.id}
                className={`relative rounded-3xl overflow-hidden bg-gradient-to-b ${pack.gradient} border-2 ${pack.border} p-5 flex flex-col justify-between shadow-[0_18px_45px_rgba(0,0,0,0.85)] group`}
              >
                {/* Subtle SVG Corner Filigree on Card Container */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-black/70 border border-amber-400/35 text-[11px] font-black text-amber-300">
                      {pack.rarityLabel}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-black text-amber-200 mr-1">باك مزخرف</span>
                    </div>
                  </div>

                  {/* Ornate 2D Football Pack Artwork + Description */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 my-3">
                    <div
                      onClick={() => {
                        sounds.playTap();
                        setConfirmPackItem(pack);
                      }}
                      className="cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    >
                      <OrnatePackArtwork tier={pack.id} size="md" animated />
                    </div>

                    <div className="space-y-2 text-center sm:text-right flex-1">
                      <h3 className="text-lg font-black text-white leading-snug">{pack.nameAr}</h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">{pack.descAr}</p>

                      {/* Odds Table */}
                      <div className="bg-black/55 border border-amber-500/20 rounded-2xl p-3 mt-2 space-y-1.5 text-right">
                        <div className="text-[10px] font-black text-amber-300/90 uppercase">
                          نسب الظهور المضمونة (DROP ODDS):
                        </div>
                        {pack.odds.map((o, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300 font-bold">{o.label}</span>
                            <span className="font-chakra font-black text-amber-400">{o.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Actions */}
                <div className="pt-3 mt-2 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-950/85 border border-amber-500/25">
                    <span className="text-xs text-zinc-300 font-bold">سعر الباك المزخرف:</span>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-chakra text-lg font-black text-amber-300 tabular-nums">
                        {pack.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">كوينز</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <GoldButton
                        fullWidth
                        onClick={() => {
                          sounds.playTap();
                          setConfirmPackItem(pack);
                        }}
                      >
                        شراء وفتح الباك
                      </GoldButton>
                    </div>
                    <button
                      onClick={() => handleBuyPackToVault(pack)}
                      className="py-2.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-200 font-black text-[11px] transition-all"
                      title="شراء وحفظ في الخزينة لفتحه لاحقًا"
                    >
                      + للخزينة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: 3D SANTRA CHESTS ==================== */}
      {activeTab === 'chests' && (
        <div className="space-y-6">
          {/* User's Earned 3D Santra Chests Vault */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>خزينة صناديق سانترا ثلاثية الأبعاد ({ownedChests.length})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  الصناديق التي ربحتها من المباريات أو الشحن — اضغط على أي صندوق لفتحه بتقنية 3D!
                </p>
              </div>
            </div>

            {ownedChests.length === 0 ? (
              <div className="text-center py-8 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-2">
                <Package className="w-10 h-10 text-zinc-600 mx-auto" />
                <div className="text-sm font-bold text-zinc-400">
                  لا توجد صناديق غير مفتوحة حاليًا في خزينتك
                </div>
                <div className="text-xs text-zinc-500">
                  العب وفز في المباريات أو اشحن باقة ملكية أو افتح صندوقًا مباشرًا من الأسفل!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ownedChests.map((chest) => (
                  <div
                    key={chest.id}
                    className="rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/45 p-4 flex flex-col items-center text-center space-y-3 shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
                  >
                    <div className="relative w-20 h-16 mt-1">
                      <div className="w-20 h-5 rounded-t-xl bg-gradient-to-b from-amber-300 to-amber-600 border border-amber-200" />
                      <div className="w-20 h-11 rounded-b-xl bg-zinc-950 border-2 border-amber-500/60 flex items-center justify-center">
                        <div className="w-5 h-6 rounded bg-amber-400 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-zinc-950" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px]">
                        SANTRA 3D • {chest.tier.toUpperCase()}
                      </span>
                      <div className="text-xs font-black text-white mt-1">{chest.sourceAr}</div>
                    </div>

                    <GoldButton
                      fullWidth
                      size="sm"
                      onClick={() => handleOpenOwnedSantraChest(chest.id)}
                    >
                      افتح الصندوق 3D الآن
                    </GoldButton>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct 3D Santra Chests Catalog */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-amber-400">
              متجر صناديق سانترا 3D المباشر (5 فئات)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SANTRA_CHEST_SHOP.map((c) => (
                <div
                  key={c.tier}
                  className={`rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 ${c.border} p-5 flex flex-col justify-between gap-4 shadow-xl`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-amber-500/40 flex flex-col items-center justify-center shrink-0 shadow-inner">
                      <div className="w-14 h-4 rounded-t-lg bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 border border-white/40" />
                      <div className="w-14 h-10 rounded-b-lg bg-gradient-to-b from-zinc-800 to-black border border-amber-500/60 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        {c.tier} 3D CHEST
                      </span>
                      <h4 className="text-base font-black text-white">{c.nameAr}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{c.descAr}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-chakra text-base font-black text-amber-300 tabular-nums">
                        {c.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">كوينز</span>
                    </div>

                    <GoldButton
                      size="sm"
                      onClick={() => handleBuyAndOpenSantraChest(c.tier, c.price)}
                    >
                      شراء وفتح 3D
                    </GoldButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: FULL TOP-UP STORE (متجر الشحن الكامل) ==================== */}
      {activeTab === 'topup' && (
        <div className="space-y-6">
          {/* Player ID & Instant Owner Access Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-black">
                <Zap className="w-3.5 h-3.5" />
                <span>مركز شحن كوينز وباقات GOALIX الرسمي</span>
              </div>
              <h3 className="text-xl font-black text-white">
                اشحن حسابك أو أي حساب آخر عن طريق الأيدي (Player ID)
              </h3>
              <p className="text-xs text-zinc-300">
                الأيدي الخاص بحسابك هو{' '}
                <strong className="font-chakra text-amber-300 text-sm">{myAccountId}</strong> — انسخ
                الأيدي أو افتح لوحة المالك للشحن الفوري بالعداد والباقات!
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
              <GoldButton
                onClick={() => {
                  sounds.playTap();
                  setSearchQuery(myAccountId);
                  setActiveTab('owner');
                }}
              >
                <Crown className="w-4 h-4" />
                فتح لوحة المالك للشحن
              </GoldButton>
            </div>
          </div>

          {/* Official Top-Up Packages Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>باقات الشحن الرسمية المتاحة ({topUpPackages.length} باقات)</span>
              </h3>
              <span className="text-xs text-amber-400 font-bold">تُدار بواسطة مالك اللعبة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topUpPackages.map((pkg) => {
                const totalCoins = pkg.coinsAmount + (pkg.bonusCoins || 0);
                return (
                  <div
                    key={pkg.id}
                    className="relative rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/45 p-5 flex flex-col justify-between gap-4 shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:border-amber-400 transition-all"
                  >
                    {pkg.badgeAr && (
                      <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-[10px] font-black shadow-md">
                        {pkg.badgeAr}
                      </div>
                    )}

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400">{pkg.nameAr}</span>
                        <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 font-chakra text-xs font-black text-emerald-400">
                          {pkg.priceTextAr}
                        </span>
                      </div>

                      {/* Ornate Coin Vault Visual */}
                      <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-zinc-950 to-black border border-amber-500/30 p-4 text-center space-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto mb-1 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                          <Coins className="w-6 h-6 text-amber-300" />
                        </div>
                        <div className="font-chakra text-2xl font-black text-amber-300 tabular-nums">
                          {totalCoins.toLocaleString()} <span className="text-xs">COINS</span>
                        </div>
                        {pkg.bonusCoins > 0 && (
                          <div className="text-[11px] font-bold text-emerald-400">
                            الأساسي: {pkg.coinsAmount.toLocaleString()} + بونص مجاني:{' '}
                            {pkg.bonusCoins.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Bonus Gifts Included */}
                      {(pkg.bonusPackTier || pkg.bonusChestTier) && (
                        <div className="space-y-1 bg-zinc-950/90 border border-zinc-800 rounded-xl p-2.5 text-[11px] font-bold">
                          <div className="text-zinc-400 text-[10px]">هدايا إضافية مع الباقة:</div>
                          {pkg.bonusPackTier && (
                            <div className="text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>+ باك 2D مزخرف فئة ({pkg.bonusPackTier})</span>
                            </div>
                          )}
                          {pkg.bonusChestTier && (
                            <div className="text-sky-300 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5" />
                              <span>+ صندوق سانترا 3D فئة ({pkg.bonusChestTier})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <GoldButton
                        fullWidth
                        size="sm"
                        onClick={() => {
                          sounds.playTap();
                          setSearchQuery(myAccountId);
                          handleSelectPackageForOwner(pkg);
                          setActiveTab('owner');
                        }}
                      >
                        <Zap className="w-4 h-4" />
                        شحن هذه الباقة بالأيدي ({myAccountId})
                      </GoldButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User's Received Top-Ups History */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>سجل عمليات الشحن الأخيرة في المتجر</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-bold">تحديث مباشر</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 font-bold">
                لا توجد عمليات شحن مسجلة حتى الآن — يمكنك تجربة الشحن الفوري من لوحة المالك!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {transactions.slice(0, 12).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-black text-white flex items-center gap-2">
                        <span>{tx.targetPlayerName}</span>
                        <span className="font-chakra text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {tx.targetAccountId}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{tx.packageNameAr}</div>
                    </div>

                    <div className="text-left">
                      <div
                        className={`font-chakra font-black text-sm ${
                          tx.coinsDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.coinsDelta >= 0
                          ? `+${tx.coinsDelta.toLocaleString()}`
                          : tx.coinsDelta.toLocaleString()}{' '}
                        كوينز
                      </div>
                      <div className="text-[10px] text-zinc-500 font-chakra">
                        الرصيد: {tx.newBalance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: OWNER PANEL (لوحة المالك للشحن بالأيدي والعداد) ==================== */}
      {activeTab === 'owner' && (
        <div className="space-y-6">
          {/* Owner Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-amber-500/25 via-zinc-900 to-zinc-950 border-2 border-amber-400 p-5 sm:p-6 shadow-2xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black">
                <Crown className="w-4 h-4" />
                <span>لوحة تحكم المالك الرسمية — OWNER RECHARGE & STORE PANEL</span>
              </div>
              <button
                onClick={() => setShowPackageCreator((s) => !s)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Settings2 className="w-4 h-4" />
                <span>{showPackageCreator ? 'إخفاء إدارة الباقات' : 'إدارة وإضافة باقات المتجر'}</span>
              </button>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              شحن أي لاعب عن طريق الأيدي (ID) بالعداد أو الباقات
            </h3>
            <p className="text-xs text-zinc-300">
              ابحث عن اللاعب بواسطة الأيدي (مثل <strong className="text-amber-300">{myAccountId}</strong>
              ) أو الاسم، ثم اختر باقة جاهزة أو حدد العدد الذي تريده بالعداد واشحن حسابه فورًا!
            </p>
          </div>

          {/* Optional Owner Store Package Manager */}
          {showPackageCreator && (
            <div className="rounded-3xl bg-zinc-900 border-2 border-amber-500/40 p-5 space-y-4 animate-fade-in">
              <h4 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                <span>إدارة باقات متجر الشحن (إضافة أو حذف باقة)</span>
              </h4>

              <form onSubmit={handleSaveNewPackage} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    اسم الباقة
                  </label>
                  <input
                    type="text"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    placeholder="مثال: باقة الملوك الخاصة"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    عدد الكوينز الأساسي
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={newPkgCoins}
                    onChange={(e) => setNewPkgCoins(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-chakra font-black text-amber-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    الكوينز الإضافية (البونص)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newPkgBonus}
                    onChange={(e) => setNewPkgBonus(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-chakra font-black text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    سعر الباقة المعروض
                  </label>
                  <input
                    type="text"
                    value={newPkgPriceText}
                    onChange={(e) => setNewPkgPriceText(e.target.value)}
                    placeholder="150 ج.م / $5.99"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    هدية باك مزخرف مع الباقة
                  </label>
                  <select
                    value={newPkgPack}
                    onChange={(e) => setNewPkgPack(e.target.value as PackTierId | '')}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  >
                    <option value="">بدون باك هدية</option>
                    <option value="BRONZE">BRONZE</option>
                    <option value="WEEKLY">WEEKLY / SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="ELITE">ELITE</option>
                    <option value="ICON">ICON LEGEND</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    شارة تمييز الباقة
                  </label>
                  <input
                    type="text"
                    value={newPkgBadge}
                    onChange={(e) => setNewPkgBadge(e.target.value)}
                    placeholder="عرض خاص 🔥"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end pt-1">
                  <GoldButton type="submit" size="sm">
                    <Plus className="w-4 h-4" />
                    إضافة الباقة إلى المتجر
                  </GoldButton>
                </div>
              </form>

              {/* Current Packages Delete List */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-400">الباقات الحالية في المتجر:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {topUpPackages.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                    >
                      <div>
                        <span className="font-black text-white">{p.nameAr}</span>
                        <span className="text-amber-400 font-chakra mr-2">
                          ({(p.coinsAmount + p.bonusCoins).toLocaleString()} كوينز)
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePackage(p.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors"
                        title="حذف الباقة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: SEARCH PLAYER BY ID */}
          <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>1. ابحث عن اللاعب عن طريق الأيدي (Player ID) أو الاسم</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(myAccountId);
                  handleSearchById(undefined, myAccountId);
                }}
                className="text-xs font-black text-amber-300 hover:text-amber-200 underline"
              >
                اختيار حسابي الحالي ({myAccountId})
              </button>
            </div>

            <form onSubmit={(e) => handleSearchById(e)} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب الأيدي هنا (مثال: GLX-482910 أو الأرقام فقط أو اسم اللاعب)..."
                  className="w-full bg-zinc-950 border-2 border-amber-500/40 focus:border-amber-400 rounded-2xl pr-10 pl-4 py-3 text-sm font-bold text-white focus:outline-none"
                />
              </div>
              <GoldButton type="submit" size="md">
                <Search className="w-4 h-4" />
                بحث عن الحساب
              </GoldButton>
            </form>

            {/* Quick Registered Players Chips */}
            {registeredPlayers.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-400">
                  الحسابات المسجلة والنشطة على الخادم (اضغط لاختيار الحساب مباشرة):
                </div>
                <div className="flex flex-wrap gap-2">
                  {registeredPlayers.slice(0, 10).map((rp) => {
                    const isSelected =
                      selectedTargetPlayer?.accountId === rp.accountId ||
                      selectedTargetPlayer?.id === rp.id;
                    return (
                      <button
                        key={rp.id}
                        type="button"
                        onClick={() => {
                          sounds.playTap();
                          setSearchQuery(rp.accountId);
                          setSelectedTargetPlayer(rp);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 border-amber-300 font-black shadow-md'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500/40'
                        }`}
                      >
                        <span>{rp.username}</span>
                        <span
                          className={`font-chakra text-[11px] px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-black/20 text-zinc-950' : 'bg-zinc-900 text-amber-400'
                          }`}
                        >
                          {rp.accountId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Found Player Account Card */}
            {selectedTargetPlayer && (
              <div className="rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-950 to-zinc-950 border-2 border-emerald-500/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-chakra text-xl font-black shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-white">
                        {selectedTargetPlayer.username}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 font-chakra text-xs font-black text-amber-300">
                        ID: {selectedTargetPlayer.accountId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                        تم العثور على الحساب ✓
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 font-bold">
                      المباريات: {selectedTargetPlayer.matchesPlayed} • الفوز:{' '}
                      {selectedTargetPlayer.matchesWon} • قوة التشكيلة: {selectedTargetPlayer.squadOvr}{' '}
                      OVR
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end bg-black/50 px-4 py-2.5 rounded-xl border border-zinc-800">
                  <div className="text-center">
                    <div className="text-[10px] text-zinc-400 font-bold">الرصيد الحالي</div>
                    <div className="font-chakra text-lg font-black text-zinc-200 tabular-nums">
                      {selectedTargetPlayer.coins.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-amber-400 font-black">➔</div>
                  <div className="text-center">
                    <div className="text-[10px] text-emerald-400 font-bold">الرصيد بعد الشحن</div>
                    <div className="font-chakra text-xl font-black text-amber-300 tabular-nums">
                      {previewNewBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: CHOOSE PRESET PACKAGE OR CUSTOM COUNTER */}
          <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 space-y-5 shadow-xl">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>2. اختر باقة شحن جاهزة أو حدد العدد الذي تريده بالعداد</span>
            </h4>

            {/* Preset Packages Selector */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-400">
                أ) اختيار سريع من باقات المتجر (يضبط العداد والهدايا تلقائيًا):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {topUpPackages.map((pkg) => {
                  const total = pkg.coinsAmount + (pkg.bonusCoins || 0);
                  const isChosen = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handleSelectPackageForOwner(pkg)}
                      className={`p-3 rounded-2xl border-2 text-right transition-all flex flex-col justify-between gap-1.5 ${
                        isChosen
                          ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                          : 'bg-zinc-950 border-zinc-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="text-[11px] font-black text-white line-clamp-1">
                        {pkg.nameAr}
                      </div>
                      <div className="font-chakra text-base font-black text-amber-300 tabular-nums">
                        +{total.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-bold">{pkg.priceTextAr}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Coin Counter & Custom Number Input */}
            <div className="rounded-2xl bg-zinc-950 border-2 border-amber-500/35 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-300">
                  ب) عداد الكوينز الحر — تحكم بالعداد أو اكتب العدد الذي تريده مباشرة:
                </span>

                {/* Operation Mode Switch */}
                <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setOperationMode('add')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      operationMode === 'add'
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    + إضافة وشحن
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperationMode('set')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      operationMode === 'set'
                        ? 'bg-amber-400 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    = تعيين الرصيد
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperationMode('deduct')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                      operationMode === 'deduct'
                        ? 'bg-rose-500 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    - خصم
                  </button>
                </div>
              </div>

              {/* Main Counter Display + Stepper */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                {/* Decrement Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(-1000)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/70 border border-zinc-700 hover:border-rose-500/40 font-chakra text-xs font-black text-rose-300 transition-all"
                  >
                    -1000
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(-100)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/70 border border-zinc-700 hover:border-rose-500/40 font-chakra text-xs font-black text-rose-300 transition-all"
                  >
                    -100
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(-10)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Custom Number Input */}
                <div className="relative w-full md:w-64">
                  <input
                    type="number"
                    min={0}
                    max={99999999}
                    value={coinCounterValue}
                    onChange={(e) => {
                      setSelectedPackageId(null);
                      setCoinCounterValue(Math.max(0, Math.floor(Number(e.target.value) || 0)));
                    }}
                    className="w-full bg-black border-2 border-amber-400 rounded-2xl px-4 py-3 text-center font-chakra text-2xl sm:text-3xl font-black text-amber-300 focus:outline-none shadow-[0_0_25px_rgba(245,158,11,0.25)] tabular-nums"
                  />
                  <span className="block text-center text-[10px] font-bold text-zinc-400 mt-1">
                    كوينز (اكتب أي رقم تريده أو استخدم الأزرار)
                  </span>
                </div>

                {/* Increment Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(10)}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(100)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-emerald-950/70 border border-zinc-700 hover:border-emerald-500/40 font-chakra text-xs font-black text-emerald-300 transition-all"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(1000)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-emerald-950/70 border border-zinc-700 hover:border-emerald-500/40 font-chakra text-xs font-black text-emerald-300 transition-all"
                  >
                    +1000
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCoinCounter(5000)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-emerald-950/70 border border-zinc-700 hover:border-emerald-500/40 font-chakra text-xs font-black text-amber-300 transition-all"
                  >
                    +5000
                  </button>
                </div>
              </div>

              {/* Quick Custom Presets Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {[250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setSelectedPackageId(null);
                      setCoinCounterValue(val);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-chakra text-xs font-black border transition-all ${
                      coinCounterValue === val
                        ? 'bg-amber-400 text-zinc-950 border-amber-200'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-500/40'
                    }`}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Optional Bonus Pack / Chest & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    إرفاق باك 2D مزخرف هدية (اختياري)
                  </label>
                  <select
                    value={bonusPackGift}
                    onChange={(e) => setBonusPackGift(e.target.value as PackTierId | '')}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  >
                    <option value="">بدون باك إضافي</option>
                    <option value="BRONZE">الباك البرونزي المزخرف (BRONZE)</option>
                    <option value="WEEKLY">الباك الفضي المزخرف (WEEKLY)</option>
                    <option value="GOLD">الباك الذهبي السلطاني (GOLD)</option>
                    <option value="ELITE">باك النخبة الياقوتي (ELITE)</option>
                    <option value="ICON">باك الأساطير الإمبراطوري (ICON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    إرفاق صندوق سانترا 3D هدية (اختياري)
                  </label>
                  <select
                    value={bonusChestGift}
                    onChange={(e) => setBonusChestGift(e.target.value as SantraChestTier | '')}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  >
                    <option value="">بدون صندوق إضافي</option>
                    <option value="Bronze">صندوق سانترا Bronze 3D</option>
                    <option value="Silver">صندوق سانترا Silver 3D</option>
                    <option value="Gold">صندوق سانترا Gold 3D</option>
                    <option value="Elite">صندوق سانترا Elite 3D</option>
                    <option value="Legendary">صندوق سانترا Legendary 3D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    رسالة أو ملاحظة مع الشحن (اختياري)
                  </label>
                  <input
                    type="text"
                    value={ownerNote}
                    onChange={(e) => setOwnerNote(e.target.value)}
                    placeholder="مثال: شحن فوري من المالك..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  />
                </div>
              </div>

              {/* Execute Recharge Button */}
              <div className="pt-2">
                <GoldButton
                  fullWidth
                  size="lg"
                  disabled={recharging}
                  onClick={handleExecuteOwnerRecharge}
                >
                  <Crown className="w-5 h-5" />
                  {recharging
                    ? 'جاري تنفيذ الشحن وتحديث الحساب...'
                    : `شحن حساب اللاعب (${
                        selectedTargetPlayer?.accountId || searchQuery || 'ID'
                      }) بـ ${coinCounterValue.toLocaleString()} كوينز الآن`}
                </GoldButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: REWARDS & MILESTONES ==================== */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">نظام المكافآت والإنجازات الحقيقي</h3>
                <p className="text-xs text-zinc-400">
                  أكمل المهام في الألعاب والمباريات لاستلام الكوينز والباكات المزخرفة وصناديق سانترا 3D
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REWARDS_CATALOG.map((reward) => {
              const prog = getRewardProgress(profile, reward);
              const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

              return (
                <div
                  key={reward.id}
                  className={`rounded-3xl border-2 p-5 flex flex-col justify-between gap-4 transition-all ${
                    prog.claimed
                      ? 'bg-zinc-950/60 border-zinc-800/80 opacity-75'
                      : prog.unlocked
                      ? 'bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-900/90 border-zinc-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-zinc-950 border border-amber-500/30 text-amber-300">
                        {reward.chestReward
                          ? `صندوق 3D (${reward.chestReward}) + ${reward.coinsReward} كوينز`
                          : reward.packReward
                          ? `باك مزخرف (${reward.packReward}) + ${reward.coinsReward} كوينز`
                          : `+${reward.coinsReward} كوينز`}
                      </span>
                      {prog.claimed && (
                        <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          تم الاستلام
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-white">{reward.titleAr}</h4>
                    <p className="text-xs text-zinc-400">{reward.descriptionAr}</p>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-zinc-400">التقدم الفعلي</span>
                        <span className="font-chakra text-amber-400">
                          {prog.progressText} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {prog.claimed ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-black text-xs cursor-not-allowed"
                      >
                        تم استلام الجائزة ✓
                      </button>
                    ) : prog.unlocked ? (
                      <GoldButton fullWidth size="sm" onClick={() => handleClaimMilestone(reward.id)}>
                        استلام المكافأة الآن (CLAIM)
                      </GoldButton>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 font-bold text-xs cursor-not-allowed"
                      >
                        أكمل المتطلبات لفتح الجائزة
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONFIRM PACK PURCHASE DIALOG */}
      {confirmPackItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border-2 border-amber-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <OrnatePackArtwork tier={confirmPackItem.id} size="sm" />
            </div>
            <h3 className="text-lg font-black text-white">تأكيد شراء وفتح الباك المزخرف</h3>
            <p className="text-xs text-zinc-300">
              هل ترغب في شراء وفتح <strong>{confirmPackItem.nameAr}</strong> مقابل{' '}
              <strong className="text-amber-400">
                {confirmPackItem.price.toLocaleString()} كوينز
              </strong>
              ؟
            </p>
            <div className="flex gap-2.5 pt-2">
              <GoldButton fullWidth onClick={() => handleConfirmAndOpenPack(confirmPackItem)}>
                تأكيد وفتح الباك
              </GoldButton>
              <GoldButton variant="secondary" onClick={() => setConfirmPackItem(null)}>
                إلغاء
              </GoldButton>
            </div>
          </div>
        </div>
      )}

      {/* 2D Pack Opening Modal */}
      {openingPack && (
        <PackOpeningModal
          packId={openingPack.pack.id}
          packTitle={openingPack.pack.nameAr}
          packPrice={openingPack.pack.price}
          rewardPlayer={openingPack.player}
          isDuplicate={openingPack.isDuplicate}
          duplicateCompensation={openingPack.pack.compensation}
          onClaim={() => setOpeningPack(null)}
        />
      )}

      {/* 3D Santra Chest Interactive Opening Modal */}
      {openingChest && (
        <SantraChestOpeningModal
          tier={openingChest.tier}
          reward={openingChest.reward}
          onClaim={() => setOpeningChest(null)}
        />
      )}

      {loadingStore && <div className="sr-only">جاري المزامنة</div>}
    </div>
  );
};
