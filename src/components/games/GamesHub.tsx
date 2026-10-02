import React, { useState } from 'react';
import { GameId } from '../../types/game';
import { GoldButton } from '../common/GoldButton';
import { sounds } from '../../services/audio';
import {
  Play,
  Sparkles,
  Trophy,
  Users,
  Brain,
  Globe,
  Swords,
  Info,
  CheckCircle2,
  X,
  Coins,
  Award,
  Package,
  Dices,
} from 'lucide-react';
import statArenaCover from '../../assets/images/stat_arena_cover_1790797310047.jpg';
import santraCover from '../../assets/images/santra_mystery_cover_1790797320678.jpg';
import memoryXICover from '../../assets/images/memory_xi_cover_1790801558164.jpg';
import heroBanner from '../../assets/images/goalix_hero_banner_1790797297425.jpg';

interface GamesHubProps {
  onSelectGame: (game: GameId) => void;
  onOpenRooms?: (gameId?: GameId) => void;
}

interface GameCatalogItem {
  id: GameId;
  code: string;
  titleAr: string;
  subtitleAr: string;
  descriptionAr: string;
  howToPlaySummaryAr: string;
  coverImg: string;
  supportsRooms: boolean;
  modeBadge: string;
  roundsInfo: string;
  rewardCoins: string;
  rewardChest: string;
  features: string[];
  rules: string[];
}

