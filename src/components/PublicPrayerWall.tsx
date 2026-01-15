/**
 * Public Prayer Wall
 *
 * A community-facing prayer wall where members can:
 * - View public prayer requests
 * - Submit new prayer requests
 * - Indicate they're praying for someone
 * - Celebrate answered prayers
 */

import { useState, useMemo } from 'react';
import {
  Heart,
  Send,
  Sparkles,
  Users,
  Lock,
  HeartHandshake,
  MessageCircle,
} from 'lucide-react';

export interface PublicPrayer {
  id: string;
  content: string;
  authorName: string;
  authorInitials: string;
  isAnonymous: boolean;
  isAnswered: boolean;
  testimony?: string;
  prayerCount: number;
  createdAt: string;
  category?: 'health' | 'family' | 'work' | 'spiritual' | 'other';
}

interface PublicPrayerWallProps {
  prayers: PublicPrayer[];
  onSubmitPrayer: (prayer: { content: string; authorName: string; isAnonymous: boolean; category?: string }) => void;
  onPrayFor: (prayerId: string) => void;
  churchName?: string;
  currentUserName?: string;
}

const CATEGORIES = [
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'work', label: 'Work/Career', icon: Sparkles },
  { id: 'spiritual', label: 'Spiritual Growth', icon: HeartHandshake },
  { id: 'other', label: 'Other', icon: MessageCircle },
];

export function PublicPrayerWall({
  prayers,
  onSubmitPrayer,
  onPrayFor,
  churchName = 'Our Church',
  currentUserName,
}: PublicPrayerWallProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>('active');
  const [newPrayer, setNewPrayer] = useState('');
  const [authorName, setAuthorName] = useState(currentUserName || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('other');
  const [showForm, setShowForm] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  // Filter prayers
  const filteredPrayers = useMemo(() => {
    return prayers.filter((p) => {
      if (filter === 'active') return !p.isAnswered;
      if (filter === 'answered') return p.isAnswered;
      return true;
    });
  }, [prayers, filter]);

  // Handle prayer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.trim()) return;

    onSubmitPrayer({
      content: newPrayer.trim(),
      authorName: isAnonymous ? 'Anonymous' : authorName.trim() || 'Anonymous',
      isAnonymous,
      category: selectedCategory,
    });

    setNewPrayer('');
    setShowForm(false);
  };

  // Handle praying for someone
  const handlePrayFor = (prayerId: string) => {
    if (prayedFor.has(prayerId)) return;
    setPrayedFor(new Set([...prayedFor, prayerId]));
    onPrayFor(prayerId);
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'health':
        return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400';
      case 'family':
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'work':
        return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'spiritual':
        return 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-dark-900 dark:via-dark-900 dark:to-dark-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-850/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">
              {churchName} Prayer Wall
            </h1>
            <p className="text-gray-500 dark:text-dark-400 mt-2">
              Join together in prayer with our community
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {prayers.filter((p) => !p.isAnswered).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-dark-400">Active Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {prayers.filter((p) => p.isAnswered).length}
              </div>
              <div className="text-sm text-gray-500 dark:text-dark-400">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {prayers.reduce((sum, p) => sum + p.prayerCount, 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-dark-400">Prayers Lifted</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Submit Prayer Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 p-6 bg-white dark:bg-dark-850 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
          >
            <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400">
              <HeartHandshake size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-lg font-medium">Share a Prayer Request</span>
            </div>
          </button>
        )}

        {/* Prayer Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">
              Share Your Prayer Request
            </h3>

            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500'
                          : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                      }`}
                    >
                      <Icon size={16} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prayer Content */}
            <textarea
              value={newPrayer}
              onChange={(e) => setNewPrayer(e.target.value)}
              placeholder="Share what's on your heart..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
              required
            />

            {/* Author Name */}
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                disabled={isAnonymous}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Lock size={14} />
                Post anonymously
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} />
                Share Prayer
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['active', 'answered', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800'
              }`}
            >
              {f === 'active' ? 'Active' : f === 'answered' ? 'Answered' : 'All'}
            </button>
          ))}
        </div>

        {/* Prayer List */}
        <div className="space-y-4">
          {filteredPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className={`bg-white dark:bg-dark-850 rounded-2xl border p-6 transition-all hover:shadow-md ${
                prayer.isAnswered
                  ? 'border-green-200 dark:border-green-500/20'
                  : 'border-gray-200 dark:border-dark-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {prayer.isAnonymous ? '?' : prayer.authorInitials}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-100">
                      {prayer.authorName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-dark-400">
                      {new Date(prayer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prayer.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(prayer.category)}`}>
                      {CATEGORIES.find((c) => c.id === prayer.category)?.label || 'Other'}
                    </span>
                  )}
                  {prayer.isAnswered && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400">
                      <Sparkles size={12} />
                      Answered
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-dark-200 mb-4">{prayer.content}</p>

              {/* Testimony */}
              {prayer.testimony && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl mb-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm mb-2">
                    <Sparkles size={16} />
                    Testimony
                  </div>
                  <p className="text-green-800 dark:text-green-300 text-sm">{prayer.testimony}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
                  <HeartHandshake size={16} className="text-indigo-500" />
                  <span>{prayer.prayerCount} people praying</span>
                </div>
                {!prayer.isAnswered && (
                  <button
                    onClick={() => handlePrayFor(prayer.id)}
                    disabled={prayedFor.has(prayer.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      prayedFor.has(prayer.id)
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300'
                    }`}
                  >
                    <Heart size={16} className={prayedFor.has(prayer.id) ? 'fill-current' : ''} />
                    {prayedFor.has(prayer.id) ? 'Praying' : 'Pray'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrayers.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700">
            <HeartHandshake className="mx-auto text-gray-300 dark:text-dark-600 mb-4" size={64} />
            <p className="text-gray-500 dark:text-dark-400 text-lg">
              {filter === 'answered'
                ? 'No answered prayers yet'
                : 'No active prayer requests'}
            </p>
            <p className="text-gray-400 dark:text-dark-500 text-sm mt-2">
              Be the first to share a prayer request
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
