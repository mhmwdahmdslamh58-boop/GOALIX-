import { FormationType, MatchSimEvent, MatchSimStats, Player } from '../../../types/game';

export interface TacticalSettings {
  mentality: 'defensive' | 'balanced' | 'attacking';
  tempo: 'patient' | 'normal' | 'fast';
  pressing: 'low' | 'mid' | 'high';
  formation?: FormationType;
}

export interface TeamSimulationInput {
  name: string;
  squad: Player[];
  tactics: TacticalSettings;
  advantageGoals?: number;
}

export interface MatchSimulationOutput {
  goalsP1: number;
  goalsP2: number;
  winner: 'team1' | 'team2' | 'draw';
  mvp: Player | null;
  team1Ovr: number;
  team2Ovr: number;
  team1Chemistry: number;
  team2Chemistry: number;
  events: MatchSimEvent[];
  stats: MatchSimStats;
}

function evaluateTeamStrength(input: TeamSimulationInput) {
  const valid = input.squad.filter((p): p is Player => Boolean(p));
  if (valid.length === 0) {
    return {
      ovr: 78,
      att: 78,
      mid: 78,
      def: 78,
      gk: 78,
      chemistry: 70,
      starPlayer: null as Player | null,
      allPlayers: [] as Player[],
    };
  }

  let totalOvr = 0;
  let attSum = 0;
  let attCount = 0;
  let midSum = 0;
  let midCount = 0;
  let defSum = 0;
  let defCount = 0;
  let gkOvr = 80;

  const clubs = new Map<string, number>();
  const leagues = new Map<string, number>();

  valid.forEach((p) => {
    totalOvr += p.ovr;
    clubs.set(p.club, (clubs.get(p.club) || 0) + 1);
    leagues.set(p.league, (leagues.get(p.league) || 0) + 1);

    if (p.position === 'ATT') {
      attSum += p.stats.sho * 0.45 + p.stats.pac * 0.3 + p.stats.dri * 0.25;
      attCount++;
    } else if (p.position === 'MID') {
      midSum += p.stats.pas * 0.45 + p.stats.dri * 0.35 + p.stats.phy * 0.2;
      midCount++;
    } else if (p.position === 'DEF') {
      defSum += p.stats.def * 0.55 + p.stats.phy * 0.3 + p.stats.pac * 0.15;
      defCount++;
    } else if (p.position === 'GK') {
      gkOvr = p.ovr;
    }
  });

  const ovr = Math.round(totalOvr / valid.length);
  let att = attCount > 0 ? Math.round(attSum / attCount) : ovr;
  let mid = midCount > 0 ? Math.round(midSum / midCount) : ovr;
  let def = defCount > 0 ? Math.round(defSum / defCount) : ovr;

  // Apply Tactical Mentality & Tempo Modifiers
  if (input.tactics.mentality === 'attacking') {
    att += 4;
    def -= 2;
  } else if (input.tactics.mentality === 'defensive') {
    def += 4;
    att -= 2;
  }

  if (input.tactics.tempo === 'fast') {
    att += 2;
  } else if (input.tactics.tempo === 'patient') {
    mid += 3;
  }

  if (input.tactics.pressing === 'high') {
    mid += 2;
    def += 1;
  }

  // Chemistry from shared clubs/leagues + ICON cards
  let synergyBonus = 68;
  clubs.forEach((c) => {
    if (c >= 2) synergyBonus += c * 4;
  });
  leagues.forEach((l) => {
    if (l >= 2) synergyBonus += l * 2.5;
  });
  const iconCount = valid.filter((p) => p.cardType === 'ICON').length;
  const chemistry = Math.min(100, Math.round(synergyBonus + iconCount * 4));

  const starPlayer = [...valid].sort((a, b) => b.ovr - a.ovr)[0] || null;

  return {
    ovr,
    att,
    mid,
    def,
    gk: gkOvr,
    chemistry,
    starPlayer,
    allPlayers: valid,
  };
}

