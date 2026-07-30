import React, { useState, useEffect } from 'react';
import { X, Search, Github, Star, GitFork, AlertCircle, ExternalLink, Sparkles, Filter, Terminal, PlusCircle, Check } from 'lucide-react';
import { Idea } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { sounds } from '../utils/audio';

interface GitHubSearchResult {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  updated_at: string;
}

interface SearchEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIdeas: Idea[];
  onOpenIdeaDetail: (idea: Idea) => void;
  onImportGithubRepo: (repo: {
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
  }) => void;
}

export const SearchEngineModal: React.FC<SearchEngineModalProps> = ({
  isOpen,
  onClose,
  localIdeas,
  onOpenIdeaDetail,
  onImportGithubRepo,
}) => {
  const [query, setQuery] = useState('rust cli');
  const [activeTab, setActiveTab] = useState<'github' | 'local'>('github');
  const [language, setLanguage] = useState<string>('All');
  const [minStars, setMinStars] = useState<number>(100);
  const [sortOrder, setSortOrder] = useState<'stars' | 'forks' | 'updated'>('stars');
  
  // Results
  const [githubResults, setGithubResults] = useState<GitHubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Record<number, boolean>>({});

  // Popular search queries
  const popularQueries = [
    'rust cli', 'llm agent', 'python devtool', 'docker monitor',
    'vscode extension', 'database engine', 'react ui', 'terminal copilot'
  ];

  useEffect(() => {
    if (isOpen && query.trim()) {
      handleSearch();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    sounds.playClick();
    setLoading(true);
    setError(null);

    try {
      let qStr = query.trim();
      if (language !== 'All') {
        qStr += ` language:${language}`;
      }
      if (minStars > 0) {
        qStr += ` stars:>=${minStars}`;
      }

      const sortParam = sortOrder === 'stars' ? 'stars' : sortOrder === 'forks' ? 'forks' : 'updated';
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(qStr)}&sort=${sortParam}&order=desc&per_page=15`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please wait a moment or refine your search.');
        }
        throw new Error(`GitHub API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setGithubResults(data.items || []);
    } catch (err: any) {
      console.error('Search Engine error:', err);
      setError(err.message || 'Failed to fetch repositories from GitHub.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuery = (q: string) => {
    setQuery(q);
    setTimeout(() => {
      handleSearch();
    }, 50);
  };

  // Filter local ideas
  const filteredLocalIdeas = localIdeas.filter(idea => 
    idea.title.toLowerCase().includes(query.toLowerCase()) ||
    idea.tagline.toLowerCase().includes(query.toLowerCase()) ||
    idea.description.toLowerCase().includes(query.toLowerCase()) ||
    idea.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleImportRepo = (repo: GitHubSearchResult) => {
    sounds.playSuccess();
    setImportedIds(prev => ({ ...prev, [repo.id]: true }));

    const cleanTags = [...(repo.topics || []).slice(0, 4), repo.language || 'DevTool'].filter(Boolean);
    if (!cleanTags.includes('GitHub')) cleanTags.push('GitHub');

    onImportGithubRepo({
      title: `${repo.name} - ${repo.description ? repo.description.slice(0, 60) : 'Open Source Developer Tool'}`,
      tagline: repo.description || `Popular open-source repository by @${repo.owner.login}`,
      description: `### About ${repo.full_name}\n\n${repo.description || 'No detailed description provided.'}\n\n- **Primary Language:** ${repo.language || 'N/A'}\n- **GitHub Stars:** ⭐ ${repo.stargazers_count.toLocaleString()}\n- **Forks:** 🍴 ${repo.forks_count.toLocaleString()}\n- **Open Issues:** 🐛 ${repo.open_issues_count.toLocaleString()}\n- **GitHub Link:** [${repo.html_url}](${repo.html_url})`,
      githubUrl: repo.html_url,
      language: repo.language || 'TypeScript',
      starsCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      tags: cleanTags,
      screenshotUrl: `https://opengraph.githubassets.com/1/${repo.full_name}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0f0c] border border-emerald-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-[#0d1410] flex items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Developer Search Engine
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
                  LIVE REST API
                </span>
              </h2>
              <p className="text-[11px] text-emerald-400/70">
                Index & search 100M+ real GitHub open-source repositories and community pitches
              </p>
            </div>
          </div>

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

        {/* Search Input Bar */}
        <div className="p-4 bg-[#080d0a] border-b border-emerald-500/15 font-mono space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search GitHub repositories, CLI tools, libraries..."
                className="w-full bg-[#0d1410] border border-emerald-500/25 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-emerald-700/80 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" /> Search
                </>
              )}
            </button>
          </form>

          {/* Quick Search Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] pt-1">
            <span className="text-emerald-600 font-bold shrink-0">TRENDING:</span>
            {popularQueries.map(q => (
              <button
                key={q}
                onClick={() => handleQuickQuery(q)}
                className="px-2.5 py-1 bg-[#0d1410] border border-emerald-500/15 hover:border-emerald-500/40 text-emerald-300 rounded-md shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Filters & Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-500/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500/80 text-[11px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Language:
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0d1410] border border-emerald-500/20 text-emerald-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
              >
                {['All', 'Rust', 'Python', 'TypeScript', 'Go', 'C++', 'C', 'Java', 'Zig', 'JavaScript'].map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <span className="text-emerald-500/80 text-[11px] ml-2">Min Stars:</span>
              <select
                value={minStars}
                onChange={(e) => setMinStars(Number(e.target.value))}
                className="bg-[#0d1410] border border-emerald-500/20 text-emerald-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value={0}>Any Stars</option>
                <option value={100}>100+ Stars</option>
                <option value={1000}>1,000+ Stars</option>
                <option value={10000}>10,000+ Stars</option>
              </select>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-[#0d1410] p-1 rounded-lg border border-emerald-500/20">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('github');
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'github'
                    ? 'bg-emerald-500 text-black'
                    : 'text-emerald-400/80 hover:text-emerald-200'
                }`}
              >
                <Github className="w-3.5 h-3.5" /> GitHub Repos ({githubResults.length})
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('local');
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'local'
                    ? 'bg-emerald-500 text-black'
                    : 'text-emerald-400/80 hover:text-emerald-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Community Ideas ({filteredLocalIdeas.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* GitHub Tab Results */}
          {activeTab === 'github' && (
            <>
              {loading ? (
                <div className="py-12 text-center font-mono text-emerald-400/80 space-y-3">
                  <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Querying GitHub REST API index...</p>
                </div>
              ) : githubResults.length === 0 ? (
                <div className="py-12 text-center font-mono text-emerald-500/60 space-y-2">
                  <Github className="w-10 h-10 mx-auto text-emerald-500/40" />
                  <p className="text-xs text-white">No GitHub repositories found for "{query}".</p>
                  <p className="text-[11px]">Try adjusting filters or searching for terms like "rust cli" or "llm".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {githubResults.map((repo) => {
                    const isImported = !!importedIds[repo.id];

                    return (
                      <div
                        key={repo.id}
                        className="bg-[#0d1410] border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between transition-all group font-mono text-xs"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={repo.owner.avatar_url}
                                alt={repo.owner.login}
                                className="w-6 h-6 rounded-md border border-emerald-500/30 object-cover shrink-0"
                              />
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-white hover:text-emerald-300 transition-colors line-clamp-1 break-all"
                              >
                                {repo.full_name}
                              </a>
                            </div>
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-500 hover:text-emerald-300 p-1 shrink-0"
                              title="Open on GitHub"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-emerald-300/80 line-clamp-2 font-sans mb-3">
                            {repo.description || 'No description provided for this repository.'}
                          </p>
                        </div>

                        {/* Footer stats & import action */}
                        <div className="pt-2 border-t border-emerald-500/10 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-emerald-400/80">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-emerald-300 font-bold">
                                <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                {repo.stargazers_count.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork className="w-3 h-3" />
                                {repo.forks_count.toLocaleString()}
                              </span>
                            </div>

                            {repo.language && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                                {repo.language}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleImportRepo(repo)}
                            disabled={isImported}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isImported
                                ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 cursor-default'
                                : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-black cursor-pointer'
                            }`}
                          >
                            {isImported ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Pitched to CodeBrainHub!
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-3.5 h-3.5" /> Pitch this Repo to Hub
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Local Community Tab Results */}
          {activeTab === 'local' && (
            <div className="space-y-3 font-mono">
              {filteredLocalIdeas.length === 0 ? (
                <div className="py-12 text-center text-emerald-500/60 text-xs">
                  No community ideas matched "{query}". Switch to the GitHub tab to import it!
                </div>
              ) : (
                filteredLocalIdeas.map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      onOpenIdeaDetail(idea);
                    }}
                    className="p-3.5 bg-[#0d1410] border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {idea.title}
                      </h4>
                      <p className="text-[11px] text-emerald-300/80 font-sans line-clamp-1 mt-0.5">
                        {idea.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-500">
                        <span>@{idea.authorUsername}</span>
                        <span>•</span>
                        <span>{idea.willUseVotes.length} "Will Use" Votes</span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0 font-bold">
                      View Idea →
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#0d1410] border-t border-emerald-500/20 font-mono text-[11px] text-emerald-500/70 flex items-center justify-between">
          <span>Real-time GitHub REST V3 integration</span>
          <span className="text-emerald-400 font-semibold">100% Real Repository Data</span>
        </div>

      </div>
    </div>
  );
};
