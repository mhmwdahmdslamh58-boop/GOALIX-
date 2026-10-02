import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types/game';
import {
  googleLoginWithServer,
  completeProfileSetupWithServer,
} from '../../services/roomApi';
import {
  saveUserProfile,
  copyAccountIdToClipboard,
  OWNER_EMAIL,
} from '../../services/storage';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import {
  Crown,
  Upload,
  Copy,
  Check,
  ShieldAlert,
  User,
  Sparkles,
  Camera,
  Lock,
  ArrowLeft,
  Mail,
} from 'lucide-react';

interface WelcomeAndProfileFlowProps {
  profile: UserProfile;
  onAuthenticated: (updatedProfile: UserProfile) => void;
}

const PRESET_AVATARS = [
  '/players/icon_zidane.jpg',
  '/players/icon_ronaldo.jpg',
  '/players/icon_maldini.jpg',
  '/players/elite_salah.jpg',
  '/players/elite_mbappe.jpg',
  '/players/elite_bellingham.jpg',
];

function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 260;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.84);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('تعذر قراءة الصورة المختارة'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('تعذر تحميل ملف الصورة'));
    reader.readAsDataURL(file);
  });
}

export const WelcomeAndProfileFlow: React.FC<WelcomeAndProfileFlowProps> = ({
  profile,
  onAuthenticated,
}) => {
  const [step, setStep] = useState<'welcome' | 'google_chooser' | 'create_profile'>(() => {
    if (profile.email && !profile.profileCompleted) {
      return 'create_profile';
    }
    return 'welcome';
  });

  const [emailInput, setEmailInput] = useState(profile.email || '');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [username, setUsername] = useState(
    profile.username && profile.username !== 'كابتن جواليكس' ? profile.username : ''
  );
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile.avatar || '/players/icon_zidane.jpg'
  );
  const [accountId, setAccountId] = useState<string>(profile.accountId || 'GX-849271');
  const [currentUserId, setCurrentUserId] = useState<string>(profile.id);
  const [currentRole, setCurrentRole] = useState<'OWNER' | 'PLAYER'>(
    profile.role || 'PLAYER'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const executeGoogleSignIn = async (targetEmail: string, suggestedName?: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('يرجى إدخال بريد Google صحيح لتسجيل الدخول');
      return;
    }

    setError(null);
    setLoading(true);
    sounds.playTap();

    try {
      const res = await googleLoginWithServer({
        email: cleanEmail,
        googleDisplayName: suggestedName,
        existingClientId: profile.id,
      });

      const acc = res.account;
      setCurrentUserId(acc.id);
      setAccountId(acc.accountId);
      setEmailInput(acc.email || cleanEmail);
      setCurrentRole(acc.role || 'PLAYER');
      if (acc.avatar) setAvatarPreview(acc.avatar);
      if (acc.username && acc.username !== 'كابتن جواليكس') {
        setUsername(acc.username);
      }

      if (!res.isNewUser && acc.profileCompleted) {
        // Existing user -> load account directly and go to Home Screen!
        sounds.playSuccess();
        const mergedProfile: UserProfile = {
          ...profile,
          id: acc.id,
          accountId: acc.accountId,
          email: acc.email || cleanEmail,
          role: acc.role || 'PLAYER',
          profileCompleted: true,
          username: acc.username,
          avatar: acc.avatar || profile.avatar,
          coins: acc.coins,
          rankPoints: acc.rankPoints,
          matchesPlayed: acc.matchesPlayed,
          matchesWon: acc.matchesWon,
          matchesDrawn: acc.matchesDrawn,
          matchesLost: acc.matchesLost,
          ownedPacks: acc.ownedPacks || profile.ownedPacks || [],
          ownedChatIds: acc.ownedChatIds || profile.ownedChatIds || [],
          ownedCosmetics: acc.ownedCosmetics || profile.ownedCosmetics || [],
          lastSquadTrialAt: acc.lastSquadTrialAt,
        };
        saveUserProfile(mergedProfile);
        onAuthenticated(mergedProfile);
      } else {
        // First time login -> Open CREATE PROFILE
        sounds.playReveal();
        setStep('create_profile');
      }
    } catch (err: unknown) {
      sounds.playWrong();
      setError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول عبر Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPG / PNG / WEBP)');
      return;
    }
    setError(null);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setAvatarPreview(dataUrl);
      sounds.playTap();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر معالجة الصورة');
    }
  };

  const handleCopyId = async () => {
    sounds.playTap();
    const ok = await copyAccountIdToClipboard(accountId);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = username.trim();
    if (cleanName.length < 3) {
      setError('يرجى كتابة اسم مستخدم (Username) مكون من 3 أحرف على الأقل');
      return;
    }

    setError(null);
    setLoading(true);
    sounds.playTap();

    try {
      const res = await completeProfileSetupWithServer({
        userId: currentUserId,
        email: emailInput,
        username: cleanName,
        avatarDataUrl: avatarPreview,
      });

      const acc = res.account;
      sounds.playGoalHorn();

      const completedProfile: UserProfile = {
        ...profile,
        id: acc.id,
        accountId: acc.accountId,
        email: acc.email || emailInput,
        role: acc.role || currentRole,
        profileCompleted: true,
        username: acc.username,
        avatar: acc.avatar || avatarPreview,
        coins: acc.coins,
        rankPoints: acc.rankPoints,
        ownedChatIds: acc.ownedChatIds || profile.ownedChatIds || [],
        ownedCosmetics: acc.ownedCosmetics || profile.ownedCosmetics || [],
      };
      saveUserProfile(completedProfile);
      onAuthenticated(completedProfile);
    } catch (err: unknown) {
      sounds.playWrong();
      setError(err instanceof Error ? err.message : 'اسم المستخدم مستخدم بالفعل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Luxury 3D Ambient Stadium Lighting */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-amber-500/12 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-yellow-500/8 blur-[110px]" />
      </div>

      {/* STEP 1: WELCOME SCREEN */}
      {step === 'welcome' && (
        <div className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/40 p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.95)] space-y-7 animate-fade-in">
          {/* 3D Emblem */}
          <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-[0_12px_35px_rgba(245,158,11,0.4)]">
            <div className="w-full h-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center">
              <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]" />
              <span className="font-chakra font-black text-[11px] tracking-widest text-amber-300 mt-0.5">
                GX 3D
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-chakra text-4xl sm:text-5xl font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-transparent drop-shadow">
              GOALIX
            </h1>
            <p className="text-lg font-black text-white">مرحبًا بك في GOALIX</p>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              منصة الألعاب الكروية التنافسية، الغرف المباشرة، تشكيلات النخبة، وصناديق سانترا ثلاثية الأبعاد
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2 text-right">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setError(null);
                setStep('google_chooser');
              }}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-b from-white to-zinc-200 hover:from-zinc-100 hover:to-white text-zinc-950 font-black text-sm flex items-center justify-center gap-3 shadow-[0_6px_0_rgb(161,161,170),0_15px_30px_rgba(0,0,0,0.6)] active:translate-y-1 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.5H12v4.8h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.9 7.4 24 12 24z"
                />
              </svg>
              <span>تسجيل الدخول باستخدام Google</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 1B: GOOGLE ACCOUNT CHOOSER / AUTHENTICATION */}
      {step === 'google_chooser' && (
        <div className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/40 p-7 shadow-[0_28px_80px_rgba(0,0,0,0.95)] space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow">
                <Mail className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">تسجيل الدخول باستخدام Google</h2>
                <p className="text-[11px] text-zinc-400">اختر حسابك في Google أو أدخل بريدك الإلكتروني</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('welcome')}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Google Account Cards */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-zinc-400">حسابات Google السريعة:</div>

            {/* Owner Account Option */}
            <button
              type="button"
              disabled={loading}
              onClick={() => executeGoogleSignIn(OWNER_EMAIL, 'Mahmoud_GX')}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 hover:from-amber-500/25 border border-amber-500/50 flex items-center justify-between gap-3 text-right transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-black">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>حساب المالك الرسمي (OWNER)</span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-mono">{OWNER_EMAIL}</div>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-400">دخول كمالك</span>
            </button>

            {/* Player Account Option */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                executeGoogleSignIn(
                  `player_${profile.id.slice(-5)}@gmail.com`,
                  profile.username !== 'كابتن جواليكس' ? profile.username : ''
                )
              }
              className="w-full p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-between gap-3 text-right transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-200 font-black">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">حساب لاعب GOALIX</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    player_{profile.id.slice(-5)}@gmail.com
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-400">دخول كلاعب</span>
            </button>
          </div>

          {/* Custom Google Email Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeGoogleSignIn(emailInput, displayNameInput);
            }}
            className="space-y-3 pt-3 border-t border-zinc-800"
          >
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                أو أدخل بريد حساب Google الخاص بك:
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <GoldButton type="submit" fullWidth disabled={loading}>
              {loading ? 'جاري التحقق من الحساب...' : 'متابعة باستخدام حساب Google'}
            </GoldButton>
          </form>
        </div>
      )}

      {/* STEP 2: CREATE PROFILE (FIRST-TIME LOGIN ONLY) */}
      {step === 'create_profile' && (
        <div className="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/45 p-6 sm:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.95)] space-y-6 animate-fade-in">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>CREATE PROFILE • إعداد الحساب لأول مرة</span>
            </div>
            <h2 className="text-2xl font-black text-white">إنشاء ملفك الشخصي في GOALIX</h2>
            <p className="text-xs text-zinc-400">
              اختر صورة حسابك واسم المستخدم الفريد الخاص بك
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* 1. Account Image Upload & Preview */}
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                    <img
                      src={avatarPreview}
                      alt="معاينة الصورة"
                      className="w-full h-full rounded-full object-cover bg-zinc-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-zinc-950 cursor-pointer"
                    title="رفع صورة من جهازك"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-right space-y-2">
                  <div className="text-xs font-black text-white">1. اختيار صورة الحساب (Preview)</div>
                  <p className="text-[11px] text-zinc-400">
                    ارفع صورة من جهازك أو اختر من صور الأساطير وسيتم حفظها في الخادم
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-black transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختيار صورة من الجهاز</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Avatars */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="text-[10px] font-bold text-zinc-500 mb-2">
                  أو اختر رمزًا كرويًا جاهزًا:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        setAvatarPreview(av);
                      }}
                      className={`w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        avatarPreview === av
                          ? 'border-amber-400 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'border-zinc-800 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Unique Username */}
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-black text-white">
                2. اسم المستخدم (Username — فريد لكل لاعب)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: Ahmed_GX"
                maxLength={22}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 text-sm font-black text-white focus:outline-none"
              />
              <p className="text-[11px] text-zinc-500">
                يظهر اسمك في الغرف وجدول دوري جولكس ولا يمكن تكراره مع أي لاعب آخر.
              </p>
            </div>

            {/* 3. Immutable Account ID with Copy */}
            <div className="bg-gradient-to-r from-amber-500/10 via-zinc-950 to-zinc-950 border border-amber-500/35 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                  <Lock className="w-3.5 h-3.5" />
                  <span>معرف الحساب الثابت (Account ID)</span>
                </div>
                <div className="font-chakra text-xl font-black text-white tracking-wider">
                  {accountId}
                </div>
                <div className="text-[10px] text-zinc-400">
                  معرف فريد وثابت لحسابك يُستخدم في الشحن والغرف
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyId}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">تم نسخ ID بنجاح ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>📋 نسخ</span>
                  </>
                )}
              </button>
            </div>

            <GoldButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'جاري حفظ الملف الشخصي...' : 'حفظ والدخول إلى الصفحة الرئيسية'}
            </GoldButton>
          </form>
        </div>
      )}
    </div>
  );
};
