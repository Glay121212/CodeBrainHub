import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { IdeaCard } from './components/IdeaCard';
import { IdeaDetailModal } from './components/IdeaDetailModal';
import { NewIdeaModal } from './components/NewIdeaModal';
import { ArcadeStatsBanner } from './components/ArcadeStatsBanner';
import { LeaderboardWidget } from './components/LeaderboardWidget';
import { SearchEngineModal } from './components/SearchEngineModal';
import { ProfileModal } from './components/ProfileModal';
import { FirestoreService } from './services/firestoreService';
import { StorageService } from './services/storage';
import { User, Idea, SortMode, AppNotification } from './types';
import { Terminal, Plus, UserCheck } from 'lucide-react';
import { sounds } from './utils/audio';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('hot');
  
  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [isSearchEngineOpen, setIsSearchEngineOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedIdeaDetail, setSelectedIdeaDetail] = useState<Idea | null>(null);
  
  // UI Customizations (flat & clean by default)
  const [crtMode, setCrtMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Load local storage user
    setCurrentUser(StorageService.getCurrentUser());

    // Subscribe to Firestore Real-Time Ideas Collection
    const unsubscribeIdeas = FirestoreService.subscribeIdeas((realtimeIdeas) => {
      setIdeas(realtimeIdeas);

      // Keep selected detail modal updated in real-time if open
      setSelectedIdeaDetail((prevSelected) => {
        if (!prevSelected) return null;
        const matched = realtimeIdeas.find(i => i.id === prevSelected.id);
        return matched || prevSelected;
      });
    });

    // Subscribe to Real Registered Firestore Users
    const unsubscribeUsers = FirestoreService.subscribeUsers((realtimeUsers) => {
      setRegisteredUsers(realtimeUsers);
    });

    return () => {
      unsubscribeIdeas();
      unsubscribeUsers();
    };
  }, []);

  // Subscribe to notifications when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const unsubscribeNotifs = FirestoreService.subscribeNotifications(
      currentUser.username,
      (realtimeNotifs) => {
        setNotifications(realtimeNotifs);
      }
    );
    return () => {
      unsubscribeNotifs();
    };
  }, [currentUser]);

  const handleVote = async (ideaId: string, voteType: 'will_use' | 'will_not_use') => {
    if (!currentUser) return;
    const targetIdea = ideas.find(i => i.id === ideaId);
    if (!targetIdea) return;

    try {
      await FirestoreService.voteIdea(ideaId, currentUser.id, voteType, targetIdea, currentUser);
    } catch (err) {
      console.error('Error recording vote in Firestore:', err);
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    sounds.playClick();
  };

  const handleIdeaCreated = (newIdea: Idea) => {
    // Real-time Firestore subscription will automatically update ideas
  };

  const handleImportGithubRepo = async (repo: {
    title: string;
    tagline: string;
    description: string;
    githubUrl: string;
    language: string;
    starsCount: number;
    forksCount: number;
    openIssuesCount: number;
    tags: string[];
    screenshotUrl: string;
  }) => {
    const authorName = currentUser ? currentUser.username : 'github_explorer';
    const authorAvatar = currentUser ? currentUser.avatar : 'https://avatars.githubusercontent.com/u/9919?v=4';

    const newIdea: Idea = {
      id: `idea_gh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: repo.title,
      tagline: repo.tagline,
      description: repo.description,
      authorUsername: authorName,
      authorAvatar: authorAvatar,
      tags: repo.tags,
      screenshotUrl: repo.screenshotUrl,
      githubUrl: repo.githubUrl,
      language: repo.language,
      starsCount: repo.starsCount,
      forksCount: repo.forksCount,
      openIssuesCount: repo.openIssuesCount,
      createdAt: Date.now(),
      willUseVotes: currentUser ? [currentUser.id] : ['demo_1'],
      willNotUseVotes: [],
      commentCount: 0,
      views: 1,
      status: 'active',
    };

    try {
      await FirestoreService.createIdea(newIdea);
      sounds.playSuccess();
    } catch (err) {
      console.error('Error importing repo into Firestore:', err);
    }
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    setSelectedIdeaDetail(updatedIdea);
  };

  // Calculate Metrics
  const totalIdeasCount = ideas.length;
  let totalWillUseVotesAll = 0;
  let totalVotesAll = 0;

  ideas.forEach(i => {
    totalWillUseVotesAll += i.willUseVotes.length;
    totalVotesAll += (i.willUseVotes.length + i.willNotUseVotes.length);
  });

  const avgDemandScore = totalVotesAll > 0 ? Math.round((totalWillUseVotesAll / totalVotesAll) * 100) : 100;
  const myIdeasCount = currentUser ? ideas.filter(i => i.authorUsername.toLowerCase() === currentUser.username.toLowerCase()).length : 0;

  // Filter & Sort Ideas
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      idea.authorUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.language && idea.language.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      activeCategory === 'ALL' || 
      idea.tags.map(t => t.toLowerCase()).includes(activeCategory.toLowerCase()) ||
      (idea.language && idea.language.toLowerCase() === activeCategory.toLowerCase());

    const matchesMyIdeas = sortMode !== 'my_ideas' || (
      currentUser && idea.authorUsername.toLowerCase() === currentUser.username.toLowerCase()
    );

    return matchesSearch && matchesCategory && matchesMyIdeas;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortMode === 'newest' || sortMode === 'my_ideas') {
      return b.createdAt - a.createdAt;
    }
    if (sortMode === 'most_discussed') {
      return b.commentCount - a.commentCount;
    }
    if (sortMode === 'top_demand') {
      const totalA = a.willUseVotes.length + a.willNotUseVotes.length;
      const pctA = totalA > 0 ? (a.willUseVotes.length / totalA) : 0;
      const totalB = b.willUseVotes.length + b.willNotUseVotes.length;
      const pctB = totalB > 0 ? (b.willUseVotes.length / totalB) : 0;
      if (pctB !== pctA) return pctB - pctA;
      return b.willUseVotes.length - a.willUseVotes.length;
    }
    // 'hot' score algorithm
    const scoreA = (a.willUseVotes.length * 3) + (a.commentCount * 2) + (a.views * 0.1) + ((a.starsCount || 0) * 0.01);
    const scoreB = (b.willUseVotes.length * 3) + (b.commentCount * 2) + (b.views * 0.1) + ((b.starsCount || 0) * 0.01);
    return scoreB - scoreA;
  });

  return (
    <div className={`min-h-screen bg-[#080d0a] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-black ${crtMode ? 'crt-scanlines' : ''}`}>
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onOpenNewIdea={() => setIsNewIdeaOpen(true)}
        onOpenSearchEngine={() => setIsSearchEngineOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMyIdeas={() => {
          if (!currentUser) {
            setAuthMode('login');
            setIsAuthOpen(true);
          } else {
            setSortMode('my_ideas');
          }
        }}
        onSelectIdeaId={(ideaId) => {
          const matched = ideas.find(i => i.id === ideaId);
          if (matched) setSelectedIdeaDetail(matched);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        crtMode={crtMode}
        setCrtMode={setCrtMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner & Ticker */}
        <ArcadeStatsBanner
          totalIdeas={totalIdeasCount}
          avgDemandScore={avgDemandScore}
          totalVotesCount={totalVotesAll}
          sortMode={sortMode}
          setSortMode={setSortMode}
          myIdeasCount={myIdeasCount}
          isLoggedIn={!!currentUser}
        />

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Ideas Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {sortedIdeas.length === 0 ? (
              <div className="p-8 text-center bg-[#0d1410] border border-dashed border-emerald-500/20 rounded-2xl space-y-3 font-mono">
                <Terminal className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                <h3 className="text-sm font-bold text-white">NO MATCHING IDEAS FOUND</h3>
                <p className="text-xs text-emerald-400/80 max-w-sm mx-auto">
                  Try clearing search filters or use our live Search Engine to import a GitHub repository!
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsSearchEngineOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors inline-flex items-center gap-2"
                  >
                    Open Search Engine
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      if (!currentUser) setIsAuthOpen(true);
                      else setIsNewIdeaOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#080d0a] border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:border-emerald-500 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Submit Idea
                  </button>
                </div>
              </div>
            ) : (
              sortedIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUser={currentUser}
                  onVote={handleVote}
                  onOpenDetail={setSelectedIdeaDetail}
                  onRequireAuth={() => {
                    setAuthMode('login');
                    setIsAuthOpen(true);
                  }}
                />
              ))
            )}

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <LeaderboardWidget
              ideas={ideas}
              registeredUsers={registeredUsers}
              onOpenDetail={setSelectedIdeaDetail}
              onOpenSearchEngine={() => setIsSearchEngineOpen(true)}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-500/10 bg-[#080d0a] py-6 font-mono text-center text-xs text-emerald-500/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">&gt;_ CODEBRAINHUB</span>
            <span>• Realtime Developer Ideas & GitHub Search Engine</span>
          </div>
          <div className="text-[11px] text-emerald-600">
            Realtime Firestore Sync • Live GitHub REST Integration
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      <NewIdeaModal
        isOpen={isNewIdeaOpen}
        onClose={() => setIsNewIdeaOpen(false)}
        currentUser={currentUser}
        onIdeaCreated={handleIdeaCreated}
      />

      <SearchEngineModal
        isOpen={isSearchEngineOpen}
        onClose={() => setIsSearchEngineOpen(false)}
        localIdeas={ideas}
        onOpenIdeaDetail={setSelectedIdeaDetail}
        onImportGithubRepo={handleImportGithubRepo}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      <IdeaDetailModal
        idea={selectedIdeaDetail}
        currentUser={currentUser}
        onClose={() => setSelectedIdeaDetail(null)}
        onVote={handleVote}
        onRequireAuth={() => {
          setSelectedIdeaDetail(null);
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        onUpdateIdea={handleUpdateIdea}
      />

    </div>
  );
}
