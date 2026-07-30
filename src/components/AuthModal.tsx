import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Check, KeyRound, User, Lock, Clock, Sparkles, Terminal } from 'lucide-react';
import { User as UserType, AuthLockout } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { StorageService } from '../services/storage';
import { evaluatePasswordStrength, formatTimeRemaining } from '../utils/password';
import { sounds } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onAuthSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Lockout State
  const [lockout, setLockout] = useState<AuthLockout | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  // Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  // Check lockout status
  useEffect(() => {
    if (!username.trim()) {
      setLockout(null);
      setRemainingTime(0);
      return;
    }
    FirestoreService.getLockout(username).then((currentLock) => {
      if (currentLock && currentLock.lockUntil > Date.now()) {
        setLockout(currentLock);
        setRemainingTime(currentLock.lockUntil - Date.now());
      } else {
        setLockout(null);
        setRemainingTime(0);
      }
    });
  }, [username]);

  // Countdown ticker for lockout
  useEffect(() => {
    if (!lockout || remainingTime <= 0) return;

    const interval = setInterval(() => {
      const msLeft = lockout.lockUntil - Date.now();
      if (msLeft <= 0) {
        setRemainingTime(0);
        setLockout(null);
        setErrorMsg(null);
        FirestoreService.clearLockout(username);
        clearInterval(interval);
      } else {
        setRemainingTime(msLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockout, remainingTime, username]);

  if (!isOpen) return null;

  const pwdEvaluation = evaluatePasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long.');
      sounds.playError();
      return;
    }

    if (!pwdEvaluation.isValid) {
      setErrorMsg('Password must be STRONG (8+ chars, uppercase, lowercase, number, special char).');
      sounds.playError();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      sounds.playError();
      return;
    }

    setIsSubmitting(true);
    try {
      // Check existing
      const existing = await FirestoreService.getUser(username.trim());
      if (existing) {
        setErrorMsg(`Username '@${username.trim()}' is already registered.`);
        sounds.playError();
        setIsSubmitting(false);
        return;
      }

      // Create User
      const newUser: UserType = {
        id: `user_${Date.now()}`,
        username: username.trim(),
        passwordHash: password,
        createdAt: Date.now(),
        avatar: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000)}?v=4`,
        karma: 100,
        badges: ['VERIFIED CODER'],
      };

      await FirestoreService.saveUser(newUser);
      StorageService.setCurrentUser(newUser);
      sounds.playSuccess();
      setSuccessMsg('Account created successfully!');
      
      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess(newUser);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('Failed to register. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg('Please enter your username.');
      sounds.playError();
      return;
    }

    setIsSubmitting(true);
    try {
      // Check lockout
      const activeLock = await FirestoreService.getLockout(cleanUser);
      if (activeLock && activeLock.lockUntil > Date.now()) {
        setLockout(activeLock);
        setRemainingTime(activeLock.lockUntil - Date.now());
        setErrorMsg('ACCOUNT LOCKED: 5 failed attempts exceeded.');
        sounds.playLockoutWarning();
        setIsSubmitting(false);
        return;
      }

      const foundUser = await FirestoreService.getUser(cleanUser);

      if (!foundUser || foundUser.passwordHash !== password) {
        const result = await FirestoreService.recordFailedAttempt(cleanUser);

        if (result.lockout) {
          setLockout(result.lockout);
          setRemainingTime(result.lockout.lockUntil - Date.now());
          setErrorMsg('SECURITY LOCKOUT: 5 failed attempts! Locked out for 5 minutes.');
          sounds.playLockoutWarning();
        } else {
          setErrorMsg(`Invalid credentials. ${result.remainingAttempts} attempts remaining before 5-min lockout.`);
          sounds.playError();
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      await FirestoreService.clearLockout(cleanUser);
      StorageService.setCurrentUser(foundUser);
      sounds.playSuccess();
      setSuccessMsg(`Welcome back, @${foundUser.username}!`);

      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess(foundUser);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Error logging in. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (demoUsername: string) => {
    sounds.playClick();
    const demoUser: UserType = {
      id: `demo_${demoUsername}`,
      username: demoUsername,
      passwordHash: 'Demo123!',
      createdAt: Date.now(),
      avatar: `https://avatars.githubusercontent.com/u/1000${demoUsername.length}?v=4`,
      karma: 250,
      badges: ['CORE BUILDER'],
    };
    StorageService.setCurrentUser(demoUser);
    sounds.playSuccess();
    onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0a0f0c] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl font-sans text-slate-100">
        
        {/* Header close button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-5 border-b border-emerald-500/20 pb-4 font-mono">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            Developer Account
          </h2>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-[#080d0a] border border-emerald-500/20 rounded-xl font-mono text-xs">
          <button
            onClick={() => {
              sounds.playClick();
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Log In
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Sign Up
          </button>
        </div>

        {/* Error / Lockout Alert */}
        {errorMsg && (
          <div className={`p-3 mb-4 rounded-xl border text-xs font-mono flex items-start gap-2 ${
            lockout
              ? 'bg-red-950/80 border-red-500 text-red-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}>
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">{errorMsg}</p>
              {lockout && (
                <div className="mt-2 p-2 bg-black/60 rounded-lg border border-red-500/40 flex items-center justify-between font-mono">
                  <span className="text-red-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Cooldown Timer:
                  </span>
                  <span className="text-sm font-bold text-red-400">
                    {formatTimeRemaining(remainingTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                USERNAME:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cyber_coder"
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                STRONG PASSWORD:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 p-2.5 bg-[#080d0a] border border-emerald-500/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400">STRENGTH:</span>
                    <span className={`font-bold ${pwdEvaluation.isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {pwdEvaluation.label} ({pwdEvaluation.score}%)
                    </span>
                  </div>

                  <div className="w-full bg-emerald-950/60 h-1.5 rounded-full overflow-hidden border border-emerald-500/20">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pwdEvaluation.isValid ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${pwdEvaluation.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                CONFIRM PASSWORD:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password..."
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!pwdEvaluation.isValid || isSubmitting}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                pwdEvaluation.isValid && !isSubmitting
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer'
                  : 'bg-emerald-950/40 border border-emerald-900 text-emerald-700 cursor-not-allowed opacity-60'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                USERNAME:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  required
                  disabled={!!lockout || isSubmitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username..."
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                PASSWORD:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="password"
                  required
                  disabled={!!lockout || isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="p-2 bg-[#080d0a] border border-emerald-500/15 rounded-lg text-[11px] text-emerald-500/80 flex items-center justify-between">
              <span>Security Rule:</span>
              <span className="text-emerald-400 font-semibold">5 Failed Attempts = 5 min Lockout</span>
            </div>

            <button
              type="submit"
              disabled={!!lockout || isSubmitting}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                lockout || isSubmitting
                  ? 'bg-emerald-500/50 text-black/70 border border-emerald-500/30 cursor-not-allowed'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 cursor-pointer shadow-sm'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Verifying Credentials...
                </>
              ) : lockout ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Locked ({formatTimeRemaining(remainingTime)})
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Log In
                </>
              )}
            </button>
          </form>
        )}

        {/* DEMO ACCOUNTS */}
        <div className="mt-5 pt-4 border-t border-emerald-500/20 font-mono">
          <p className="text-[10px] text-emerald-500/80 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Demo Login:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDemoLogin('cyber_dev')}
              className="px-2.5 py-1 bg-[#080d0a] border border-emerald-500/20 hover:border-emerald-500 text-xs text-emerald-300 rounded-lg"
            >
              @cyber_dev
            </button>
            <button
              onClick={() => handleDemoLogin('pixel_coder')}
              className="px-2.5 py-1 bg-[#080d0a] border border-emerald-500/20 hover:border-emerald-500 text-xs text-emerald-300 rounded-lg"
            >
              @pixel_coder
            </button>
            <button
              onClick={() => handleDemoLogin('rust_hacker')}
              className="px-2.5 py-1 bg-[#080d0a] border border-emerald-500/20 hover:border-emerald-500 text-xs text-emerald-300 rounded-lg"
            >
              @rust_hacker
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
