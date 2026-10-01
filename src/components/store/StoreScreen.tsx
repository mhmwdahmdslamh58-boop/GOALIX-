import React, { useState, useEffect } from 'react';
import { CardTier, Player, UserProfile, StoreProduct, StoreCategory } from '../../types/game';
import { fetchStoreProducts, purchaseProductOnServer } from '../../services/store';
import { addPlayerToCollection, getUserSquad, saveUserSquad } from '../../services/storage';
import { PackOpeningModal } from './PackOpeningModal';
import { Pack3DView } from './Pack3DView';
import { ProductDetailModal } from './ProductDetailModal';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { 
  Coins, 
  Sparkles, 
  Shield, 
  AlertCircle, 
  ShoppingBag, 
  Crown, 
  MessageSquare, 
  Flame, 
  Image as ImageIcon, 
  Trophy, 
  Check, 
  Filter, 
  Copy, 
  CheckCircle2, 
  Zap,
  Tag
} from 'lucide-react';

interface StoreScreenProps {
  userProfile: UserProfile;
  onCoinsUpdated: (newCoins: number) => void;
  onUpdateProfile?: (updated: UserProfile) => void;
}

const CATEGORIES: { id: StoreCategory; labelAr: string; icon: any }[] = [
  { id: 'coins', labelAr: 'شحن Coins 🪙', icon: Coins },
  { id: 'packs', labelAr: 'باقات البطاقات 🎁', icon: ShoppingBag },
  { id: 'chat_messages', labelAr: 'شعارات الشات 💬', icon: MessageSquare },
  { id: 'chat_effects', labelAr: 'تأثيرات الشات ✨', icon: Sparkles },
  { id: 'profile_items', labelAr: 'إطارات البروفايل 🖼️', icon: ImageIcon },
  { id: 'special_items', labelAr: 'ألقاب تكتيكية 🏆', icon: Trophy },
  { id: 'limited_items', labelAr: 'عناصر محدودة 🔥', icon: Flame },
];

