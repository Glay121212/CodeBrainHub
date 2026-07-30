import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink, Github, Eye, Star, GitFork, AlertCircle } from 'lucide-react';
import { Idea, User as UserType } from '../types';
import { sounds } from '../utils/audio';

interface IdeaCardProps {
  idea: Idea;
  currentUser: UserType | null;
  onVote: (ideaId: string, voteType: 'will_use' | 'will_not_use') => void;
  onOpenDetail: (idea: Idea) => void;
  onRequireAuth: () => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  currentUser,
  onVote,
  onOpenDetail,
  onRequireAuth,
}) => {
  const currentUserId = currentUser ? currentUser.id : null;

  const hasVotedWillUse = currentUserId ? idea.willUseVotes.includes(currentUserId) : false;
  const hasVotedWillNotUse = currentUserId ? idea.willNotUseVotes.includes(currentUserId) : false;

  const totalWillUse = idea.willUseVotes.length;
  const totalWillNotUse = idea.willNotUseVotes.length;
  const totalVotes = totalWillUse + totalWillNotUse;

  // Demand score percentage
  const demandPercentage = totalVotes > 0 ? Math.round((totalWillUse / totalVotes) * 100) : 0;

  const handleVoteClick = (e: React.MouseEvent, voteType: 'will_use' | 'will_not_use') => {
    e.stopPropagation();
    if (!currentUser) {
      sounds.playError();
      onRequireAuth();
      return;
    }

    if (voteType === 'will_use') {
      sounds.playVoteUp();
    } else {
      sounds.playVoteDown();
    }
    onVote(idea.id, voteType);
  };

  const getTimeAgo = (timestamp: number) => {
    const diffHours = Math.floor((Date.now() - timestamp) / (1000 * 3600));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div 
      onClick={() => {
        sounds.playClick();
        onOpenDetail(idea);
      }}
      className="group relative bg-[#0d1410] border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row gap-4"
    >
      
      {/* VOTE COLUMN */}
      <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 p-3 bg-[#080d0a] border border-emerald-500/20 rounded-xl shrink-0">
        
        {/* "WILL USE IT" Button */}
        <button
          onClick={(e) => handleVoteClick(e, 'will_use')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg font-mono text-xs font-bold transition-all ${
            hasVotedWillUse
              ? 'bg-emerald-500 text-black shadow-sm'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
          title="Vote: I WILL USE IT!"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasVotedWillUse ? 'fill-black' : ''}`} />
          <span className="whitespace-nowrap">Will Use ({totalWillUse})</span>
        </button>

        {/* Demand Percentage Badge */}
        <div className="text-center px-2 py-0.5 font-mono">
          <span className={`text-xs font-bold ${
            demandPercentage >= 70 ? 'text-emerald-400' : demandPercentage >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {demandPercentage}% Demand
          </span>
        </div>

        {/* "WON'T USE" Button */}
        <button
          onClick={(e) => handleVoteClick(e, 'will_not_use')}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg font-mono text-xs font-bold transition-all ${
            hasVotedWillNotUse
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-red-950/30 text-red-400 border border-red-500/30 hover:bg-red-900/40'
          }`}
          title="Vote: I WILL NOT USE IT"
        >
          <ThumbsDown className={`w-3.5 h-3.5 ${hasVotedWillNotUse ? 'fill-white' : ''}`} />
          <span className="whitespace-nowrap">Won't Use ({totalWillNotUse})</span>
        </button>

      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 space-y-2.5">
        
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <img
              src={idea.authorAvatar}
              alt={idea.authorUsername}
              className="w-5 h-5 rounded-full border border-emerald-500/30 object-cover"
            />
            <span className="text-emerald-400 font-medium">@{idea.authorUsername}</span>
            <span className="text-emerald-700">•</span>
            <span className="text-emerald-500/70">{getTimeAgo(idea.createdAt)}</span>
          </div>

          {/* Language & Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {idea.language && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-semibold">
                {idea.language}
              </span>
            )}
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Title & Tagline */}
        <div>
          <h3 className="text-base sm:text-lg font-bold font-mono text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
            {idea.title}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 line-clamp-2">
            {idea.tagline}
          </p>
        </div>

        {/* REAL GITHUB STATS BAR (Stars, Forks, Issues) */}
        {(idea.starsCount !== undefined || idea.githubUrl) && (
          <div className="flex items-center gap-3 pt-1 text-xs font-mono text-emerald-400/80">
            {idea.starsCount !== undefined && (
              <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-300" /> {idea.starsCount.toLocaleString()} stars
              </span>
            )}
            {idea.forksCount !== undefined && (
              <span className="flex items-center gap-1 text-emerald-300">
                <GitFork className="w-3.5 h-3.5" /> {idea.forksCount.toLocaleString()}
              </span>
            )}
            {idea.openIssuesCount !== undefined && (
              <span className="flex items-center gap-1 text-emerald-400/70">
                <AlertCircle className="w-3.5 h-3.5" /> {idea.openIssuesCount} issues
              </span>
            )}
          </div>
        )}

        {/* Demand Bar Gauge */}
        <div className="space-y-1">
          <div className="w-full bg-[#080d0a] h-1.5 rounded-full overflow-hidden border border-emerald-500/20">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${demandPercentage}%` }}
            />
          </div>
        </div>

        {/* Media Preview Thumbnail */}
        {idea.screenshotUrl && (
          <div className="pt-1">
            <div className="relative overflow-hidden rounded-lg border border-emerald-500/20 max-h-32 w-full bg-black">
              <img
                src={idea.screenshotUrl}
                alt={idea.title}
                className="w-full h-28 object-cover group-hover:scale-102 transition-transform duration-300 opacity-90"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between border-t border-emerald-500/10 text-xs font-mono text-emerald-400/70 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              {idea.commentCount} Comments
            </span>

            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              {idea.views} Views
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {idea.githubUrl && (
              <a
                href={idea.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 bg-[#080d0a] border border-emerald-500/30 hover:border-emerald-500 rounded text-emerald-300 hover:text-white transition-colors flex items-center gap-1"
                title="GitHub Repo"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}

            {idea.liveUrl && (
              <a
                href={idea.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 bg-[#080d0a] border border-emerald-500/30 hover:border-emerald-500 rounded text-emerald-300 hover:text-white transition-colors flex items-center gap-1"
                title="Live Demo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Demo</span>
              </a>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
