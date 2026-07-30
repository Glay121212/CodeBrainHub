import { User, Idea, Comment, AuthLockout } from '../types';

const STORAGE_KEYS = {
  USERS: 'codebrainhub_users',
  CURRENT_USER: 'codebrainhub_current_user',
  IDEAS: 'codebrainhub_ideas',
  COMMENTS: 'codebrainhub_comments',
  LOCKOUTS: 'codebrainhub_lockouts',
  CRT_MODE: 'codebrainhub_crt_mode',
  SOUND_MODE: 'codebrainhub_sound_mode',
};

// Seed Users
const SEED_USERS: User[] = [
  {
    id: 'user_1',
    username: 'cyber_dev',
    passwordHash: 'Cyber123!',
    createdAt: Date.now() - 86400000 * 30,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    karma: 1420,
    badges: ['PROTOTYPE GOD', 'TOP VOTER'],
  },
  {
    id: 'user_2',
    username: 'pixel_coder',
    passwordHash: 'Pixel123!',
    createdAt: Date.now() - 86400000 * 20,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    karma: 980,
    badges: ['CLI ARCHITECT'],
  },
  {
    id: 'user_3',
    username: 'matrix_hacker',
    passwordHash: 'Matrix123!',
    createdAt: Date.now() - 86400000 * 15,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    karma: 650,
    badges: ['RUST FANATIC'],
  },
];

// Seed Ideas
const SEED_IDEAS: Idea[] = [
  {
    id: 'idea_1',
    title: 'GitCanvas - Interactive Visual Git Graph & Branch Time Machine',
    tagline: 'Visualizes complex git rebase & merge conflicts into drag-and-drop nodes in VSCode.',
    description: `Tired of stepping into git rebase detached head hell? GitCanvas is a lightweight VSCode extension and desktop app that parses your local git DAG in real-time. It displays a interactive canvas where you can drag commit nodes, visually preview rebase sequences before applying them, and resolve conflict diffs side-by-side with 3D timeline scrubbing.

Features:
- Instant visual DAG canvas inside VSCode or terminal.
- Dry-run rebase previewer with undo/redo node history.
- AI-assisted merge conflict resolution suggestions.
- Export branch history as interactive HTML reports.`,
    authorUsername: 'cyber_dev',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tags: ['VSCode', 'DevTool', 'Git', 'CLI'],
    screenshotUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    githubUrl: 'https://github.com/example/git-canvas',
    liveUrl: 'https://gitcanvas.dev',
    createdAt: Date.now() - 3600000 * 5,
    willUseVotes: ['user_1', 'user_2', 'user_3', 'demo_1', 'demo_2', 'demo_3', 'demo_4', 'demo_5', 'demo_6'],
    willNotUseVotes: ['demo_7'],
    commentCount: 4,
    views: 342,
    status: 'in_development',
  },
  {
    id: 'idea_2',
    title: 'TerminalAI - Zero-Latency Local LLM Command Line Copilot',
    tagline: 'An ultra-fast Rust CLI tool that translates plain English into bulletproof bash/zsh commands.',
    description: `Stop Googling "how to untar a tar.gz file" or searching StackOverflow for complex ffmpeg syntax. TerminalAI runs ultra-light local GGUF models directly in your terminal daemon.

Type \`?? convert all pngs in this folder to webp and resize to 800px\` and TerminalAI outputs the exact pipeline with line-by-line safety checks and dry-run execution mode.

Highlights:
- Pure Rust binary with 4ms cold start.
- Runs 100% offline without sending commands to remote servers.
- Syntax highlighting and interactive confirmation prompt before running rm -rf!`,
    authorUsername: 'pixel_coder',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tags: ['CLI', 'Rust', 'AI', 'OpenSource'],
    screenshotUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/example/terminal-ai',
    createdAt: Date.now() - 3600000 * 18,
    willUseVotes: ['user_1', 'user_2', 'demo_1', 'demo_2', 'demo_3', 'demo_4', 'demo_5'],
    willNotUseVotes: ['user_3', 'demo_8'],
    commentCount: 3,
    views: 219,
    status: 'active',
  },
  {
    id: 'idea_3',
    title: 'DevDock Arcade - Gamified Local Docker Container Monitor',
    tagline: 'Retro 8-bit arcade dashboard monitoring your Docker containers, logs, & RAM usage.',
    description: `Why use boring grey dashboards when your Docker containers can be 8-bit space invader ships?

DevDock Arcade maps your active containers to retro pixel art spaceships. Container CPU usage speeds up engine thrusters, error logs emit red particle lasers, and restarting a crashed container plays an arcade extra-life chime!

Includes:
- Low-overhead electron/web wrapper connecting to Docker socket.
- Real-time CPU, RAM, & network metrics in retro 16-bit arcade HUD.
- One-click container rebuild & shell access.`,
    authorUsername: 'matrix_hacker',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    tags: ['Docker', 'DevTool', 'Gamified', 'Arcade'],
    screenshotUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/example/devdock-arcade',
    liveUrl: 'https://devdock.io',
    createdAt: Date.now() - 3600000 * 42,
    willUseVotes: ['user_1', 'user_3', 'demo_1', 'demo_2', 'demo_3', 'demo_4'],
    willNotUseVotes: ['demo_9', 'demo_10'],
    commentCount: 2,
    views: 180,
    status: 'active',
  }
];