export const StoreScreen: React.FC<StoreScreenProps> = ({ 
  userProfile, 
  onCoinsUpdated, 
  onUpdateProfile 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory>('packs');
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'new' | 'limited'>('all');
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePackOpening, setActivePackOpening] = useState<{ tier: CardTier; player: Player } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Load products from backend server
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const list = await fetchStoreProducts();
      if (mounted) {
        setProducts(list);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const accountId = userProfile.accountId || 'GX-849271';
  const ownedSet = new Set(userProfile.inventory || []);

  const handleCopyAccountId = () => {
    sounds.playTap();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accountId);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Authoritative Server-Side Purchase
  const handlePurchase = async (product: StoreProduct) => {
    setErrorMsg(null);
    sounds.playButtonClick();

    try {
      const res = await purchaseProductOnServer(userProfile.id, product.id);
      
      // Update coins and inventory on client
      onCoinsUpdated(res.user.coins);
      if (onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          coins: res.user.coins,
          inventory: res.user.inventory,
          purchaseHistory: res.user.purchaseHistory
        });
      }

      sounds.playCorrect();
      setSuccessToast(`تم شراء "${product.nameAr}" بنجاح! ✓`);
      setTimeout(() => setSuccessToast(null), 3000);

      // Close product detail modal
      setSelectedProduct(null);

      // If it's a pack, trigger 3D walkout opening sequence
      if (product.category === 'packs' && product.tier && res.rewardPlayer) {
        addPlayerToCollection(res.rewardPlayer);
        setActivePackOpening({ tier: product.tier, player: res.rewardPlayer });
      }
    } catch (err: unknown) {
      sounds.playWrong();
      setErrorMsg(err instanceof Error ? err.message : 'فشل إتمام الشراء');
    }
  };

  const handleAddToSquad = (player: Player) => {
    const currentSquad = getUserSquad();
    const targetIdx = currentSquad.findIndex(p => p?.position === player.position);
    if (targetIdx !== -1) {
      currentSquad[targetIdx] = player;
    } else {
      currentSquad[0] = player;
    }
    saveUserSquad(currentSquad);
  };

  const handleAddToBench = (player: Player) => {
    addPlayerToCollection(player);
  };

  // Filter products by selected category and badge filter
  const filteredProducts = products.filter(p => {
    if (p.category !== selectedCategory) return false;
    if (filterType === 'featured') return p.isFeatured;
    if (filterType === 'new') return p.isNew;
    if (filterType === 'limited') return p.isLimited;
    return true;
  });

  return (
    <div className="pb-24 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-4 select-none font-tajawal antialiased">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce border border-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Store Header Banner */}
      <div className="bg-gradient-to-r from-[#171206] via-[#100d05] to-black rounded-3xl p-4 border-2 border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-chakra font-black text-lg text-white tracking-wider">
                GOALIX OFFICIAL STORE
              </h3>
              <p className="text-[10px] text-zinc-400">المتجر المعتمد للبطاقات والتأثيرات التكتيكية</p>
            </div>
          </div>

          {/* Current Coins Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 rounded-2xl border border-amber-500/40 text-amber-300 font-chakra font-black text-sm shadow">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{userProfile.coins}</span>
          </div>
        </div>

        {/* Account ID Recharge Banner */}
        <div className="bg-black/60 rounded-2xl p-2.5 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-zinc-400 block">ID الشحن الخاص بك:</span>
              <span className="font-chakra font-black text-xs text-yellow-300">{accountId}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyAccountId}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedId ? 'تم النسخ ✓' : 'نسخ ID'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 7 CATEGORY SELECTOR CAROUSEL */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-zinc-400 block px-1">أقسام المتجر المعتمدة:</span>
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setSelectedCategory(cat.id);
                  setErrorMsg(null);
                }}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black scale-105 shadow-amber-500/20'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                <span>{cat.labelAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-FILTER BUTTONS (Featured, New, Limited, All) */}
      <div className="flex items-center gap-1.5 text-xs font-bold bg-black/40 p-1 rounded-2xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            filterType === 'all' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          الكل
        </button>
        <button
          type="button"
          onClick={() => setFilterType('featured')}
          className={`flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            filterType === 'featured' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🔥 المميزة
        </button>
        <button
          type="button"
          onClick={() => setFilterType('new')}
          className={`flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            filterType === 'new' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ✨ الجديدة
        </button>
        <button
          type="button"
          onClick={() => setFilterType('limited')}
          className={`flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            filterType === 'limited' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          ⏳ المحدودة
        </button>
      </div>

      {/* COINS SECTION SPECIAL CARD */}
      {selectedCategory === 'coins' && (
        <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black rounded-3xl p-4 border border-amber-500/40 space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300">كيفية شحن رصيد الكوينز:</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-tajawal">
            1. انسخ معرّف الحساب الخاص بك: <strong className="font-chakra text-yellow-300">{accountId}</strong><br />
            2. زوّد به إدارة المنصة أو المطور عبر لوحة الإدارة لإضافة الكوينز فورياً إلى حسابك.<br />
            3. يتم حفظ وتحديث رصيدك بشكل دائم على السيرفر المركزي.
          </p>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500 font-bold text-xs space-y-2">
          <Sparkles className="w-6 h-6 text-amber-400 mx-auto animate-spin" />
          <p>جارٍ تحميل معروضات المتجر من السيرفر...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 font-bold text-xs space-y-2 bg-zinc-900/40 rounded-3xl border border-zinc-800">
          <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">لا توجد عناصر متاحة بهذا التصنيف حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProducts.map(product => {
            const isOwned = ownedSet.has(product.id);
            const isPack = product.category === 'packs';
            const canAfford = userProfile.coins >= product.price;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`rounded-3xl p-3.5 border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group cursor-pointer shadow-xl ${
                  product.isFeatured
                    ? 'bg-gradient-to-b from-[#1b1407] to-[#090805] border-amber-500/50 hover:border-amber-400'
                    : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Visual Header / Badges */}
                <div className="flex items-center justify-between text-[9px] font-chakra font-black">
                  <div className="flex items-center gap-1">
                    {product.isFeatured && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black shadow">
                        FEATURED
                      </span>
                    )}
                    {product.isLimited && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white shadow">
                        LIMITED
                      </span>
                    )}
                    {product.isNew && (
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white shadow">
                        NEW
                      </span>
                    )}
                  </div>

                  <span className="px-2 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-800 uppercase">
                    {product.rarity}
                  </span>
                </div>

                {/* 3D PACK VIEW OR IMAGE PREVIEW */}
                {isPack && product.tier ? (
                  <div className="py-2 flex items-center justify-center">
                    <Pack3DView tier={product.tier} />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-inner">
                    <img
                      src={product.image}
                      alt={product.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                )}

                {/* Title & Description */}
                <div className="space-y-1 text-right">
                  <h4 className="font-bold text-sm text-white font-tajawal group-hover:text-amber-300 transition-colors">
                    {product.nameAr}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {product.descriptionAr}
                  </p>
                </div>

                {/* Price & Purchase Action */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-chakra font-black text-amber-400 text-sm">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{product.price}</span>
                  </div>

                  {isOwned ? (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>✓ مملوك</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(product);
                      }}
                      disabled={!canAfford}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black font-black active:scale-95'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'شراء' : 'غير كافٍ'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          userProfile={userProfile}
          isOwned={ownedSet.has(selectedProduct.id)}
          onPurchase={handlePurchase}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* PACK OPENING WALKOUT CASINO MODAL */}
      {activePackOpening && (
        <PackOpeningModal
          tier={activePackOpening.tier}
          rewardPlayer={activePackOpening.player}
          onAddToSquad={handleAddToSquad}
          onAddToBench={handleAddToBench}
          onClose={() => setActivePackOpening(null)}
        />
      )}
    </div>
  );
};
