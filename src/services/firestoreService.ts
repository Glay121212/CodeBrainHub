import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Idea, Comment, AuthLockout, AppNotification } from '../types';
import { StorageService } from './storage';

const IDEAS_COL = 'ideas';
const COMMENTS_COL = 'comments';
const USERS_COL = 'users';
const LOCKOUTS_COL = 'lockouts';
const NOTIFICATIONS_COL = 'notifications';

// Real GitHub open-source repositories pre-seeded into Firestore
const INITIAL_REAL_GITHUB_IDEAS: Idea[] = [
  {
    id: 'idea_uv',
    title: 'uv - Ultra-Fast Python Package & Project Manager in Rust',
    tagline: 'A single, blazingly fast tool to replace pip, pip-tools, virtualenv, poetry, and pyenv.',
    description: `uv is an extremely fast Python package manager written in Rust. Designed as a drop-in replacement for pip and pip-tools, it achieves 10x to 100x speedups compared to standard pip.

Features:
- Global module cache & copy-on-write virtualenvs.
- Built-in Python executable version management (pyenv alternative).
- Universal lockfile format and workspace support.
- Zero external dependencies required.`,
    authorUsername: 'astral_sh',
    authorAvatar: 'https://avatars.githubusercontent.com/u/115278705?v=4',
    tags: ['Rust', 'Python', 'CLI', 'DevTool'],
    screenshotUrl: 'https://opengraph.githubassets.com/1/astral-sh/uv',
    githubUrl: 'https://github.com/astral-sh/uv',
    starsCount: 38400,
    forksCount: 1200,
    openIssuesCount: 420,
    language: 'Rust',
    createdAt: Date.now() - 3600000 * 2,
    willUseVotes: ['demo_1', 'demo_2', 'demo_3', 'demo_4', 'demo_5', 'demo_6', 'demo_7', 'demo_8'],
    willNotUseVotes: ['demo_9'],
    commentCount: 3,
    views: 890,
    status: 'active',
  },
  {
    id: 'idea_ollama',
    title: 'Ollama - Local LLM Engine for DeepSeek-R1, Llama 3 & Mistral',
    tagline: 'Run, customize, and build apps with open-source large language models locally on macOS, Linux & Windows.',
    description: `Ollama allows you to bundle model weights, configuration, and data into a single Modelfile. It optimizes GPU/CPU offloading and provides a simple REST API & OpenAI-compatible endpoint.

Key Highlights:
- Run DeepSeek-R1, Llama 3.3, Qwen 2.5, & Gemma 2 with one CLI command: \`ollama run deepseek-r1\`.
- Native C++ llama.cpp backend with Metal/CUDA acceleration.
- Built-in Docker-like library of open weights.`,
    authorUsername: 'ollama_dev',
    authorAvatar: 'https://avatars.githubusercontent.com/u/128362622?v=4',
    tags: ['AI', 'CLI', 'C++', 'OpenSource'],
    screenshotUrl: 'https://opengraph.githubassets.com/1/ollama/ollama',
    githubUrl: 'https://github.com/ollama/ollama',
    starsCount: 112000,
    forksCount: 8900,
    openIssuesCount: 750,
    language: 'Go',
    createdAt: Date.now() - 3600000 * 12,
    willUseVotes: ['demo_1', 'demo_2', 'demo_3', 'demo_4', 'demo_5', 'demo_6', 'demo_10', 'demo_11', 'demo_12'],
    willNotUseVotes: ['demo_13'],
    commentCount: 2,
    views: 1420,
    status: 'launched',
  },
  {
    id: 'idea_eza',
    title: 'eza - Modern Replacement for ls with Git Status & Icons',
    tagline: 'A modern, maintained replacement for ls in Linux & macOS with color-coded file types, extended attributes, and git status.',
    description: `eza is a modern fork of exa that uses colors and icons to distinguish file types and metadata. It knows about symlinks, extended attributes, and Git integration to display file state directly in directory listings.

Commands:
- \`eza -la --git --icons\`
- \`eza --tree --level=2\``,
    authorUsername: 'eza_community',
    authorAvatar: 'https://avatars.githubusercontent.com/u/139268399?v=4',
    tags: ['CLI', 'Rust', 'Linux', 'DevTool'],
    screenshotUrl: 'https://opengraph.githubassets.com/1/eza-community/eza',
    githubUrl: 'https://github.com/eza-community/eza',
    starsCount: 13500,
    forksCount: 310,
    openIssuesCount: 85,
    language: 'Rust',
    createdAt: Date.now() - 3600000 * 28,
    willUseVotes: ['demo_1', 'demo_2', 'demo_3', 'demo_4', 'demo_5'],
    willNotUseVotes: ['demo_6', 'demo_7'],
    commentCount: 1,
    views: 610,
    status: 'active',
  }
];

