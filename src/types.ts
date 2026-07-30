export type VoteType = 'will_use' | 'will_not_use' | null;

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  avatar: string;
  karma: number;
  badges: string[];
}

export interface Comment {
  id: string;
  ideaId: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
  parentId?: string | null;
  upvotes: string[];
  codeSnippet?: string;
}

export interface Idea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  authorUsername: string;
  authorAvatar: string;
  tags: string[]; // e.g. ['CLI', 'AI', 'DevTool', 'VSCode']
  screenshotUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  starsCount?: number;
  forksCount?: number;
  openIssuesCount?: number;
  language?: string;
  createdAt: number;
  willUseVotes: string[]; // array of userIds
  willNotUseVotes: string[]; // array of userIds
  commentCount: number;
  views: number;
  status: 'active' | 'in_development' | 'launched';
}

export interface AuthLockout {
  username: string;
  failedAttempts: number;
  lockUntil: number; // Unix timestamp in ms
}

export interface PasswordStrength {
  score: number; // 0 to 100
  label: 'VERY WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'SECURE';
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

export interface AppNotification {
  id: string;
  recipientUsername: string;
  actorUsername: string;
  actorAvatar: string;
  type: 'vote_will_use' | 'vote_will_not_use' | 'comment';
  ideaId: string;
  ideaTitle: string;
  createdAt: number;
  read: boolean;
  commentText?: string;
}

export type SortMode = 'hot' | 'top_demand' | 'most_discussed' | 'newest' | 'my_ideas';
