import React, { useState, useEffect } from 'react';
import { sounds } from '../../services/audio';
import { GoldButton } from '../common/GoldButton';
import { UserProfile } from '../../types/game';
import { 
  ShieldCheck, 
  Database, 
  Coins, 
  Trophy, 
  Wifi, 
  Users, 
  X, 
  RefreshCw, 
  Check, 
  Crown, 
  Server, 
  Download, 
  Activity,
  Flame,
  Plus
} from 'lucide-react';

interface AdminControlModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

interface AdminData {
  snapshot: {
    totalUsers: number;
    users: Array<{
      id: string;
      username: string;
      role: string;
      coins: number;
      bids: number;
      points: number;
      matchesPlayed: number;
      matchesWon: number;
      createdAt: number;
      lastLogin: number;
    }>;
    matchLogs: Array<{
      id: string;
      roomCode: string;
      hostName: string;
      guestName: string;
      score: string;
      winner: string;
      timestamp: number;
    }>;
    serverUptime: number;
  };
  activeRooms: any[];
  rankings: any;
  serverTime: number;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  userProfile,
  onUpdateProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'economy' | 'rooms'>('overview');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database');
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
      }
    } catch {
      // Fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleGrantCoins = async (coinsDelta: number, bidsDelta: number, pointsDelta: number) => {
    sounds.playGoalHorn();
    try {
      await fetch('/api/admin/adjust-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          coinsDelta,
          bidsDelta,
          pointsDelta
        })
      });

      const updated: UserProfile = {
        ...userProfile,
        coins: userProfile.coins + coinsDelta,
        bids: (userProfile.bids || 0) + bidsDelta,
        matchesWon: userProfile.matchesWon + (pointsDelta > 0 ? 1 : 0)
      };
      onUpdateProfile(updated);
      setGrantSuccess(`تمت إضافة ${coinsDelta} كوينز و ${bidsDelta} تذكرة بنجاح!`);
      setTimeout(() => setGrantSuccess(null), 2500);
      fetchAdminData();
    } catch {
      // Error
    }
  };

  const handleExportDatabase = () => {
    sounds.playButtonClick();
    if (!adminData) return;
    const blob = new Blob([JSON.stringify(adminData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goalix_database_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none font-tajawal antialiased">
      <div className="max-w-xl w-full bg-[#0a0c10] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Golden Glowing Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white font-tajawal">
                  غرفة الإدارة وقاعدة البيانات
                </h2>
                <span className="text-[10px] font-chakra px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEVELOPER ONLY
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-tajawal">
                إشراف وتحكم المطور: <span className="text-amber-300 font-bold">محمود أحمد سلامة</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playButtonClick();
                fetchAdminData();
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                sounds.playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-black/50 p-1 rounded-2xl border border-zinc-800 shrink-0 text-xs font-bold">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('overview');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>نظرة عامة</span>
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('database');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'database' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>قاعدة البيانات</span>
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('economy');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'economy' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>التحكم بالموارد</span>
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveTab('rooms');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'rooms' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>الغرف المباشرة</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            <div className="grid grid-cols-3 gap-2 font-chakra">
              <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl text-center">
                <Users className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[10px] text-zinc-400 font-tajawal block">المستخدمين بقاعدة البيانات</span>
                <span className="text-xl font-black text-white">{adminData?.snapshot.totalUsers || 1}</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl text-center">
                <Wifi className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[10px] text-zinc-400 font-tajawal block">الغرف النشطة حالياً</span>
                <span className="text-xl font-black text-emerald-400">{adminData?.activeRooms?.length || 0}</span>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl text-center">
                <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <span className="text-[10px] text-zinc-400 font-tajawal block">المباريات المسجلة</span>
                <span className="text-xl font-black text-blue-400">{adminData?.snapshot.matchLogs?.length || 0}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-300 font-tajawal flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                إجراءات سريعة لحساب المطور
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGrantCoins(5000, 50, 6)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+5,000 كوينز و 50 تذكرة</span>
                </button>

                <button
                  onClick={handleExportDatabase}
                  className="py-2.5 px-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-500/30 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير نسخة احتياطية JSON</span>
                </button>
              </div>

              {grantSuccess && (
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{grantSuccess}</span>
                </div>
              )}
            </div>

            {/* Recent Match Logs */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 space-y-2">
              <h4 className="text-xs font-bold text-zinc-200 font-tajawal flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                آخر نتائج المباريات في الغرف
              </h4>

              {adminData?.snapshot.matchLogs && adminData.snapshot.matchLogs.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {adminData.snapshot.matchLogs.map(m => (
                    <div key={m.id} className="p-2 rounded-xl bg-black/40 border border-zinc-800 text-[11px] flex items-center justify-between">
                      <span className="font-chakra text-amber-400 font-bold">[{m.roomCode}]</span>
                      <span className="text-zinc-200">{m.hostName} ضد {m.guestName}</span>
                      <span className="font-chakra font-black text-white bg-zinc-800 px-2 py-0.5 rounded">{m.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 text-center py-2">لا توجد مباريات مسجلة بعد</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Database Users */}
        {activeTab === 'database' && (
          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>سجلات المستخدمين المخزنة بالسيرفر</span>
              <button
                onClick={handleExportDatabase}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                تحميل السجلات (JSON)
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {adminData?.snapshot.users.map(u => (
                <div key={u.id} className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{u.username}</span>
                      {u.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          مدير
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-chakra block">ID: {u.id}</span>
                  </div>

                  <div className="text-left font-chakra space-y-0.5">
                    <div className="text-amber-400 font-black">{u.coins} Coins · {u.bids} Bids</div>
                    <div className="text-[10px] text-zinc-400">{u.points} PTS · {u.matchesPlayed} لعب</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Economy & Points Editor */}
        {activeTab === 'economy' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white font-tajawal flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                تزويد حساب المطور بالموارد الفورية
              </h4>

              <div className="grid grid-cols-3 gap-2 font-chakra">
                <button
                  onClick={() => handleGrantCoins(1000, 10, 3)}
                  className="p-3 rounded-xl bg-black/60 border border-zinc-700 hover:border-amber-400 text-center transition-all cursor-pointer"
                >
                  <span className="block text-sm font-black text-amber-400">+1,000 كوينز</span>
                  <span className="text-[10px] text-zinc-400 font-tajawal">+10 تذاكر</span>
                </button>

                <button
                  onClick={() => handleGrantCoins(5000, 50, 9)}
                  className="p-3 rounded-xl bg-black/60 border border-zinc-700 hover:border-amber-400 text-center transition-all cursor-pointer"
                >
                  <span className="block text-sm font-black text-amber-400">+5,000 كوينز</span>
                  <span className="text-[10px] text-zinc-400 font-tajawal">+50 تذكرة</span>
                </button>

                <button
                  onClick={() => handleGrantCoins(20000, 200, 30)}
                  className="p-3 rounded-xl bg-black/60 border border-zinc-700 hover:border-amber-400 text-center transition-all cursor-pointer"
                >
                  <span className="block text-sm font-black text-amber-400">+20,000 كوينز</span>
                  <span className="text-[10px] text-zinc-400 font-tajawal">+200 تذكرة</span>
                </button>
              </div>

              {grantSuccess && (
                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{grantSuccess}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Live Rooms */}
        {activeTab === 'rooms' && (
          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            <h4 className="text-xs font-bold text-zinc-300 font-tajawal">مراقبة الغرف الحية بالسيرفر</h4>
            {adminData?.activeRooms && adminData.activeRooms.length > 0 ? (
              <div className="space-y-2">
                {adminData.activeRooms.map(r => (
                  <div key={r.code} className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-chakra font-black text-amber-400 text-sm">رمز الغرفة: {r.code}</span>
                      <p className="text-[11px] text-zinc-300">
                        المضيف: {r.participants.host.name} {r.participants.guest ? `| الضيف: ${r.participants.guest.name}` : '(بانتظار لاعب)'}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded bg-black text-zinc-300 font-chakra text-[10px]">
                      {r.phase}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl text-xs text-zinc-500">
                لا توجد غرف نشطة حالياً بالسيرفر
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
