import React from 'react';
import { PackTierId } from '../../types/game';
import { Crown, Shield, Sparkles, Star, Award, Flame } from 'lucide-react';

interface OrnatePackArtworkProps {
  tier: PackTierId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  opened?: boolean;
  className?: string;
}

const TIER_VISUAL_CONFIG: Record<
  PackTierId,
  {
    titleEn: string;
    subtitleAr: string;
    rarityLabel: string;
    ovrBadge: string;
    outerBorder: string;
    foilGradient: string;
    bodyGradient: string;
    glowClass: string;
    ornamentStroke: string;
    accentText: string;
    ribbonBg: string;
    gemColor: string;
    stars: number;
  }
> = {
  BRONZE: {
    titleEn: 'ROYAL BRONZE',
    subtitleAr: 'زخرفة البرونز التكتيكي',
    rarityLabel: 'COMMON TIER',
    ovrBadge: '83+ OVR',
    outerBorder: 'border-amber-600/85',
    foilGradient: 'from-amber-700 via-amber-400 to-amber-800',
    bodyGradient: 'from-[#2c1608] via-[#170c05] to-[#0a0502]',
    glowClass: 'pack-glow-BRONZE',
    ornamentStroke: '#f59e0b',
    accentText: 'text-amber-300',
    ribbonBg: 'from-amber-700 via-amber-500 to-amber-800 text-zinc-950',
    gemColor: 'bg-amber-500 shadow-[0_0_12px_#f59e0b]',
    stars: 3,
  },
  WEEKLY: {
    titleEn: 'IMPERIAL SILVER',
    subtitleAr: 'باك المحترفين الفضي المزخرف',
    rarityLabel: 'RARE TIER',
    ovrBadge: '85+ OVR',
    outerBorder: 'border-slate-300/90',
    foilGradient: 'from-slate-400 via-white to-slate-500',
    bodyGradient: 'from-[#1e2636] via-[#0f141d] to-[#07090e]',
    glowClass: 'pack-glow-WEEKLY',
    ornamentStroke: '#e2e8f0',
    accentText: 'text-slate-100',
    ribbonBg: 'from-slate-300 via-white to-slate-400 text-zinc-950',
    gemColor: 'bg-sky-300 shadow-[0_0_12px_#38bdf8]',
    stars: 3,
  },
  GOLD: {
    titleEn: 'SULTAN GOLD',
    subtitleAr: 'الباك الذهبي الملكي المزخرف',
    rarityLabel: 'RARE GOLD TIER',
    ovrBadge: '87+ OVR',
    outerBorder: 'border-yellow-400',
    foilGradient: 'from-yellow-500 via-amber-200 to-yellow-600',
    bodyGradient: 'from-[#362807] via-[#1c1303] to-[#090601]',
    glowClass: 'pack-glow-GOLD',
    ornamentStroke: '#facc15',
    accentText: 'text-yellow-300',
    ribbonBg: 'from-yellow-400 via-amber-200 to-yellow-500 text-zinc-950',
    gemColor: 'bg-yellow-300 shadow-[0_0_14px_#facc15]',
    stars: 4,
  },
  ELITE: {
    titleEn: 'CRIMSON ELITE',
    subtitleAr: 'باك النخبة الياقوتي المزخرف',
    rarityLabel: 'EPIC TIER',
    ovrBadge: '90+ OVR',
    outerBorder: 'border-rose-400',
    foilGradient: 'from-rose-500 via-amber-300 to-rose-700',
    bodyGradient: 'from-[#3b0a1e] via-[#1f0510] to-[#0a0205]',
    glowClass: 'pack-glow-ELITE',
    ornamentStroke: '#fb7185',
    accentText: 'text-rose-200',
    ribbonBg: 'from-rose-500 via-amber-300 to-rose-600 text-zinc-950',
    gemColor: 'bg-rose-400 shadow-[0_0_14px_#fb7185]',
    stars: 4,
  },
  ICON: {
    titleEn: 'DYNASTY ICON',
    subtitleAr: 'باك الأساطير الإمبراطوري المزخرف',
    rarityLabel: 'LEGENDARY TIER',
    ovrBadge: '96+ OVR',
    outerBorder: 'border-amber-200',
    foilGradient: 'from-amber-300 via-white to-yellow-500',
    bodyGradient: 'from-[#3d2c08] via-[#1f1604] to-[#080602]',
    glowClass: 'pack-glow-ICON',
    ornamentStroke: '#fef08a',
    accentText: 'text-amber-100',
    ribbonBg: 'from-amber-200 via-white to-amber-400 text-zinc-950',
    gemColor: 'bg-emerald-400 shadow-[0_0_16px_#34d399]',
    stars: 5,
  },
};