function pickPlayerByRole(players: Player[], roles: string[]): Player | null {
  if (players.length === 0) return null;
  const matches = players.filter((p) => roles.includes(p.position));
  const pool = matches.length > 0 ? matches : players;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateMatchSimulation(
  t1Input: TeamSimulationInput,
  t2Input: TeamSimulationInput
): MatchSimulationOutput {
  const s1 = evaluateTeamStrength(t1Input);
  const s2 = evaluateTeamStrength(t2Input);

  const events: MatchSimEvent[] = [];
  let goalsP1 = t1Input.advantageGoals || 0;
  let goalsP2 = t2Input.advantageGoals || 0;
  let shotsP1 = 0;
  let shotsP2 = 0;
  let shotsOnTargetP1 = 0;
  let shotsOnTargetP2 = 0;
  let savesP1 = 0;
  let savesP2 = 0;
  let cornersP1 = 0;
  let cornersP2 = 0;
  let foulsP1 = 0;
  let foulsP2 = 0;
  let yellowCardsP1 = 0;
  let yellowCardsP2 = 0;
  let redCardsP1 = 0;
  let redCardsP2 = 0;
  let chancesP1 = 0;
  let chancesP2 = 0;

  const midDiff = s1.mid + s1.chemistry * 0.2 - (s2.mid + s2.chemistry * 0.2);
  const possessionP1 = Math.max(34, Math.min(66, Math.round(50 + midDiff * 0.65 + (Math.random() * 6 - 3))));
  const possessionP2 = 100 - possessionP1;

  const attacksP1 = Math.round(possessionP1 * 0.85 + s1.att * 0.22 + Math.random() * 10);
  const attacksP2 = Math.round(possessionP2 * 0.85 + s2.att * 0.22 + Math.random() * 10);

  events.push({
    minute: 1,
    type: 'pass',
    team: 'p1',
    descriptionAr: `صافرة البداية! انطلاق المواجهة بين ${t1Input.name} (${s1.ovr} OVR) و ${t2Input.name} (${s2.ovr} OVR).`,
    ballCoords: { x: 50, y: 50 },
  });

  const slices = [6, 13, 20, 27, 34, 41, 45, 52, 59, 65, 72, 78, 84, 88, 90];

  slices.forEach((minute) => {
    const p1Prob =
      (s1.ovr + s1.mid * 0.4 + s1.chemistry * 0.15 - redCardsP1 * 8) /
      (s1.ovr + s2.ovr + (s1.mid + s2.mid) * 0.4 + (s1.chemistry + s2.chemistry) * 0.15);

    const isP1Attacking = Math.random() < p1Prob;
    const attTeam: 'p1' | 'p2' = isP1Attacking ? 'p1' : 'p2';
    const defTeam: 'p1' | 'p2' = isP1Attacking ? 'p2' : 'p1';
    const attStats = isP1Attacking ? s1 : s2;
    const defStats = isP1Attacking ? s2 : s1;
    const attName = isP1Attacking ? t1Input.name : t2Input.name;
    const defName = isP1Attacking ? t2Input.name : t1Input.name;

    if (isP1Attacking) chancesP1++;
    else chancesP2++;

    const striker = pickPlayerByRole(attStats.allPlayers, ['ATT', 'MID']);
    const playmaker = pickPlayerByRole(attStats.allPlayers, ['MID', 'ATT']);
    const defender = pickPlayerByRole(defStats.allPlayers, ['DEF', 'MID']);
    const gk = pickPlayerByRole(defStats.allPlayers, ['GK']);

    const strikerName = striker?.name || 'المهاجم';
    const playmakerName = playmaker && playmaker.id !== striker?.id ? playmaker.name : 'صانع الألعاب';
    const defenderName = defender?.name || 'قلب الدفاع';
    const gkName = gk?.name || 'حارس المرمى';

    // Foul / Card check (~14% chance)
    if (Math.random() < 0.14) {
      if (defTeam === 'p1') foulsP1++;
      else foulsP2++;

      const isRed = Math.random() < 0.1 && (defTeam === 'p1' ? redCardsP1 === 0 : redCardsP2 === 0);
      if (isRed) {
        if (defTeam === 'p1') redCardsP1++;
        else redCardsP2++;
        events.push({
          minute,
          type: 'red_card',
          team: defTeam,
          playerName: defenderName,
          descriptionAr: `🟥 بطاقة حمراء مباشرة على ${defenderName} (${defName}) بعد إعاقة انفراد صريح لـ ${strikerName}!`,
          ballCoords: { x: isP1Attacking ? 78 : 22, y: 48 },
        });
      } else {
        if (defTeam === 'p1') yellowCardsP1++;
        else yellowCardsP2++;
        events.push({
          minute,
          type: 'yellow_card',
          team: defTeam,
          playerName: defenderName,
          descriptionAr: `🟨 بطاقة صفراء تكتيكية على ${defenderName} (${defName}) إثر تدخل قوي في وسط الملعب.`,
          ballCoords: { x: 50, y: 45 },
        });
      }
      return;
    }

    const attackScore =
      attStats.att * 0.55 +
      (striker?.ovr || 84) * 0.35 +
      attStats.chemistry * 0.12 +
      (Math.random() * 24 - 9);

    const defenseScore =
      defStats.def * 0.48 +
      defStats.gk * 0.38 +
      defStats.chemistry * 0.1 +
      (Math.random() * 22 - 7);

    const delta = attackScore - defenseScore;

    if (isP1Attacking) shotsP1++;
    else shotsP2++;

    if (delta > 8.8) {
      if (isP1Attacking) {
        goalsP1++;
        shotsOnTargetP1++;
      } else {
        goalsP2++;
        shotsOnTargetP2++;
      }

      events.push({
        minute,
        type: 'goal',
        team: attTeam,
        playerName: strikerName,
        playerImage: striker?.image,
        assisterName: playmakerName,
        descriptionAr: `⚽ هـــــدف رائع لـ ${attName}! تمريرة حاسمة من ${playmakerName} إلى ${strikerName} الذي يسددها بقوة في الشباك!`,
        ballCoords: { x: isP1Attacking ? 92 : 8, y: 50 },
      });
    } else if (delta > 1.5) {
      if (isP1Attacking) {
        shotsOnTargetP1++;
        savesP2++;
        cornersP1++;
      } else {
        shotsOnTargetP2++;
        savesP1++;
        cornersP2++;
      }

      events.push({
        minute,
        type: 'save',
        team: defTeam,
        playerName: gkName,
        descriptionAr: `🧤 تصدي خارق من ${gkName} (${defName}) أمام تسديدة صاروخية من ${strikerName} ويحولها لركنية!`,
        ballCoords: { x: isP1Attacking ? 86 : 14, y: 35 },
      });
    } else {
      events.push({
        minute,
        type: 'shot',
        team: attTeam,
        playerName: strikerName,
        descriptionAr: `تسديدة خطيرة من ${strikerName} (${attName}) تمر بجوار القائم وسط تغطية من ${defenderName}.`,
        ballCoords: { x: isP1Attacking ? 80 : 20, y: 55 },
      });
    }
  });

  const winner: 'team1' | 'team2' | 'draw' =
    goalsP1 > goalsP2 ? 'team1' : goalsP2 > goalsP1 ? 'team2' : 'draw';

  const mvp =
    winner === 'team2'
      ? s2.starPlayer || s1.starPlayer
      : s1.starPlayer || s2.starPlayer;

  return {
    goalsP1,
    goalsP2,
    winner,
    mvp,
    team1Ovr: s1.ovr,
    team2Ovr: s2.ovr,
    team1Chemistry: s1.chemistry,
    team2Chemistry: s2.chemistry,
    events,
    stats: {
      possessionP1,
      possessionP2,
      attacksP1,
      attacksP2,
      chancesP1,
      chancesP2,
      shotsP1,
      shotsP2,
      shotsOnTargetP1,
      shotsOnTargetP2,
      savesP1,
      savesP2,
      cornersP1,
      cornersP2,
      foulsP1,
      foulsP2,
      yellowCardsP1,
      yellowCardsP2,
      redCardsP1,
      redCardsP2,
    },
  };
}
