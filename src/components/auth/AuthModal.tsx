import React, { useState } from 'react';
import { loginCoach, registerCoach, loginWithGoogle, quickLoginDeveloper, AuthUser } from '../../services/auth';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  X, 
  Crown, 
  KeyRound, 
  AlertCircle,
  CheckCircle2,
  Mail,
  Zap,
  Globe
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
  const [tab, setTab] = useState<'login' | 'register' | 'google'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('يرجى كتابة اسم المدرب أو Account ID');
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
      setSuccessMsg(`أهلاً بك يا كابتن ${user.username}! (ID: ${user.accountId})`);
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

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setErrorMsg('يرجى كتابة بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    sounds.playButtonClick();

    try {
      const user = await loginWithGoogle({
        email: googleEmail.trim().toLowerCase(),
        name: googleName.trim() || googleEmail.split('@')[0],
        avatar
      });

      sounds.playCorrect();
      setSuccessMsg(`تم الدخول بنجاح بحساب Google: ${user.username}!`);
      setTimeout(() => {
        onSuccess(user);
        onClose();
      }, 700);
    } catch (err: unknown) {
      sounds.playWrong();
      setErrorMsg(err instanceof Error ? err.message : 'فشل تسجيل الدخول بحساب Google');
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
      <div className="max-w-md w-full bg-[#0d0f14] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative space-y-4 overflow-hidden max-h-[90vh] overflow-y-auto">
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
                بوابة حسابات GOALIX
              </h3>
              <p className="text-[10px] text-zinc-400">حفظ الكوينز والمشتريات والرتبة وAccount ID على السيرفر</p>
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

        {/* GOOGLE QUICK SIGN-IN BUTTON */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            setTab('google');
          }}
          className={`w-full py-2.5 px-4 rounded-2xl border font-bold text-xs font-tajawal flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer shadow-md ${
            tab === 'google'
              ? 'bg-white text-zinc-950 border-white'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>تسجيل الدخول باستخدام Google</span>
        </button>

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
            type="button"
            onClick={handleDeveloperQuickLogin}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>دخول فوري بحساب: محمود أحمد سلامة</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'login'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>تسجيل الدخول / استرجاع ID</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'register'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE SIGN-IN FORM */}
        {tab === 'google' && (
          <form onSubmit={handleGoogleSubmit} className="space-y-3.5">
            <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-center space-y-1">
              <span className="text-xs font-bold text-white block">الدخول السريع بحساب Google</span>
              <p className="text-[11px] text-zinc-400">
                سيتم حفظ حسابك تلقائياً على السيرفر وتوليد Account ID دائم مع ربط جميع مشترياتك.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-bold block">بريد Google الإلكتروني (Gmail):</label>
              <div className="relative">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  placeholder="coach@gmail.com"
                  required
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 ltr:text-left"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-bold block">اسم المدرب المفضل (اختياري):</label>
              <input
                type="text"
                value={googleName}
                onChange={e => setGoogleName(e.target.value)}
                placeholder="مثال: Ahmed_GX"
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <GoldButton fullWidth size="lg" disabled={loading}>
              {loading ? 'جارٍ تسجيل الدخول...' : 'تأكيد الدخول عبر Google'}
            </GoldButton>
          </form>
        )}

        {/* TAB 2 & 3: STANDARD USERNAME / ID LOGIN & REGISTER */}
        {tab !== 'google' && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-300 font-bold block">اختر الصورة الرمزية للمدرب:</label>
                <div className="flex items-center justify-center gap-2">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === av
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-bold block">
                {tab === 'login' ? 'اسم المدرب أو Account ID:' : 'اسم المدرب (يجب أن يكون فريداً):'}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={tab === 'login' ? 'مثال: Ahmed_GX أو GX-849271' : 'اختر اسماً مميزاً'}
                required
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-300 font-bold block">كلمة المرور / الرمز السري:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <GoldButton fullWidth size="lg" disabled={loading}>
              {loading ? 'جارٍ المعالجة...' : tab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد وتوليد Account ID'}
            </GoldButton>
          </form>
        )}
      </div>
    </div>
  );
};
