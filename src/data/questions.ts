import { StatQuestion, PositionType } from '../types/game';

export const STAT_QUESTIONS: StatQuestion[] = [
  // ================= GK QUESTIONS =================
  {
    id: 'q_buffon_cleansheets_seriea',
    position: 'GK',
    player: 'Gianluigi Buffon',
    playerId: 'icon_buffon',
    season: 'All-Time',
    category: 'Clean sheets',
    statisticType: 'مباريات بشباك نظيفة في الدوري الإيطالي',
    difficulty: 'Elite',
    question: 'كم عدد المباريات بشباك نظيفة (Clean Sheets) التي حققها جانلويجي بوفون في الدوري الإيطالي (سيريا آ) طوال مسيرته القياسية؟',
    correctAnswer: 299,
    source: 'Lega Serie A Official Records',
    playerImage: '/players/icon_buffon.jpg',
    hint: 'يقترب من الرقم القياسي التاريخي لـ 300 مباراة بشباك نظيفة'
  },
  {
    id: 'q_casillas_ucl_cleansheets',
    position: 'GK',
    player: 'Iker Casillas',
    playerId: 'icon_casillas',
    season: 'All-Time UCL',
    category: 'Champions League',
    statisticType: 'مباريات بشباك نظيفة في دوري أبطال أوروبا',
    difficulty: 'Pro',
    question: 'كم مباراة بشباك نظيفة حافظ عليها إيكر كاسياس في تاريخ بطولة دوري أبطال أوروبا؟',
    correctAnswer: 57,
    source: 'UEFA Official Records',
    playerImage: '/players/icon_casillas.jpg',
    hint: 'بين 50 و 65 مباراة'
  },
  {
    id: 'q_neuer_wc2014_saves',
    position: 'GK',
    player: 'Manuel Neuer',
    playerId: 'wk_neuer',
    season: 'World Cup 2014',
    category: 'World Cup',
    statisticType: 'تصديات في كأس العالم 2014',
    difficulty: 'Legend',
    question: 'كم عدد التصديات الناجحة التي قام بها مانويل نوير خلال مشوار تتويج ألمانيا بكأس العالم 2014؟',
    correctAnswer: 25,
    source: 'FIFA World Cup 2014 Technical Report',
    playerImage: '/players/wk_neuer.jpg',
    hint: 'فاز بالقفاز الذهبي في هذه البطولة'
  },
  {
    id: 'q_courtois_ucl_final_2022',
    position: 'GK',
    player: 'Thibaut Courtois',
    playerId: 'elite_courtois',
    season: '2021/22',
    category: 'Champions League',
    statisticType: 'تصديات في نهائي دوري أبطال أوروبا',
    difficulty: 'Pro',
    question: 'كم عدد التصديات التاريخية التي قام بها تيبو كورتوا في نهائي دوري أبطال أوروبا 2022 ضد ليفربول؟',
    correctAnswer: 9,
    source: 'UEFA Champions League Match Report',
    playerImage: '/players/elite_courtois.jpg',
    hint: 'رقم قياسي في نهائي دوري الأبطال'
  },
  {
    id: 'q_alisson_epl_cleansheets_2022',
    position: 'GK',
    player: 'Alisson Becker',
    playerId: 'elite_alisson',
    season: '2021/22',
    category: 'League statistics',
    statisticType: 'شباك نظيفة في موسم البريميرليج',
    difficulty: 'Elite',
    question: 'كم مباراة بشباك نظيفة خرج بها أليسون بيكر ليتوج بالقفاز الذهبي في الدوري الإنجليزي لموسم 2021/2022؟',
    correctAnswer: 20,
    source: 'Premier League Official',
    playerImage: '/players/elite_alisson.jpg'
  },

  // ================= DEF QUESTIONS =================
  {
    id: 'q_maldini_ucl_finals',
    position: 'DEF',
    player: 'Paolo Maldini',
    playerId: 'icon_maldini',
    season: 'Career',
    category: 'Champions League',
    statisticType: 'مشاركات في نهائيات دوري أبطال أوروبا',
    difficulty: 'Pro',
    question: 'كم عدد نهائيات دوري أبطال أوروبا التي خاضها الأسطورة باولو مالديني مع ميلان طوال مسيرته؟',
    correctAnswer: 8,
    source: 'UEFA Official Records',
    playerImage: '/players/icon_maldini.jpg',
    hint: 'توج باللقب 5 مرات ووصيف 3 مرات'
  },
  {
    id: 'q_beckenbauer_caps',
    position: 'DEF',
    player: 'Franz Beckenbauer',
    playerId: 'icon_beckenbauer',
    season: 'International',
    category: 'National team statistics',
    statisticType: 'مباريات دولية مع منتخب ألمانيا الغربية',
    difficulty: 'Elite',
    question: 'كم عدد المباريات الدولية التي شارك فيها القيصر فرانتس بكنباور مع منتخب ألمانيا الغربية؟',
    correctAnswer: 103,
    source: 'DFB German Football Association',
    playerImage: '/players/icon_beckenbauer.jpg',
    hint: 'أكثر بقليل من 100 مباراة'
  },
  {
    id: 'q_vandijk_unbeaten_home',
    position: 'DEF',
    player: 'Virgil van Dijk',
    playerId: 'elite_vandijk',
    season: '2018-2022',
    category: 'Records',
    statisticType: 'مباريات متتالية في آنفيلد بالدوري دون هزيمة',
    difficulty: 'Legend',
    question: 'كم مباراة متتالية خاضها فيرجيل فان دايك في ملعب آنفيلد في الدوري الإنجليزي دون أن يتلقى أي هزيمة؟',
    correctAnswer: 70,
    source: 'Premier League Opta Stats',
    playerImage: '/players/elite_vandijk.jpg',
    hint: 'سلسلة تاريخية امتدت لـ 70 مباراة'
  },
  {
    id: 'q_rudiger_ucl_minutes',
    position: 'DEF',
    player: 'Antonio Rüdiger',
    playerId: 'elite_rudiger',
    season: '2023/24',
    category: 'Champions League',
    statisticType: 'مباريات في دوري الأبطال خلال موسم التتويج',
    difficulty: 'Pro',
    question: 'كم مباراة شارك فيها أنطونيو روديغر مع ريال مدريد في دوري أبطال أوروبا خلال موسم التتويج 2023/24؟',
    correctAnswer: 12,
    source: 'UEFA Official',
    playerImage: '/players/elite_rudiger.jpg'
  },
  {
    id: 'q_saliba_starts_epl_2024',
    position: 'DEF',
    player: 'William Saliba',
    playerId: 'wk_saliba',
    season: '2023/24',
    category: 'League statistics',
    statisticType: 'مشاركات كاملة في الدوري الإنجليزي 2023/24',
    difficulty: 'Rookie',
    question: 'لعب ويليام ساليبا كل دقيقة مع أرسنال في الدوري الإنجليزي 2023/24، فكم عدد المباريات التي خاضها؟',
    correctAnswer: 38,
    source: 'Premier League Official',
    playerImage: '/players/wk_saliba.jpg',
    hint: 'خاض كل جولات الموسم دون غياب'
  },

  // ================= MID QUESTIONS =================
  {
    id: 'q_zidane_wc1998_goals',
    position: 'MID',
    player: 'Zinedine Zidane',
    playerId: 'icon_zidane',
    season: 'World Cup 1998',
    category: 'World Cup',
    statisticType: 'أهداف في نهائي كأس العالم 1998',
    difficulty: 'Rookie',
    question: 'كم هدفاً برأسه سجله زين الدين زيدان في شباك البرازيل في نهائي كأس العالم 1998؟',
    correctAnswer: 2,
    source: 'FIFA World Cup Archives',
    playerImage: '/players/icon_zidane.jpg',
    hint: 'ثنائية رأسية شهيرة في الشوط الأول'
  },
  {
    id: 'q_debruyne_epl_assists_record',
    position: 'MID',
    player: 'Kevin De Bruyne',
    playerId: 'elite_debruyne',
    season: '2019/20',
    category: 'Assists',
    statisticType: 'صناعة أهداف في موسم واحد بالبريميرليج',
    difficulty: 'Pro',
    question: 'كم تمريرة حاسمة (أسيست) صنعها كيفن دي بروين في الدوري الإنجليزي موسم 2019/20 ليعادل الرقم القياسي؟',
    correctAnswer: 20,
    source: 'Premier League Official Records',
    playerImage: '/players/elite_debruyne.jpg',
    hint: 'يعادل رقم تييري هنري'
  },
  {
    id: 'q_xavi_pass_rate_elclasico',
    position: 'MID',
    player: 'Xavi Hernández',
    playerId: 'icon_xavi',
    season: '2008/09',
    category: 'Assists',
    statisticType: 'صناعة أهداف في كلاسيكو 6-2 الشهير',
    difficulty: 'Elite',
    question: 'كم تمريرة حاسمة صنعها تشافي هيرنانديز في مباراة الكلاسيكو التاريخية التي انتهت بفوز برشلونة 6-2 على ريال مدريد؟',
    correctAnswer: 4,
    source: 'La Liga Records',
    playerImage: '/players/icon_xavi.jpg',
    hint: 'رقم قياسي تاريخي في مباريات الكلاسيكو'
  },
  {
    id: 'q_bellingham_first_season_goals',
    position: 'MID',
    player: 'Jude Bellingham',
    playerId: 'elite_bellingham',
    season: '2023/24',
    category: 'Goals',
    statisticType: 'أهداف في جميع المسابقات مع ريال مدريد بموسمه الأول',
    difficulty: 'Pro',
    question: 'كم هدفاً أحرزه جود بيلينجهام في جميع المسابقات الرسمية مع ريال مدريد في موسمه الأول 2023/24؟',
    correctAnswer: 23,
    source: 'Real Madrid CF Official',
    playerImage: '/players/elite_bellingham.jpg'
  },
  {
    id: 'q_rodri_unbeaten_games',
    position: 'MID',
    player: 'Rodri Hernández',
    playerId: 'elite_rodri',
    season: '2023-2024',
    category: 'Records',
    statisticType: 'مباريات متتالية دون هزيمة مع مانشستر سيتي وإسبانيا',
    difficulty: 'Legend',
    question: 'كم عدد المباريات المتتالية التي خاضها رودري دون أن يتلقى أي هزيمة في 90 دقيقة محققاً أطول سلسلة في تاريخ اللعبة؟',
    correctAnswer: 74,
    source: 'Opta / FIFA Official',
    playerImage: '/players/elite_rodri.jpg',
    hint: 'سلسلة امتدت لأكثر من عام كامل'
  },

  // ================= ATT QUESTIONS =================
  {
    id: 'q_messi_91_goals',
    position: 'ATT',
    player: 'Lionel Messi',
    playerId: 'elite_messi',
    season: '2012',
    category: 'Records',
    statisticType: 'أهداف في سنة ميلادية واحدة',
    difficulty: 'Pro',
    question: 'كم عدد الأهداف التاريخية التي سجلها ليونيل ميسي خلال عام 2012 الميلادي محطماً الرقم القياسي العالمي لجيرد مولر؟',
    correctAnswer: 91,
    source: 'Guinness World Records / FIFA',
    playerImage: '/players/elite_messi.jpg',
    hint: 'الرقم الأسطوري الشهير لميسي'
  },
  {
    id: 'q_cr7_ucl_season_goals',
    position: 'ATT',
    player: 'Cristiano Ronaldo',
    playerId: 'elite_ronaldo',
    season: '2013/14',
    category: 'Champions League',
    statisticType: 'أهداف في موسم واحد بدوري أبطال أوروبا',
    difficulty: 'Pro',
    question: 'كم هدفاً سجل كريستيانو رونالدو في موسم 2013/14 بدوري أبطال أوروبا، وهو الرقم القياسي التهديفي لموسم واحد؟',
    correctAnswer: 17,
    source: 'UEFA Champions League All-Time Records',
    playerImage: '/players/elite_ronaldo.jpg',
    hint: 'بين 15 و 20 هدفاً'
  },
  {
    id: 'q_haaland_epl_debut_goals',
    position: 'ATT',
    player: 'Erling Haaland',
    playerId: 'elite_haaland',
    season: '2022/23',
    category: 'League statistics',
    statisticType: 'أهداف في الدوري الإنجليزي بموسمه الأول',
    difficulty: 'Pro',
    question: 'كم هدفاً أحرز إيرلينغ هالاند في الدوري الإنجليزي الممتاز موسم 2022/23 ليحطم الرقم القياسي التاريخي للبريميرليج؟',
    correctAnswer: 36,
    source: 'Premier League Official Records',
    playerImage: '/players/elite_haaland.jpg',
    hint: 'كسر رقم شيرر وكول (34 هدفاً)'
  },
  {
    id: 'q_mbappe_wc2022_final_goals',
    position: 'ATT',
    player: 'Kylian Mbappé',
    playerId: 'elite_mbappe',
    season: 'World Cup 2022',
    category: 'World Cup',
    statisticType: 'أهداف في نهائي كأس العالم 2022',
    difficulty: 'Rookie',
    question: 'كم هدفاً سجل كيليان مبابي في نهائي كأس العالم 2022 ضد الأرجنتين محققاً هاتريك تاريخياً؟',
    correctAnswer: 3,
    source: 'FIFA World Cup Final Report',
    playerImage: '/players/elite_mbappe.jpg',
    hint: 'ثاني هاتريك في تاريخ نهائيات كأس العالم'
  },
  {
    id: 'q_pele_world_cups',
    position: 'ATT',
    player: 'Pelé',
    playerId: 'icon_pele',
    season: 'Career',
    category: 'Trophies',
    statisticType: 'ألقاب كأس العالم كلاعب',
    difficulty: 'Rookie',
    question: 'كم لقباً في كأس العالم فاز به الأسطورة البرازيلية بيليه كلاعب (اللاعب الوحيد في التاريخ الذي حقق هذا الإنجاز)؟',
    correctAnswer: 3,
    source: 'FIFA Official Trophy Records',
    playerImage: '/players/icon_pele.jpg',
    hint: 'أعوام 1958، 1962، 1970'
  },
  {
    id: 'q_salah_debut_season_goals',
    position: 'ATT',
    player: 'Mohamed Salah',
    playerId: 'elite_salah',
    season: '2017/18',
    category: 'League statistics',
    statisticType: 'أهداف في الدوري الإنجليزي بموسمه الأول مع ليفربول',
    difficulty: 'Pro',
    question: 'كم هدفاً أحرز محمد صلاح في الدوري الإنجليزي الممتاز بموسمه الأول 2017/18 ليتوج بالحذاء الذهبي؟',
    correctAnswer: 32,
    source: 'Premier League Official Records',
    playerImage: '/players/elite_salah.jpg',
    hint: 'كان رقماً قياسياً لموسم مكون من 38 جولة'
  }
];

export function getQuestionsForGame(positionOrder: PositionType[], excludeIds: string[] = []): StatQuestion[] {
  const chosen: StatQuestion[] = [];
  const used = new Set(excludeIds);

  for (const pos of positionOrder) {
    const pool = STAT_QUESTIONS.filter(q => q.position === pos && !used.has(q.id));
    if (pool.length > 0) {
      const selected = pool[Math.floor(Math.random() * pool.length)];
      chosen.push(selected);
      used.add(selected.id);
    } else {
      // fallback to any question for this position
      const fallbackPool = STAT_QUESTIONS.filter(q => q.position === pos);
      const fallback = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      chosen.push(fallback);
    }
  }

  return chosen;
}
