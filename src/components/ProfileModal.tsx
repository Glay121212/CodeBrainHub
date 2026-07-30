import React, { useState } from 'react';
import { X, User, Upload, Check, Camera, Image, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { StorageService } from '../services/storage';
import { sounds } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onUserUpdated: (user: UserType) => void;
}

// Preset developer avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'https://avatars.githubusercontent.com/u/583231?v=4',
  'https://avatars.githubusercontent.com/u/1024025?v=4',
  'https://avatars.githubusercontent.com/u/115278705?v=4',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  if (!isOpen || !currentUser) return null;

  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSelectPreset = (url: string) => {
    sounds.playClick();
    setAvatarUrl(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        sounds.playClick();
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl.trim()) return;

    setIsSaving(true);
    sounds.playClick();

    const updatedUser: UserType = {
      ...currentUser,
      avatar: avatarUrl.trim(),
    };

    try {
      await FirestoreService.updateUserAvatar(currentUser.id, currentUser.username, avatarUrl.trim());
      StorageService.setCurrentUser(updatedUser);
      onUserUpdated(updatedUser);

      sounds.playSuccess();
      setSuccessMsg(true);

      setTimeout(() => {
        setSuccessMsg(false);
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error updating avatar:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-md bg-[#0a0f0c] border border-emerald-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-5">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Customize Profile
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                alt={currentUser.username}
                className="w-24 h-24 rounded-full border-2 border-emerald-500/50 object-cover shadow-lg bg-[#080d0a]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://avatars.githubusercontent.com/u/9919?v=4';
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-emerald-300 pointer-events-none">
                <Camera className="w-6 h-6" />
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-white block">@{currentUser.username}</span>
              <span className="text-[11px] text-emerald-400/80">
                Karma: {currentUser.karma || 100} XP • {currentUser.badges?.[0] || 'VERIFIED DEVELOPER'}
              </span>
            </div>
          </div>

          {/* Preset Avatars */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Choose Preset Avatar:
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(url)}
                  className={`relative p-0.5 rounded-xl border transition-all ${
                    avatarUrl === url
                      ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-105'
                      : 'border-emerald-500/20 hover:border-emerald-500/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="preset" className="w-12 h-12 rounded-lg object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Upload File or Enter URL */}
          <div className="space-y-3 pt-2 border-t border-emerald-500/15">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Upload Custom Image:
              </label>
              <label className="flex items-center justify-center gap-2 p-2.5 bg-[#080d0a] border border-dashed border-emerald-500/30 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer text-xs text-emerald-300">
                <Upload className="w-4 h-4" />
                <span>Choose Image File (PNG/JPG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Or Paste Avatar Image URL:
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#080d0a] border border-emerald-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-emerald-100 placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Success feedback */}
          {successMsg && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> Profile picture updated successfully!
            </div>
          )}

          {/* Save Action */}
          <button
            type="submit"
            disabled={isSaving || !avatarUrl.trim()}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Save Profile Picture
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
