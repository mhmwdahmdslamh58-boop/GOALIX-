import { Player, MatchSimEvent, MatchSimStats } from '../../../types/game';

export interface TacticalSettings {
  mentality: 'attacking' | 'balanced' | 'defensive';
  tempo: 'fast' | 'normal' | 'patient';
  pressing: 'high' | 'mid' | 'low';
}

export interface TeamSimulationInput {
  name: string;
  squad: Player[];
  tactics: TacticalSettings;
  advantageGoals?: number;
}

export function calculateTeamRatings(squad: Player[]) {
  if (!squad || squad.length === 0) {
    return { attRating: 75, midRating: 75, defRating: 75, gkRating: 75, ovrAvg: 75 };
  }

  const atts = squad.filter(p => p.position === 'ATT');
  const mids = squad.filter(p => p.position === 'MID');
  const defs = squad.filter(p => p.position === 'DEF');
  const gks = squad.filter(p => p.position === 'GK');

  const avg = (arr: Player[], fallback: number) => {
    if (arr.length === 0) return fallback;
    return Math.round(arr.reduce((sum, p) => sum + p.ovr, 0) / arr.length);
  };

  const ovrAvg = Math.round(squad.reduce((sum, p) => sum + p.ovr, 0) / squad.length);
  const attRating = avg(atts, ovrAvg - 2);
  const midRating = avg(mids, ovrAvg);
  const defRating = avg(defs, ovrAvg - 1);
  const gkRating = avg(gks, ovrAvg);

  return { attRating, midRating, defRating, gkRating, ovrAvg };
}