// Utility to strip 'undefined' properties before passing to Firestore
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj as T;
}

export class FirestoreService {
  
  // Real-time listener for all Ideas across all connected users
  public static subscribeIdeas(onUpdate: (ideas: Idea[]) => void): () => void {
    const ideasRef = collection(db, IDEAS_COL);
    const q = query(ideasRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial data if Firestore collection is completely empty
        await this.seedInitialIdeas();
        return;
      }

      const ideasList: Idea[] = [];
      snapshot.forEach((doc) => {
        ideasList.push(doc.data() as Idea);
      });
      onUpdate(ideasList);
    }, (error) => {
      console.error('Firestore subscribeIdeas error:', error);
    });

    return unsubscribe;
  }

  // Seed initial real GitHub repos if empty
  private static async seedInitialIdeas() {
    try {
      for (const idea of INITIAL_REAL_GITHUB_IDEAS) {
        await setDoc(doc(db, IDEAS_COL, idea.id), sanitizeForFirestore(idea));
      }
    } catch (err) {
      console.error('Error seeding initial Firestore ideas:', err);
    }
  }

  // Create/Post a new idea to Firestore
  public static async createIdea(idea: Idea): Promise<void> {
    const cleanIdea = sanitizeForFirestore(idea);
    const docRef = doc(db, IDEAS_COL, idea.id);
    await setDoc(docRef, cleanIdea);
  }

  // Cast or toggle vote ("will_use" or "will_not_use") in Firestore
  public static async voteIdea(
    ideaId: string, 
    userId: string, 
    voteType: 'will_use' | 'will_not_use', 
    currentIdea: Idea,
    actorUser?: User | null
  ): Promise<void> {
    const ideaRef = doc(db, IDEAS_COL, ideaId);

    let willUseVotes = [...currentIdea.willUseVotes].filter(id => id !== userId);
    let willNotUseVotes = [...currentIdea.willNotUseVotes].filter(id => id !== userId);

    if (voteType === 'will_use') {
      willUseVotes.push(userId);
    } else {
      willNotUseVotes.push(userId);
    }

    await updateDoc(ideaRef, {
      willUseVotes,
      willNotUseVotes,
    });

    // Create Notification if voter is not the idea author
    if (actorUser && currentIdea.authorUsername && actorUser.username.toLowerCase() !== currentIdea.authorUsername.toLowerCase()) {
      await this.createNotification({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        recipientUsername: currentIdea.authorUsername,
        actorUsername: actorUser.username,
        actorAvatar: actorUser.avatar,
        type: voteType === 'will_use' ? 'vote_will_use' : 'vote_will_not_use',
        ideaId: currentIdea.id,
        ideaTitle: currentIdea.title,
        createdAt: Date.now(),
        read: false,
      });
    }
  }

  // Increment view counter
  public static async incrementViews(ideaId: string): Promise<void> {
    try {
      const ideaRef = doc(db, IDEAS_COL, ideaId);
      await updateDoc(ideaRef, {
        views: increment(1)
      });
    } catch (e) {
      // ignore
    }
  }

  // Subscribe to comments for a specific idea
  public static subscribeComments(ideaId: string, onUpdate: (comments: Comment[]) => void): () => void {
    const commentsRef = collection(db, COMMENTS_COL);
    const q = query(commentsRef, where('ideaId', '==', ideaId), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList: Comment[] = [];
      snapshot.forEach((doc) => {
        commentsList.push(doc.data() as Comment);
      });
      onUpdate(commentsList);
    }, (err) => {
      console.error('Firestore subscribeComments error:', err);
    });

    return unsubscribe;
  }

  // Add comment to Firestore
  public static async addComment(comment: Comment, ideaAuthorUsername?: string, ideaTitle?: string): Promise<void> {
    await setDoc(doc(db, COMMENTS_COL, comment.id), sanitizeForFirestore(comment));
    // Increment idea's commentCount
    const ideaRef = doc(db, IDEAS_COL, comment.ideaId);
    await updateDoc(ideaRef, {
      commentCount: increment(1)
    });

    // Create notification for idea author if commenter is someone else
    if (ideaAuthorUsername && ideaTitle && comment.authorUsername.toLowerCase() !== ideaAuthorUsername.toLowerCase()) {
      await this.createNotification({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        recipientUsername: ideaAuthorUsername,
        actorUsername: comment.authorUsername,
        actorAvatar: comment.authorAvatar,
        type: 'comment',
        ideaId: comment.ideaId,
        ideaTitle: ideaTitle,
        createdAt: Date.now(),
        read: false,
        commentText: comment.text.slice(0, 80),
      });
    }
  }

  // Upvote comment
  public static async upvoteComment(comment: Comment, username: string): Promise<void> {
    const commentRef = doc(db, COMMENTS_COL, comment.id);
    let upvotes = [...comment.upvotes];
    if (upvotes.includes(username)) {
      upvotes = upvotes.filter(u => u !== username);
    } else {
      upvotes.push(username);
    }
    await updateDoc(commentRef, { upvotes });
  }

  // NOTIFICATIONS
  public static async createNotification(notification: AppNotification): Promise<void> {
    try {
      const notifRef = doc(db, NOTIFICATIONS_COL, notification.id);
      await setDoc(notifRef, sanitizeForFirestore(notification));
    } catch (e) {
      console.error('Error creating notification:', e);
    }
  }

  public static subscribeNotifications(recipientUsername: string, onUpdate: (notifications: AppNotification[]) => void): () => void {
    if (!recipientUsername) return () => {};
    const notifRef = collection(db, NOTIFICATIONS_COL);
    const q = query(
      notifRef, 
      where('recipientUsername', '==', recipientUsername),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach((doc) => {
        notifs.push(doc.data() as AppNotification);
      });
      onUpdate(notifs);
    }, (error) => {
      console.error('Firestore subscribeNotifications error:', error);
    });

    return unsubscribe;
  }

  public static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifRef = doc(db, NOTIFICATIONS_COL, notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  }

  public static async markAllNotificationsAsRead(recipientUsername: string): Promise<void> {
    try {
      const snapshot = await getDocs(query(collection(db, NOTIFICATIONS_COL), where('recipientUsername', '==', recipientUsername)));
      snapshot.forEach(async (d) => {
        if (!d.data().read) {
          await updateDoc(doc(db, NOTIFICATIONS_COL, d.id), { read: true });
        }
      });
    } catch (e) {
      console.error('Error marking all notifications as read:', e);
    }
  }

  // User auth management in Firestore
  public static subscribeUsers(onUpdate: (users: User[]) => void): () => void {
    const usersRef = collection(db, USERS_COL);
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        usersList.push(doc.data() as User);
      });
      onUpdate(usersList);
    }, (error) => {
      console.error('Firestore subscribeUsers error:', error);
    });

    return unsubscribe;
  }

  public static async getUser(username: string): Promise<User | null> {
    const clean = username.trim();
    if (!clean) return null;

    try {
      // 1. Direct match query
      const userDoc = await getDocs(query(collection(db, USERS_COL), where('username', '==', clean)));
      if (!userDoc.empty) {
        return userDoc.docs[0].data() as User;
      }

      // 2. Case-insensitive search on Firestore users collection
      const allUsersSnap = await getDocs(collection(db, USERS_COL));
      const caseMatch = allUsersSnap.docs
        .map(d => d.data() as User)
        .find(u => u.username && u.username.toLowerCase() === clean.toLowerCase());
      if (caseMatch) return caseMatch;

      // 3. Fallback to Local Storage
      const localUsers = StorageService.getUsers();
      const localMatch = localUsers.find(u => u.username.toLowerCase() === clean.toLowerCase());
      if (localMatch) return localMatch;

      return null;
    } catch (err) {
      console.error('Error in getUser:', err);
      // Fallback to local users if Firestore call encounters issue
      const localUsers = StorageService.getUsers();
      return localUsers.find(u => u.username.toLowerCase() === clean.toLowerCase()) || null;
    }
  }

  public static async saveUser(user: User): Promise<void> {
    await setDoc(doc(db, USERS_COL, user.id), sanitizeForFirestore(user));
  }

  // Custom profile picture / avatar update
  public static async updateUserAvatar(userId: string, username: string, newAvatarUrl: string): Promise<void> {
    try {
      // Update user doc
      const userRef = doc(db, USERS_COL, userId);
      await updateDoc(userRef, { avatar: newAvatarUrl });

      // Update avatar on ideas authored by this user
      const ideasSnapshot = await getDocs(query(collection(db, IDEAS_COL), where('authorUsername', '==', username)));
      ideasSnapshot.forEach(async (d) => {
        await updateDoc(doc(db, IDEAS_COL, d.id), { authorAvatar: newAvatarUrl });
      });
    } catch (e) {
      console.error('Error updating user avatar in Firestore:', e);
    }
  }

  // Lockout tracking (5 failed attempts -> 5 minutes cooldown) in Firestore
  public static async getLockout(username: string): Promise<AuthLockout | null> {
    try {
      const lockoutDoc = doc(db, LOCKOUTS_COL, username.toLowerCase());
      const snapshot = await getDocs(query(collection(db, LOCKOUTS_COL), where('username', '==', username.toLowerCase())));
      if (snapshot.empty) return null;
      const lockout = snapshot.docs[0].data() as AuthLockout;
      if (Date.now() > lockout.lockUntil) {
        return null;
      }
      return lockout;
    } catch {
      return null;
    }
  }

  public static async recordFailedAttempt(username: string): Promise<{ lockout: AuthLockout | null; remainingAttempts: number }> {
    const lowerUser = username.toLowerCase();
    const lockoutRef = doc(db, LOCKOUTS_COL, lowerUser);

    let currentLockout: AuthLockout = {
      username: lowerUser,
      failedAttempts: 0,
      lockUntil: 0,
    };

    const existingLock = await this.getLockout(lowerUser);
    if (existingLock) {
      currentLockout = { ...existingLock };
    }

    currentLockout.failedAttempts += 1;
    let isLockedOut = false;

    if (currentLockout.failedAttempts >= 5) {
      // 5 minutes lockout
      currentLockout.lockUntil = Date.now() + (5 * 60 * 1000);
      isLockedOut = true;
    }

    await setDoc(lockoutRef, currentLockout);

    return {
      lockout: isLockedOut ? currentLockout : null,
      remainingAttempts: Math.max(0, 5 - currentLockout.failedAttempts),
    };
  }

  public static async clearLockout(username: string): Promise<void> {
    try {
      const lockoutRef = doc(db, LOCKOUTS_COL, username.toLowerCase());
      await setDoc(lockoutRef, { username: username.toLowerCase(), failedAttempts: 0, lockUntil: 0 });
    } catch {
      // ignore
    }
  }
}
