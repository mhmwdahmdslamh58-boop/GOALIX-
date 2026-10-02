import React, { useState } from 'react';
import { AppSettings, UserProfile } from '../../types/game';
import {
  updateUserSettings,
  resetAllGoalixData,
  logoutCurrentGoalixAccount,
  getFormattedAccountId,
  copyAccountIdToClipboard,
  isOwnerAccount,
} from '../../services/storage';
import { sounds } from '../../services/audio';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
  RotateCcw,
  Check,
  ShieldAlert,
  Settings as SettingsIcon,
  Sliders,
  Copy,
  LogOut,
  Crown,
} from 'lucide-react';

interface SettingsModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() =>
    profile.settings || {
      soundEnabled: true,
      musicEnabled: false,
      effectsEnabled: true,
      notificationsEnabled: true,
      language: 'ar',
    }
  );
  const [activeTab, setActiveTab] = useState<'general' | 'danger'>('general');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const accountId = getFormattedAccountId(profile);
  const isOwner = isOwnerAccount(profile);

  const handleToggleSetting = (key: 'soundEnabled' | 'musicEnabled' | 'effectsEnabled') => {
    const updated: AppSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(updated);
    const updatedProfile = updateUserSettings(updated);
    onUpdateProfile(updatedProfile);
    sounds.playTap();
  };

  const handleCopyId = async () => {
    sounds.playTap();
    const ok = await copyAccountIdToClipboard(accountId);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleLogout = () => {
    sounds.playTap();
    const loggedOut = logoutCurrentGoalixAccount();
    onUpdateProfile(loggedOut);
    onClose();
  };

  const handleResetData = () => {
    sounds.playWrong();
    const freshProfile = resetAllGoalixData();
    onUpdateProfile(freshProfile);
    setConfirmReset(false);
    setSavedBanner('تمت إعادة ضبط جميع البيانات إلى الحالة الافتراضية بنجاح.');
    setTimeout(() => {
      setSavedBanner(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95)] my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => {
            sounds.playTap();
            onClose();
          }}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">إعدادات اللعبة (SETTINGS)</h2>
            <p className="text-xs text-zinc-400">التحكم بالصوت، المؤثرات البصرية، ومعلومات الحساب</p>
          </div>
        </div>

        {/* Navigation Tabs (No Add Player tab) */}
        <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 mb-5">
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('general');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            الصوت والحساب
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('danger');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'danger'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            إعادة الضبط
          </button>
        </div>

        {savedBanner && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{savedBanner}</span>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Account ID Summary Card */}
            <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{profile.username}</span>
                  {isOwner && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300">
                      <Crown className="w-3 h-3" />
                      OWNER
                    </span>
                  )}
                </div>
                <div className="font-chakra text-sm font-black text-amber-400 tracking-wider">
                  Account ID: {accountId}
                </div>
                {profile.email && (
                  <div className="text-[11px] text-zinc-500 font-mono">{profile.email}</div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyId}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 shrink-0 transition-all"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">تم نسخ ID بنجاح ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>📋 نسخ</span>
                  </>
                )}
              </button>
            </div>

            {/* Audio & Effects Toggles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      settings.soundEnabled
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {settings.soundEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">المؤثرات الصوتية (Sound ON/OFF)</div>
                    <div className="text-[11px] text-zinc-400">
                      أصوات الأزرار، صافرة الحكم، فتح الباكات والصناديق
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSetting('soundEnabled')}
                  className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
                    settings.soundEnabled ? 'bg-amber-500 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      settings.musicEnabled
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">الموسيقى الخلفية (Music ON/OFF)</div>
                    <div className="text-[11px] text-zinc-400">موسيقى أجواء الملعب الحماسية</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSetting('musicEnabled')}
                  className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
                    settings.musicEnabled ? 'bg-amber-500 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
                </button>
              </div>

              <div className="flex items-center justify-between bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      settings.effectsEnabled
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">
                      المؤثرات البصرية (Effects ON/OFF)
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      احتفالات الكونفيتي، الإضاءة الذهبية، واهتزاز الصناديق
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSetting('effectsEnabled')}
                  className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
                    settings.effectsEnabled
                      ? 'bg-amber-500 justify-end'
                      : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white shadow-md block" />
                </button>
              </div>
            </div>

            {/* Switch Google Account / Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4 text-amber-400" />
              <span>تبديل حساب Google / تسجيل الخروج</span>
            </button>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-4">
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">إعادة ضبط مصنع لحسابك في GOALIX</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                سيؤدي هذا الإجراء إلى مسح سجل المباريات المحلي وإعادة التشكيلة الأساسية.
              </p>

              {!confirmReset ? (
                <button
                  onClick={() => {
                    sounds.playTap();
                    setConfirmReset(true);
                  }}
                  className="w-full py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-xs transition-all"
                >
                  طلب إعادة ضبط جميع البيانات (RESET DATA)
                </button>
              ) : (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-black text-rose-400">هل أنت متأكد تمامًا؟</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleResetData}
                      className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg"
                    >
                      نعم، أعد الضبط الآن
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
