import React from 'react';
import { StoreProduct, UserProfile } from '../../types/game';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { X, Coins, Sparkles, Check, AlertCircle, Flame, Shield, Crown, Gem, Star } from 'lucide-react';

interface ProductDetailModalProps {
  product: StoreProduct;
  userProfile: UserProfile;
  isOwned: boolean;
  onPurchase: (product: StoreProduct) => void;
  onClose: () => void;
}

const RARITY_MAP: Record<string, { labelAr: string; color: string; bg: string; icon: any }> = {
  common: { labelAr: 'شائع (Common)', color: 'text-zinc-300', bg: 'bg-zinc-800/80 border-zinc-600', icon: Star },
  rare: { labelAr: 'نادر (Rare)', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-500/50', icon: Shield },
  epic: { labelAr: 'ملحمي (Epic)', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-500/50', icon: Gem },
  legendary: { labelAr: 'أسطوري (Legendary)', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-500/50', icon: Crown },
  mythic: { labelAr: 'خرافي محدود (Mythic)', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-500/50', icon: Flame }
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  userProfile,
  isOwned,
  onPurchase,
  onClose
}) => {
  const rarity = RARITY_MAP[product.rarity] || RARITY_MAP.common;
  const RarityIcon = rarity.icon;
  const canAfford = userProfile.coins >= product.price;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-tajawal antialiased">
      <div className="max-w-sm w-full bg-[#0d0f14] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative space-y-4 overflow-hidden">
        {/* Top Glow Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        {/* Modal Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold font-chakra uppercase shadow-sm"
               style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(0,0,0,0.6)' }}>
            <RarityIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className={rarity.color}>{rarity.labelAr}</span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image / Big Preview */}
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 border-zinc-800 bg-black/80 shadow-2xl group flex items-center justify-center">
          <img
            src={product.image}
            alt={product.nameAr}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Badges Over Image */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            {product.isFeatured && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase shadow">
                🔥 FEATURED
              </span>
            )}
            {product.isLimited && (
              <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase shadow">
                ⏳ LIMITED
              </span>
            )}
          </div>
        </div>

        {/* Product Title & Category */}
        <div className="space-y-1 text-right">
          <h3 className="text-base sm:text-lg font-black text-white font-tajawal">
            {product.nameAr}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-tajawal">
            {product.descriptionAr}
          </p>
        </div>

        {/* Price & Balance Showcase */}
        <div className="bg-black/60 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block font-tajawal">سعر العنصر:</span>
            <div className="flex items-center gap-1.5 font-chakra font-black text-amber-400 text-lg">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>{product.price} Coins</span>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-zinc-400 block font-tajawal">رصيدك الحالي:</span>
            <span className={`font-chakra font-bold text-sm ${canAfford ? 'text-zinc-200' : 'text-red-400'}`}>
              {userProfile.coins} Coins
            </span>
          </div>
        </div>

        {/* Ownership Status & Action Button */}
        {isOwned ? (
          <div className="py-2.5 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 shadow">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>✓ هذا العنصر مملوك لك بالفعل ومحفوظ بحسابك</span>
          </div>
        ) : (
          <div className="space-y-2">
            {!canAfford && (
              <p className="text-[11px] text-red-400 text-center font-tajawal font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>رصيدك غير كافٍ — اطلب شحن الكوينز من الإدارة عبر Account ID</span>
              </p>
            )}

            <GoldButton
              onClick={() => onPurchase(product)}
              disabled={!canAfford}
              fullWidth
              size="lg"
            >
              <Coins className="w-4 h-4 text-zinc-950" />
              <span>شراء بـ {product.price} Coins</span>
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  );
};
