import React, { useState, useEffect } from 'react';
import { UserProfile, Player, GameId } from './types/game';
import { 
  getOrCreateUserProfile, 
  saveUserProfile, 
  addCoinsToUser, 
  getUserCollection, 
  getUserSquad, 
  saveUserSquad 
} from './services/storage';
import { Header } from './components/common/Header';
import { BottomNav, MainTab } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { GamesHub } from './components/games/GamesHub';
import { StatArenaGame } from './components/games/stat-arena/StatArenaGame';
import { SantraGame } from './components/games/santra/SantraGame';
import { MemoryXIGame } from './components/games/memory-xi/MemoryXIGame';
import { RoomsLobby } from './components/rooms/RoomsLobby';
import { OnlineMatchRoom } from './components/rooms/OnlineMatchRoom';
import { MySquadScreen } from './components/squad/MySquadScreen';
import { StoreScreen } from './components/store/StoreScreen';
import { RankingScreen } from './components/ranking/RankingScreen';
import { PlayerDetailModal } from './components/collection/PlayerDetailModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminControlModal } from './components/admin/AdminControlModal';
import { getStoredAuthSession, AuthUser } from './services/auth';
import { sounds } from './services/audio';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getOrCreateUserProfile());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeView, setActiveView] = useState<'main' | 'rooms_lobby'>('main');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Initialize audio and start ambient loop on first user gesture
  useEffect(() => {
    // Restore authenticated session if exists
    const session = getStoredAuthSession();
    if (session) {
      setProfile(prev => ({
        ...prev,
        id: session.id,
        username: session.username,
        avatar: session.avatar,
        coins: Math.max(prev.coins, session.coins),
        bids: Math.max(prev.bids || 0, session.bids || 0),
        matchesPlayed: Math.max(prev.matchesPlayed, session.matchesPlayed),
        matchesWon: Math.max(prev.matchesWon, session.matchesWon)
      }));
    }

    const handleFirstGesture = () => {
      sounds.initOnUserGesture();
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Manage ambient loop between menu and active matches
  useEffect(() => {
    if (activeGame !== null || activeRoomCode !== null) {
      sounds.stopAmbientLoop();
    } else {
      if (sounds.isEnabled()) {
        sounds.startAmbientLoop();
      }
    }
  }, [activeGame, activeRoomCode]);

  // Sync profile changes
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleAuthSuccess = (authUser: AuthUser) => {
    const updated: UserProfile = {
      ...profile,
      id: authUser.id,
      username: authUser.username,
      avatar: authUser.avatar,
      coins: authUser.coins,
      bids: authUser.bids || 20,
      matchesPlayed: authUser.matchesPlayed,
      matchesWon: authUser.matchesWon
    };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleCoinsUpdated = (newCoins: number) => {
    const updated = { ...profile, coins: newCoins };
    setProfile(updated);
    saveUserProfile(updated);
  };

  // Match completed handler (awards coins for victory or loss)
  const handleGameComplete = (winner: 'p1' | 'p2' | 'draw', coinsReward: number) => {
    const isP1Win = winner === 'p1';
    const updated: UserProfile = {
      ...profile,
      matchesPlayed: profile.matchesPlayed + 1,
      matchesWon: isP1Win ? profile.matchesWon + 1 : profile.matchesWon,
      statArenaWins: activeGame === 'stat_arena' && isP1Win ? profile.statArenaWins + 1 : profile.statArenaWins,
      santraWins: activeGame === 'santra' && isP1Win ? profile.santraWins + 1 : profile.santraWins,
      memoryXiWins: activeGame === 'memory_xi' && isP1Win ? (profile.memoryXiWins || 0) + 1 : profile.memoryXiWins || 0,
      coins: Math.max(0, profile.coins + coinsReward)
    };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleAddToSquad = (player: Player) => {
    const squad = getUserSquad();
    const targetIdx = squad.findIndex(p => p?.position === player.position);
    if (targetIdx !== -1) {
      squad[targetIdx] = player;
    } else {
      squad[0] = player;
    }
    saveUserSquad(squad);
  };

  // Full-screen games (STAT ARENA / SANTRA / MEMORY XI)
  if (activeGame === 'stat_arena') {
    return (
      <StatArenaGame
        player1Name={profile.username}
        onBack={() => setActiveGame(null)}
        onGameComplete={(winner, coins) => {
          handleGameComplete(winner, coins);
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'santra') {
    return (
      <SantraGame
        player1Name={profile.username}
        onBack={() => setActiveGame(null)}
        onGameComplete={(winner, coins) => {
          handleGameComplete(winner, coins);
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'memory_xi') {
    return (
      <MemoryXIGame
        player1Name={profile.username}
        onBack={() => setActiveGame(null)}
        onGameComplete={(winner, coins) => {
          handleGameComplete(winner, coins);
          setActiveGame(null);
        }}
      />
    );
  }

  // Active Online Match Room
  if (activeRoomCode) {
    return (
      <OnlineMatchRoom
        roomCode={activeRoomCode}
        userProfile={profile}
        onLeave={() => setActiveRoomCode(null)}
        onMatchWin={(coins) => {
          handleGameComplete('p1', coins);
        }}
      />
    );
  }

  // Online Rooms Lobby
  if (activeView === 'rooms_lobby') {
    return (
      <RoomsLobby
        userProfile={profile}
        onEnterRoom={(code) => {
          setActiveRoomCode(code);
          setActiveView('main');
        }}
        onBack={() => setActiveView('main')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col font-tajawal antialiased">
      {/* Top Header */}
      <Header
        userProfile={profile}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenStore={() => setCurrentTab('store')}
        onOpenRooms={() => setCurrentTab('rooms')}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <HomeScreen
            userProfile={profile}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSelectGame={(gameId) => setActiveGame(gameId)}
            onOpenOnlineRooms={() => setCurrentTab('rooms')}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
          />
        )}

        {currentTab === 'games' && (
          <GamesHub
            onSelectGame={(gameId) => setActiveGame(gameId)}
            onOpenOnlineRooms={() => setCurrentTab('rooms')}
          />
        )}

        {currentTab === 'rooms' && (
          <RoomsLobby
            userProfile={profile}
            onEnterRoom={(code) => setActiveRoomCode(code)}
            onBack={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'ranking' && (
          <RankingScreen
            userProfile={profile}
            onBack={() => setCurrentTab('home')}
            onOpenRooms={() => setCurrentTab('rooms')}
          />
        )}

        {currentTab === 'squad' && (
          <MySquadScreen
            onSelectPlayer={(p) => setSelectedPlayer(p)}
          />
        )}

        {currentTab === 'store' && (
          <StoreScreen
            userProfile={profile}
            onCoinsUpdated={handleCoinsUpdated}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
      />

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onAddToSquad={handleAddToSquad}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          userProfile={profile}
          onUpdate={handleUpdateProfile}
          onClose={() => setShowProfileModal(false)}
          onOpenAdmin={() => setShowAdminModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* In-Game Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Developer Admin & Database Room */}
      {showAdminModal && (
        <AdminControlModal
          userProfile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}
