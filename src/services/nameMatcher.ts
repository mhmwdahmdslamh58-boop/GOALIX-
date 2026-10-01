import { Player } from '../types/game';

// Normalized string helper
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Normalize English accents / diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Normalize special Latin characters
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    // Normalize Arabic letters and diacritics
    .replace(/[\u064B-\u065F\u0670]/g, '') // Arabic tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[گچپژ]/g, m => ({ 'گ': 'ك', 'چ': 'ج', 'پ': 'ب', 'ژ': 'ز' }[m] || m))
    // Remove punctuation & symbols
    .replace(/[\.\-_'’`,\/#!$%\^&\*;:{}=\-_~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Levenshtein distance for fuzzy matching typos
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Known aliases in English and Arabic for all playable GOALIX stars
export const PLAYER_NAME_ALIASES: Record<string, string[]> = {
  icon_pele: ['pele', 'edson arantes', 'بيليه', 'بيليه البرازيلي'],
  icon_maradona: ['maradona', 'diego maradona', 'diego armando', 'مارادونا', 'دييغو مارادونا', 'دييجو مارادونا'],
  icon_zidane: ['zidane', 'zizou', 'zinedine zidane', 'زيدان', 'زيزو', 'زين الدين زيدان'],
  icon_ronaldinho: ['ronaldinho', 'gaucho', 'ronaldinho gaucho', 'رونالدينيو', 'رونالدينهو', 'رونالدينو'],
  icon_maldini: ['maldini', 'paolo maldini', 'مالديني', 'باولو مالديني'],
  icon_beckenbauer: ['beckenbauer', 'franz beckenbauer', 'kaiser', 'بيكنباور', 'فرانز بيكنباور'],
  icon_buffon: ['buffon', 'gianluigi buffon', 'gigi buffon', 'بوفون', 'جانلويجي بوفون', 'جيجي بوفون'],
  icon_casillas: ['casillas', 'iker casillas', 'san iker', 'كاسياس', 'ايكر كاسياس', 'إيكر كاسياس'],
  icon_xavi: ['xavi', 'xavi hernandez', 'تشافي', 'تشافي هيرنانديز', 'شافي'],
  icon_iniesta: ['iniesta', 'andres iniesta', 'don andres', 'انييستا', 'إنييستا', 'اندريس انييستا', 'أندريس إنييستا'],
  icon_kaka: ['kaka', 'ricardo kaka', 'كاكا', 'ريكاردو كاكا'],
  icon_delpiero: ['del piero', 'alessandro del piero', 'ديل بييرو', 'دل بييرو', 'اليساندرو ديل بييرو'],
  icon_nesta: ['nesta', 'alessandro nesta', 'نيستا', 'اليساندرو نيستا'],
  icon_chiellini: ['chiellini', 'giorgio chiellini', 'كيليني', 'كيلليني', 'جورجيو كيليني'],
  elite_messi: ['messi', 'lionel messi', 'leo messi', 'ميسي', 'ليونيل ميسي', 'ليو ميسي'],
  elite_ronaldo: ['ronaldo', 'cristiano ronaldo', 'cr7', 'cristiano', 'رونالدو', 'كريستيانو', 'كريستيانو رونالدو', 'الدون'],
  elite_mbappe: ['mbappe', 'kylian mbappe', 'k mbappe', 'مبابي', 'كيليان مبابي'],
  elite_haaland: ['haaland', 'erling haaland', 'e haaland', 'هالاند', 'ايرلينج هالاند', 'إيرلينغ هالاند'],
  elite_vinicius: ['vinicius', 'vini jr', 'vinicius jr', 'vinicius junior', 'فينيسيوس', 'فيني', 'فيني جونيور', 'فينيسيوس جونيور'],
  elite_debruyne: ['de bruyne', 'debruyne', 'kevin de bruyne', 'kdb', 'دي بروين', 'كيفين دي بروين'],
  elite_rodri: ['rodri', 'rodrigo', 'rodri hernandez', 'رودري', 'رودريغو'],
  elite_bellingham: ['bellingham', 'jude bellingham', 'بيلينجهام', 'بيلينغهام', 'جود بيلينجهام', 'جود بيلينغهام'],
  elite_modric: ['modric', 'luka modric', 'مودريتش', 'لوكا مودريتش'],
  elite_salah: ['salah', 'mohamed salah', 'mo salah', 'صلاح', 'محمد صلاح', 'ابو مكة'],
  elite_vandijk: ['van dijk', 'vandijk', 'virgil van dijk', 'فان دايك', 'فاندايك', 'فيرجيل فان دايك'],
  elite_rubendias: ['ruben dias', 'dias', 'روبن دياز', 'دياز'],
  elite_rudiger: ['rudiger', 'antonio rudiger', 'روديجير', 'روديغر', 'انطونيو روديجير'],
  elite_courtois: ['courtois', 'thibaut courtois', 'كورتوا', 'تيبو كورتوا'],
  elite_alisson: ['alisson', 'alisson becker', 'اليسون', 'أليسون', 'اليسون بيكر', 'أليسون بيكر'],
  elite_ederson: ['ederson', 'ederson moraes', 'ايدرسون', 'إيدرسون', 'ايدرسون مورايس'],
  elite_kvaratskhelia: ['kvaratskhelia', 'kvara', 'khvicha', 'كفاراتسخيليا', 'كفارا', 'كفاراتسيخيليا'],
  elite_leao: ['leao', 'rafael leao', 'لياو', 'رافائيل لياو'],
  elite_theo: ['theo', 'theo hernandez', 'ثيو', 'تيو', 'ثيو هيرنانديز', 'تيو هرنانديز'],
  wk_saka: ['saka', 'bukayo saka', 'ساكا', 'بوكايو ساكا'],
  wk_odegaard: ['odegaard', 'martin odegaard', 'اوديغارد', 'أوديغارد', 'اوديجارد', 'مارتن اوديغارد'],
  wk_saliba: ['saliba', 'william saliba', 'ساليبا', 'ويليام ساليبا'],
  wk_raya: ['raya', 'david raya', 'رايا', 'ديفيد رايا'],
  wk_pedri: ['pedri', 'pedri gonzalez', 'بيدري', 'بدري'],
  wk_gavi: ['gavi', 'pablo gavi', 'جافي', 'غافي'],
  wk_araujo: ['araujo', 'ronald araujo', 'اراوخو', 'أراوخو', 'رونالد اراوخو'],
  wk_kounde: ['kounde', 'jules kounde', 'كوندي', 'جول كوندي'],
  wk_dimarco: ['dimarco', 'federico dimarco', 'ديماركو', 'فيديريكو ديماركو'],
  wk_bastoni: ['bastoni', 'alessandro bastoni', 'باستوني', 'اليساندرو باستوني'],
  wk_barella: ['barella', 'nicolo barella', 'باريلا', 'نيكولو باريلا'],
  wk_lautaro: ['lautaro', 'lautaro martinez', 'لاوتارو', 'لاوتارو مارتينيز'],
  wk_sommer: ['sommer', 'yann sommer', 'سومر', 'يان سومر'],
  wk_kimmich: ['kimmich', 'joshua kimmich', 'كيميتش', 'كيميش', 'جوشوا كيميتش'],
  wk_musiala: ['musiala', 'jamal musiala', 'موسيالا', 'جمال موسيالا'],
  wk_davies: ['davies', 'alphonso davies', 'ديفيز', 'الفونسو ديفيز', 'ألفونسو ديفيز'],
  wk_neuer: ['neuer', 'manuel neuer', 'نوير', 'مانويل نوير'],
  wk_kane: ['kane', 'harry kane', 'كين', 'هاري كين']
};

export interface MatchResult {
  matched: boolean;
  player: Player | null;
  alreadyFound: boolean;
  statusMessage: string;
}

/**
 * Smart name matching function for Memory XI
 * Tests player input against the active 11 players in the formation.
 */
export function matchPlayerName(
  input: string, 
  lineup: Player[], 
  alreadyFoundIds: string[] = []
): MatchResult {
  const cleanInput = normalizeText(input);
  if (!cleanInput || cleanInput.length < 2) {
    return {
      matched: false,
      player: null,
      alreadyFound: false,
      statusMessage: '❌ اكتب اسماً صالحاً'
    };
  }

  for (const player of lineup) {
    const isAlreadyFound = alreadyFoundIds.includes(player.id);
    const aliases = PLAYER_NAME_ALIASES[player.id] || [];
    const normalizedPlayerName = normalizeText(player.name);
    const nameParts = normalizedPlayerName.split(' ');
    const lastName = nameParts[nameParts.length - 1];

    // 1. Direct match on full name or last name
    if (cleanInput === normalizedPlayerName || cleanInput === lastName) {
      return {
        matched: true,
        player,
        alreadyFound: isAlreadyFound,
        statusMessage: isAlreadyFound ? `⚠️ ${player.name} تم احتسابه مسبقاً!` : `✅ كان موجود: ${player.name}`
      };
    }

    // 2. Check predefined aliases
    for (const alias of aliases) {
      const normAlias = normalizeText(alias);
      if (cleanInput === normAlias) {
        return {
          matched: true,
          player,
          alreadyFound: isAlreadyFound,
          statusMessage: isAlreadyFound ? `⚠️ ${player.name} تم احتسابه مسبقاً!` : `✅ كان موجود: ${player.name}`
        };
      }
    }

    // 3. Partial substring match for distinct longer names (e.g. "bellingham", "kvaratskhelia")
    if (cleanInput.length >= 4 && (normalizedPlayerName.includes(cleanInput) || aliases.some(a => normalizeText(a).includes(cleanInput)))) {
      return {
        matched: true,
        player,
        alreadyFound: isAlreadyFound,
        statusMessage: isAlreadyFound ? `⚠️ ${player.name} تم احتسابه مسبقاً!` : `✅ كان موجود: ${player.name}`
      };
    }

    // 4. Fuzzy Levenshtein match (tolerance for 1 typo on longer words)
    if (cleanInput.length >= 5) {
      if (levenshteinDistance(cleanInput, lastName) <= 1 || levenshteinDistance(cleanInput, normalizedPlayerName) <= 1) {
        return {
          matched: true,
          player,
          alreadyFound: isAlreadyFound,
          statusMessage: isAlreadyFound ? `⚠️ ${player.name} تم احتسابه مسبقاً!` : `✅ كان موجود: ${player.name}`
        };
      }
      for (const alias of aliases) {
        const normAlias = normalizeText(alias);
        if (normAlias.length >= 5 && levenshteinDistance(cleanInput, normAlias) <= 1) {
          return {
            matched: true,
            player,
            alreadyFound: isAlreadyFound,
            statusMessage: isAlreadyFound ? `⚠️ ${player.name} تم احتسابه مسبقاً!` : `✅ كان موجود: ${player.name}`
          };
        }
      }
    }
  }

  return {
    matched: false,
    player: null,
    alreadyFound: false,
    statusMessage: '❌ مش موجود في التشكيلة'
  };
}

/**
 * Generates an authoritative 11-player formation (1 GK, 4 DEF, 3 MID, 3 ATT)
 * with no duplicate players, using real players from INITIAL_PLAYERS.
 */
export function generateMemoryLineup(allPlayers: Player[]): Player[] {
  const gks = allPlayers.filter(p => p.position === 'GK');
  const defs = allPlayers.filter(p => p.position === 'DEF');
  const mids = allPlayers.filter(p => p.position === 'MID');
  const atts = allPlayers.filter(p => p.position === 'ATT');

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => 0.5 - Math.random());

  const selectedGk = shuffle(gks)[0] || gks[0];
  const selectedDefs = shuffle(defs).slice(0, 4);
  const selectedMids = shuffle(mids).slice(0, 3);
  const selectedAtts = shuffle(atts).slice(0, 3);

  // Exact position sequence: 1 GK, 4 DEF, 3 MID, 3 ATT
  return [
    selectedGk,
    ...selectedDefs,
    ...selectedMids,
    ...selectedAtts
  ];
}
