import React, { useState } from 'react';
import { X, Terminal, Upload, Image as ImageIcon, Video, Github, ExternalLink, Sparkles, Search, Loader2, Check } from 'lucide-react';
import { Idea, User as UserType } from '../types';
import { fetchGitHubRepoDetails, parseGitHubPath, searchGitHubRepos, GitHubRepoMeta } from '../services/github';
import { FirestoreService } from '../services/firestoreService';
import { sounds } from '../utils/audio';

interface NewIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onIdeaCreated: (newIdea: Idea) => void;
}

export const NewIdeaModal: React.FC<NewIdeaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onIdeaCreated,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['CLI', 'DevTool']);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [starsCount, setStarsCount] = useState<number | undefined>(undefined);
  const [forksCount, setForksCount] = useState<number | undefined>(undefined);
  const [openIssuesCount, setOpenIssuesCount] = useState<number | undefined>(undefined);

  // GitHub search / import state
  const [githubInput, setGithubInput] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubSearchQuery, setGithubSearchQuery] = useState('');
  const [githubSearchResults, setGithubSearchResults] = useState<GitHubRepoMeta[]>([]);
  const [isSearchingGithub, setIsSearchingGithub] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const AVAILABLE_TAGS = ['CLI', 'DevTool', 'VSCode', 'AI', 'Docker', 'OpenSource', 'Rust', 'SaaS', 'Python', 'Go', 'React'];

  const toggleTag = (tag: string) => {
    sounds.playClick();
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
      }
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const applyGitHubRepo = (repo: GitHubRepoMeta) => {
    sounds.playSuccess();
    setTitle(`${repo.name} - ${repo.description ? repo.description.slice(0, 60) : 'Open Source Tool'}`);
    setTagline(repo.description || 'Open source tool on GitHub');
    setDescription(`**${repo.fullName}**\n\n${repo.description}\n\nPrimary Language: ${repo.language || 'Code'}\nGitHub Stars: ${repo.stars.toLocaleString()} | Forks: ${repo.forks.toLocaleString()} | Open Issues: ${repo.openIssues}`);
    setGithubUrl(repo.githubUrl);
    setScreenshotUrl(repo.openGraphImage);
    setLanguage(repo.language);
    setStarsCount(repo.stars);
    setForksCount(repo.forks);
    setOpenIssuesCount(repo.openIssues);

    if (repo.language && !selectedTags.includes(repo.language)) {
      setSelectedTags(prev => [...prev.slice(0, 3), repo.language]);
    }
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 3000);
  };

  const handleFetchGithubByUrl = async () => {
    if (!githubInput.trim()) return;
    setIsFetchingGithub(true);
    setErrorMsg(null);

    const parsed = parseGitHubPath(githubInput);
    if (!parsed) {
      setErrorMsg('Invalid GitHub URL or format. Try "owner/repo" or "https://github.com/owner/repo".');
      setIsFetchingGithub(false);
      sounds.playError();
      return;
    }

    const details = await fetchGitHubRepoDetails(parsed.owner, parsed.repo);
    setIsFetchingGithub(false);

    if (!details) {
      setErrorMsg(`Could not fetch repository "${parsed.owner}/${parsed.repo}" from GitHub. Make sure it is public.`);
      sounds.playError();
      return;
    }

    applyGitHubRepo(details);
  };

  const handleSearchGithub = async (query: string) => {
    setGithubSearchQuery(query);
    if (!query.trim()) {
      setGithubSearchResults([]);
      return;
    }
    setIsSearchingGithub(true);
    const results = await searchGitHubRepos(query);
    setGithubSearchResults(results);
    setIsSearchingGithub(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        sounds.playSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('You must be logged in to submit an idea.');
      sounds.playError();
      return;
    }

    if (!title.trim() || !tagline.trim() || !description.trim()) {
      setErrorMsg('Please fill out all required fields (Title, Tagline, Description).');
      sounds.playError();
      return;
    }

    const newIdea: Idea = {
      id: `idea_${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      tags: selectedTags,
      createdAt: Date.now(),
      willUseVotes: [currentUser.id],
      willNotUseVotes: [],
      commentCount: 0,
      views: 1,
      status: 'active',
    };

    if (screenshotUrl.trim()) newIdea.screenshotUrl = screenshotUrl.trim();
    if (videoUrl.trim()) newIdea.videoUrl = videoUrl.trim();
    if (githubUrl.trim()) newIdea.githubUrl = githubUrl.trim();
    if (liveUrl.trim()) newIdea.liveUrl = liveUrl.trim();
    if (language) newIdea.language = language;
    if (typeof starsCount === 'number') newIdea.starsCount = starsCount;
    if (typeof forksCount === 'number') newIdea.forksCount = forksCount;
    if (typeof openIssuesCount === 'number') newIdea.openIssuesCount = openIssuesCount;

    try {
      await FirestoreService.createIdea(newIdea);
      sounds.playSuccess();
      onIdeaCreated(newIdea);
      onClose();

      // Reset form
      setTitle('');
      setTagline('');
      setDescription('');
      setScreenshotUrl('');
      setVideoUrl('');
      setGithubUrl('');
      setLiveUrl('');
      setGithubInput('');
    } catch (err) {
      console.error('Error saving idea to Firestore:', err);
      setErrorMsg('Failed to post idea to real-time database. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0f0c] border border-emerald-500/30 rounded-2xl my-auto p-5 sm:p-6 shadow-2xl font-sans text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 border-b border-emerald-500/20 pb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">
              Submit Programmer Idea or Repo
            </h2>
            <p className="text-xs text-emerald-400/80">
              Gather real-time "Will Use / Won't Use" validation from developers.
            </p>
          </div>
        </div>

        {/* REAL GITHUB IMPORT BOX */}
        <div className="mb-5 p-3.5 bg-[#0e1611] border border-emerald-500/25 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
              <Github className="w-4 h-4 text-white" />
              ⚡ AUTO-IMPORT REAL REPOSITORY FROM GITHUB
            </label>
            {importSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Repository Auto-Filled!
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={githubInput}
              onChange={(e) => {
                setGithubInput(e.target.value);
                handleSearchGithub(e.target.value);
              }}
              placeholder="e.g. astral-sh/uv or https://github.com/ollama/ollama"
              className="flex-1 bg-[#080d0a] border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleFetchGithubByUrl}
              disabled={isFetchingGithub || !githubInput.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
            >
              {isFetchingGithub ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                </>
              ) : (
                'Import Repo'
              )}
            </button>
          </div>

          {/* Real-time GitHub search suggestions */}
          {githubSearchResults.length > 0 && (
            <div className="pt-2 border-t border-emerald-500/15 space-y-1.5">
              <span className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-mono">
                Matching GitHub Open-Source Projects:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {githubSearchResults.map(repo => (
                  <button
                    key={repo.fullName}
                    type="button"
                    onClick={() => {
                      applyGitHubRepo(repo);
                      setGithubSearchResults([]);
                    }}
                    className="p-2 bg-[#080d0a] hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate font-mono">{repo.fullName}</div>
                      <div className="text-[10px] text-emerald-400/80 truncate">{repo.description}</div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 shrink-0 ml-2">
                      ★ {repo.stars.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400/90 mb-1 font-mono">
              PROJECT TITLE *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GitCanvas - Visual Branch Time Machine"
              className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg p-2.5 text-xs font-mono text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400/90 mb-1 font-mono">
              TAGLINE / ELEVATOR PITCH *
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Visualizes complex git rebase conflicts into interactive nodes inside VSCode."
              className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg p-2.5 text-xs font-mono text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tags selector */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400/90 mb-1.5 font-mono">
              TAGS (SELECT UP TO 5):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                        : 'bg-[#080d0a] border-emerald-500/20 text-emerald-400/70 hover:border-emerald-500/40'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400/90 mb-1 font-mono">
              DETAILED DESCRIPTION & SPECIFICATION *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem your tool solves, architecture, CLI syntax, or target workflow..."
              className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg p-2.5 text-xs font-mono text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Media Attachments: Screenshot & Video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0e1611] border border-emerald-500/20 rounded-xl">
            
            {/* Screenshot Upload or URL */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1 font-mono">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> SCREENSHOT (FILE OR URL):
              </label>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://... image url"
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded p-1.5 text-xs font-mono text-emerald-100"
                />

                <label className="flex items-center justify-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 text-xs font-mono rounded cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1 font-mono">
                <Video className="w-3.5 h-3.5 text-emerald-400" /> DEMO VIDEO URL:
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube / Loom / MP4 link..."
                className="w-full bg-[#080d0a] border border-emerald-500/20 rounded p-1.5 text-xs font-mono text-emerald-100"
              />
            </div>

          </div>

          {/* Repository & Live Demo URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1 font-mono">
                <Github className="w-3.5 h-3.5" /> GITHUB REPO URL:
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[#080d0a] border border-emerald-500/20 rounded p-2 text-xs font-mono text-emerald-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1 font-mono">
                <ExternalLink className="w-3.5 h-3.5" /> LIVE PROTOTYPE URL:
              </label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://mytool.dev"
                className="w-full bg-[#080d0a] border border-emerald-500/20 rounded p-2 text-xs font-mono text-emerald-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2 font-mono"
          >
            <Sparkles className="w-4 h-4" /> PUBLISH TO REALTIME COMMUNITY
          </button>

        </form>

      </div>
    </div>
  );
};
