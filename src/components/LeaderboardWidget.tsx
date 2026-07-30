import React from 'react';
import { Trophy, Users, ArrowUpRight, ShieldCheck, Search, Sparkles, UserCheck } from 'lucide-react';
import { Idea, User as UserType } from '../types';
import { sounds } from '../utils/audio';

interface LeaderboardWidgetProps {
  ideas: Idea[];
  registeredUsers: UserType[];
  onOpenDetail: (idea: Idea) => void;
  onOpenSearchEngine: () => void;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  ideas,
  registeredUsers,
  onOpenDetail,
  onOpenSearchEngine,
}) => {
  const sortedByDemand = [...ideas].sort((a, b) => {
    const totalA = a.willUseVotes.length + a.willNotUseVotes.length;
    const pctA = totalA > 0 ? (a.willUseVotes.length / totalA) : 0;

    const totalB = b.willUseVotes.length + b.willNotUseVotes.length;
    const pctB = totalB > 0 ? (b.willUseVotes.length / totalB) : 0;

    if (pctB !== pctA) return pctB - pctA;
    return b.willUseVotes.length - a.willUseVotes.length;
  }).slice(0, 5);

  return (
    <aside className="space-y-5 font-mono">
      
      {/* Search Engine Launcher Widget */}
      <div className="bg-[#0d1410] border border-emerald-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden grid-bg">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            DEVELOPER SEARCH ENGINE
          </h3>
        </div>
        <p className="text-[11px] text-emerald-300/80 mb-3 font-sans">
          Live REST search across 100M+ real GitHub repositories and community tools.
        </p>
        <button
          onClick={() => {
            sounds.playClick();
            onOpenSearchEngine();
          }}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Search className="w-4 h-4" /> Open Search Engine
        </button>
      </div>

      {/* Top Validated Ideas Widget */}
      <div className="bg-[#0d1410] border border-emerald-500/20 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/15">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            TOP DEMAND REPOSITORIES
          </h3>
        </div>

        <div className="space-y-2">
          {sortedByDemand.map((idea, index) => {
            const total = idea.willUseVotes.length + idea.willNotUseVotes.length;
            const pct = total > 0 ? Math.round((idea.willUseVotes.length / total) * 100) : 0;

            return (
              <div
                key={idea.id}
                onClick={() => {
                  sounds.playClick();
                  onOpenDetail(idea);
                }}
                className="p-2.5 bg-[#080d0a] border border-emerald-500/15 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <h4 className="text-xs font-bold text-emerald-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {idea.title}
                    </h4>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-emerald-400/80 mt-2">
                  <span>@{idea.authorUsername}</span>
                  <span className="font-bold text-emerald-300">{pct}% DEMAND ({idea.willUseVotes.length} Votes)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Registered Users / Community Members (100% Real Registered Accounts) */}
      <div className="bg-[#0d1410] border border-emerald-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              REAL REGISTERED MEMBERS
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            {registeredUsers.length} REAL
          </span>
        </div>

        {registeredUsers.length === 0 ? (
          <div className="p-3 bg-[#080d0a] border border-emerald-500/15 rounded-xl text-center space-y-2">
            <UserCheck className="w-5 h-5 text-emerald-500/50 mx-auto" />
            <p className="text-[11px] text-emerald-400/80">No registered members yet.</p>
            <p className="text-[10px] text-emerald-600">Create an account to be the first real registered member!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {registeredUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2.5 bg-[#080d0a] border border-emerald-500/15 rounded-xl text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-6 h-6 rounded-full border border-emerald-500/30 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-emerald-300 font-bold block truncate">@{user.username}</span>
                    <span className="text-[9px] text-emerald-500/80 uppercase">
                      {user.badges && user.badges[0] ? user.badges[0] : 'VERIFIED DEVELOPER'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 shrink-0 ml-2">
                  {user.karma || 100} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Protection Notice */}
      <div className="p-3 bg-[#080d0a] border border-emerald-500/20 rounded-xl text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" /> FIRESTORE AUTH LOCKOUT
        </div>
        <p className="text-[11px] text-emerald-400/70">
          5 failed password attempts trigger a 5-minute security cooldown stored in Firestore.
        </p>
      </div>

    </aside>
  );
};
