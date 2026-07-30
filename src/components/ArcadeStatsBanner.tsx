import React from 'react';
import { Flame, Award, MessageSquare, Clock, Cpu, Sparkles, UserCheck } from 'lucide-react';
import { SortMode } from '../types';
import { sounds } from '../utils/audio';

interface ArcadeStatsBannerProps {
  totalIdeas: number;
  avgDemandScore: number;
  totalVotesCount: number;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  myIdeasCount?: number;
  isLoggedIn?: boolean;
}

export const ArcadeStatsBanner: React.FC<ArcadeStatsBannerProps> = ({
  totalIdeas,
  avgDemandScore,
  totalVotesCount,
  sortMode,
  setSortMode,
  myIdeasCount = 0,
  isLoggedIn = false,
}) => {
  return (
    <div className="space-y-4 mb-6">
      
      {/* CLEAN HEADER BANNER */}
      <div className="relative overflow-hidden bg-[#0d1410] border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-sm grid-bg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-emerald-400 font-mono">
              <Cpu className="w-4 h-4" />
              <span>REALTIME DEVELOPER HUB</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
              Programmer Ideas & GitHub Validation
            </h1>
            <p className="text-xs text-emerald-300/80 max-w-xl font-sans">
              Discover real GitHub open-source repositories and pitch developer tools. Cast real-time <span className="text-emerald-400 font-semibold font-mono">"Will Use"</span> vs <span className="text-red-400 font-semibold font-mono">"Won't Use"</span> community votes.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto shrink-0 font-mono">
            <div className="bg-[#080d0a] border border-emerald-500/20 rounded-xl p-3 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-500 uppercase block font-semibold">IDEAS</span>
              <span className="text-lg font-bold text-white">{totalIdeas}</span>
            </div>

            <div className="bg-[#080d0a] border border-emerald-500/20 rounded-xl p-3 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-500 uppercase block font-semibold">AVG DEMAND</span>
              <span className="text-lg font-bold text-emerald-400">{avgDemandScore}%</span>
            </div>

            <div className="bg-[#080d0a] border border-emerald-500/20 rounded-xl p-3 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-500 uppercase block font-semibold font-mono">VOTES</span>
              <span className="text-lg font-bold text-white">{totalVotesCount}</span>
            </div>
          </div>

        </div>
      </div>

      {/* SORTING TABS BAR */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
        <div className="flex items-center gap-1 p-1 bg-[#0d1410] border border-emerald-500/20 rounded-xl">
          
          <button
            onClick={() => {
              sounds.playClick();
              setSortMode('hot');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              sortMode === 'hot'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> HOT
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSortMode('top_demand');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              sortMode === 'top_demand'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> TOP DEMAND %
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSortMode('most_discussed');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              sortMode === 'most_discussed'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> MOST DISCUSSED
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSortMode('newest');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              sortMode === 'newest'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> NEWEST
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSortMode('my_ideas');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 border ${
              sortMode === 'my_ideas'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> MY IDEAS
            {isLoggedIn && myIdeasCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                sortMode === 'my_ideas' ? 'bg-black text-emerald-400' : 'bg-emerald-500 text-black'
              }`}>
                {myIdeasCount}
              </span>
            )}
          </button>

        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400/80 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Real-time Firestore Sync
        </div>
      </div>

    </div>
  );
};
