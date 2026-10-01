import React, { useState, useEffect } from 'react';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import { UserProfile, StoreProduct, StoreCategory, ItemRarity, PurchaseRecord } from '../../types/game';
import { 
  ShieldCheck, 
  Database, 
  Coins, 
  Trophy, 
  Users, 
  X, 
  RefreshCw, 
  Check, 
  Crown, 
  Search, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  Tag
} from 'lucide-react';

interface AdminControlModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

interface AdminData {
  snapshot: {
    totalUsers: number;
    users: Array<{
      id: string;
      accountId: string;
      username: string;
      role: string;
      coins: number;
      bids: number;
      points: number;
      inventoryCount: number;
      matchesPlayed: number;
      matchesWon: number;
      createdAt: number;
      lastLogin: number;
    }>;
    products: StoreProduct[];
    recentPurchases: PurchaseRecord[];
    matchLogs: Array<{
      id: string;
      roomCode: string;
      hostName: string;
      guestName: string;
      score: string;
      winner: string;
      timestamp: number;
    }>;
    adminLogs: Array<{
      id: string;
      adminId: string;
      action: string;
      targetAccountId?: string;
      targetUsername?: string;
      details: string;
      timestamp: number;
    }>;
    serverUptime: number;
  };
  activeRooms: any[];
  rankings: any;
  serverTime: number;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  userProfile,
  onUpdateProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recharge' | 'store_admin' | 'purchases' | 'database'>('recharge');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Recharge Player State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPlayer, setSearchedPlayer] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [customCoins, setCustomCoins] = useState('500');
  const [rechargeReason, setRechargeReason] = useState('شحن يدوي من الإدارة');
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);

  // Create Product Form State
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<StoreCategory>('chat_effects');
  const [newProdPrice, setNewProdPrice] = useState('300');
  const [newProdRarity, setNewProdRarity] = useState<ItemRarity>('epic');
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80');
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [newProdLimited, setNewProdLimited] = useState(false);
  const [productSuccess, setProductSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database');
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
      }
    } catch {
      // Fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Search player by Account ID or Username
  const handleSearchPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchError(null);
    sounds.playTap();

    try {
      const res = await fetch('/api/admin/search-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setSearchedPlayer(data.user);
      } else {
        setSearchError(data.error || 'لم يتم العثور على اللاعب');
        setSearchedPlayer(null);
      }
    } catch {
      setSearchError('فشل الاتصال بالسيرفر');
      setSearchedPlayer(null);
    }
  };

  // Adjust coins for searched player
  const handleAdjustPlayerCoins = async (amount: number) => {
    if (!searchedPlayer) return;
    sounds.playGoalHorn();

    try {
      const res = await fetch('/api/admin/adjust-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserIdOrAccountId: searchedPlayer.id,
          coinsDelta: amount,
          adminId: userProfile.id,
          reason: rechargeReason
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setSearchedPlayer(data.user);
        setRechargeSuccess(`تمت ${amount >= 0 ? 'إضافة' : 'خصم'} ${Math.abs(amount)} كوينز بنجاح! الرصيد الجديد: ${data.user.coins} Coins`);
        setTimeout(() => setRechargeSuccess(null), 3500);

        // If adjusting current user, sync profile
        if (searchedPlayer.id === userProfile.id || searchedPlayer.accountId === userProfile.accountId) {
          onUpdateProfile({ ...userProfile, coins: data.user.coins });
        }
        fetchAdminData();
      }
    } catch (err: unknown) {
      setSearchError('فشل تعديل الرصيد');
    }
  };

  // Create new store product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playButtonClick();

    try {
      const res = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName || 'Custom Item',
          nameAr: newProdNameAr || 'عنصر جديد',
          category: newProdCategory,
          price: Number(newProdPrice) || 100,
          rarity: newProdRarity,
          description: newProdDescAr,
          descriptionAr: newProdDescAr || 'عنصر فاخر وحصري في GOALIX',
          image: newProdImage,
          isFeatured: newProdFeatured,
          isLimited: newProdLimited,
          isNew: true
        })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playCorrect();
        setProductSuccess(`تم إنشاء المنتج "${newProdNameAr}" بنجاح في المتجر!`);
        setShowCreateProduct(false);
        setNewProdNameAr('');
        setNewProdDescAr('');
        setTimeout(() => setProductSuccess(null), 3000);
        fetchAdminData();
      }
    } catch {
      // Error
    }
  };

  // Toggle active / deactivate product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في إيقاف / حذف هذا المنتج من المتجر؟')) return;
    sounds.playButtonClick();

    try {
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        sounds.playWrong();
        fetchAdminData();
      }
    } catch {
      // Error
    }
  };

  const handleExportDatabase = () => {
    sounds.playButtonClick();
    if (!adminData) return;
    const blob = new Blob([JSON.stringify(adminData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goalix_database_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none font-tajawal antialiased">
      <div className="max-w-2xl w-full bg-[#0a0c10] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white font-tajawal">
                  غرفة الإدارة والمتجر المركزي
                </h2>
                <span className="text-[10px] font-chakra px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ADMINISTRATOR
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-tajawal">
                تحكم كامل بالمتجر، وشحن الكوينز عبر Account ID، وقاعدة البيانات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playButtonClick();
                fetchAdminData();
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                sounds.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'recharge' ? 'bg-amber-500 text-black font-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>البحث والشحن بالـ ID</span>
          </button>

          <button
            onClick={() => setActiveTab('store_admin')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'store_admin' ? 'bg-amber-500 text-black font-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>إدارة المتجر والمنتجات ({adminData?.snapshot?.products?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'purchases' ? 'bg-amber-500 text-black font-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>سجل المشتريات العام ({adminData?.snapshot?.recentPurchases?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-amber-500 text-black font-black shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>الحسابات المسجلة ({adminData?.snapshot?.totalUsers || 0})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* TAB 1: PLAYER SEARCH & COINS RECHARGE VIA ACCOUNT ID */}
          {activeTab === 'recharge' && (
            <div className="space-y-4">
              {/* Search Form */}
              <div className="bg-zinc-900/90 rounded-2xl p-4 border border-amber-500/40 space-y-3">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Search className="w-4 h-4" />
                  <span>البحث عن لاعب لشحن الكوينز (باستخدام Account ID أو Username):</span>
                </div>

                <form onSubmit={handleSearchPlayer} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="أدخل Account ID (مثال: GX-849271) أو اسم المدرب"
                    className="flex-1 bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <GoldButton size="sm" type="submit">
                    بحث 🔍
                  </GoldButton>
                </form>

                {searchError && (
                  <p className="text-xs text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{searchError}</span>
                  </p>
                )}

                {rechargeSuccess && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{rechargeSuccess}</span>
                  </p>
                )}
              </div>

              {/* Searched Player Card & Recharge Controls */}
              {searchedPlayer && (
                <div className="bg-gradient-to-r from-[#171206] via-[#100d05] to-black rounded-3xl p-4 border-2 border-amber-500/60 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400 bg-zinc-800">
                        <img src={searchedPlayer.avatar} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{searchedPlayer.username}</h4>
                        <div className="flex items-center gap-1.5 font-chakra">
                          <Tag className="w-3 h-3 text-amber-400" />
                          <span className="text-xs font-black text-yellow-300">{searchedPlayer.accountId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-chakra">
                      <span className="text-[10px] text-zinc-400 block font-tajawal">الرصيد الحالي:</span>
                      <div className="flex items-center gap-1 text-amber-400 font-black text-base">
                        <Coins className="w-4 h-4" />
                        <span>{searchedPlayer.coins} Coins</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Recharge Actions */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300 block">إضافة رصيد كوينز فوري (+):</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 500, 1000, 5000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAdjustPlayerCoins(amt)}
                          className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-chakra font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
                        >
                          +{amt} 🪙
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Deduct Actions */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300 block">خصم كوينز (-):</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[-100, -500, -1000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAdjustPlayerCoins(amt)}
                          className="py-2 px-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 font-chakra font-black text-xs transition-all active:scale-95 cursor-pointer text-center"
                        >
                          {amt} 🪙
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Coins Amount */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="number"
                      value={customCoins}
                      onChange={e => setCustomCoins(e.target.value)}
                      placeholder="كمية مخصصة"
                      className="w-32 bg-black/60 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-chakra text-center focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAdjustPlayerCoins(Number(customCoins) || 0)}
                      className="flex-1 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      تنفيذ الشحن المخصص ⚡
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STORE CATALOG MANAGEMENT */}
          {activeTab === 'store_admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">قائمة معروضات المتجر الرسمية:</span>
                <button
                  type="button"
                  onClick={() => setShowCreateProduct(!showCreateProduct)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center gap-1 hover:bg-amber-400 transition-all cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showCreateProduct ? 'إلغاء' : 'إضافة منتج جديد للمتجر'}</span>
                </button>
              </div>

              {productSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{productSuccess}</span>
                </div>
              )}

              {/* Create Product Form */}
              {showCreateProduct && (
                <form onSubmit={handleCreateProduct} className="bg-zinc-900 rounded-2xl p-4 border border-amber-500/40 space-y-3">
                  <span className="text-xs font-black text-amber-400 block border-b border-zinc-800 pb-2">
                    إنشاء منتج متجر جديد
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">اسم المنتج (عربي):</label>
                      <input
                        type="text"
                        value={newProdNameAr}
                        onChange={e => setNewProdNameAr(e.target.value)}
                        placeholder="مثال: تأثير اللهب الناري"
                        required
                        className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">اسم المنتج (English):</label>
                      <input
                        type="text"
                        value={newProdName}
                        onChange={e => setNewProdName(e.target.value)}
                        placeholder="e.g. Fire Aura"
                        className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">القسم:</label>
                      <select
                        value={newProdCategory}
                        onChange={e => setNewProdCategory(e.target.value as StoreCategory)}
                        className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-white"
                      >
                        <option value="chat_effects">✨ تأثيرات الشات</option>
                        <option value="profile_items">🖼️ إطارات البروفايل</option>
                        <option value="chat_messages">💬 رسائل الشات</option>
                        <option value="special_items">🏆 ألقاب تكتيكية</option>
                        <option value="limited_items">🔥 عناصر محدودة</option>
                        <option value="packs">🎁 باقات بطاقات</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">السعر بالـ Coins:</label>
                      <input
                        type="number"
                        value={newProdPrice}
                        onChange={e => setNewProdPrice(e.target.value)}
                        className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-white font-chakra"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">الندرة:</label>
                      <select
                        value={newProdRarity}
                        onChange={e => setNewProdRarity(e.target.value as ItemRarity)}
                        className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2 py-1.5 text-xs text-white"
                      >
                        <option value="common">شائع (Common)</option>
                        <option value="rare">نادر (Rare)</option>
                        <option value="epic">ملحمي (Epic)</option>
                        <option value="legendary">أسطوري (Legendary)</option>
                        <option value="mythic">خرافي (Mythic)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">الوصف بالعربية:</label>
                    <input
                      type="text"
                      value={newProdDescAr}
                      onChange={e => setNewProdDescAr(e.target.value)}
                      placeholder="وصف مميزات العنصر..."
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex gap-4 pt-1 text-xs text-zinc-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdFeatured}
                        onChange={e => setNewProdFeatured(e.target.checked)}
                      />
                      <span>عنصر مميز (Featured 🔥)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdLimited}
                        onChange={e => setNewProdLimited(e.target.checked)}
                      />
                      <span>عنصر محدود (Limited ⏳)</span>
                    </label>
                  </div>

                  <GoldButton size="sm" type="submit" fullWidth>
                    إضافة المنتج فوراً للمتجر
                  </GoldButton>
                </form>
              )}

              {/* Products List Table */}
              <div className="space-y-2">
                {adminData?.snapshot?.products?.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 bg-black shrink-0">
                        <img src={p.image} alt={p.nameAr} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-white truncate">{p.nameAr}</h5>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-amber-400 border border-zinc-800 uppercase font-chakra">
                            {p.rarity}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block font-chakra">
                          {p.category} · {p.price} Coins · بيع {p.purchasedCount || 0} مرة
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/40 transition-all cursor-pointer"
                        title="إيقاف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL PURCHASES HISTORY */}
          {activeTab === 'purchases' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">سجل كافة عمليات الشراء باللعبة:</span>
              {(!adminData?.snapshot?.recentPurchases || adminData.snapshot.recentPurchases.length === 0) ? (
                <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/50 rounded-2xl">
                  لا توجد عمليات شراء مسجلة بعد
                </div>
              ) : (
                adminData.snapshot.recentPurchases.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{rec.productName}</span>
                        <span className="text-[9px] font-chakra text-yellow-300 bg-black/60 px-1.5 py-0.2 rounded border border-zinc-800">
                          {rec.accountId}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block font-tajawal">
                        المدرب: {rec.username} · العملية: {rec.id}
                      </span>
                    </div>

                    <div className="text-left font-chakra font-black text-amber-400 text-xs">
                      <span>{rec.price} Coins</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: DATABASE & USERS LIST */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">الحسابات المسجلة بقاعدة البيانات:</span>
                <button
                  type="button"
                  onClick={handleExportDatabase}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير نسخة احتياطية (JSON)</span>
                </button>
              </div>

              <div className="space-y-2">
                {adminData?.snapshot?.users?.map(u => (
                  <div key={u.id} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{u.username}</span>
                        <span className="text-[9px] font-chakra font-bold text-yellow-300 bg-black px-1.5 py-0.2 rounded">
                          {u.accountId}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-chakra block">
                        فوز: {u.matchesWon} · مباريات: {u.matchesPlayed} · مقتنيات: {u.inventoryCount || 0}
                      </span>
                    </div>

                    <div className="text-left font-chakra">
                      <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                        <Coins className="w-3 h-3" />
                        <span>{u.coins}</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-chakra">
                        {u.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