// Seed Comments
const SEED_COMMENTS: Comment[] = [
  {
    id: 'comm_1',
    ideaId: 'idea_1',
    authorUsername: 'pixel_coder',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'This looks incredible! I manage a team with 20+ feature branches and rebase conflicts happen daily. Does this support custom git aliases?',
    createdAt: Date.now() - 3600000 * 4,
    upvotes: ['user_1', 'user_3'],
    codeSnippet: 'git config --global alias.canvas "git-canvas open"',
  },
  {
    id: 'comm_2',
    ideaId: 'idea_1',
    authorUsername: 'cyber_dev',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: 'Yes! It automatically reads your ~/.gitconfig aliases and binds them directly into the visual action bar.',
    createdAt: Date.now() - 3600000 * 3,
    parentId: 'comm_1',
    upvotes: ['user_2'],
  },
  {
    id: 'comm_3',
    ideaId: 'idea_2',
    authorUsername: 'matrix_hacker',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    text: 'Would definitely use this if it has offline GGUF support! Cloud CLI assistants always feel laggy and unsafe for private repos.',
    createdAt: Date.now() - 3600000 * 12,
    upvotes: ['user_1'],
    codeSnippet: 'terminal-ai --model llama-3.2-1b-instruct.gguf --offline',
  }
];

