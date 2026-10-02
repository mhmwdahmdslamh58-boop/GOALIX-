import { Player, PositionType, CardTier, PackTierId, SantraChestTier } from '../types/game';
import { validateAwardedPlayerPosition } from '../services/positions';

const CUSTOM_PLAYERS_KEY = 'goalix_custom_players_v1';

export const INITIAL_PLAYERS: Player[] = [
  // ================= ICON LEGACY (96 - 105) =================
  {
    id: 'icon_pele',
    name: 'Pelé',
    nationality: 'Brazil',
    flag: '🇧🇷',
    club: 'Santos FC',
    position: 'ATT',
    detailedPosition: 'ST',
    ovr: 102,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '1970',
    image: '/players/icon_pele.jpg',
    stats: { pac: 98, sho: 101, pas: 96, dri: 100, def: 62, phy: 88 }
  },
  {
    id: 'icon_maradona',
    name: 'Diego Maradona',
    nationality: 'Argentina',
    flag: '🇦🇷',
    club: 'SSC Napoli',
    position: 'ATT',
    detailedPosition: 'CAM',
    ovr: 101,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '1986',
    image: '/players/icon_maradona.jpg',
    stats: { pac: 95, sho: 98, pas: 100, dri: 102, def: 55, phy: 84 }
  },
  {
    id: 'icon_zidane',
    name: 'Zinedine Zidane',
    nationality: 'France',
    flag: '🇫🇷',
    club: 'Real Madrid',
    position: 'MID',
    detailedPosition: 'CAM',
    ovr: 99,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2002',
    image: '/players/icon_zidane.jpg',
    stats: { pac: 87, sho: 94, pas: 100, dri: 98, def: 75, phy: 91 }
  },
  {
    id: 'icon_ronaldinho',
    name: 'Ronaldinho',
    nationality: 'Brazil',
    flag: '🇧🇷',
    club: 'FC Barcelona',
    position: 'ATT',
    detailedPosition: 'LW',
    ovr: 98,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2005',
    image: '/players/icon_ronaldinho.jpg',
    stats: { pac: 94, sho: 95, pas: 96, dri: 101, def: 50, phy: 85 }
  },
  {
    id: 'icon_maldini',
    name: 'Paolo Maldini',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'AC Milan',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 99,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2003',
    image: '/players/icon_maldini.jpg',
    stats: { pac: 88, sho: 60, pas: 82, dri: 80, def: 102, phy: 94 }
  },
  {
    id: 'icon_beckenbauer',
    name: 'Franz Beckenbauer',
    nationality: 'Germany',
    flag: '🇩🇪',
    club: 'Bayern Munich',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 98,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '1974',
    image: '/players/icon_beckenbauer.jpg',
    stats: { pac: 86, sho: 80, pas: 93, dri: 89, def: 100, phy: 90 }
  },
  {
    id: 'icon_buffon',
    name: 'Gianluigi Buffon',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'Juventus',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 98,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2006',
    image: '/players/icon_buffon.jpg',
    stats: { pac: 70, sho: 40, pas: 75, dri: 50, def: 98, phy: 92 }
  },
  {
    id: 'icon_casillas',
    name: 'Iker Casillas',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'Real Madrid',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 97,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2010',
    image: '/players/icon_casillas.jpg',
    stats: { pac: 72, sho: 35, pas: 74, dri: 55, def: 97, phy: 88 }
  },
  {
    id: 'icon_xavi',
    name: 'Xavi Hernández',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'FC Barcelona',
    position: 'MID',
    detailedPosition: 'CM',
    ovr: 97,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2011',
    image: '/players/icon_xavi.jpg',
    stats: { pac: 80, sho: 82, pas: 102, dri: 94, def: 78, phy: 80 }
  },
  {
    id: 'icon_iniesta',
    name: 'Andrés Iniesta',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'FC Barcelona',
    position: 'MID',
    detailedPosition: 'CM',
    ovr: 97,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2010',
    image: '/players/icon_iniesta.jpg',
    stats: { pac: 83, sho: 84, pas: 100, dri: 99, def: 74, phy: 78 }
  },
  {
    id: 'icon_kaka',
    name: 'Kaká',
    nationality: 'Brazil',
    flag: '🇧🇷',
    club: 'AC Milan',
    position: 'MID',
    detailedPosition: 'CAM',
    ovr: 97,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2007',
    image: '/players/icon_kaka.jpg',
    stats: { pac: 93, sho: 91, pas: 92, dri: 96, def: 52, phy: 78 }
  },
  {
    id: 'icon_delpiero',
    name: 'Alessandro Del Piero',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'Juventus',
    position: 'ATT',
    detailedPosition: 'CF',
    ovr: 96,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '1998',
    image: '/players/icon_delpiero.jpg',
    stats: { pac: 87, sho: 96, pas: 92, dri: 95, def: 48, phy: 75 }
  },
  {
    id: 'icon_nesta',
    name: 'Alessandro Nesta',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'AC Milan',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 97,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2004',
    image: '/players/icon_nesta.jpg',
    stats: { pac: 84, sho: 40, pas: 78, dri: 72, def: 98, phy: 91 }
  },
  {
    id: 'icon_chiellini',
    name: 'Giorgio Chiellini',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'Juventus',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 96,
    cardType: 'ICON',
    league: 'Icon Legends',
    season: '2016',
    image: '/players/icon_chiellini.jpg',
    stats: { pac: 78, sho: 50, pas: 70, dri: 65, def: 97, phy: 95 }
  },

  // ================= ELITE RUSH (86 - 95) =================
  {
    id: 'elite_messi',
    name: 'Lionel Messi',
    nationality: 'Argentina',
    flag: '🇦🇷',
    club: 'FC Barcelona',
    position: 'ATT',
    detailedPosition: 'RW',
    ovr: 95,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_messi.jpg',
    stats: { pac: 86, sho: 95, pas: 96, dri: 97, def: 42, phy: 73 }
  },
  {
    id: 'elite_ronaldo',
    name: 'Cristiano Ronaldo',
    nationality: 'Portugal',
    flag: '🇵🇹',
    club: 'Real Madrid',
    position: 'ATT',
    detailedPosition: 'ST',
    ovr: 95,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_ronaldo.jpg',
    stats: { pac: 88, sho: 96, pas: 83, dri: 88, def: 45, phy: 90 }
  },
  {
    id: 'elite_mbappe',
    name: 'Kylian Mbappé',
    nationality: 'France',
    flag: '🇫🇷',
    club: 'Real Madrid',
    position: 'ATT',
    detailedPosition: 'ST',
    ovr: 95,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2024/25',
    image: '/players/elite_mbappe.jpg',
    stats: { pac: 98, sho: 93, pas: 85, dri: 94, def: 40, phy: 82 }
  },
  {
    id: 'elite_haaland',
    name: 'Erling Haaland',
    nationality: 'Norway',
    flag: '🇳🇴',
    club: 'Manchester City',
    position: 'ATT',
    detailedPosition: 'ST',
    ovr: 94,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_haaland.jpg',
    stats: { pac: 91, sho: 96, pas: 75, dri: 84, def: 50, phy: 93 }
  },
  {
    id: 'elite_vinicius',
    name: 'Vinícius Júnior',
    nationality: 'Brazil',
    flag: '🇧🇷',
    club: 'Real Madrid',
    position: 'ATT',
    detailedPosition: 'LW',
    ovr: 93,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_vinicius.jpg',
    stats: { pac: 97, sho: 89, pas: 86, dri: 95, def: 38, phy: 78 }
  },
  {
    id: 'elite_debruyne',
    name: 'Kevin De Bruyne',
    nationality: 'Belgium',
    flag: '🇧🇪',
    club: 'Manchester City',
    position: 'MID',
    detailedPosition: 'CAM',
    ovr: 93,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_debruyne.jpg',
    stats: { pac: 78, sho: 89, pas: 96, dri: 88, def: 72, phy: 80 }
  },
  {
    id: 'elite_rodri',
    name: 'Rodri Hernández',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'Manchester City',
    position: 'MID',
    detailedPosition: 'CDM',
    ovr: 94,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_rodri.jpg',
    stats: { pac: 73, sho: 84, pas: 90, dri: 85, def: 93, phy: 91 }
  },
  {
    id: 'elite_bellingham',
    name: 'Jude Bellingham',
    nationality: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Real Madrid',
    position: 'MID',
    detailedPosition: 'CAM',
    ovr: 92,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_bellingham.jpg',
    stats: { pac: 84, sho: 88, pas: 89, dri: 91, def: 83, phy: 88 }
  },
  {
    id: 'elite_modric',
    name: 'Luka Modrić',
    nationality: 'Croatia',
    flag: '🇭🇷',
    club: 'Real Madrid',
    position: 'MID',
    detailedPosition: 'CM',
    ovr: 91,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_modric.jpg',
    stats: { pac: 74, sho: 80, pas: 94, dri: 92, def: 75, phy: 73 }
  },
  {
    id: 'elite_salah',
    name: 'Mohamed Salah',
    nationality: 'Egypt',
    flag: '🇪🇬',
    club: 'Liverpool',
    position: 'ATT',
    detailedPosition: 'RW',
    ovr: 91,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_salah.jpg',
    stats: { pac: 91, sho: 90, pas: 86, dri: 90, def: 48, phy: 79 }
  },
  {
    id: 'elite_vandijk',
    name: 'Virgil van Dijk',
    nationality: 'Netherlands',
    flag: '🇳🇱',
    club: 'Liverpool',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 92,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_vandijk.jpg',
    stats: { pac: 80, sho: 60, pas: 75, dri: 73, def: 94, phy: 90 }
  },
  {
    id: 'elite_rubendias',
    name: 'Rúben Dias',
    nationality: 'Portugal',
    flag: '🇵🇹',
    club: 'Manchester City',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 89,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_rubendias.jpg',
    stats: { pac: 72, sho: 45, pas: 74, dri: 72, def: 91, phy: 89 }
  },
  {
    id: 'elite_rudiger',
    name: 'Antonio Rüdiger',
    nationality: 'Germany',
    flag: '🇩🇪',
    club: 'Real Madrid',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 88,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_rudiger.jpg',
    stats: { pac: 86, sho: 58, pas: 73, dri: 70, def: 89, phy: 91 }
  },
  {
    id: 'elite_courtois',
    name: 'Thibaut Courtois',
    nationality: 'Belgium',
    flag: '🇧🇪',
    club: 'Real Madrid',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 91,
    cardType: 'ELITE',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/elite_courtois.jpg',
    stats: { pac: 50, sho: 30, pas: 75, dri: 48, def: 92, phy: 87 }
  },
  {
    id: 'elite_alisson',
    name: 'Alisson Becker',
    nationality: 'Brazil',
    flag: '🇧🇷',
    club: 'Liverpool',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 90,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_alisson.jpg',
    stats: { pac: 52, sho: 35, pas: 85, dri: 50, def: 91, phy: 86 }
  },
  {
    id: 'elite_ederson',
    name: 'Ederson Moraes',
    nationality: 'Brazil',
    flag: '🇧🇷',
    club: 'Manchester City',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 89,
    cardType: 'ELITE',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/elite_ederson.jpg',
    stats: { pac: 64, sho: 30, pas: 93, dri: 55, def: 88, phy: 82 }
  },
  {
    id: 'elite_kvaratskhelia',
    name: 'Khvicha Kvaratskhelia',
    nationality: 'Georgia',
    flag: '🇬🇪',
    club: 'SSC Napoli',
    position: 'ATT',
    detailedPosition: 'LW',
    ovr: 88,
    cardType: 'ELITE',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/elite_kvaratskhelia.jpg',
    stats: { pac: 90, sho: 85, pas: 84, dri: 92, def: 42, phy: 76 }
  },
  {
    id: 'elite_leao',
    name: 'Rafael Leão',
    nationality: 'Portugal',
    flag: '🇵🇹',
    club: 'AC Milan',
    position: 'ATT',
    detailedPosition: 'LW',
    ovr: 88,
    cardType: 'ELITE',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/elite_leao.jpg',
    stats: { pac: 94, sho: 84, pas: 80, dri: 91, def: 35, phy: 80 }
  },
  {
    id: 'elite_theo',
    name: 'Theo Hernández',
    nationality: 'France',
    flag: '🇫🇷',
    club: 'AC Milan',
    position: 'DEF',
    detailedPosition: 'LB',
    ovr: 88,
    cardType: 'ELITE',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/elite_theo.jpg',
    stats: { pac: 95, sho: 74, pas: 82, dri: 84, def: 82, phy: 89 }
  },

  // ================= WEEKLY PACK (77 - 85) =================
  {
    id: 'wk_saka',
    name: 'Bukayo Saka',
    nationality: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Arsenal',
    position: 'ATT',
    detailedPosition: 'RW',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/wk_saka.jpg',
    stats: { pac: 87, sho: 83, pas: 84, dri: 88, def: 60, phy: 75 }
  },
  {
    id: 'wk_odegaard',
    name: 'Martin Ødegaard',
    nationality: 'Norway',
    flag: '🇳🇴',
    club: 'Arsenal',
    position: 'MID',
    detailedPosition: 'CAM',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/wk_odegaard.jpg',
    stats: { pac: 78, sho: 82, pas: 90, dri: 88, def: 64, phy: 70 }
  },
  {
    id: 'wk_saliba',
    name: 'William Saliba',
    nationality: 'France',
    flag: '🇫🇷',
    club: 'Arsenal',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/wk_saliba.jpg',
    stats: { pac: 82, sho: 40, pas: 74, dri: 72, def: 87, phy: 84 }
  },
  {
    id: 'wk_raya',
    name: 'David Raya',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'Arsenal',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 84,
    cardType: 'WEEKLY',
    league: 'Premier League',
    season: '2023/24',
    image: '/players/wk_raya.jpg',
    stats: { pac: 55, sho: 25, pas: 83, dri: 45, def: 85, phy: 80 }
  },
  {
    id: 'wk_pedri',
    name: 'Pedri',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'FC Barcelona',
    position: 'MID',
    detailedPosition: 'CM',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/wk_pedri.jpg',
    stats: { pac: 80, sho: 76, pas: 87, dri: 90, def: 70, phy: 73 }
  },
  {
    id: 'wk_gavi',
    name: 'Gavi',
    nationality: 'Spain',
    flag: '🇪🇸',
    club: 'FC Barcelona',
    position: 'MID',
    detailedPosition: 'CM',
    ovr: 83,
    cardType: 'WEEKLY',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/wk_gavi.jpg',
    stats: { pac: 79, sho: 72, pas: 82, dri: 85, def: 74, phy: 80 }
  },
  {
    id: 'wk_araujo',
    name: 'Ronald Araújo',
    nationality: 'Uruguay',
    flag: '🇺🇾',
    club: 'FC Barcelona',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 84,
    cardType: 'WEEKLY',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/wk_araujo.jpg',
    stats: { pac: 81, sho: 50, pas: 68, dri: 65, def: 86, phy: 87 }
  },
  {
    id: 'wk_kounde',
    name: 'Jules Koundé',
    nationality: 'France',
    flag: '🇫🇷',
    club: 'FC Barcelona',
    position: 'DEF',
    detailedPosition: 'RB',
    ovr: 84,
    cardType: 'WEEKLY',
    league: 'La Liga',
    season: '2023/24',
    image: '/players/wk_kounde.jpg',
    stats: { pac: 83, sho: 48, pas: 75, dri: 76, def: 85, phy: 81 }
  },
  {
    id: 'wk_dimarco',
    name: 'Federico Dimarco',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'Inter Milan',
    position: 'DEF',
    detailedPosition: 'LB',
    ovr: 84,
    cardType: 'WEEKLY',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/wk_dimarco.jpg',
    stats: { pac: 84, sho: 78, pas: 85, dri: 82, def: 78, phy: 76 }
  },
  {
    id: 'wk_bastoni',
    name: 'Alessandro Bastoni',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'Inter Milan',
    position: 'DEF',
    detailedPosition: 'CB',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/wk_bastoni.jpg',
    stats: { pac: 75, sho: 42, pas: 79, dri: 74, def: 87, phy: 84 }
  },
  {
    id: 'wk_barella',
    name: 'Nicolò Barella',
    nationality: 'Italy',
    flag: '🇮🇹',
    club: 'Inter Milan',
    position: 'MID',
    detailedPosition: 'CM',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/wk_barella.jpg',
    stats: { pac: 80, sho: 78, pas: 86, dri: 87, def: 80, phy: 82 }
  },
  {
    id: 'wk_lautaro',
    name: 'Lautaro Martínez',
    nationality: 'Argentina',
    flag: '🇦🇷',
    club: 'Inter Milan',
    position: 'ATT',
    detailedPosition: 'ST',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/wk_lautaro.jpg',
    stats: { pac: 84, sho: 87, pas: 76, dri: 85, def: 48, phy: 84 }
  },
  {
    id: 'wk_sommer',
    name: 'Yann Sommer',
    nationality: 'Switzerland',
    flag: '🇨🇭',
    club: 'Inter Milan',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 84,
    cardType: 'WEEKLY',
    league: 'Serie A',
    season: '2023/24',
    image: '/players/wk_sommer.jpg',
    stats: { pac: 50, sho: 25, pas: 79, dri: 40, def: 85, phy: 78 }
  },
  {
    id: 'wk_kimmich',
    name: 'Joshua Kimmich',
    nationality: 'Germany',
    flag: '🇩🇪',
    club: 'Bayern Munich',
    position: 'MID',
    detailedPosition: 'CDM',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Bundesliga',
    season: '2023/24',
    image: '/players/wk_kimmich.jpg',
    stats: { pac: 74, sho: 75, pas: 89, dri: 84, def: 84, phy: 80 }
  },
  {
    id: 'wk_musiala',
    name: 'Jamal Musiala',
    nationality: 'Germany',
    flag: '🇩🇪',
    club: 'Bayern Munich',
    position: 'MID',
    detailedPosition: 'CAM',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Bundesliga',
    season: '2023/24',
    image: '/players/wk_musiala.jpg',
    stats: { pac: 86, sho: 81, pas: 84, dri: 92, def: 58, phy: 68 }
  },
  {
    id: 'wk_davies',
    name: 'Alphonso Davies',
    nationality: 'Canada',
    flag: '🇨🇦',
    club: 'Bayern Munich',
    position: 'DEF',
    detailedPosition: 'LB',
    ovr: 84,
    cardType: 'WEEKLY',
    league: 'Bundesliga',
    season: '2023/24',
    image: '/players/wk_davies.jpg',
    stats: { pac: 95, sho: 68, pas: 78, dri: 86, def: 77, phy: 78 }
  },
  {
    id: 'wk_neuer',
    name: 'Manuel Neuer',
    nationality: 'Germany',
    flag: '🇩🇪',
    club: 'Bayern Munich',
    position: 'GK',
    detailedPosition: 'GK',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Bundesliga',
    season: '2023/24',
    image: '/players/wk_neuer.jpg',
    stats: { pac: 55, sho: 30, pas: 90, dri: 52, def: 86, phy: 82 }
  },
  {
    id: 'wk_kane',
    name: 'Harry Kane',
    nationality: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Bayern Munich',
    position: 'ATT',
    detailedPosition: 'ST',
    ovr: 85,
    cardType: 'WEEKLY',
    league: 'Bundesliga',
    season: '2023/24',
    image: '/players/wk_kane.jpg',
    stats: { pac: 76, sho: 92, pas: 86, dri: 83, def: 52, phy: 84 }
  }
];

