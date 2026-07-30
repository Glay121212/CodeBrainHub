import React, { useState } from 'react';
import { Terminal, Plus, Search, Volume2, VolumeX, Tv, LogOut, Bell, User, Camera, UserCheck } from 'lucide-react';
import { User as UserType, AppNotification } from '../types';
import { NotificationPopover } from './NotificationPopover';
import { sounds } from '../utils/audio';

interface NavbarProps {
  currentUser: UserType | null;
  notifications?: AppNotification[];
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenNewIdea: () => void;
  onOpenSearchEngine: () => void;
  onOpenProfile: () => void;
  onOpenMyIdeas: () => void;
  onSelectIdeaId: (ideaId: string) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  crtMode: boolean;
  setCrtMode: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications = [],
  onOpenAuth,
  onOpenNewIdea,
  onOpenSearchEngine,
  onOpenProfile,
  onOpenMyIdeas,
  onSelectIdeaId,
  onLogout,
  searchQuery,
  setSearchQuery,
  crtMode,
  setCrtMode,
  soundEnabled,
  setSoundEnabled,
  activeCategory,
  setActiveCategory,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  const toggleCrt = () => {
    sounds.playClick();
    setCrtMode(prev => !prev);
  };

  const categories = ['ALL', 'CLI', 'DevTool', 'VSCode', 'AI', 'Rust', 'Docker', 'OpenSource'];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0f0c]/95 backdrop-blur-md border-b border-emerald-500/20 shadow-md">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div>
              <a href="#" className="flex items-center gap-1 sm:gap-1.5 text-sm sm:text-lg font-bold tracking-tight text-white font-mono">
                <span className="text-emerald-400">CODE</span>
                <span>BRAIN</span>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-sans border border-emerald-500/30">
                  REALTIME
                </span>
              </a>
              <div className="hidden sm:flex text-[10px] text-emerald-500/70 font-mono items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Ideas & GitHub Validation
              </div>
            </div>
          </div>

          {/* Search bar (Desktop/Tablet) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas, GitHub repos, tags..."
                className="w-full bg-[#0d1410] border border-emerald-500/20 rounded-lg pl-9 pr-4 py-1.5 text-xs text-emerald-100 placeholder-emerald-600/60 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500/60 hover:text-emerald-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Engine Modal Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenSearchEngine();
              }}
              title="Open GitHub Search Engine"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#0d1410] hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Search Engine</span>
            </button>

            {/* CRT Effect Toggle */}
            <button
              onClick={toggleCrt}
              title="Toggle CRT Mode"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors shrink-0 ${
                crtMode
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#0d1410] border-emerald-500/20 text-emerald-500/70 hover:border-emerald-500/40'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{crtMode ? 'CRT' : 'FLAT'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title="Toggle Sound Effects"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors shrink-0 ${
                soundEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#0d1410] border-emerald-500/20 text-emerald-500/70 hover:border-emerald-500/40'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{soundEnabled ? 'SND' : 'MUTED'}</span>
            </button>

            {/* New Idea Button */}
            <button
              onClick={() => {
                sounds.playClick();
                if (!currentUser) {
                  onOpenAuth('login');
                } else {
                  onOpenNewIdea();
                }
              }}
              className="px-2 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Submit Idea</span>
              <span className="inline sm:hidden">Idea</span>
            </button>

            {/* Auth status / Profile & Notifications */}
            {currentUser ? (
              <div className="relative flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-emerald-500/20 shrink-0">
                
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowNotifications(prev => !prev);
                    }}
                    title="Notifications"
                    className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors relative ${
                      showNotifications || unreadNotifsCount > 0
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#0d1410] border-emerald-500/20 text-emerald-500/70 hover:border-emerald-500/40'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-emerald-400 text-black font-bold text-[9px] rounded-full animate-bounce">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  <NotificationPopover
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    notifications={notifications}
                    recipientUsername={currentUser.username}
                    onSelectIdeaId={onSelectIdeaId}
                  />
                </div>

                {/* My Ideas button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenMyIdeas();
                  }}
                  title="View My Ideas"
                  className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0d1410] border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 text-xs font-mono transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>My Ideas</span>
                </button>

                {/* User Avatar / Customize Profile */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenProfile();
                  }}
                  title="Customize Profile Picture"
                  className="flex items-center gap-1.5 bg-[#0d1410] border border-emerald-500/20 hover:border-emerald-500/50 px-1.5 sm:px-2.5 py-1 rounded-lg transition-colors group cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500/40"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-emerald-300 transition-opacity">
                      <Camera className="w-3 h-3" />
                    </div>
                  </div>
                  <span className="hidden md:inline text-xs font-mono text-emerald-300 font-medium group-hover:text-emerald-200">
                    @{currentUser.username}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onLogout();
                  }}
                  title="Logout"
                  className="p-1 sm:p-1.5 rounded-lg text-emerald-500/70 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 pl-1.5 sm:pl-2 border-l border-emerald-500/20 shrink-0">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenAuth('login');
                  }}
                  className="px-2 py-1 text-xs font-mono text-emerald-300 hover:text-emerald-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenAuth('register');
                  }}
                  className="px-2 py-1 rounded-lg border border-emerald-500/40 text-xs font-mono text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Search Input for Mobile Phones (< md) */}
        <div className="block md:hidden pb-2 pt-1 border-t border-emerald-500/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas, repos, tags..."
              className="w-full bg-[#0d1410] border border-emerald-500/20 rounded-lg pl-8 pr-4 py-1.5 text-xs text-emerald-100 placeholder-emerald-600/60 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500/60 hover:text-emerald-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar border-t border-emerald-500/10 text-xs font-mono">
          <span className="text-emerald-600/70 text-[10px] tracking-wider uppercase shrink-0 font-bold mr-1">
            TAGS:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playClick();
                setActiveCategory(cat);
              }}
              className={`px-2.5 py-0.5 rounded-md border text-xs transition-colors shrink-0 ${
                activeCategory === cat
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-[#0d1410] border-emerald-500/15 text-emerald-400/70 hover:text-emerald-200 hover:border-emerald-500/30'
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