export function generateMatchSimulation(
  team1: TeamSimulationInput,
  team2: TeamSimulationInput
): {
  events: MatchSimEvent[];
  finalScore: [number, number];
  stats: MatchSimStats;
} {
  const t1 = calculateTeamRatings(team1.squad);
  const t2 = calculateTeamRatings(team2.squad);

  // Initial score includes any challenge advantage (e.g. 1-0)
  let scoreP1 = team1.advantageGoals || 0;
  let scoreP2 = team2.advantageGoals || 0;

  const events: MatchSimEvent[] = [];
  const stats: MatchSimStats = {
    possessionP1: 50,
    possessionP2: 50,
    shotsP1: 0,
    shotsP2: 0,
    shotsOnTargetP1: 0,
    shotsOnTargetP2: 0,
    savesP1: 0,
    savesP2: 0,
    cornersP1: 0,
    cornersP2: 0,
    foulsP1: 0,
    foulsP2: 0
  };

  if (team1.advantageGoals && team1.advantageGoals > 0) {
    const leaderAtt = team1.squad.find(p => p.position === 'ATT') || team1.squad[0];
    events.push({
      minute: 0,
      type: 'goal',
      team: 'p1',
      playerName: leaderAtt?.name,
      playerImage: leaderAtt?.image,
      chainSteps: ['تحدي STAT ARENA', 'فارق توقعات إحصائية أدق', 'أفضلية انطلاق المباراة'],
      descriptionAr: `أفضلية تحدي التوقعات الإحصائية تمنح ${team1.name} التقدم بهدف نظيف (1 - 0) قبل انطلاق صافرة البداية!`
    });
  } else if (team2.advantageGoals && team2.advantageGoals > 0) {
    const leaderAtt = team2.squad.find(p => p.position === 'ATT') || team2.squad[0];
    events.push({
      minute: 0,
      type: 'goal',
      team: 'p2',
      playerName: leaderAtt?.name,
      playerImage: leaderAtt?.image,
      chainSteps: ['تحدي STAT ARENA', 'فارق توقعات إحصائية أدق', 'أفضلية انطلاق المباراة'],
      descriptionAr: `أفضلية تحدي التوقعات الإحصائية تمنح ${team2.name} التقدم بهدف نظيف (0 - 1) قبل انطلاق صافرة البداية!`
    });
  }

  // Tactical modifiers
  const t1MentalityMod = team1.tactics.mentality === 'attacking' ? 1.15 : team1.tactics.mentality === 'defensive' ? 0.85 : 1.0;
  const t2MentalityMod = team2.tactics.mentality === 'attacking' ? 1.15 : team2.tactics.mentality === 'defensive' ? 0.85 : 1.0;

  // Midfield possession share
  const midTotal = (t1.midRating * t1MentalityMod) + (t2.midRating * t2MentalityMod);
  stats.possessionP1 = Math.min(68, Math.max(32, Math.round(((t1.midRating * t1MentalityMod) / midTotal) * 100)));
  stats.possessionP2 = 100 - stats.possessionP1;

  // Simulation time steps: 10 connected key phases
  const simulationMinutes = [8, 17, 26, 35, 43, 52, 61, 71, 80, 89];

  for (const min of simulationMinutes) {
    const attackingP1 = Math.random() * 100 < stats.possessionP1;
    const attackerTeam = attackingP1 ? 'p1' : 'p2';
    const attackingName = attackingP1 ? team1.name : team2.name;
    const defendingName = attackingP1 ? team2.name : team1.name;
    const attSquad = attackingP1 ? team1.squad : team2.squad;
    const defSquad = attackingP1 ? team2.squad : team1.squad;

    const attPlayer = attSquad.find(p => p.position === 'ATT') || attSquad[0];
    const midPlayer = attSquad.find(p => p.position === 'MID') || attSquad[0];
    const defPlayer = defSquad.find(p => p.position === 'DEF') || defSquad[0];
    const gkPlayer = defSquad.find(p => p.position === 'GK') || defSquad[0];

    const attPwr = (attackingP1 ? t1.attRating : t2.attRating) * (attackingP1 ? t1MentalityMod : t2MentalityMod);
    const defPwr = attackingP1 ? t2.defRating : t1.defRating;
    const gkPwr = attackingP1 ? t2.gkRating : t1.gkRating;

    // Chain scenario picker
    const scenarioRoll = Math.random();

    if (scenarioRoll < 0.12) {
      // Scenario A: Foul -> Free Kick / Yellow Card
      if (attackingP1) stats.foulsP2++; else stats.foulsP1++;
      const isYellow = Math.random() > 0.6;
      events.push({
        minute: min,
        type: isYellow ? 'yellow_card' : 'foul',
        team: attackingP1 ? 'p2' : 'p1',
        playerName: defPlayer.name,
        playerImage: defPlayer.image,
        chainSteps: ['انطلاقة مرتدة', 'عرقلة تكتيكية من الخلف', isYellow ? 'بطاقة صفراء مستحقة' : 'خطأ وركلة حرة'],
        descriptionAr: `عرقلة تكتيكية من ${defPlayer.name} لإيقاف انطلاقة ${attPlayer.name} الخطيرة لصالح ${attackingName}. الحكم يحتسب مخالفة${isYellow ? ' ويشهر البطاقة الصفراء!' : '.'}`,
        ballCoords: { x: attackingP1 ? 65 : 35, y: 40 }
      });
      continue;
    }

    if (scenarioRoll < 0.20) {
      // Scenario B: Offside trap
      events.push({
        minute: min,
        type: 'offside',
        team: attackerTeam,
        playerName: attPlayer.name,
        playerImage: attPlayer.image,
        chainSteps: ['تمريرة بينية في العمق', 'تحرك المهاجم خلف الدفاع', 'راية التسلل من الحكم المساعد'],
        descriptionAr: `تمريرة ذكية من ${midPlayer.name} باتجاه ${attPlayer.name}، لكن مصيدة التسلل بقيادة ${defPlayer.name} تنجح في إيقاف الهجمة.`,
        ballCoords: { x: attackingP1 ? 80 : 20, y: 30 }
      });
      continue;
    }

    // Phase 1: Buildup Pass
    const passSuccess = (Math.random() * 100) < ((attackingP1 ? t1.midRating : t2.midRating) * 0.9);

    if (!passSuccess) {
      // Defensive Interception / Tackle
      events.push({
        minute: min,
        type: 'tackle',
        team: attackingP1 ? 'p2' : 'p1',
        playerName: defPlayer.name,
        playerImage: defPlayer.image,
        chainSteps: ['بناء هجمة', 'تمريرة مقطوعة في الوسط', 'استعادة السيطرة للدفاع'],
        descriptionAr: `تدخل دفاعي متقن من الصخرة ${defPlayer.name} لقطع تمريرة ${midPlayer.name} وإحباط خطورة ${attackingName}.`,
        ballCoords: { x: 50, y: 50 }
      });
      continue;
    }

    // Phase 2: Attacker penetrates defense
    if (attackingP1) stats.shotsP1++; else stats.shotsP2++;

    const beatDefender = (attPwr * (0.8 + Math.random() * 0.4)) > (defPwr * (0.8 + Math.random() * 0.4));

    if (!beatDefender) {
      // Corner or Block
      if (Math.random() > 0.4) {
        if (attackingP1) stats.cornersP1++; else stats.cornersP2++;
        events.push({
          minute: min,
          type: 'corner',
          team: attackerTeam,
          playerName: attPlayer.name,
          playerImage: attPlayer.image,
          chainSteps: ['بناء سريع', 'تسديدة قوية من المهاجم', 'اصطدام بالمدافع وركنية'],
          descriptionAr: `تسديدة قوية من ${attPlayer.name} ترتطم بجسد ${defPlayer.name} وتتحول إلى ركلة ركنية لصالح ${attackingName}.`,
          ballCoords: { x: attackingP1 ? 90 : 10, y: 15 }
        });
      } else {
        events.push({
          minute: min,
          type: 'tackle',
          team: attackingP1 ? 'p2' : 'p1',
          playerName: defPlayer.name,
          playerImage: defPlayer.image,
          chainSteps: ['مراوغة فردية', 'تغطية عكسية نموذجية', 'إبعاد الخطر'],
          descriptionAr: `استبسال دفاعي بطولي من ${defPlayer.name} يغلق به زاوية التسديد تماماً في اللحظة الأخيرة أمام ${attPlayer.name}.`,
          ballCoords: { x: attackingP1 ? 82 : 18, y: 45 }
        });
      }
      continue;
    }

    // Phase 3: Shot on Target vs Goalkeeper
    if (attackingP1) stats.shotsOnTargetP1++; else stats.shotsOnTargetP2++;

    const shotScore = attPwr * (0.85 + Math.random() * 0.4);
    const saveScore = gkPwr * (0.88 + Math.random() * 0.35);

    if (shotScore > saveScore) {
      // GOAL!
      if (attackingP1) scoreP1++; else scoreP2++;
      events.push({
        minute: min,
        type: 'goal',
        team: attackerTeam,
        playerName: attPlayer.name,
        playerImage: attPlayer.image,
        assisterName: midPlayer.name,
        chainSteps: [
          `استخلاص الكرة بواسطة ${midPlayer.name}`,
          `تمريرة حريرية نحو ${attPlayer.name}`,
          'انفراد تام بحارس المرمى',
          'تسديدة متقنة تمزق الشباك!'
        ],
        descriptionAr: `هدف رائع! ${attPlayer.name} يستلم تمريرة سحرية متقنة من ${midPlayer.name}، يروغ الدفاع ويسدد كرة صاروخية تسكن شباك ${gkPlayer.name} معلنة هدفاً لصالح ${attackingName}!`,
        ballCoords: { x: attackingP1 ? 95 : 5, y: 50 }
      });
    } else {
      // SAVE!
      if (attackingP1) stats.savesP2++; else stats.savesP1++;
      events.push({
        minute: min,
        type: 'save',
        team: attackingP1 ? 'p2' : 'p1',
        playerName: gkPlayer.name,
        playerImage: gkPlayer.image,
        chainSteps: [
          `هجمة خطيرة من ${attPlayer.name}`,
          'تسديدة مركزة في الزاوية الصعبة',
          `ردة فعل إعجازية وتصدي من ${gkPlayer.name}`
        ],
        descriptionAr: `تصدي الموسم! طار العملاق ${gkPlayer.name} ببراعة خرافية وأبعد تسديدة لا تصد أطلقها ${attPlayer.name} من قلب منطقة الجزاء.`,
        ballCoords: { x: attackingP1 ? 92 : 8, y: 50 }
      });
    }
  }

  return {
    events,
    finalScore: [scoreP1, scoreP2],
    stats
  };
}
