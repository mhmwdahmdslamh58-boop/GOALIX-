import React, { useState } from 'react';
import { CardTier, Player, UserProfile } from '../../types/game';
import { openPackReward } from '../../data/players';
import { deductCoinsFromUser, addPlayerToCollection, getUserSquad, saveUserSquad } from '../../services/storage';
import { PackOpeningModal } from './PackOpeningModal';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { Coins, Sparkles, Shield, AlertCircle, ShoppingBag } from 'lucide-react';

interface StoreScreenProps {
  userProfile: UserProfile;
  onCoinsUpdated: (newCoins: number) => void;
}

export const StoreScreen: React.FC<StoreScreenProps> = ({ userProfile, onCoinsUpdated }) => {
  const [activePackOpening, setActivePackOpening] = useState<{ tier: CardTier; player: Player } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const packs = [
    {
      tier: 'WEEKLY' as CardTier,
      name: 'WEEKLY PACK',
      nameAr: 'حزمة الأسبوع',
      price: 50,
      ovrRange: '77 – 85',
      descAr: 'لاعبون مميزون من الدوريات الكبرى الحالية',
      featured: 'ساكا · أوديغارد · ساليبا · كين · ديماركو',
      border: 'border-zinc-700',
      bgGradient: 'from-zinc-900 to-zinc-950',
      btnText: 'شراء بـ 50 كوينز'
    },
    {
      tier: 'ELITE' as CardTier,
      name: 'ELITE RUSH',
      nameAr: 'نخبة العالم (ELITE)',
      price: 250,
      ovrRange: '86 – 95',
      descAr: 'صفوة نجوم العالم وأبرز المرشحين للكرة الذهبية',
      featured: 'ميسي · رونالدو · مبابي · هالاند · بيلينجهام',
      border: 'border-amber-500/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]',
      bgGradient: 'from-[#1f1706] to-[#0a0906]',
      btnText: 'شراء بـ 250 كوينز'
    },
    {
      tier: 'ICON' as CardTier,
      name: 'ICON LEGACY',
      nameAr: 'أساطير التاريخ (ICON)',
      price: 500,
      ovrRange: '96 – 105',
      descAr: 'أعظم أساطير كرة القدم عبر التاريخ حصرياً',
      featured: 'بيليه · مارادونا · زيدان · رونالدينيو · مالديني',
      border: 'border-yellow-400/80 shadow-[0_0_30px_rgba(252,226,137,0.35)]',
      bgGradient: 'from-[#2e2107] to-[#0b0803]',
      btnText: 'شراء بـ 500 كوينز'
    }
  ];

  const handleBuyPack = (tier: CardTier, price: number) => {
    setErrorMsg(null);
    sounds.playTap();

    const success = deductCoinsFromUser(price);
    if (!success) {
      setErrorMsg(`عذراً، رصيدك الحالي (${userProfile.coins} كوينز) لا يكفي لشراء هذه الحزمة.`);
      return;
    }

    onCoinsUpdated(userProfile.coins - price);
    const reward = openPackReward(tier);
    addPlayerToCollection(reward);
    setActivePackOpening({ tier, player: reward });
  };

  const handleAddToSquad = (player: Player) => {
    const currentSquad = getUserSquad();
    // Replace same position or first slot
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

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Store Header Banner */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-chakra font-black text-lg text-zinc-100">
              GOALIX STORE
            </h3>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-300 font-chakra font-bold text-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="tabular-nums text-sm">{userProfile.coins}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 font-tajawal leading-relaxed">
          افتح حزم بطاقات كرة القدم واستمتع بعروض الـ Walkout السينمائية الحصرية بالمتجر. اللاعبون البارزون في الوصف هم أمثلة توضيحية.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/50 flex items-center gap-2 text-xs text-red-200 font-tajawal">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Packs List */}
      <div className="space-y-3">
        {packs.map(pack => (
          <div
            key={pack.tier}
            className={`rounded-2xl p-4 border ${pack.border} bg-gradient-to-b ${pack.bgGradient} shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden`}
          >
            {/* Subtle glow circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-wider block">
                  {pack.name}
                </span>
                <h4 className="text-base font-bold font-tajawal text-zinc-100 mt-0.5">
                  {pack.nameAr}
                </h4>
                <p className="text-xs text-zinc-400 font-tajawal mt-1">{pack.descAr}</p>
              </div>

              <div className="text-center px-2.5 py-1 bg-black/60 rounded-xl border border-amber-500/30 shrink-0">
                <span className="text-[9px] text-zinc-400 font-chakra block">OVR RANGE</span>
                <span className="font-chakra font-black text-amber-300 text-sm">
                  {pack.ovrRange}
                </span>
              </div>
            </div>

            {/* Featured stars snippet */}
            <div className="text-[11px] text-zinc-400 font-tajawal pt-1 border-t border-white/5">
              <span>نجوم الحزمة المحتملون: </span>
              <span className="text-zinc-200 font-medium">{pack.featured}</span>
            </div>

            {/* Buy Button */}
            <GoldButton
              onClick={() => handleBuyPack(pack.tier, pack.price)}
              fullWidth
              size="md"
            >
              <Coins className="w-4 h-4 text-zinc-950" />
              <span>{pack.btnText}</span>
            </GoldButton>
          </div>
        ))}
      </div>

      {/* Pack Opening Walkout Modal */}
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
