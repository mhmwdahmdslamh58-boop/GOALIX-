export interface FootballClub {
  id: string;
  name: string;
  nameAr: string;
  league: string;
  country: string;
  primaryColor: string;
}

export const CLUBS_DATABASE: FootballClub[] = [
  { id: 'real_madrid', name: 'Real Madrid', nameAr: 'ريال مدريد', league: 'La Liga', country: 'Spain', primaryColor: '#f7f7f7' },
  { id: 'barcelona', name: 'FC Barcelona', nameAr: 'برشلونة', league: 'La Liga', country: 'Spain', primaryColor: '#a50044' },
  { id: 'man_city', name: 'Manchester City', nameAr: 'مانشستر سيتي', league: 'Premier League', country: 'England', primaryColor: '#6cabdd' },
  { id: 'arsenal', name: 'Arsenal', nameAr: 'أرسنال', league: 'Premier League', country: 'England', primaryColor: '#ef0107' },
  { id: 'bayern', name: 'Bayern Munich', nameAr: 'بايرن ميونخ', league: 'Bundesliga', country: 'Germany', primaryColor: '#dc052d' },
  { id: 'liverpool', name: 'Liverpool', nameAr: 'ليفربول', league: 'Premier League', country: 'England', primaryColor: '#c8102e' },
  { id: 'inter', name: 'Inter Milan', nameAr: 'إنتر ميلان', league: 'Serie A', country: 'Italy', primaryColor: '#001489' },
  { id: 'juventus', name: 'Juventus', nameAr: 'يوفنتوس', league: 'Serie A', country: 'Italy', primaryColor: '#000000' },
  { id: 'milan', name: 'AC Milan', nameAr: 'إيه سي ميلان', league: 'Serie A', country: 'Italy', primaryColor: '#fb090b' },
  { id: 'napoli', name: 'SSC Napoli', nameAr: 'نابولي', league: 'Serie A', country: 'Italy', primaryColor: '#12a0d7' },
  { id: 'santos', name: 'Santos FC', nameAr: 'سانتوس', league: 'Icon Club', country: 'Brazil', primaryColor: '#ffffff' }
];

export function getRandomClubsForRound(count: number = 4): FootballClub[] {
  const shuffled = [...CLUBS_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
