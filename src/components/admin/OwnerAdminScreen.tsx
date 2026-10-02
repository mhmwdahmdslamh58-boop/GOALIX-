import React, { useState, useEffect, useCallback } from 'react';
import {
  PackRarityTier,
  PackTierId,
  QuickChatCategory,
  QuickChatMessageItem,
  SantraChestTier,
  StoreProductItem,
  StoreSectionType,
  SyncedPlayerAccount,
  TopUpPackageItem,
  UserProfile,
} from '../../types/game';
import {
  fetchOwnerAdminDashboard,
  OwnerAdminDashboardData,
  executeOwnerTopUpRequest,
  reviewPurchaseRequestApi,
  saveStoreProductApi,
  deleteStoreProductApi,
  saveQuickChatItemApi,
  deleteQuickChatItemApi,
  saveTopUpPackageRequest,
  deleteTopUpPackageRequest,
} from '../../services/roomApi';
import { isOwnerAccount, OWNER_EMAIL } from '../../services/storage';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import {
  Crown,
  ShieldAlert,
  Search,
  Coins,
  Plus,
  Minus,
  Check,
  X,
  Package,
  MessageSquare,
  Users,
  FileText,
  RefreshCw,
  Trash2,
  Edit3,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface OwnerAdminScreenProps {
  profile: UserProfile;
  onBack: () => void;
  onRefreshProfile: () => void;
}

export const OwnerAdminScreen: React.FC<OwnerAdminScreenProps> = ({
  profile,
  onBack,
  onRefreshProfile,
}) => {
  const [adminTab, setAdminTab] = useState<
    'recharge' | 'requests' | 'products' | 'chat' | 'packages' | 'logs'
  >('recharge');
  const [data, setData] = useState<OwnerAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Owner ID Recharge State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<SyncedPlayerAccount | null>(null);
  const [operation, setOperation] = useState<'add' | 'set' | 'deduct'>('add');
  const [coinsCounter, setCoinsCounter] = useState<number>(1000);
  const [bonusPack, setBonusPack] = useState<PackTierId | ''>('');
  const [bonusChest, setBonusChest] = useState<SantraChestTier | ''>('');
  const [rechargeNote, setRechargeNote] = useState('');
  const [executingTopUp, setExecutingTopUp] = useState(false);

  // 2. Store Product Editor State
  const [editingProduct, setEditingProduct] = useState<Partial<StoreProductItem>>({
    section: 'PACKS',
    nameAr: '',
    descriptionAr: '',
    priceCoins: 300,
    rarity: 'Rare',
    packTier: 'GOLD',
    featured: true,
    limited: false,
    enabled: true,
    hidden: false,
  });

  // 3. Quick Chat Item Editor State
  const [editingChat, setEditingChat] = useState<Partial<QuickChatMessageItem>>({
    textAr: '',
    category: 'CHALLENGE',
    categoryLabelAr: 'تحدي وحماس',
    priceCoins: 150,
    rarity: 'Rare',
    enabled: true,
    isStarterOwned: false,
  });

  // 4. Top-Up Package Editor State
  const [editingPkg, setEditingPkg] = useState<Partial<TopUpPackageItem>>({
    nameAr: '',
    coinsAmount: 2500,
    bonusCoins: 500,
    priceTextAr: '200 ج.م / $7.99',
    badgeAr: 'عرض خاص',
    theme: 'gold',
  });

  const showNotice = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOwnerAdminDashboard(profile.id, profile.email);
      setData(res);
      setAccessDenied(false);
    } catch {
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  }, [profile.id, profile.email]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Strict 403 Access Denied Screen for Non-Owners
  if (!isOwnerAccount(profile) || accessDenied) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="font-chakra text-sm font-black tracking-widest text-rose-400 uppercase">
            403 ACCESS DENIED • وصول مرفوض
          </div>
          <h2 className="text-2xl font-black text-white">صلاحية المالك مطلوبة (OWNER ONLY)</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            هذه اللوحة مخصصة حصريًا لمالك مشروع GOALIX ({OWNER_EMAIL}). لا يملك اللاعبون صلاحية الدخول إلى إعدادات الإدارة أو التحكم في الأرصدة والمتجر.
          </p>
        </div>
        <GoldButton onClick={onBack} fullWidth>
          العودة إلى الصفحة الرئيسية
        </GoldButton>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-bold">جاري تحميل لوحة تحكم المالك (OWNER PANEL)...</p>
      </div>
    );
  }

  const filteredUsers = (data?.users || []).filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toUpperCase();
    return (
      (u.accountId || '').toUpperCase().includes(q) ||
      (u.username || '').toUpperCase().includes(q) ||
      (u.id || '').toUpperCase().includes(q) ||
      (u.email || '').toUpperCase().includes(q)
    );
  });

  const pendingRequestsCount = (data?.purchaseRequests || []).filter(
    (r) => r.status === 'PENDING'
  ).length;

  const handleExecuteTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedPlayer?.accountId || searchQuery.trim();
    if (!targetId) {
      showNotice('error', 'يرجى اختيار لاعب أو كتابة Account ID أولاً');
      return;
    }

    setExecutingTopUp(true);
    sounds.playTap();
    try {
      const res = await executeOwnerTopUpRequest({
        ownerUserId: profile.id,
        ownerEmail: profile.email,
        targetQueryId: targetId,
        operation,
        coinsAmount: coinsCounter,
        bonusPackTier: bonusPack || undefined,
        bonusChestTier: bonusChest || undefined,
        noteAr: rechargeNote.trim() || undefined,
      });
      sounds.playGoalHorn();
      setSelectedPlayer(res.player);
      showNotice(
        'success',
        `تم تحديث حساب ${res.player.username} (${res.player.accountId}) بنجاح! الرصيد الجديد: ${res.player.coins.toLocaleString()} كوينز`
      );
      await loadDashboard();
      onRefreshProfile();
    } catch (err: unknown) {
      sounds.playWrong();
      showNotice('error', err instanceof Error ? err.message : 'فشل تنفيذ الشحن');
    } finally {
      setExecutingTopUp(false);
    }
  };

  const handleReviewRequest = async (requestId: string, decision: 'APPROVE' | 'REJECT') => {
    sounds.playTap();
    try {
      await reviewPurchaseRequestApi({
        ownerUserId: profile.id,
        ownerEmail: profile.email,
        requestId,
        decision,
      });
      sounds.playSuccess();
      showNotice(
        'success',
        decision === 'APPROVE'
          ? 'تمت الموافقة على الطلب وخصم الكوينز وتسليم المنتج للاعب بنجاح ✓'
          : 'تم رفض طلب الشراء'
      );
      await loadDashboard();
      onRefreshProfile();
    } catch (err: unknown) {
      sounds.playWrong();
      showNotice('error', err instanceof Error ? err.message : 'فشل معالجة الطلب');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.nameAr?.trim()) return;
    try {
      await saveStoreProductApi({
        ownerUserId: profile.id,
        ownerEmail: profile.email,
        product: editingProduct,
      });
      sounds.playSuccess();
      showNotice('success', 'تم حفظ المنتج في المتجر بنجاح ✓');
      setEditingProduct({
        section: 'PACKS',
        nameAr: '',
        descriptionAr: '',
        priceCoins: 300,
        rarity: 'Rare',
        packTier: 'GOLD',
        featured: true,
        limited: false,
        enabled: true,
        hidden: false,
      });
      await loadDashboard();
    } catch (err: unknown) {
      showNotice('error', err instanceof Error ? err.message : 'فشل حفظ المنتج');
    }
  };

  const handleSaveChatItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChat.textAr?.trim()) return;
    try {
      await saveQuickChatItemApi({
        ownerUserId: profile.id,
        ownerEmail: profile.email,
        item: editingChat,
      });
      sounds.playSuccess();
      showNotice('success', 'تم حفظ رسالة الغرفة السريعة بنجاح ✓');
      setEditingChat({
        textAr: '',
        category: 'CHALLENGE',
        categoryLabelAr: 'تحدي وحماس',
        priceCoins: 150,
        rarity: 'Rare',
        enabled: true,
        isStarterOwned: false,
      });
      await loadDashboard();
    } catch (err: unknown) {
      showNotice('error', err instanceof Error ? err.message : 'فشل حفظ الرسالة');
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg.nameAr?.trim()) return;
    try {
      await saveTopUpPackageRequest(editingPkg as TopUpPackageItem);
      sounds.playSuccess();
      showNotice('success', 'تم حفظ باقة الشحن بنجاح ✓');
      setEditingPkg({
        nameAr: '',
        coinsAmount: 2500,
        bonusCoins: 500,
        priceTextAr: '200 ج.م / $7.99',
        badgeAr: 'عرض خاص',
        theme: 'gold',
      });
      await loadDashboard();
    } catch (err: unknown) {
      showNotice('error', err instanceof Error ? err.message : 'فشل حفظ الباقة');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/45 rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
              OWNER CONTROL CENTER • {OWNER_EMAIL}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              لوحة تحكم المالك الشاملة (ADMIN)
            </h1>
            <p className="text-xs text-zinc-400">
              تحكم كامل في المستخدمين، شحن الـID، طلبات الشراء، منتجات المتجر، الباكات، ورسائل الشات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-black flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button
            onClick={onBack}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>عودة</span>
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-2xl border text-xs font-black flex items-center gap-2 ${
            banner.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
          }`}
        >
          {banner.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{banner.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'recharge', label: 'شحن اللاعبين بالـID', icon: <Coins className="w-4 h-4" /> },
          {
            id: 'requests',
            label: `طلبات الشراء (${pendingRequestsCount})`,
            icon: <Package className="w-4 h-4" />,
          },
          { id: 'products', label: 'إدارة منتجات المتجر', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'chat', label: 'إدارة رسائل الشات', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'packages', label: 'إدارة باقات الشحن', icon: <Users className="w-4 h-4" /> },
          { id: 'logs', label: 'سجل العمليات والأمان', icon: <FileText className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              sounds.playTap();
              setAdminTab(t.id as typeof adminTab);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shrink-0 transition-all ${
              adminTab === t.id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: RECHARGE BY ACCOUNT ID (GX-XXXXXX) ================= */}
      {adminTab === 'recharge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Player Search & Directory */}
          <div className="lg:col-span-5 bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>ابحث عن اللاعب بالـ Account ID أو الاسم</span>
            </h3>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثال: GX-849271 أو Ahmed_GX..."
              className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const isSelected = selectedPlayer?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedPlayer(u);
                      setSearchQuery(u.accountId);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatar || '/players/icon_zidane.jpg'}
                        alt={u.username}
                        className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">{u.username}</div>
                        <div className="font-chakra text-xs font-bold text-amber-400">
                          {u.accountId}
                        </div>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-chakra text-sm font-black text-amber-300">
                        {u.coins.toLocaleString()} 🪙
                      </div>
                      <div className="text-[10px] text-zinc-400">{u.rankPoints} RP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Counter & Package Selector */}
          <form
            onSubmit={handleExecuteTopUp}
            className="lg:col-span-7 bg-zinc-900/95 border border-amber-500/35 rounded-3xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  عداد الشحن المباشر والباقات (OWNER RECHARGE)
                </h3>
                <p className="text-xs text-zinc-400">
                  اختر باقة جاهزة أو استخدم العداد التفاعلي أو اكتب العدد الذي تريده مباشرة
                </p>
              </div>
              {selectedPlayer && (
                <div className="text-left">
                  <div className="text-xs font-black text-amber-400">
                    {selectedPlayer.username} ({selectedPlayer.accountId})
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    الرصيد الحالي: {selectedPlayer.coins.toLocaleString()} كوينز
                  </div>
                </div>
              )}
            </div>

            {/* Operation Mode */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'add', label: '+ إضافة وشحن كوينز' },
                { id: 'deduct', label: '- سحب وخصم كوينز' },
                { id: 'set', label: '= تحديد الرصيد مباشرة' },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setOperation(op.id as typeof operation)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all ${
                    operation === op.id
                      ? 'bg-amber-500 text-zinc-950 border-amber-300'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {/* Quick Package Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-amber-400">
                اختر باقة شحن جاهزة (أو خصص العدد بالأسفل):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(data?.topUpPackages || []).map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setCoinsCounter(pkg.coinsAmount + (pkg.bonusCoins || 0));
                      setBonusPack(pkg.bonusPackTier || '');
                      setBonusChest(pkg.bonusChestTier || '');
                      setRechargeNote(pkg.nameAr);
                    }}
                    className="p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-amber-500/30 text-right transition-all"
                  >
                    <div className="text-xs font-black text-white truncate">{pkg.nameAr}</div>
                    <div className="font-chakra text-sm font-black text-amber-400 mt-0.5">
                      {(pkg.coinsAmount + (pkg.bonusCoins || 0)).toLocaleString()} 🪙
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Counter */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <label className="block text-xs font-black text-zinc-300">
                العداد التفاعلي وكتابة العدد المطلوب:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCoinsCounter((c) => Math.max(0, c - 500))}
                  className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={coinsCounter}
                  onChange={(e) => setCoinsCounter(Math.max(0, Number(e.target.value) || 0))}
                  className="flex-1 bg-zinc-900 border-2 border-amber-500/50 rounded-xl py-2.5 px-4 text-center font-chakra text-2xl font-black text-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCoinsCounter((c) => c + 500)}
                  className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 2500, 5000, 10000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setCoinsCounter((c) => c + step)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-chakra font-black text-amber-300"
                  >
                    +{step.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Bonus Pack & Chest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  هدية باك مزخرف إضافي (اختياري)
                </label>
                <select
                  value={bonusPack}
                  onChange={(e) => setBonusPack(e.target.value as PackTierId | '')}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white"
                >
                  <option value="">بدون باك إضافي</option>
                  <option value="BRONZE">BRONZE PACK</option>
                  <option value="WEEKLY">WEEKLY / SILVER PACK</option>
                  <option value="GOLD">GOLD PACK</option>
                  <option value="ELITE">ELITE PACK</option>
                  <option value="ICON">ICON LEGENDARY PACK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">
                  هدية صندوق سانترا 3D (اختياري)
                </label>
                <select
                  value={bonusChest}
                  onChange={(e) => setBonusChest(e.target.value as SantraChestTier | '')}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white"
                >
                  <option value="">بدون صندوق 3D</option>
                  <option value="Bronze">Bronze 3D Chest</option>
                  <option value="Silver">Silver 3D Chest</option>
                  <option value="Gold">Gold 3D Chest</option>
                  <option value="Elite">Elite 3D Chest</option>
                  <option value="Legendary">Legendary 3D Chest</option>
                </select>
              </div>
            </div>

            <GoldButton type="submit" fullWidth size="lg" disabled={executingTopUp}>
              {executingTopUp ? 'جاري التنفيذ...' : 'تأكيد وشحن حساب اللاعب الآن'}
            </GoldButton>
          </form>
        </div>
      )}

      {/* ================= TAB 2: PURCHASE REQUESTS (APPROVE / REJECT) ================= */}
      {adminTab === 'requests' && (
        <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-black text-white">
            طلبات الشراء من المتجر ({data?.purchaseRequests.length || 0})
          </h3>
          {(data?.purchaseRequests || []).length === 0 ? (
            <p className="text-xs text-zinc-400">لا توجد طلبات شراء حاليًا.</p>
          ) : (
            <div className="space-y-3">
              {(data?.purchaseRequests || []).map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{req.productNameAr}</span>
                      <span className="font-chakra text-xs font-bold text-amber-400">
                        ({req.priceCoins.toLocaleString()} 🪙)
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      اللاعب: <strong className="text-white">{req.username}</strong> · الأيدي:{' '}
                      <strong className="text-amber-300 font-chakra">{req.accountId}</strong> · الحالة:{' '}
                      <strong className="text-emerald-400">{req.status}</strong>
                    </div>
                  </div>

                  {req.status === 'PENDING' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewRequest(req.id, 'APPROVE')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>موافقة وتسليم</span>
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req.id, 'REJECT')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-black text-zinc-400">{req.status}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: STORE PRODUCTS MANAGEMENT ================= */}
      {adminTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveProduct}
            className="lg:col-span-5 bg-zinc-900/95 border border-amber-500/35 rounded-3xl p-5 space-y-4"
          >
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>إضافة / تعديل منتج في المتجر</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">القسم</label>
              <select
                value={editingProduct.section}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    section: e.target.value as StoreSectionType,
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              >
                <option value="PACKS">PACKS (باكات مزخرفة)</option>
                <option value="CHAT_EFFECTS">CHAT_EFFECTS (تأثيرات شات)</option>
                <option value="PROFILE_ITEMS">PROFILE_ITEMS (إطارات وألقاب)</option>
                <option value="SPECIAL_ITEMS">SPECIAL_ITEMS (عناصر خاصة)</option>
                <option value="LIMITED">LIMITED (إصدار محدود)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">اسم المنتج</label>
              <input
                type="text"
                required
                value={editingProduct.nameAr || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">الوصف</label>
              <input
                type="text"
                value={editingProduct.descriptionAr || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">السعر (Coins)</label>
                <input
                  type="number"
                  min={10}
                  value={editingProduct.priceCoins || 100}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, priceCoins: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">الندرة</label>
                <select
                  value={editingProduct.rarity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      rarity: e.target.value as PackRarityTier,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                >
                  <option value="Common">Common</option>
                  <option value="Rare">Rare</option>
                  <option value="Epic">Epic</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
            </div>

            <GoldButton type="submit" fullWidth>
              حفظ المنتج في المتجر
            </GoldButton>
          </form>

          <div className="lg:col-span-7 bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 space-y-3 max-h-[540px] overflow-y-auto">
            <h3 className="text-base font-black text-white">
              منتجات المتجر الحالية ({data?.storeProducts.length || 0})
            </h3>
            {(data?.storeProducts || []).map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-black text-white">{prod.nameAr}</div>
                  <div className="text-[11px] text-zinc-400">
                    {prod.section} · {prod.priceCoins} كوينز · {prod.rarity}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingProduct(prod)}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-300"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      await deleteStoreProductApi({
                        ownerUserId: profile.id,
                        ownerEmail: profile.email,
                        productId: prod.id,
                      });
                      loadDashboard();
                    }}
                    className="p-2 rounded-xl bg-zinc-900 border border-rose-500/30 text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: QUICK CHAT ITEMS MANAGEMENT ================= */}
      {adminTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveChatItem}
            className="lg:col-span-5 bg-zinc-900/95 border border-amber-500/35 rounded-3xl p-5 space-y-4"
          >
            <h3 className="text-base font-black text-white">إضافة / تعديل رسالة غرف سريعة</h3>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">نص الرسالة</label>
              <input
                type="text"
                required
                value={editingChat.textAr || ''}
                onChange={(e) => setEditingChat({ ...editingChat, textAr: e.target.value })}
                placeholder="مثال: استنى بس 😏"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">التصنيف</label>
                <select
                  value={editingChat.category}
                  onChange={(e) =>
                    setEditingChat({
                      ...editingChat,
                      category: e.target.value as QuickChatCategory,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                >
                  <option value="SALAM">سلام</option>
                  <option value="FUN">هزار</option>
                  <option value="TAUNT">غيظ</option>
                  <option value="CHALLENGE">تحدي</option>
                  <option value="LATE">تأخير</option>
                  <option value="LUCK">حظ</option>
                  <option value="GOOD_PLAYER">لاعب قوي</option>
                  <option value="BAD_PLAYER">لاعب ضعيف</option>
                  <option value="CELEBRATION">احتفال</option>
                  <option value="CONFIDENCE">ثقة</option>
                  <option value="RESPECT">احترام</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">السعر (Coins)</label>
                <input
                  type="number"
                  min={10}
                  value={editingChat.priceCoins || 150}
                  onChange={(e) =>
                    setEditingChat({ ...editingChat, priceCoins: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400"
                />
              </div>
            </div>

            <GoldButton type="submit" fullWidth>
              حفظ الرسالة السريعة
            </GoldButton>
          </form>

          <div className="lg:col-span-7 bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 space-y-2.5 max-h-[540px] overflow-y-auto">
            <h3 className="text-base font-black text-white">
              رسائل الشات المعتمدة ({data?.quickChatCatalog.length || 0})
            </h3>
            {(data?.quickChatCatalog || []).map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-black text-white">{msg.textAr}</div>
                  <div className="text-[10px] text-zinc-400">
                    {msg.categoryLabelAr} · {msg.priceCoins} كوينز
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await deleteQuickChatItemApi({
                      ownerUserId: profile.id,
                      ownerEmail: profile.email,
                      messageId: msg.id,
                    });
                    loadDashboard();
                  }}
                  className="p-2 rounded-xl bg-zinc-900 border border-rose-500/30 text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: TOP-UP PACKAGES MANAGEMENT ================= */}
      {adminTab === 'packages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSavePackage}
            className="lg:col-span-5 bg-zinc-900/95 border border-amber-500/35 rounded-3xl p-5 space-y-4"
          >
            <h3 className="text-base font-black text-white">إضافة / تعديل باقة شحن</h3>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">اسم الباقة</label>
              <input
                type="text"
                required
                value={editingPkg.nameAr || ''}
                onChange={(e) => setEditingPkg({ ...editingPkg, nameAr: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">الكوينز الأساسي</label>
                <input
                  type="number"
                  value={editingPkg.coinsAmount || 1000}
                  onChange={(e) =>
                    setEditingPkg({ ...editingPkg, coinsAmount: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">كوينز إضافي (Bonus)</label>
                <input
                  type="number"
                  value={editingPkg.bonusCoins || 0}
                  onChange={(e) =>
                    setEditingPkg({ ...editingPkg, bonusCoins: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">السعر المعروض</label>
              <input
                type="text"
                value={editingPkg.priceTextAr || ''}
                onChange={(e) => setEditingPkg({ ...editingPkg, priceTextAr: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>
            <GoldButton type="submit" fullWidth>
              حفظ الباقة
            </GoldButton>
          </form>

          <div className="lg:col-span-7 bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-base font-black text-white">باقات الشحن الحالية</h3>
            {(data?.topUpPackages || []).map((pkg) => (
              <div
                key={pkg.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-black text-white">{pkg.nameAr}</div>
                  <div className="text-[11px] text-amber-400">
                    {pkg.coinsAmount.toLocaleString()} + {pkg.bonusCoins.toLocaleString()} كوينز ·{' '}
                    {pkg.priceTextAr}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await deleteTopUpPackageRequest(pkg.id);
                    loadDashboard();
                  }}
                  className="p-2 rounded-xl bg-zinc-900 border border-rose-500/30 text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: COIN TRANSACTIONS & SECURITY LOGS ================= */}
      {adminTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 space-y-3 max-h-[520px] overflow-y-auto">
            <h3 className="text-base font-black text-white">سجل معاملات الكوينز</h3>
            {(data?.coinTransactions || []).map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-black">
                  <span className="text-white">
                    {tx.username} ({tx.accountId})
                  </span>
                  <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} 🪙
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">{tx.reason}</div>
                <div className="text-[10px] text-zinc-500">
                  الرصيد: {tx.beforeBalance} ← {tx.afterBalance}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 space-y-3 max-h-[520px] overflow-y-auto">
            <h3 className="text-base font-black text-white">سجل الحماية والأمان (Security Logs)</h3>
            {(data?.securityLogs || []).length === 0 ? (
              <p className="text-xs text-zinc-500">لا توجد تنبيهات أمنية مسجلة.</p>
            ) : (
              (data?.securityLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-rose-500/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-black text-rose-400">
                    <span>{log.action}</span>
                    <span>{log.status}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">{log.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