export function getAllPlayers(): Player[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CUSTOM_PLAYERS_KEY) : null;
    if (raw) {
      const custom: Player[] = JSON.parse(raw);
      return [...INITIAL_PLAYERS, ...custom];
    }
  } catch {
    // Fallback
  }
  return INITIAL_PLAYERS;
}

export function addCustomPlayerToDatabase(newPlayer: Omit<Player, 'id'>): Player {
  const created: Player = {
    ...newPlayer,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  };
  try {
    const raw = localStorage.getItem(CUSTOM_PLAYERS_KEY);
    const custom: Player[] = raw ? JSON.parse(raw) : [];
    custom.unshift(created);
    localStorage.setItem(CUSTOM_PLAYERS_KEY, JSON.stringify(custom));
  } catch {
    // Ignore storage error
  }
  return created;
}

export function getPlayerById(id: string): Player | undefined {
  return getAllPlayers().find(p => p.id === id);
}

/**
 * Returns a random player strictly matching the expected position.
 */
export function getRandomPlayerByPosition(position: PositionType, excludeIds: string[] = []): Player {
  const all = getAllPlayers();
  const eligible = all.filter(p => p.position === position && !excludeIds.includes(p.id));
  if (eligible.length > 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  // fallback strictly within same position
  const fallback = all.filter(p => p.position === position);
  return fallback[Math.floor(Math.random() * fallback.length)] || all.find(p => p.position === position)!;
}

/**
 * Returns a random player from the specified club matching the CURRENT POSITION.
 * CRITICAL RULE: If the club doesn't have a player for this position,
 * it MUST fall back to a player from the CURRENT POSITION, NEVER another position!
 */
export function getRandomPlayerByClubAndPosition(club: string, position: PositionType): Player {
  const all = getAllPlayers();
  const directMatches = all.filter(
    p => p.club.toLowerCase() === club.toLowerCase() && p.position === position
  );
  if (directMatches.length > 0) {
    return directMatches[Math.floor(Math.random() * directMatches.length)];
  }
  // Fallback to random player of the EXACT SAME POSITION
  return getRandomPlayerByPosition(position);
}

export function openPackReward(tier: CardTier): Player {
  const all = getAllPlayers();
  const eligible = all.filter(p => p.cardType === tier);
  if (eligible.length === 0) return all[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function openPackRewardByTier(packTier: PackTierId): { players: Player[]; bonusCoins: number } {
  const all = getAllPlayers();
  const pickRandom = (pool: Player[], count: number): Player[] => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  switch (packTier) {
    case 'BRONZE': {
      const pool = all.filter(p => p.ovr <= 85);
      return { players: pickRandom(pool.length ? pool : all, 1), bonusCoins: 5 };
    }
    case 'WEEKLY': {
      const pool = all.filter(p => p.cardType === 'WEEKLY' || (p.ovr >= 83 && p.ovr <= 88));
      return { players: pickRandom(pool.length ? pool : all, 1), bonusCoins: 10 };
    }
    case 'GOLD': {
      const pool = all.filter(p => p.ovr >= 84 && p.ovr <= 92);
      return { players: pickRandom(pool.length >= 2 ? pool : all, 2), bonusCoins: 20 };
    }
    case 'ELITE': {
      const pool = all.filter(p => p.cardType === 'ELITE');
      return { players: pickRandom(pool.length ? pool : all, 1), bonusCoins: 35 };
    }
    case 'ICON': {
      const pool = all.filter(p => p.cardType === 'ICON');
      return { players: pickRandom(pool.length ? pool : all, 1), bonusCoins: 75 };
    }
  }
}

export interface SantraChestRewardResult {
  tier: SantraChestTier;
  coinsAwarded: number;
  playerAwarded: Player;
  descriptionAr: string;
}

export function generateSantraChestReward(tier: SantraChestTier, preferredPosition?: PositionType): SantraChestRewardResult {
  const all = getAllPlayers();
  const filterByPos = (pool: Player[]) => {
    if (!preferredPosition) return pool;
    const posMatched = pool.filter(p => p.position === preferredPosition);
    return posMatched.length > 0 ? posMatched : pool;
  };

  let pool: Player[] = [];
  let coinsAwarded = 15;
  let descriptionAr = '';

  switch (tier) {
    case 'Bronze':
      pool = filterByPos(all.filter(p => p.ovr <= 84));
      coinsAwarded = 15 + Math.floor(Math.random() * 11); // 15-25
      descriptionAr = 'مكافأة صندوق سانترا البرونزي';
      break;
    case 'Silver':
      pool = filterByPos(all.filter(p => p.ovr >= 84 && p.ovr <= 86));
      coinsAwarded = 30 + Math.floor(Math.random() * 16); // 30-45
      descriptionAr = 'مكافأة صندوق سانترا الفضي';
      break;
    case 'Gold':
      pool = filterByPos(all.filter(p => p.ovr >= 85 && p.ovr <= 90));
      coinsAwarded = 55 + Math.floor(Math.random() * 26); // 55-80
      descriptionAr = 'مكافأة صندوق سانترا الذهبي';
      break;
    case 'Elite':
      pool = filterByPos(all.filter(p => p.cardType === 'ELITE'));
      coinsAwarded = 90 + Math.floor(Math.random() * 41); // 90-130
      descriptionAr = 'مكافأة صندوق سانترا النخبة (ELITE)';
      break;
    case 'Legendary':
      pool = filterByPos(all.filter(p => p.cardType === 'ICON'));
      coinsAwarded = 160 + Math.floor(Math.random() * 61); // 160-220
      descriptionAr = 'مكافأة صندوق سانترا الأسطوري (LEGENDARY)';
      break;
  }

  if (pool.length === 0) {
    pool = preferredPosition ? all.filter(p => p.position === preferredPosition) : all;
  }
  const playerAwarded = pool[Math.floor(Math.random() * pool.length)] || all[0];

  return {
    tier,
    coinsAwarded,
    playerAwarded,
    descriptionAr
  };
}
