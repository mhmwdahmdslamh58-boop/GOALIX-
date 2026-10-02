import React, { useState, useEffect } from 'react';
import { GameId, OnlineRoomState, Player, UserProfile } from './types/game';
import {
  getOrCreateUserProfile,
  saveUserProfile,
  recordMatchOutcome,
  REWARDS_CATALOG,
  getRewardProgress,
  getUserSquad,
  getUserCollection,
  applyPendingServerGrants,
} from './services/storage';
import { syncPlayerAccountWithServer } from './services/roomApi';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { GamesHub } from './components/games/GamesHub';
import { StatArenaGame } from './components/games/stat-arena/StatArenaGame';
import { SantraGame } from './components/games/santra/SantraGame';
import { MemoryXIGame } from './components/games/memory-xi/MemoryXIGame';
import { StandaloneMatchGame } from './components/games/simulation/StandaloneMatchGame';
import { RoomsLobby } from './components/rooms/RoomsLobby';
import { OnlineMatchRoom } from './components/rooms/OnlineMatchRoom';
import { MySquadScreen } from './components/squad/MySquadScreen';
import { StoreScreen } from './components/store/StoreScreen';
import { CollectionScreen } from './components/collection/CollectionScreen';
import { RankingScreen } from './components/ranking/RankingScreen';
import { ProfileModal } from './components/profile/ProfileModal';
import { SettingsModal } from './components/settings/SettingsModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => getOrCreateUserProfile());
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [storeSection, setStoreSection] = useState<'packs' | 'chests' | 'topup' | 'owner' | 'rewards'>('packs');

  const refreshProfileFromStorage = () => {
    setProfile(getOrCreateUserProfile());
  };

  // Sync player account with backend server & pull any Owner top-up grants
  useEffect(() => {
    let active = true;

    const runSync = async () => {
      const currentProfile = getOrCreateUserProfile();
      const squad = getUserSquad().filter((p): p is Player => p !== null);
      const squadOvr =
        squad.length > 0
          ? Math.round(squad.reduce((s, p) => s + (p.ovr || 84), 0) / squad.length)
          : 84;
      const ownedCount = getUserCollection().length;

      const res = await syncPlayerAccountWithServer(currentProfile, squadOvr, ownedCount);
      if (!active || !res) return;

      if (res.pendingGrants && res.pendingGrants.length > 0) {
        const applied = applyPendingServerGrants(res.pendingGrants);
        if (applied.appliedCount > 0) {
          setProfile(applied.updatedProfile);
          await syncPlayerAccountWithServer(
            applied.updatedProfile,
            squadOvr,
            ownedCount,
            res.pendingGrants.map((g) => g.id)
          );
        }
      }
    };

    runSync();
    const timer = setInterval(runSync, 6000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handleUpdateProfile = (updated: UserProfile) => {
    saveUserProfile(updated);
    setProfile(updated);
  };

  const handleOpenStoreTab = (section: 'packs' | 'chests' | 'topup' | 'owner' | 'rewards') => {
    setStoreSection(section);
    setActiveGame(null);
    setActiveRoomCode(null);
    setActiveTab('store');
  };

  // Calculate badge count for Store & Rewards tab (unopened chests + packs + claimable rewards)
  const claimableRewards = REWARDS_CATALOG.filter((r) => {
    const p = getRewardProgress(profile, r);
    return p.unlocked && !p.claimed;
  }).length;
  const storeBadgeCount =
    (profile.santraChests?.length || 0) +
    (profile.ownedPacks?.length || 0) +
    claimableRewards;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      {/* Persistent Top Header */}
      <Header
        profile={profile}
        onNavigate={(tab) => {
          setActiveGame(null);
          setActiveRoomCode(null);
          setActiveTab(tab);
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeRoomCode ? (
          <OnlineMatchRoom
            roomCode={activeRoomCode}
            userProfile={profile}
            onLeave={() => {
              setActiveRoomCode(null);
              refreshProfileFromStorage();
            }}
            onMatchWin={(coins) => {
              const res = recordMatchOutcome({
                matchId: `online_${activeRoomCode}_${Date.now()}`,
                gameId: 'santra',
                isOnline: true,
                outcome: 'win',
                customCoinsReward: coins || 50,
                awardSantraChest: 'Gold',
              });
              setProfile(res.updatedProfile);
            }}
          />
        ) : activeGame === 'stat_arena' ? (
          <StatArenaGame
            onBack={() => {
              setActiveGame(null);
              refreshProfileFromStorage();
            }}
            onFinishSave={refreshProfileFromStorage}
          />
        ) : activeGame === 'santra' ? (
          <SantraGame
            onBack={() => {
              setActiveGame(null);
              refreshProfileFromStorage();
            }}
            onFinishSave={refreshProfileFromStorage}
          />
        ) : activeGame === 'memory_xi' ? (
          <MemoryXIGame
            player1Name={profile.username}
            onBack={() => {
              setActiveGame(null);
              refreshProfileFromStorage();
            }}
            onGameComplete={() => {
              refreshProfileFromStorage();
            }}
          />
        ) : activeGame === 'squad_match' ? (
          <StandaloneMatchGame
            profile={profile}
            onBack={() => {
              setActiveGame(null);
              refreshProfileFromStorage();
            }}
            onUpdateProfile={handleUpdateProfile}
            onOpenStore={() => handleOpenStoreTab('chests')}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                profile={profile}
                onNavigate={(tab) => setActiveTab(tab)}
                onStartGame={(gameId) => setActiveGame(gameId)}
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenSettings={() => setShowSettingsModal(true)}
                onOpenStoreTab={handleOpenStoreTab}
              />
            )}

            {activeTab === 'games' && (
              <GamesHub
                onSelectGame={(gameId) => setActiveGame(gameId)}
                onOpenRooms={() => setActiveTab('rooms')}
              />
            )}

            {activeTab === 'rooms' && (
              <RoomsLobby
                profile={profile}
                onEnterRoom={(room: OnlineRoomState) => setActiveRoomCode(room.code)}
              />
            )}

            {activeTab === 'store' && (
              <StoreScreen
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                initialSection={storeSection}
              />
            )}

            {activeTab === 'squad' && (
              <MySquadScreen
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onPlaySquadMatch={() => setActiveGame('squad_match')}
              />
            )}

            {activeTab === 'collection' && (
              <CollectionScreen
                profile={profile}
                onOpenSettingsAddPlayer={() => setShowSettingsModal(true)}
              />
            )}

            {activeTab === 'ranking' && (
              <RankingScreen
                profile={profile}
                onNavigateToRooms={() => setActiveTab('rooms')}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveGame(null);
          setActiveRoomCode(null);
          setActiveTab(tab);
        }}
        badgeCounts={{ store: storeBadgeCount }}
      />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={handleUpdateProfile}
          onOpenSettings={() => setShowSettingsModal(true)}
          onNavigate={(tab) => {
            setActiveGame(null);
            setActiveRoomCode(null);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Settings & Database Expansion Modal */}
      {showSettingsModal && (
        <SettingsModal
          profile={profile}
          onClose={() => setShowSettingsModal(false)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
}
