import React from 'react';
import { Smartphone, ArrowLeftRight } from 'lucide-react';
import { GoldButton } from './GoldButton';

interface PassThePhoneModalProps {
  nextPlayerName: string;
  onReady: () => void;
  titleAr?: string;
  subtitleAr?: string;
}

export const PassThePhoneModal: React.FC<PassThePhoneModalProps> = ({
  nextPlayerName,
  onReady,
  titleAr = 'مرّر الهاتف للاعب التالي',
  subtitleAr = 'PASS THE PHONE'
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-xs w-full bg-[#111317] border border-amber-500/40 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center mb-4 text-amber-400">
          <Smartphone className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-chakra text-amber-300 mb-3 tracking-widest uppercase">
          <ArrowLeftRight className="w-3 h-3 text-amber-400" />
          {subtitleAr}
        </div>

        <h3 className="text-xl font-bold font-tajawal text-zinc-100 mb-1">
          {titleAr}
        </h3>
        
        <p className="text-xs text-zinc-400 mb-6 font-tajawal">
          دور اللاعب: <span className="text-amber-400 font-bold">{nextPlayerName}</span>. تأكد من عدم رؤية اللاعب الآخر للشاشة!
        </p>

        <GoldButton onClick={onReady} fullWidth size="lg">
          أنا جاهز، ابدأ دوري
        </GoldButton>
      </div>
    </div>
  );
};