export class StorageService {
  // Initialize initial seed data if empty
  public static init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(SEED_IDEAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(SEED_COMMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCKOUTS)) {
      localStorage.setItem(STORAGE_KEYS.LOCKOUTS, JSON.stringify([]));
    }
  }

  // Users Auth
  public static getUsers(): User[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return SEED_USERS;
    }
  }

  public static saveUser(user: User): void {
    const users = this.getUsers();
    const existingIdx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    if (existingIdx >= 0) {
      users[existingIdx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Lockout tracking for 5 failed attempts -> 5 minutes countdown
  public static getLockout(username: string): AuthLockout | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCKOUTS);
      const lockouts: AuthLockout[] = data ? JSON.parse(data) : [];
      const userLockout = lockouts.find(l => l.username.toLowerCase() === username.toLowerCase());
      if (!userLockout) return null;

      // Check if lock expired
      if (Date.now() > userLockout.lockUntil) {
        this.clearLockout(username);
        return null;
      }
      return userLockout;
    } catch {
      return null;
    }
  }

  public static recordFailedAttempt(username: string): { lockout: AuthLockout | null; remainingAttempts: number } {
    const data = localStorage.getItem(STORAGE_KEYS.LOCKOUTS);
    let lockouts: AuthLockout[] = data ? JSON.parse(data) : [];
    const idx = lockouts.findIndex(l => l.username.toLowerCase() === username.toLowerCase());

    const now = Date.now();
    let currentLockout: AuthLockout = idx >= 0 ? lockouts[idx] : {
      username,
      failedAttempts: 0,
      lockUntil: 0
    };

    // If lock was active but expired, reset failed attempts
    if (currentLockout.lockUntil > 0 && now > currentLockout.lockUntil) {
      currentLockout.failedAttempts = 0;
      currentLockout.lockUntil = 0;
    }

    currentLockout.failedAttempts += 1;

    let isLockedOut = false;
    if (currentLockout.failedAttempts >= 5) {
      // 5 Minutes countdown (5 * 60 * 1000 ms)
      currentLockout.lockUntil = now + (5 * 60 * 1000);
      isLockedOut = true;
    }

    if (idx >= 0) {
      lockouts[idx] = currentLockout;
    } else {
      lockouts.push(currentLockout);
    }

    localStorage.setItem(STORAGE_KEYS.LOCKOUTS, JSON.stringify(lockouts));

    const remainingAttempts = Math.max(0, 5 - currentLockout.failedAttempts);
    return {
      lockout: isLockedOut ? currentLockout : null,
      remainingAttempts,
    };
  }

  public static clearLockout(username: string): void {
    const data = localStorage.getItem(STORAGE_KEYS.LOCKOUTS);
    if (!data) return;
    let lockouts: AuthLockout[] = JSON.parse(data);
    lockouts = lockouts.filter(l => l.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.LOCKOUTS, JSON.stringify(lockouts));
  }

  // Ideas CRUD & Voting
  public static getIdeas(): Idea[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
      return data ? JSON.parse(data) : SEED_IDEAS;
    } catch {
      return SEED_IDEAS;
    }
  }

  public static saveIdea(idea: Idea): void {
    const ideas = this.getIdeas();
    const idx = ideas.findIndex(i => i.id === idea.id);
    if (idx >= 0) {
      ideas[idx] = idea;
    } else {
      ideas.unshift(idea);
    }
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
  }

  public static voteIdea(ideaId: string, userId: string, voteType: 'will_use' | 'will_not_use'): Idea | null {
    const ideas = this.getIdeas();
    const idx = ideas.findIndex(i => i.id === ideaId);
    if (idx < 0) return null;

    const idea = { ...ideas[idx] };
    
    // Remove previous votes by this user
    idea.willUseVotes = idea.willUseVotes.filter(id => id !== userId);
    idea.willNotUseVotes = idea.willNotUseVotes.filter(id => id !== userId);

    if (voteType === 'will_use') {
      idea.willUseVotes.push(userId);
    } else if (voteType === 'will_not_use') {
      idea.willNotUseVotes.push(userId);
    }

    ideas[idx] = idea;
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    return idea;
  }

  public static incrementViews(ideaId: string): void {
    const ideas = this.getIdeas();
    const idx = ideas.findIndex(i => i.id === ideaId);
    if (idx >= 0) {
      ideas[idx].views += 1;
      localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
    }
  }

  // Comments CRUD
  public static getComments(ideaId: string): Comment[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      const comments: Comment[] = data ? JSON.parse(data) : [];
      return comments.filter(c => c.ideaId === ideaId);
    } catch {
      return [];
    }
  }

  public static addComment(comment: Comment): void {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = data ? JSON.parse(data) : [];
    comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    // Update comment count on idea
    const ideas = this.getIdeas();
    const idea = ideas.find(i => i.id === comment.ideaId);
    if (idea) {
      idea.commentCount = comments.filter(c => c.ideaId === comment.ideaId).length;
      this.saveIdea(idea);
    }
  }

  public static upvoteComment(commentId: string, username: string): Comment | null {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const comments: Comment[] = data ? JSON.parse(data) : [];
    const idx = comments.findIndex(c => c.id === commentId);
    if (idx < 0) return null;

    const comment = { ...comments[idx] };
    if (comment.upvotes.includes(username)) {
      comment.upvotes = comment.upvotes.filter(u => u !== username);
    } else {
      comment.upvotes.push(username);
    }
    comments[idx] = comment;
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    return comment;
  }
}
