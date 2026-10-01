import React, { useState } from 'react';
import { UserProfile, PurchaseRecord } from '../../types/game';
import { updateUsernameOnServer, updateAvatarOnServer, syncUserProfileFromServer } from '../../services/store';
import { saveUserProfile } from '../../services/storage';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { 
  X, 
  Trophy, 
  Check, 
  Copy, 
  Share2, 
  Coins, 
  Shield, 
  Flame, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Crown
} from 'lucide-react';

interface ProfileModalProps {
  userProfile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
}

const AVAILABLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userProfile,
  onUpdate,
  onClose,
  onOpenAdmin,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'inventory' | 'purchases'>('profile');
  const [username, setUsername] = useState(userProfile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [copyToast, setCopyToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const accountId = userProfile.accountId || `GX-849271`;
  const isDevAdmin = userProfile.username.includes('محمود') || userProfile.id === 'dev_mahmoud_salama' || accountId === 'GX-999999';

  const matchesPlayed = userProfile.matchesPlayed || 0;
  const matchesWon = userProfile.matchesWon || 0;
  const matchesDrawn = userProfile.matchesDrawn || 0;
  const matchesLost = userProfile.matchesLost || Math.max(0, matchesPlayed - matchesWon - matchesDrawn);

  const winRate = matchesPlayed > 0 
    ? Math.round((matchesWon / matchesPlayed) * 100) 
    : 0;

  // Reliable Clipboard Copy for Mobile & Desktop
  const handleCopyId = () => {
    sounds.playTap();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accountId).then(() => {
        showCopyNotification();
      }).catch(() => {
        fallbackCopyText(accountId);
      });
    } else {
      fallbackCopyText(accountId);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopyNotification();
    } catch {
      // Ignore
    }
    document.body.removeChild(textArea);
  };

  const showCopyNotification = () => {
    setCopyToast(true);
    setTimeout(() => {
      setCopyToast(false);
    }, 2000);
  };

  // Native Mobile Share
  const handleShareId = async () => {
    sounds.playButtonClick();
    const shareData = {
      title: 'حساب GOALIX',
      text: `حسابي في منصة GOALIX الكروية:\nالمدرب: ${userProfile.username}\nAccount ID: ${accountId}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyId();
    }
  };

  // Save changes to Server and Local Storage
  const handleSaveProfile = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    sounds.playButtonClick();

    if (!username.trim()) {
      setErrorMsg('اسم المدرب لا يمكن أن يكون فارغاً');
      return;
    }

    setIsSaving(true);
    try {
      let updated = { ...userProfile };

      // 1. Update username on server if changed
      if (username.trim() !== userProfile.username) {
        const resUser = await updateUsernameOnServer(userProfile.id, username.trim());
        updated = { ...updated, username: resUser.username };
      }

      // 2. Update avatar on server if changed
      if (selectedAvatar !== userProfile.avatar) {
        const resUser = await updateAvatarOnServer(userProfile.id, selectedAvatar);
        updated = { ...updated, avatar: resUser.avatar };
      }

      saveUserProfile(updated);
      onUpdate(updated);
      sounds.playCorrect();
      setSuccessMsg('تم حفظ وتحديث بيانات الحساب على السيرفر بنجاح ✓');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: unknown) {
      sounds.playWrong();
      setErrorMsg(err instanceof Error ? err.message : 'فشل تحديث البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none font-tajawal antialiased">
      <div className="max-w-md w-full bg-[#0d0f14] border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Toast Notification */}
        {copyToast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce border border-emerald-300">
            <Check className="w-4 h-4" />
            <span>تم نسخ ID بنجاح ✓</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-base text-zinc-100">
              الملف الشخصي والحساب
            </h3>
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

        {/* TABS */}
        <div className="grid grid-cols-3 gap-1.5 bg-black/60 p-1 rounded-2xl border border-zinc-800 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('profile');
            }}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            بيانات الحساب
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('inventory');
            }}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            المقتنيات ({userProfile.inventory?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setActiveTab('purchases');
            }}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            سجل المشتريات
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

        {/* TAB 1: PROFILE & ACCOUNT ID */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Account ID Showcase Card */}
            <div className="bg-gradient-to-r from-[#171206] via-[#100d05] to-black rounded-2xl p-3.5 border-2 border-amber-500/50 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  معرّف الحساب الدائم (ID الشحن)
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-chakra font-bold">
                  PERMANENT ID
                </span>
              </div>

              {/* ID Box with Copy & Share */}
              <div className="flex items-center justify-between bg-black/70 rounded-xl p-2.5 border border-amber-500/30">
                <span className="font-chakra font-black text-xl text-yellow-300 tracking-wider">
                  {accountId}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-tajawal flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow"
                    title="نسخ معرّف الحساب"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareId}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                    title="مشاركة معرّف الحساب"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                * معرّف ثابت لا يتغير، يُستخدم لشحن الكوينز وتوثيق حسابك في السيرفر.
              </p>
            </div>

            {/* Avatar & Username Form */}
            <div className="flex flex-col items-center space-y-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 p-0.5 bg-zinc-800 shadow-xl">
                  <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover rounded-[14px]" />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-black">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>

              {/* Avatar Selector */}
              <div className="flex gap-2">
                {AVAILABLE_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedAvatar === av ? 'border-amber-400 scale-105' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={av} alt="option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Username Input */}
              <div className="w-full space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-bold">اسم المدرب (Username):</span>
                  <span className="text-[10px] text-amber-400">فريد على مستوى اللعبة</span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white text-center focus:outline-none focus:border-amber-400 shadow-inner"
                  placeholder="مثال: Ahmed_GX"
                />
              </div>

              <GoldButton onClick={handleSaveProfile} fullWidth size="sm" disabled={isSaving}>
                {isSaving ? 'جارٍ الحفظ على السيرفر...' : 'حفظ اسم المدرب والصورة'}
              </GoldButton>
            </div>

            {/* Economy & Stats Cards */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/30">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                  <Coins className="w-4 h-4" />
                  <span className="text-[10px] font-bold">الكوينز (المتجر)</span>
                </div>
                <span className="font-chakra font-black text-lg text-yellow-300">
                  {userProfile.coins}
                </span>
              </div>

              <div className="bg-black/50 p-2.5 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                  <Trophy className="w-4 h-4" />
                  <span className="text-[10px] font-bold">نقاط الدوري</span>
                </div>
                <span className="font-chakra font-black text-lg text-amber-400">
                  {userProfile.points || 0}
                </span>
              </div>
            </div>

            {/* Matches Breakdown */}
            <div className="bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 space-y-2 text-center">
              <span className="text-[11px] font-tajawal text-zinc-300 font-bold block">
                سجل المباريات الرسمية
              </span>
              <div className="grid grid-cols-5 gap-1.5 font-chakra text-center">
                <div className="bg-black/40 p-2 rounded-xl">
                  <span className="text-[9px] text-zinc-400 block font-tajawal">لعب</span>
                  <span className="font-bold text-xs text-white">{matchesPlayed}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl">
                  <span className="text-[9px] text-emerald-400 block font-tajawal">فوز</span>
                  <span className="font-bold text-xs text-emerald-400">{matchesWon}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl">
                  <span className="text-[9px] text-blue-300 block font-tajawal">تعادل</span>
                  <span className="font-bold text-xs text-blue-300">{matchesDrawn}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl">
                  <span className="text-[9px] text-red-400 block font-tajawal">خسارة</span>
                  <span className="font-bold text-xs text-red-400">{matchesLost}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl">
                  <span className="text-[9px] text-amber-400 block font-tajawal">نسبة</span>
                  <span className="font-bold text-xs text-amber-400">{winRate}%</span>
                </div>
              </div>
            </div>

            {/* Switch Account & Admin Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onClose();
                    onOpenAuth();
                  }}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400 text-xs font-bold text-zinc-200 transition-all cursor-pointer text-center"
                >
                  تبديل / تسجيل الحساب 🔑
                </button>
              )}

              {isDevAdmin && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playGoalHorn();
                    onClose();
                    onOpenAdmin();
                  }}
                  className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-xs font-black text-amber-300 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>لوحة الإدارة والمتجر 🛡️</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & OWNED ITEMS */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-300 pb-1 border-b border-zinc-800">
              <span className="font-bold">العناصر المشتراة والمملوكة:</span>
              <span className="font-chakra text-amber-400 font-bold">
                {userProfile.inventory?.length || 0} عنصر
              </span>
            </div>

            {(!userProfile.inventory || userProfile.inventory.length === 0) ? (
              <div className="p-8 text-center space-y-2 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-300">حقيبة المقتنيات فارغة حالياً</p>
                <p className="text-[11px] text-zinc-500">
                  قم بزيارة المتجر لشراء تأثيرات الشات، إطارات البروفايل، وألقاب التكتيك الفاخرة!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {userProfile.inventory.map((itemId, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-black/60 border border-amber-500/30 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="truncate">
                      <span className="text-[11px] font-bold text-white block truncate">
                        {itemId.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-tajawal block">
                        ✓ في حوزتك
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PURCHASE HISTORY */}
        {activeTab === 'purchases' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-300 pb-1 border-b border-zinc-800">
              <span className="font-bold">سجل الفواتير والمشتريات (Purchase History):</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>

            {(!userProfile.purchaseHistory || userProfile.purchaseHistory.length === 0) ? (
              <div className="p-8 text-center space-y-2 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-300">لا توجد عمليات شراء سابقة</p>
                <p className="text-[11px] text-zinc-500">كل مشترياتك من المتجر تُسجل برقم عملية وتاريخ رسمي هنا.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {userProfile.purchaseHistory.map((item: PurchaseRecord, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-tajawal">
                          {item.productName}
                        </span>
                        <span className="text-[9px] font-chakra px-1.5 py-0.2 rounded bg-black/40 text-zinc-400 border border-zinc-800">
                          {item.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-chakra block">
                        {new Date(item.timestamp).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 font-chakra font-black text-amber-400 text-xs">
                        <span>{item.price}</span>
                        <Coins className="w-3 h-3" />
                      </div>
                      <span className="text-[9px] font-tajawal text-emerald-400 block font-bold">
                        مكتملة ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
