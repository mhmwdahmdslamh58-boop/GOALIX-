import React, { useState, useEffect } from 'react';
import { sounds } from '../../services/audio';
import { 
  Trophy, 
  Shield, 
  Wifi, 
  Flame, 
  ArrowLeft, 
  CheckCircle2,
  Calendar,
  Volume2
} from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterPitch = () => {
    if (isEntering) return;
    setIsEntering(true);

    // Audio kickoff celebration: whistle blast + stadium crowd roar
    sounds.playWhistle();
    sounds.playGoalHorn();
    sounds.initOnUserGesture();

    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-[#06080c] text-zinc-100 select-none overflow-hidden font-tajawal antialiased">
      {/* ================= REALISTIC PLAYERS' TUNNEL & ILLUMINATED TURF BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Pitch Green Grass at the end of tunnel */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0d2a18] via-[#091b10] to-transparent opacity-90" />
        
        {/* Stadium Floodlights Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.15),_transparent_70%)]" />

        {/* Tactical Pitch Lines (Center Circle & Midfield Line) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 h-36 border-t-2 border-white/20 rounded-t-full pointer-events-none" />
        <div className="absolute bottom-16 left-0 right-0 h-[2px] bg-white/20" />
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white/40 -translate-y-1/2" />

        {/* Concrete Tunnel Side Walls Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(4,6,9,0.92)_85%,_#030406_100%)]" />
      </div>

      {/* ================= 1. BROADCAST MATCHDAY STATUS BAR ================= */}
      <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-chakra font-black text-xs text-white tracking-widest block">
              GOALIX LEAGUE
            </span>
            <span className="text-[10px] text-zinc-400 font-tajawal">الموسم التنافسي الرسمي</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>السيرفر متصل 🟢</span>
          </div>
        </div>
      </div>

      {/* ================= 2. MATCHDAY PRESENTATION & CENTER TURF ================= */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-5 max-w-sm mx-auto">
        {/* Matchday Date Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-zinc-800 text-[11px] text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>يوم المباراة · انطلاق صافرة البداية</span>
        </div>

        {/* The Official Match Ball on the Turf */}
        <div className="relative group cursor-pointer" onClick={handleEnterPitch}>
          {/* Subtle Spotlight Ring */}
          <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse" />

          {/* Authentic Match Ball Graphic */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.8)] border border-amber-500/40 transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <svg viewBox="0 0 160 160" className="w-full h-full">
              <defs>
                {/* Photorealistic ball leather shading */}
                <radialGradient id="leatherShading" cx="30%" cy="25%" r="75%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#e2e8f0" />
                  <stop offset="70%" stopColor="#64748b" />
                  <stop offset="95%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                {/* Classic Gold & Carbon Panels */}
                <linearGradient id="goldPanel" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
              </defs>

              <circle cx="80" cy="80" r="76" fill="url(#leatherShading)" stroke="#334155" strokeWidth="2" />

              {/* Classic Center Pentagon */}
              <polygon points="80,54 102,70 94,96 66,96 58,70" fill="url(#goldPanel)" stroke="#0f172a" strokeWidth="2" />

              {/* Surrounding Panels */}
              <polygon points="80,10 94,28 74,42 54,28" fill="#0f172a" stroke="#d4af37" strokeWidth="1.2" />
              <polygon points="130,40 145,62 124,76 109,58" fill="#0f172a" stroke="#d4af37" strokeWidth="1.2" />
              <polygon points="130,120 110,135 100,114 119,98" fill="#0f172a" stroke="#d4af37" strokeWidth="1.2" />
              <polygon points="30,120 41,98 60,114 50,135" fill="#0f172a" stroke="#d4af37" strokeWidth="1.2" />
              <polygon points="30,40 51,58 36,76 15,62" fill="#0f172a" stroke="#d4af37" strokeWidth="1.2" />

              {/* Seams */}
              <line x1="80" y1="54" x2="74" y2="42" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="102" y1="70" x2="109" y2="58" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="94" y1="96" x2="100" y2="114" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="66" y1="96" x2="60" y2="114" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="58" y1="70" x2="51" y2="58" stroke="#1e293b" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* App Title */}
        <div className="space-y-1">
          <h1 className="font-chakra font-black text-4xl tracking-wider text-white">
            GOALIX
          </h1>
          <p className="text-xs text-zinc-300 font-tajawal">
            منصة محاكاة وتحديات كرة القدم الحقيقية
          </p>
        </div>

        {/* ================= OFFICIAL DEVELOPER SIGNATURE CARD ================= */}
        <div className="w-full bg-gradient-to-b from-[#13161f] to-[#0a0c10] border border-amber-500/40 rounded-2xl p-3.5 shadow-xl text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            <Shield className="w-4 h-4" />
            <span className="text-[11px] font-bold font-tajawal">إشراف وتطوير المطور</span>
          </div>

          <h2 className="text-base font-black text-white font-tajawal">
            محمود أحمد سلامة
          </h2>

          <p className="text-[10px] text-zinc-400 font-chakra dir-ltr">
            Mahmoud Ahmed Salama · Software Engineer
          </p>
        </div>
      </div>

      {/* ================= 3. TACTILE MATCHDAY KICKOFF BUTTON ================= */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-2 pb-2">
        <button
          onClick={handleEnterPitch}
          disabled={isEntering}
          className="w-full py-4 px-6 rounded-2xl btn-gold text-base font-black font-tajawal flex items-center justify-center gap-2 shadow-[0_6px_25px_rgba(212,175,55,0.35)] active:translate-y-1 transition-all cursor-pointer"
        >
          <span className="text-lg">⚽</span>
          <span>{isEntering ? 'جاري دخول المستطيل الأخضر...' : 'دخول المستطيل الأخضر'}</span>
          <ArrowLeft className="w-4 h-4 mr-1" />
        </button>

        <p className="text-[10px] text-center text-zinc-500 font-tajawal">
          جميع الحقوق محفوظة للمطور محمود أحمد سلامة © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
