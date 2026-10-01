import React from 'react';
import { CardTier } from '../../types/game';
import { Crown, Sparkles, Shield, Flame, Star, Gem } from 'lucide-react';

interface Pack3DViewProps {
  tier: CardTier;
  ovrRange?: string;
  name?: string;
  isOpening?: boolean;
}

export const Pack3DView: React.FC<Pack3DViewProps> = ({
  tier,
  isOpening = false
}) => {
  return (
    <div className="relative w-full max-w-[210px] aspect-[4/5] mx-auto select-none group perspective-1000 py-3">
      {/* Dynamic 3D Box Floor Shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/80 rounded-full blur-xl pointer-events-none transform scale-y-50" />

      {/* Dynamic Glowing Ambient Aura */}
      <div
        className={`absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-500 opacity-50 group-hover:opacity-100 pointer-events-none ${
          tier === 'ICON'
            ? 'bg-gradient-to-tr from-yellow-500/40 via-amber-500/30 to-yellow-600/40'
            : tier === 'ELITE'
            ? 'bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-indigo-600/40'
            : 'bg-gradient-to-tr from-emerald-500/40 via-teal-600/30 to-green-600/40'
        } ${isOpening ? 'scale-125 opacity-100 animate-pulse' : ''}`}
      />

      {/* ================= 3D RECTANGULAR BOX / VAULT CONTAINER ================= */}
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-gpu preserve-3d cursor-pointer ${
          isOpening
            ? 'scale-105 rotate-y-[-10deg] rotate-x-[8deg]'
            : 'group-hover:rotate-y-[-16deg] group-hover:rotate-x-[12deg] group-hover:-translate-y-2'
        }`}
        style={{
          transform: isOpening
            ? 'rotateY(-8deg) rotateX(6deg) scale(1.04)'
            : 'rotateY(-12deg) rotateX(8deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* ================= TOP 3D LID LID / BEVEL FACE ================= */}
        <div
          className={`absolute -top-3.5 left-2 right-2 h-4 rounded-t-lg origin-bottom transform -rotate-x-60 border-t border-x shadow-md ${
            tier === 'ICON'
              ? 'bg-gradient-to-r from-[#d97706] via-[#fde047] to-[#b45309] border-yellow-200'
              : tier === 'ELITE'
              ? 'bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#0369a1] border-cyan-200'
              : 'bg-gradient-to-r from-[#059669] via-[#34d399] to-[#047857] border-emerald-200'
          }`}
        />

        {/* ================= RIGHT 3D SIDE EXTRUSION (DEPTH WALL) ================= */}
        <div
          className={`absolute top-0 -right-3.5 w-4 h-full rounded-r-lg origin-left transform rotate-y-60 border-r border-y ${
            tier === 'ICON'
              ? 'bg-gradient-to-b from-[#78350f] via-[#451a03] to-black border-amber-600/60'
              : tier === 'ELITE'
              ? 'bg-gradient-to-b from-[#0c4a6e] via-[#082f49] to-black border-cyan-700/60'
              : 'bg-gradient-to-b from-[#064e3b] via-[#022c22] to-black border-emerald-700/60'
          }`}
        />

        {/* ================= MAIN FRONT RECTANGULAR BOX FACE (CLEAN & NO TEXT) ================= */}
        <div
          className={`relative w-full h-full rounded-2xl p-3 flex flex-col items-center justify-between border-2 shadow-2xl overflow-hidden ${
            tier === 'ICON'
              ? 'bg-gradient-to-b from-[#1a1306] via-[#0d0902] to-black border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.35)]'
              : tier === 'ELITE'
              ? 'bg-gradient-to-b from-[#08152b] via-[#040a17] to-black border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.3)]'
              : 'bg-gradient-to-b from-[#051c11] via-[#020d07] to-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.25)]'
          }`}
        >
          {/* Metallic Diagonal Specular Glare */}
          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />

          {/* Heavy Armor Rivets / Corner Screws */}
          <div className="w-full flex justify-between items-center z-10">
            <span
              className={`w-2.5 h-2.5 rounded-full border shadow-inner ${
                tier === 'ICON'
                  ? 'bg-yellow-400 border-yellow-200'
                  : tier === 'ELITE'
                  ? 'bg-cyan-400 border-cyan-200'
                  : 'bg-emerald-400 border-emerald-200'
              }`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full border shadow-inner ${
                tier === 'ICON'
                  ? 'bg-yellow-400 border-yellow-200'
                  : tier === 'ELITE'
                  ? 'bg-cyan-400 border-cyan-200'
                  : 'bg-emerald-400 border-emerald-200'
              }`}
            />
          </div>

          {/* CENTER 3D RECTANGULAR VAULT CORE & EMBOSSED EMBLEM (CLEAN LUXURY - NO TEXT) */}
          <div className="relative my-auto flex items-center justify-center">
            {/* Concentric 3D Beveled Chamber */}
            <div
              className={`w-28 h-28 rounded-2xl flex items-center justify-center p-1 border-2 shadow-2xl ${
                tier === 'ICON'
                  ? 'bg-gradient-to-tr from-yellow-300 via-amber-600 to-yellow-100 border-yellow-300'
                  : tier === 'ELITE'
                  ? 'bg-gradient-to-tr from-cyan-300 via-blue-600 to-sky-200 border-cyan-300'
                  : 'bg-gradient-to-tr from-emerald-300 via-teal-600 to-green-200 border-emerald-300'
              }`}
            >
              {/* Inner Dark Diamond Core */}
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden shadow-inner ${
                  tier === 'ICON'
                    ? 'bg-[#120b02]'
                    : tier === 'ELITE'
                    ? 'bg-[#051124]'
                    : 'bg-[#03140a]'
                }`}
              >
                {/* Glowing Core Gem / Symbol */}
                {tier === 'ICON' && (
                  <Crown className="w-12 h-12 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] animate-pulse" />
                )}
                {tier === 'ELITE' && (
                  <Flame className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(103,232,249,0.8)] animate-pulse" />
                )}
                {tier === 'WEEKLY' && (
                  <Shield className="w-12 h-12 text-emerald-300 drop-shadow-[0_0_15px_rgba(110,231,183,0.8)] animate-pulse" />
                )}

                {/* Subtle Inner 3D Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom Heavy Armor Rivets & Power Latch */}
          <div className="w-full flex justify-between items-center z-10">
            <span
              className={`w-2.5 h-2.5 rounded-full border shadow-inner ${
                tier === 'ICON'
                  ? 'bg-yellow-400 border-yellow-200'
                  : tier === 'ELITE'
                  ? 'bg-cyan-400 border-cyan-200'
                  : 'bg-emerald-400 border-emerald-200'
              }`}
            />

            {/* Glowing Center Lock Notch */}
            <div
              className={`h-1.5 w-12 rounded-full shadow-md ${
                tier === 'ICON'
                  ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
                  : tier === 'ELITE'
                  ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                  : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              }`}
            />

            <span
              className={`w-2.5 h-2.5 rounded-full border shadow-inner ${
                tier === 'ICON'
                  ? 'bg-yellow-400 border-yellow-200'
                  : tier === 'ELITE'
                  ? 'bg-cyan-400 border-cyan-200'
                  : 'bg-emerald-400 border-emerald-200'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
