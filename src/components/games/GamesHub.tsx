import React, { useState } from 'react';
import { GameId } from '../../types/game';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import { Gamepad2, Play, Info, Flame, Sparkles, HelpCircle, Trophy } from 'lucide-react';

interface GamesHubProps {
  onSelectGame: (gameId: GameId) => void;
  onOpenOnlineRooms: () => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame, onOpenOnlineRooms }) => {
  const [selectedIntroGame, setSelectedIntroGame] = useState<GameId | null>(null);

  const gamesList = [
    {
      id: 'stat_arena' as GameId,
      name: 'STAT ARENA',
      titleAr: 'ستات أرينا · صراع الأرقام',
      tagline: 'تحدي التوقعات الإحصائية الكروية',
      descriptionAr: 'اختبر معلوماتك الكروية التنافسية! توقع أرقام وإحصائيات أساطير ونجوم كرة القدم الحقيقية. صاحب التوقع الأدق يفوز بالجولة، بينما يحصل الخاسر على لاعب عشوائي لتعزيز تشكيلته، ثم تخوضان محاكاة مباراة تكتيكية بأفضلية 1-0 للمتصدر!',
      image: '/src/assets/images/stat_arena_cover_1790797310047.jpg',
      badge: 'إحصائيات وتحدي',
      modes: ['Quick Five (5)', 'Full Eleven (11)', 'أوفلاين ضد الكمبيوتر', 'صديق على نفس الجهاز', 'أونلاين غرف مباشرة']
    },
    {
      id: 'santra' as GameId,
      name: 'SANTRA',
      titleAr: 'سانترا · درافت الصناديق',
      tagline: 'تحدي الصناديق الغامضة وتشكيل الفريق',
      descriptionAr: 'في كل جولة، تظهر 4 صناديق غامضة متطابقة تماماً لا تحمل أي شعار أو تلميح. يختر كل لاعب صندوقه ليكتشف النادي المختبئ بداخله، ويحصل على لاعب عشوائي في المركز التلقائي للجولة لبناء تشكيلة غير متوقعة قبل خوض محاكاة المباراة!',
      image: '/src/assets/images/santra_mystery_cover_1790797320678.jpg',
      badge: 'درافت غامض',
      modes: ['Quick Five (5)', 'Full Eleven (11)', 'الكمبيوتر الذكي', 'صديق على نفس الجهاز', 'أونلاين خادم موثوق']
    },
    {
      id: 'memory_xi' as GameId,
      name: 'MEMORY XI',
      titleAr: 'ميموري XI · ذاكرة التشكيلة',
      tagline: 'تحدي حفظ وتذكر تشكيلة الـ11 لاعباً',
      descriptionAr: 'كل مباراة 3 جولات! في كل جولة تظهر تشكيلة من 11 لاعباً حقيقياً لمدة 5 ثوانٍ فقط، ثم تختفي تماماً. اكتب أسماء اللاعبين الذين تتذكرهم بنفسك بدقة، واكسب النقاط للتغلب على منافسك في شوط الحسم أو Tie Break!',
      image: '/src/assets/images/memory_xi_cover_1790801558164.jpg',
      badge: 'ذاكرة وتحدي سرعة',
      modes: ['3 جولات حاسمة', 'نظام كسر التعادل Tie Break', 'ذكاء اصطناعي (Rookie / Pro / Elite / Legend)', 'صديق على نفس الجهاز', 'غرف أونلاين مباشرة']
    }
  ];

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Hub Header */}
      <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-chakra font-black text-lg text-zinc-100">
              GOALIX GAMES
            </h3>
          </div>

          <span className="text-[10px] text-amber-400 font-chakra font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            3 ألعاب متاحة
          </span>
        </div>

        <p className="text-xs text-zinc-400 font-tajawal leading-relaxed">
          ألعاب تنافسية مصممة خصيصاً لعشاق كرة القدم. العب ضد الكمبيوتر، أو تحدّ صديقاً على نفس الجهاز، أو افتح غرفة أونلاين وتنافس عبر أجهزة مختلفة.
        </p>
      </div>

      {/* Online Rooms Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-black rounded-2xl p-4 border border-amber-500/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-widest block">
            ONLINE MULTIPLAYER
          </span>
          <h4 className="text-sm font-bold font-tajawal text-zinc-100 mt-0.5">
            غرف اللعب عبر الإنترنت
          </h4>
          <p className="text-[11px] text-zinc-400 font-tajawal">أنشئ غرفة أو انضم برمز لمنافسة أصدقائك</p>
        </div>

        <GoldButton onClick={onOpenOnlineRooms} size="sm">
          دخول الغرف
        </GoldButton>
      </div>

      {/* Games List */}
      <div className="space-y-4">
        {gamesList.map(game => (
          <div
            key={game.id}
            className="rounded-2xl border border-zinc-800 hover:border-amber-500/40 bg-zinc-900/90 overflow-hidden shadow-xl transition-all space-y-3"
          >
            {/* Artwork Banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-chakra font-bold text-amber-400 uppercase tracking-widest">
                  {game.badge}
                </span>
                <h4 className="font-chakra font-black text-xl text-white">
                  {game.name}
                </h4>
                <p className="text-xs font-tajawal text-zinc-300">{game.titleAr}</p>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-4 pt-0 space-y-3">
              <p className="text-xs text-zinc-400 font-tajawal leading-relaxed">
                {game.tagline}
              </p>

              <div className="flex gap-2">
                <GoldButton
                  onClick={() => onSelectGame(game.id)}
                  fullWidth
                  size="md"
                >
                  <Play className="w-4 h-4 fill-black" />
                  العب الآن
                </GoldButton>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setSelectedIntroGame(game.id);
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-tajawal text-zinc-300 hover:text-white"
                  title="دليل وقواعد اللعبة"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Game Intro Modal */}
      {selectedIntroGame && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          {(() => {
            const game = gamesList.find(g => g.id === selectedIntroGame)!;
            return (
              <div className="max-w-sm w-full bg-[#111317] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="font-chakra font-black text-base text-amber-400">
                    {game.name}
                  </h3>
                  <button
                    onClick={() => setSelectedIntroGame(null)}
                    className="text-xs text-zinc-400 hover:text-white font-tajawal"
                  >
                    إغلاق
                  </button>
                </div>

                <div className="space-y-2 text-right">
                  <h4 className="text-sm font-bold text-white font-tajawal">{game.titleAr}</h4>
                  <p className="text-xs text-zinc-300 font-tajawal leading-relaxed">
                    {game.descriptionAr}
                  </p>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 space-y-1 text-right">
                  <span className="text-[11px] font-bold text-amber-400 font-tajawal block">الأنماط المدعومة:</span>
                  <ul className="text-xs text-zinc-400 font-tajawal space-y-0.5">
                    {game.modes.map((m, idx) => (
                      <li key={idx}>· {m}</li>
                    ))}
                  </ul>
                </div>

                <GoldButton
                  onClick={() => {
                    onSelectGame(game.id);
                    setSelectedIntroGame(null);
                  }}
                  fullWidth
                  size="md"
                >
                  بدء اللعب مباشرة
                </GoldButton>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
