import {
  Heart,
  Shield,
  CloudRain,
  BookOpen,
  Brain,
  DollarSign,
  Baby,
  AlertTriangle,
  MessageCircle,
  MessageSquare,
  Clock,
} from 'lucide-react';
import type { LeaderProfile, HelpCategory } from '../../types';

const categoryIcons: Record<string, React.ReactNode> = {
  'marriage': <Heart size={12} />,
  'addiction': <Shield size={12} />,
  'grief': <CloudRain size={12} />,
  'faith-questions': <BookOpen size={12} />,
  'anxiety-depression': <Brain size={12} />,
  'financial': <DollarSign size={12} />,
  'parenting': <Baby size={12} />,
  'crisis': <AlertTriangle size={12} />,
  'general': <MessageCircle size={12} />,
};

const categoryColors: Record<string, string> = {
  'marriage': 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  'addiction': 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'grief': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'faith-questions': 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  'anxiety-depression': 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  'financial': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  'parenting': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'crisis': 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  'general': 'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
};

const categoryLabels: Record<HelpCategory, string> = {
  'marriage': 'Marriage',
  'addiction': 'Recovery',
  'grief': 'Grief',
  'faith-questions': 'Faith',
  'anxiety-depression': 'Emotional Support',
  'financial': 'Financial',
  'parenting': 'Parenting',
  'crisis': 'Crisis',
  'general': 'General',
};

interface LeaderProfileCardProps {
  leader: LeaderProfile;
  onChat: (leaderId: string) => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function LeaderProfileCard({ leader, onChat }: LeaderProfileCardProps) {
  return (
    <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200/60 dark:border-white/5 p-5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-500/20 transition-all duration-200 group">
      {/* Header: Avatar + Name + Status */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {leader.photo ? (
            <img
              src={leader.photo}
              alt={leader.displayName}
              className="w-14 h-14 rounded-xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {getInitials(leader.displayName)}
            </div>
          )}
          {/* Online indicator */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-dark-850 ${
              leader.isOnline
                ? 'bg-emerald-500'
                : 'bg-gray-300 dark:bg-dark-600'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-dark-100 truncate">
            {leader.displayName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-400">{leader.title}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {leader.isOnline ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Live Now
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-500">
                <Clock size={10} />
                {getTimeAgo(leader.lastSeenAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 dark:text-dark-300 mb-4 line-clamp-3">
        {leader.bio}
      </p>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {leader.expertiseAreas.map((area) => (
          <span
            key={area}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
              categoryColors[area] || categoryColors.general
            }`}
          >
            {categoryIcons[area]}
            {categoryLabels[area] || area}
          </span>
        ))}
      </div>

      {/* Chat Button */}
      <button
        onClick={() => onChat(leader.id)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors group-hover:shadow-md"
      >
        <MessageSquare size={16} />
        Chat with {leader.displayName.split(' ')[0]}
        {leader.isOnline && (
          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Live</span>
        )}
      </button>
    </div>
  );
}