const GAMES_CATALOG: GameCatalogItem[] = [
  {
    id: 'santra',
    code: 'SANTRA 3D',
    titleAr: 'سانترا — اللوح التكتيكي وصناديق 3D',
    subtitleAr: 'نرد تكتيكي · لوح 12 خانة · ألغاز · صناديق سانترا 3D',
    descriptionAr:
      'اللعبة التكتيكية المتكاملة! ارمِ نرد سانترا للتحرك على اللوح التكتيكي، حل ألغاز اللاعبين، وافتح صناديق سانترا ثلاثية الأبعاد لبناء تشكيلتك وخوض المحاكاة.',
    howToPlaySummaryAr:
      'ارمِ النرد التكتيكي ← خمن اللاعب بأقل تلميحات ← افتح أحد الصناديق الـ3 ← خض محاكاة الـ90 دقيقة.',
    coverImg: santraCover,
    supportsRooms: true,
    modeBadge: 'فردي ضد AI / غرف أونلاين (Player 1 VS Player 2)',
    roundsInfo: '5 أو 11 جولة + محاكاة',
    rewardCoins: '+25 كوينز بالغرف (+5 فردي)',
    rewardChest: 'صندوق سانترا 3D',
    features: [
      'لوح سانترا التكتيكي الفعلي (12 خانة تفاعلية)',
      'نرد تكتيكي يمنح كوينز وترقيات OVR وبطاقات مساعدة',
      'صناديق 3D معدنية بالأسود والذهبي قابلة للفتح الفعلي',
      'محاكاة تكتيكية 90 دقيقة في نهاية بناء التشكيلة',
    ],
    rules: [
      'في بداية دورك ارمِ نرد سانترا للتقدم على اللوح وكسب ميزة الخانة.',
      'اقرأ التلميحات وخمّن اسم اللاعب بأقل عدد من التلميحات لكسب نقاط أعلى.',
      'اختر أحد صناديق سانترا 3D الثلاثة لضم لاعب في المركز المطلوب.',
      'بعد اكتمال التشكيلة، تنطلق محاكاة المباراة لتحديد البطل.',
    ],
  },
  {
    id: 'stat_arena',
    code: 'STAT ARENA',
    titleAr: 'ساحة الإحصائيات التنافسية',
    subtitleAr: 'تحدي الأرقام القياسية · خطف نجوم المراكز · محاكاة',
    descriptionAr:
      'اختبر معرفتك الكروية بلغة الأرقام! صاحب التخمين الأقرب للإحصائية الحقيقية يخطف بطاقة اللاعب الأعلى تقييمًا في المركز المستهدف قبل انطلاق المحاكاة.',
    howToPlaySummaryAr:
      'اقرأ السؤال الإحصائي ← أدخل الرقم الأقرب للصواب قبل انتهاء المؤقت ← اخطف لاعب المركز ← حسم المحاكاة.',
    coverImg: statArenaCover,
    supportsRooms: true,
    modeBadge: 'فردي ضد AI / غرف أونلاين (Player 1 VS Player 2)',
    roundsInfo: '5 أو 11 جولة + مؤقت',
    rewardCoins: '+25 كوينز بالغرف (+5 فردي)',
    rewardChest: 'صندوق سانترا 3D',
    features: [
      'طور فردي للتدريب وطور غرف تنافسي مباشر بين لاعبين',
      'مؤقت تنازلي تفاعلي لكل سؤال إحصائي',
      'منح بطاقات حقيقية مطابقة للمركز المطلوب 100%',
      'محاكاة كاملة للمباراة في نهاية التحدي',
    ],
    rules: [
      'يظهر سؤال رقمي عن تاريخ كرة القدم والدوريات الكبرى.',
      'أدخل الرقم الأقرب للإجابة الصحيحة قبل انتهاء المؤقت.',
      'الأقرب للإجابة الصحيحة يحصل على لاعب نخبة في المركز المستهدف.',
      'الفائز في غرف الأونلاين يحصد +3 نقاط تصنيف (RP) في دوري جولكس.',
    ],
  },
  {
    id: 'memory_xi',
    code: 'MEMORY XI',
    titleAr: 'ذاكرة التشكيلة الفوتوغرافية',
    subtitleAr: '30 ثانية حفظ · 60 ثانية استرجاع · 3 جولات حاسمة',
    descriptionAr:
      'تحدي الذاكرة الكروية للأندية الأوروبية والتاريخية! احفظ مواقع وأسماء 11 لاعبًا على الملعب خلال 30 ثانية ثم استرجعهم بدقة.',
    howToPlaySummaryAr:
      'احفظ مواقع 11 لاعبًا خلال 30 ثانية ← استرجع أسماء اللاعبين في مراكزهم خلال 60 ثانية ← اجمع أعلى نقاط في 3 جولات.',
    coverImg: memoryXICover,
    supportsRooms: false,
    modeBadge: 'تحدي فردي أو محلي',
    roundsInfo: '3 جولات + شوط كسر تعادل',
    rewardCoins: '+5 كوينز (طور فردي)',
    rewardChest: 'صندوق سانترا 3D',
    features: [
      'أندية حقيقية وتشكيلات تاريخية وحديثة متجددة',
      'مؤقت حفظ 30 ثانية ومؤقت إجابة 60 ثانية',
      'دعم الكتابة بالعربية أو الإنجليزية مع مصحح ذكي للأسماء',
      'وسائل مساعدة تكتيكية (كشف مركز / كشف حرف أول)',
    ],
    rules: [
      'ركز جيدًا في التشكيلة المعروضة على الملعب لمدة 30 ثانية.',
      'عند اختفاء الأسماء، اكتب أسماء اللاعبين في مراكزهم الصحيحة.',
      'تتكون المباراة من 3 جولات، وفي حال التعادل يتم اللجوء لجولة Tie-Break.',
    ],
  },
  {
    id: 'squad_match',
    code: 'MY SQUAD TRIAL',
    titleAr: 'اختبار تشكيلتي التكتيكي (90 دقيقة)',
    subtitleAr: 'العب بتشكيلتك الأساسية · تكتيك مباشر · إحصائيات كاملة',
    descriptionAr:
      'خض مباراة كاملة بتشكيلتك الأساسية التي بنيتها ضد أندية النخبة! غيّر الخطة والتكتيك المباشر أثناء المباراة وتابع الاستحواذ والهجمات والأهداف.',
    howToPlaySummaryAr:
      'اختر خطتك التكتيكية ← حدد النادي المنافس ← أدر التكتيك والسرعة خلال 90 دقيقة على رادار الملعب.',
    coverImg: heroBanner,
    supportsRooms: false,
    modeBadge: 'اختبار التشكيلة ضد AI (مكافأة كل 3 أيام)',
    roundsInfo: '90 دقيقة تفاعلية (1x / 2x / 4x)',
    rewardCoins: '+20 كوينز (تجربة التشكيلة)',
    rewardChest: 'صندوق سانترا 3D',
    features: [
      'محرك محاكاة يعتمد فعليًا على تقييمات لاعبيك، الخطة، والتناغم',
      'تغيير التوجيه التكتيكي أثناء سير المباراة (هجومي / متوازن / دفاعي)',
      'إحصائيات شاملة: الاستحواذ، الهجمات، الفرص، التسديدات، والبطاقات',
      'تتويج رجل المباراة (MVP)',
    ],
    rules: [
      'اختر النادي المنافس ومستوى الصعوبة.',
      'حدد خطة فريقك (4-3-3، 4-4-2، 4-2-3-1، 3-5-2، 5-3-2) والتكتيك.',
      'تابع مجريات اللقاء على رادار الملعب المباشر وتحكم بالسرعة أو التكتيك.',
    ],
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame, onOpenRooms }) => {
  const [detailsGame, setDetailsGame] = useState<GameCatalogItem | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-28 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-black tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAMES • ساحة ألعاب GOALIX ثلاثية الأبعاد</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">بطاقات الألعاب الرسمية</h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            اختر اللعبة للعب الفردي أو ادخل غرف المنافسة المباشرة (Player 1 VS Player 2) لحصد نقاط دوري جولكس
          </p>
        </div>
      </div>

      {/* 3D Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES_CATALOG.map((game) => (
          <div
            key={game.id}
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/35 hover:border-amber-400 transition-all duration-300 shadow-[0_12px_0_rgb(24,24,27),0_25px_55px_rgba(0,0,0,0.9)] hover:-translate-y-1 active:translate-y-0.5 flex flex-col"
          >
            {/* Ambient 3D Top Glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full bg-amber-500/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={game.coverImg}
                alt={game.titleAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

              <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5">
                {game.id === 'santra' && <Dices className="w-3.5 h-3.5" />}
                {game.id === 'stat_arena' && <Trophy className="w-3.5 h-3.5" />}
                {game.id === 'memory_xi' && <Brain className="w-3.5 h-3.5" />}
                {game.id === 'squad_match' && <Swords className="w-3.5 h-3.5" />}
                <span>{game.code}</span>
              </div>

              <div className="absolute bottom-3 right-4 left-4">
                <h3 className="text-xl font-black text-white drop-shadow">{game.titleAr}</h3>
                <p className="text-[11px] text-amber-300 font-bold mt-0.5">{game.subtitleAr}</p>
              </div>
            </div>

            {/* Body: Description + How To Play + Actions */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">{game.descriptionAr}</p>

                {/* How to play concise card */}
                <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3 space-y-1">
                  <div className="text-[10px] font-black text-amber-400 uppercase">
                    طريقة اللعب (HOW TO PLAY):
                  </div>
                  <p className="text-[11px] text-zinc-300 font-bold leading-relaxed">
                    {game.howToPlaySummaryAr}
                  </p>
                </div>

                {/* Unboxed Clean Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 pt-1">
                  <span className="text-zinc-200 font-bold">{game.roundsInfo}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-bold">{game.rewardCoins}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-bold">
                    {game.supportsRooms ? 'يدعم غرف الأونلاين (+3 RP)' : 'طور فردي'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Play + Rooms (if multiplayer) + Details */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2.5">
                  <GoldButton
                    fullWidth
                    onClick={() => {
                      sounds.playTap();
                      onSelectGame(game.id);
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 fill-current" />
                      Play • العب الآن
                    </span>
                  </GoldButton>

                  {game.supportsRooms && onOpenRooms && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playTap();
                        onOpenRooms(game.id);
                      }}
                      className="px-4 py-3 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border-2 border-amber-500/50 text-amber-300 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-[0_4px_0_rgb(9,9,11)] active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>Rooms • الغرف</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setDetailsGame(game);
                    }}
                    className="px-3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-amber-300 font-black text-xs flex items-center gap-1 shrink-0 shadow-[0_4px_0_rgb(9,9,11)] active:translate-y-0.5 transition-all cursor-pointer"
                    title="تفاصيل وقوانين اللعبة"
                  >
                    <Info className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GAME DETAILS MODAL */}
      {detailsGame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto">
            <div className="relative h-44">
              <img
                src={detailsGame.coverImg}
                alt={detailsGame.titleAr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
              <button
                onClick={() => setDetailsGame(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/70 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 right-5 left-5">
                <div className="text-amber-400 font-black text-xs">{detailsGame.code}</div>
                <h3 className="text-xl font-black text-white mt-0.5">{detailsGame.titleAr}</h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-zinc-300 leading-relaxed">{detailsGame.descriptionAr}</p>

              {/* Key Features */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase">مميزات نظام اللعب:</h4>
                <div className="space-y-1.5">
                  {detailsGame.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-zinc-200 bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase">طريقة وقواعد اللعب:</h4>
                <div className="space-y-1.5">
                  {detailsGame.rules.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <GoldButton
                  fullWidth
                  size="lg"
                  onClick={() => {
                    const id = detailsGame.id;
                    setDetailsGame(null);
                    onSelectGame(id);
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    العب الآن (PLAY)
                  </span>
                </GoldButton>

                {detailsGame.supportsRooms && onOpenRooms && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = detailsGame.id;
                      setDetailsGame(null);
                      onOpenRooms(id);
                    }}
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-amber-500/40 text-amber-300 font-black text-xs shrink-0"
                  >
                    غرف الأونلاين
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
