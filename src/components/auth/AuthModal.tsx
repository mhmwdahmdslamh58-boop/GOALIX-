import React, { useState } from 'react';
import { loginCoach, registerCoach, quickLoginDeveloper, AuthUser } from '../../services/auth';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  X, 
  Crown, 
  Sparkles, 
  KeyRound, 
  User, 
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: AuthUser) => void;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
];

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('يرجى كتابة اسم المدرب');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('يرجى كتابة كلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    sounds.playButtonClick();

    try {
      let user: AuthUser;
      if (tab === 'login') {
        user = await loginCoach(username, password);
      } else {
        user = await registerCoach(username, password, avatar);
      }

      sounds.playCorrect();
      setSuccessMsg(`أهلاً بك يا كابتن ${user.username}!`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err: unknown) {
      sounds.playWrong();
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ في المصادقة');
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperQuickLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    sounds.playButtonClick();
    try {
      const admin = await quickLoginDeveloper();
      sounds.playGoalHorn();
      setSuccessMsg('تم الدخول كمدير المنصة: محمود أحمد سلامة 🛡️');
      setTimeout(() => {
        onSuccess(admin);
        onClose();
      }, 700);
    } catch (err: unknown) {
      sounds.playWrong();
      setErrorMsg(err instanceof Error ? err.message : 'فشل الدخول بحساب الإدارة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-tajawal antialiased">
      <div className="max-w-md w-full bg-[#0d0f14] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative space-y-4 overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-tajawal">
                بوابة حسابات المدربين
              </h3>
              <p className="text-[10px] text-zinc-400">حفظ نقاط الدوري والتشكيلات والبطاقات</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DEVELOPER ONE-CLICK VIP ACCESS BUTTON */}
        <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-950 border border-amber-500/50 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-bold font-tajawal">حساب المطور والمدير العام</span>
            </div>
            <span className="text-[9px] font-chakra px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
              SUPER ADMIN
            </span>
          </div>

          <button
            onClick={handleDeveloperQuickLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-xs font-tajawal flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-[0_2px_12px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>تسجيل دخول فوري: محمود أحمد سلامة (المطور)</span>
            <ShieldCheck className="w-4 h-4 mr-0.5" />
          </button>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول</span>
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 block">اختر الصورة الرمزية للمدرب:</label>
              <div className="flex justify-between gap-1.5">
                {AVATAR_OPTIONS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setAvatar(av);
                    }}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      avatar === av ? 'border-amber-400 scale-105 shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={av} alt="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 block">اسم المدرب / الحساب:</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="مثال: كابتن رونالدو أو محمود"
                className="w-full bg-black/60 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all pl-9"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 block">كلمة المرور / الرمز السري:</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-black/60 border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all pl-9 font-chakra"
              />
              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <GoldButton
            type="submit"
            fullWidth
            size="md"
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : (tab === 'login' ? 'دخول اللعبة ⚽' : 'تأكيد إنشاء الحساب ⚡')}
          </GoldButton>
        </form>
      </div>
    </div>
  );
};
