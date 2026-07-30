import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, MessageSquare, Github, ExternalLink, Send, CornerDownRight, Code, Share2, Star, GitFork, AlertCircle, ImageIcon, Video } from 'lucide-react';
import { Idea, Comment, User as UserType } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { sounds } from '../utils/audio';

interface IdeaDetailModalProps {
  idea: Idea | null;
  currentUser: UserType | null;
  onClose: () => void;
  onVote: (ideaId: string, voteType: 'will_use' | 'will_not_use') => void;
  onRequireAuth: () => void;
  onUpdateIdea: (updatedIdea: Idea) => void;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  idea,
  currentUser,
  onClose,
  onVote,
  onRequireAuth,
  onUpdateIdea,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!idea) return;
    
    // Increment view count
    FirestoreService.incrementViews(idea.id);

    // Subscribe to Firestore real-time comments for this idea
    const unsubscribe = FirestoreService.subscribeComments(idea.id, (realtimeComments) => {
      setComments(realtimeComments);
    });

    return () => unsubscribe();
  }, [idea?.id]);

  if (!idea) return null;

  const currentUserId = currentUser ? currentUser.id : null;
  const hasVotedWillUse = currentUserId ? idea.willUseVotes.includes(currentUserId) : false;
  const hasVotedWillNotUse = currentUserId ? idea.willNotUseVotes.includes(currentUserId) : false;

  const totalWillUse = idea.willUseVotes.length;
  const totalWillNotUse = idea.willNotUseVotes.length;
  const totalVotes = totalWillUse + totalWillNotUse;
  const demandPercentage = totalVotes > 0 ? Math.round((totalWillUse / totalVotes) * 100) : 0;

  const handleVote = (voteType: 'will_use' | 'will_not_use') => {
    if (!currentUser) {
      sounds.playError();
      onRequireAuth();
      return;
    }
    if (voteType === 'will_use') sounds.playVoteUp();
    else sounds.playVoteDown();

    onVote(idea.id, voteType);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      sounds.playError();
      onRequireAuth();
      return;
    }

    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      ideaId: idea.id,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      text: newCommentText.trim(),
      createdAt: Date.now(),
      parentId: replyParentId,
      upvotes: [currentUser.username],
      codeSnippet: newCodeSnippet.trim() ? newCodeSnippet.trim() : undefined,
    };

    try {
      await FirestoreService.addComment(newComment, idea.authorUsername, idea.title);
      sounds.playSuccess();

      setNewCommentText('');
      setNewCodeSnippet('');
      setShowCodeInput(false);
      setReplyParentId(null);
    } catch (err) {
      console.error('Error posting comment to Firestore:', err);
    }
  };

  const handleUpvoteComment = async (comment: Comment) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    sounds.playVoteUp();
    await FirestoreService.upvoteComment(comment, currentUser.username);
  };

  const handleCopyShare = () => {
    sounds.playClick();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a0f0c] border border-emerald-500/30 rounded-2xl my-auto p-5 sm:p-6 shadow-2xl font-sans text-slate-100 flex flex-col overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="font-bold">@{idea.authorUsername}</span>
              <span>•</span>
              <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
              {idea.language && (
                <>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">{idea.language}</span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white font-mono">
              {idea.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-1.5 rounded-lg bg-[#0d1410] border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 text-xs flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="space-y-5 pt-4">
          
          {/* Tagline & Tags */}
          <div className="space-y-2">
            <p className="text-sm text-emerald-200/90 font-mono italic bg-[#0d1410] p-3 rounded-xl border border-emerald-500/20">
              "{idea.tagline}"
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {idea.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* REAL GITHUB REPO METADATA BANNER */}
          {(idea.starsCount !== undefined || idea.githubUrl) && (
            <div className="flex flex-wrap items-center gap-4 p-3 bg-[#0d1410] border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-300">
              {idea.starsCount !== undefined && (
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-4 h-4 fill-amber-300" />
                  <span>{idea.starsCount.toLocaleString()} Stars</span>
                </div>
              )}
              {idea.forksCount !== undefined && (
                <div className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  <span>{idea.forksCount.toLocaleString()} Forks</span>
                </div>
              )}
              {idea.openIssuesCount !== undefined && (
                <div className="flex items-center gap-1 text-emerald-400/80">
                  <AlertCircle className="w-4 h-4" />
                  <span>{idea.openIssuesCount} Open Issues</span>
                </div>
              )}
            </div>
          )}

          {/* VOTE MATRIX & DEMAND SCORE BAR */}
          <div className="p-4 bg-[#0d1410] border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold font-mono">
                  INTENT POLL:
                </span>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">
                  Would you use this developer tool or app idea?
                </p>
              </div>

              {/* Dual Vote Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('will_use')}
                  className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                    hasVotedWillUse
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasVotedWillUse ? 'fill-black' : ''}`} />
                  WILL USE ({totalWillUse})
                </button>

                <button
                  onClick={() => handleVote('will_not_use')}
                  className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                    hasVotedWillNotUse
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-red-950/30 text-red-400 border border-red-500/40 hover:bg-red-900/40'
                  }`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${hasVotedWillNotUse ? 'fill-white' : ''}`} />
                  WON'T USE ({totalWillNotUse})
                </button>
              </div>
            </div>

            {/* Demand gauge bar */}
            <div className="space-y-1 pt-2 border-t border-emerald-500/15 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400/80">Market Demand Index:</span>
                <span className="text-emerald-300 font-bold">{demandPercentage}% Positive Votes ({totalWillUse}/{totalVotes})</span>
              </div>
              <div className="w-full bg-[#080d0a] h-2 rounded-full overflow-hidden border border-emerald-500/30">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${demandPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Full Description / Pitch */}
          <div className="space-y-2 font-mono">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              DESCRIPTION & SPECIFICATION:
            </h3>
            <div className="p-4 bg-[#0d1410] border border-emerald-500/20 rounded-xl text-xs sm:text-sm text-emerald-100 whitespace-pre-wrap leading-relaxed">
              {idea.description}
            </div>
          </div>

          {/* Media Screenshot / Video Preview */}
          {(idea.screenshotUrl || idea.videoUrl) && (
            <div className="space-y-2 font-mono">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> MEDIA PREVIEW:
              </h3>
              
              {idea.screenshotUrl && (
                <div className="rounded-xl border border-emerald-500/20 overflow-hidden bg-black max-h-80">
                  <img
                    src={idea.screenshotUrl}
                    alt={idea.title}
                    className="w-full object-contain max-h-80"
                  />
                </div>
              )}

              {idea.videoUrl && (
                <div className="p-3 bg-[#0d1410] border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-400" /> Video Demo: {idea.videoUrl}
                  </span>
                  <a
                    href={idea.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                  >
                    WATCH DEMO
                  </a>
                </div>
              )}
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
            {idea.githubUrl && (
              <a
                href={idea.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#0d1410] border border-emerald-500/30 hover:border-emerald-500 text-emerald-200 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <Github className="w-4 h-4 text-white" /> View Real GitHub Repository
              </a>
            )}

            {idea.liveUrl && (
              <a
                href={idea.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#0d1410] border border-emerald-500/30 hover:border-emerald-500 text-emerald-200 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" /> Live Prototype
              </a>
            )}
          </div>

          {/* REALTIME COMMENTS SECTION */}
          <div className="pt-5 border-t border-emerald-500/20 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Real-time Discussion ({comments.length})
              </h3>
            </div>

            {/* Comment Post Box */}
            <form onSubmit={handlePostComment} className="p-3 bg-[#0d1410] border border-emerald-500/30 rounded-xl space-y-3">
              {replyParentId && (
                <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" /> Replying to thread...
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyParentId(null)}
                    className="text-emerald-400 hover:text-white text-xs"
                  >
                    Cancel Reply
                  </button>
                </div>
              )}

              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={currentUser ? "Share feedback, suggestions, or critique..." : "Log in to post real-time comments..."}
                disabled={!currentUser}
                className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg p-2.5 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
              />

              {showCodeInput && (
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-400 font-mono">ATTACH CODE SNIPPET / ALIAS:</label>
                  <textarea
                    rows={2}
                    value={newCodeSnippet}
                    onChange={(e) => setNewCodeSnippet(e.target.value)}
                    placeholder="e.g. uv pip install fastapi"
                    className="w-full bg-black border border-emerald-500/40 rounded p-2 text-xs font-mono text-emerald-300"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCodeInput(prev => !prev)}
                  className="text-xs text-emerald-400 hover:text-emerald-200 flex items-center gap-1"
                >
                  <Code className="w-3.5 h-3.5" /> {showCodeInput ? 'Remove Code Snippet' : '+ Add Code Snippet'}
                </button>

                <button
                  type="submit"
                  disabled={!currentUser || !newCommentText.trim()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    currentUser && newCommentText.trim()
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-emerald-950/40 border border-emerald-900 text-emerald-700 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Post Comment
                </button>
              </div>
            </form>

            {/* Comments List Thread */}
            <div className="space-y-3 pt-1">
              {rootComments.length === 0 ? (
                <p className="text-xs text-emerald-600/80 text-center py-4 font-mono">
                  No comments yet. Be the first coder to share feedback!
                </p>
              ) : (
                rootComments.map((comment) => {
                  const replies = getReplies(comment.id);
                  const isOP = comment.authorUsername === idea.authorUsername;

                  return (
                    <div key={comment.id} className="p-3 bg-[#0d1410] border border-emerald-500/20 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorUsername}
                            className="w-5 h-5 rounded-full border border-emerald-500/30 object-cover"
                          />
                          <span className="text-emerald-300 font-bold">@{comment.authorUsername}</span>
                          {isOP && (
                            <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] rounded font-semibold">
                              OP
                            </span>
                          )}
                          <span className="text-emerald-700">•</span>
                          <span className="text-emerald-500/70 text-[11px]">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Comment Upvote */}
                        <button
                          onClick={() => handleUpvoteComment(comment)}
                          className="px-2 py-0.5 rounded-md bg-[#080d0a] border border-emerald-500/30 text-emerald-300 hover:text-white text-[11px] flex items-center gap-1"
                        >
                          <ThumbsUp className="w-3 h-3 text-emerald-400" /> {comment.upvotes.length}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-emerald-100">{comment.text}</p>

                      {/* Code Snippet Box */}
                      {comment.codeSnippet && (
                        <div className="p-2 bg-black border border-emerald-500/30 rounded text-xs font-mono text-emerald-300 overflow-x-auto">
                          <code>{comment.codeSnippet}</code>
                        </div>
                      )}

                      <div className="pt-0.5">
                        <button
                          onClick={() => {
                            sounds.playClick();
                            setReplyParentId(comment.id);
                          }}
                          className="text-[11px] text-emerald-500 hover:text-emerald-300 flex items-center gap-1 font-mono"
                        >
                          <CornerDownRight className="w-3 h-3" /> Reply
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {replies.length > 0 && (
                        <div className="ml-3 pl-3 border-l-2 border-emerald-500/20 space-y-2 pt-2">
                          {replies.map(rep => (
                            <div key={rep.id} className="p-2 bg-[#080d0a] border border-emerald-500/15 rounded-lg text-xs space-y-1">
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-emerald-300 font-bold">@{rep.authorUsername}</span>
                                {rep.authorUsername === idea.authorUsername && (
                                  <span className="px-1 py-0.1 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-bold">OP</span>
                                )}
                              </div>
                              <p className="text-emerald-200">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
