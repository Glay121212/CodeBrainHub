import React from 'react';
import { Bell, Check, Sparkles, MessageSquare, ThumbsUp, ThumbsDown, X, ExternalLink } from 'lucide-react';
import { AppNotification } from '../types';
import { FirestoreService } from '../services/firestoreService';
import { sounds } from '../utils/audio';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  recipientUsername: string;
  onSelectIdeaId: (ideaId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  recipientUsername,
  onSelectIdeaId,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    sounds.playClick();
    await FirestoreService.markAllNotificationsAsRead(recipientUsername);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    sounds.playClick();
    if (!notif.read) {
      await FirestoreService.markNotificationAsRead(notif.id);
    }
    onClose();
    onSelectIdeaId(notif.ideaId);
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-96 bg-[#0a0f0c] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100">
      
      {/* Header */}
      <div className="p-3.5 bg-[#0d1410] border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold">
              {unreadCount} NEW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] text-emerald-400 hover:text-emerald-200 underline font-semibold transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-500/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-emerald-500/10">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-emerald-500/60 text-xs space-y-1">
            <Bell className="w-6 h-6 mx-auto text-emerald-500/40" />
            <p className="text-white font-bold">No notifications yet</p>
            <p className="text-[10px] text-emerald-600">You'll receive alerts when developers vote or comment on your ideas!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-emerald-500/10 ${
                !notif.read ? 'bg-emerald-950/40 border-l-2 border-l-emerald-400' : 'opacity-80'
              }`}
            >
              <img
                src={notif.actorAvatar || 'https://avatars.githubusercontent.com/u/9919?v=4'}
                alt={notif.actorUsername}
                className="w-8 h-8 rounded-full border border-emerald-500/30 object-cover shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-emerald-300 truncate">@{notif.actorUsername}</span>
                  <span className="text-[10px] text-emerald-500/70 shrink-0">
                    {formatTimestamp(notif.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-100 font-sans line-clamp-2">
                  {notif.type === 'vote_will_use' && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <ThumbsUp className="w-3 h-3" /> Voted "Will Use" on "{notif.ideaTitle}"
                    </span>
                  )}
                  {notif.type === 'vote_will_not_use' && (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                      <ThumbsDown className="w-3 h-3" /> Voted "Won't Use" on "{notif.ideaTitle}"
                    </span>
                  )}
                  {notif.type === 'comment' && (
                    <span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 inline" /> Commented on "{notif.ideaTitle}":
                      </span>
                      <span className="italic text-emerald-200 block mt-0.5">"{notif.commentText}"</span>
                    </span>
                  )}
                </p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