export const OrnatePackArtwork: React.FC<OrnatePackArtworkProps> = ({
  tier,
  size = 'md',
  animated = true,
  opened = false,
  className = '',
}) => {
  const cfg = TIER_VISUAL_CONFIG[tier] || TIER_VISUAL_CONFIG.GOLD;

  const sizeDimensions = {
    sm: 'w-24 h-34',
    md: 'w-36 h-50',
    lg: 'w-48 h-66',
    xl: 'w-56 h-76',
  }[size];

  const isCompact = size === 'sm';

  return (
    <div
      className={`relative ${sizeDimensions} rounded-2xl bg-gradient-to-b ${cfg.bodyGradient} border-2 ${
        cfg.outerBorder
      } ${animated ? cfg.glowClass : ''} ${
        opened ? 'animate-pack-opened scale-105 ring-4 ring-amber-300/70' : ''
      } flex flex-col justify-between overflow-hidden select-none shrink-0 group transition-transform duration-300 ${className}`}
    >
      {/* Top Crimped Metallic Foil Seal (Splits open when `opened` is true) */}
      <div
        className={`w-full ${
          isCompact ? 'h-3' : 'h-4'
        } bg-gradient-to-r ${cfg.foilGradient} border-b border-black/50 relative flex items-center justify-around overflow-hidden shrink-0 transition-all duration-500 ${
          opened ? '-translate-y-6 -rotate-6 opacity-0' : ''
        }`}
      >
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 2px, transparent 2px, transparent 5px)',
          }}
        />
        <span className="relative z-10 font-chakra text-[7px] font-black tracking-[0.25em] text-zinc-950 uppercase">
          GOALIX ROYAL SEAL
        </span>
      </div>

      {/* Intricate SVG Arabesque & Geometric Filigree Frame */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 200 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Double Ornate Filigree Border */}
        <rect
          x="8"
          y="18"
          width="184"
          height="244"
          rx="14"
          stroke={cfg.ornamentStroke}
          strokeWidth="1.6"
          strokeDasharray="5 2"
        />
        <rect
          x="14"
          y="24"
          width="172"
          height="232"
          rx="10"
          stroke={cfg.ornamentStroke}
          strokeWidth="1"
        />

        {/* Corner Arabesque Flourishes */}
        <path
          d="M14 50 C14 32, 32 24, 50 24 L35 24 C22 24, 14 32, 14 45 Z"
          fill={cfg.ornamentStroke}
        />
        <path
          d="M186 50 C186 32, 168 24, 150 24 L165 24 C178 24, 186 32, 186 45 Z"
          fill={cfg.ornamentStroke}
        />
        <path
          d="M14 230 C14 248, 32 256, 50 256 L35 256 C22 256, 14 248, 14 235 Z"
          fill={cfg.ornamentStroke}
        />
        <path
          d="M186 230 C186 248, 168 256, 150 256 L165 256 C178 256, 186 248, 186 235 Z"
          fill={cfg.ornamentStroke}
        />

        {/* Central Arabesque Star / Mandala */}
        <g transform="translate(100, 134)">
          <polygon
            points="0,-64 19,-19 64,0 19,19 0,64 -19,19 -64,0 -19,-19"
            stroke={cfg.ornamentStroke}
            strokeWidth="1.3"
          />
          <polygon
            points="0,-52 37,-37 52,0 37,37 0,52 -37,37 -52,0 -37,-37"
            stroke={cfg.ornamentStroke}
            strokeWidth="0.9"
            strokeDasharray="3 3"
          />
          <circle r="45" stroke={cfg.ornamentStroke} strokeWidth="1.4" />
          <circle r="35" stroke={cfg.ornamentStroke} strokeWidth="0.8" strokeDasharray="2 2" />
        </g>

        {/* Top & Bottom Ornamental Arches */}
        <path
          d="M46 24 Q100 52 154 24"
          stroke={cfg.ornamentStroke}
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M46 256 Q100 228 154 256"
          stroke={cfg.ornamentStroke}
          strokeWidth="1.3"
          fill="none"
        />
      </svg>

      {/* Continuous CSS Shimmer Sweep */}
      {animated && (
        <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      )}

      {/* Radial Energy Burst When Opened */}
      {opened && (
        <div className="absolute inset-0 z-20 bg-radial from-amber-200/80 via-amber-400/35 to-transparent animate-pulse pointer-events-none" />
      )}

      {/* Pack Content Body */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-2 px-2 text-center">
        {/* Top Stars & Rarity Header */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: cfg.stars }).map((_, idx) => (
              <Star
                key={idx}
                className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${cfg.accentText} fill-current`}
              />
            ))}
          </div>
          {!isCompact && (
            <span className="font-chakra text-[8px] font-black tracking-[0.2em] text-amber-200/90 uppercase">
              {cfg.titleEn}
            </span>
          )}
        </div>

        {/* Center Embossed Royal Crest Medallion */}
        <div className="relative flex items-center justify-center my-auto">
          {/* Slowly Rotating Filigree Halo */}
          {animated && !isCompact && (
            <div
              className={`absolute -inset-2 rounded-full border border-dashed ${cfg.outerBorder} opacity-55 animate-halo-spin pointer-events-none`}
            />
          )}

          <div
            className={`rounded-full border border-amber-300/45 bg-black/70 flex items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-transform duration-500 ${
              opened ? 'scale-125' : ''
            } ${isCompact ? 'w-12 h-12' : size === 'md' ? 'w-18 h-18' : 'w-24 h-24'}`}
          >
            {/* Inner Filigree Ring */}
            <div
              className={`rounded-full border-2 ${cfg.outerBorder} bg-gradient-to-b ${cfg.bodyGradient} flex flex-col items-center justify-center ${
                isCompact ? 'w-9 h-9' : size === 'md' ? 'w-14 h-14' : 'w-19 h-19'
              }`}
            >
              {tier === 'ICON' ? (
                <Crown
                  className={`${
                    isCompact ? 'w-4 h-4' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'
                  } text-amber-200 drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)]`}
                />
              ) : tier === 'ELITE' ? (
                <Flame
                  className={`${
                    isCompact ? 'w-4 h-4' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'
                  } text-rose-300 drop-shadow-[0_2px_8px_rgba(244,63,94,0.9)]`}
                />
              ) : tier === 'GOLD' ? (
                <Award
                  className={`${
                    isCompact ? 'w-4 h-4' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'
                  } text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.9)]`}
                />
              ) : (
                <Shield
                  className={`${
                    isCompact ? 'w-4 h-4' : size === 'md' ? 'w-7 h-7' : 'w-9 h-9'
                  } ${cfg.accentText}`}
                />
              )}
              {!isCompact && (
                <span className="font-chakra text-[8px] font-black tracking-widest text-white mt-0.5">
                  {opened ? 'OPENED' : tier}
                </span>
              )}
            </div>
          </div>

          {/* Corner Gemstones on Medallion */}
          <div className={`w-2 h-2 rounded-full ${cfg.gemColor} absolute -top-1`} />
          <div className={`w-2 h-2 rounded-full ${cfg.gemColor} absolute -bottom-1`} />
          <Sparkles
            className={`w-3.5 h-3.5 ${cfg.accentText} absolute -right-2 -top-1 animate-pulse`}
          />
        </div>

        {/* Bottom OVR Guarantee Ribbon */}
        <div className="w-full space-y-1">
          <div
            className={`mx-auto px-2.5 py-0.5 rounded-md bg-gradient-to-r ${cfg.ribbonBg} font-chakra font-black ${
              isCompact ? 'text-[8px]' : 'text-[10px]'
            } shadow-md inline-block tracking-wider`}
          >
            {cfg.ovrBadge}
          </div>
          {!isCompact && (
            <div className="text-[9px] font-bold text-amber-100/90 truncate px-1">
              {cfg.subtitleAr}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Crimped Metallic Foil Seal */}
      <div
        className={`w-full ${
          isCompact ? 'h-2.5' : 'h-3.5'
        } bg-gradient-to-r ${cfg.foilGradient} border-t border-black/50 relative flex items-center justify-center overflow-hidden shrink-0`}
      >
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 2px, transparent 2px, transparent 5px)',
          }}
        />
      </div>
    </div>
  );
};
