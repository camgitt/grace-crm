import { useState, useMemo } from 'react';
import {
  Star,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BarChart3,
  Filter,
  ChevronDown,
} from 'lucide-react';
import type { View } from '../../types';
import { usePastoralCareData } from '../../hooks/usePastoralCareData';

// ============================================
// STAR DISPLAY HELPER
// ============================================

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= rating
              ? 'text-amber-400'
              : 'text-gray-300 dark:text-dark-400'
          }
          fill={star <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

// ============================================
// RATING WIDGET — Inline rating for resolved conversations
// ============================================

interface RatingWidgetProps {
  conversationId: string;
  onSubmitRating: (
    conversationId: string,
    rating: number,
    feedback: string,
    wouldRecommend: boolean
  ) => void;
  existingRating?: {
    rating: number;
    feedback?: string;
    wouldRecommend?: boolean;
  };
}

export function RatingWidget({
  conversationId,
  onSubmitRating,
  existingRating,
}: RatingWidgetProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Read-only mode if existing rating is provided
  if (existingRating) {
    return (
      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl animate-in fade-in duration-300">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
          Thank you for your feedback!
        </p>
        <StarDisplay rating={existingRating.rating} size={18} />
        {existingRating.feedback && (
          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 italic">
            &ldquo;{existingRating.feedback}&rdquo;
          </p>
        )}
        {existingRating.wouldRecommend !== undefined && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            {existingRating.wouldRecommend ? (
              <>
                <ThumbsUp size={12} /> Would recommend
              </>
            ) : (
              <>
                <ThumbsDown size={12} /> Would not recommend
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  // Thank-you state after submission
  if (submitted) {
    return (
      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl transition-all duration-300">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Thank you for your feedback!
        </p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedRating === 0) return;
    onSubmitRating(
      conversationId,
      selectedRating,
      feedback,
      wouldRecommend ?? false
    );
    setSubmitted(true);
  };

  const displayRating = hoveredRating || selectedRating;

  return (
    <div className="mt-4 p-4 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 transition-all duration-300">
      <p className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3">
        How was your experience?
      </p>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setSelectedRating(star)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              size={24}
              className={
                star <= displayRating
                  ? 'text-amber-400 transition-colors duration-150'
                  : 'text-gray-300 dark:text-dark-400 transition-colors duration-150'
              }
              fill={star <= displayRating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        {selectedRating > 0 && (
          <span className="ml-2 text-xs text-gray-500 dark:text-dark-400">
            {selectedRating === 1 && 'Poor'}
            {selectedRating === 2 && 'Fair'}
            {selectedRating === 3 && 'Good'}
            {selectedRating === 4 && 'Very Good'}
            {selectedRating === 5 && 'Excellent'}
          </span>
        )}
      </div>

      {/* Feedback textarea — appears after rating selected */}
      {selectedRating > 0 && (
        <div className="space-y-3 transition-all duration-300">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share any additional thoughts (optional)..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
          />

          {/* Would recommend toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-dark-400">
              Would you recommend this to a friend?
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  wouldRecommend === true
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <ThumbsUp size={12} /> Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  wouldRecommend === false
                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <ThumbsDown size={12} /> No
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// FEEDBACK REVIEW PAGE — Staff view of all ratings
// ============================================

const categoryLabels: Record<string, string> = {
  marriage: 'Marriage & Relationships',
  addiction: 'Addiction & Recovery',
  grief: 'Grief & Loss',
  'faith-questions': 'Faith & Questions',
  'anxiety-depression': 'Anxiety & Depression',
  financial: 'Financial Struggles',
  parenting: 'Parenting',
  crisis: 'Crisis',
  general: 'General Support',
};

const categoryColors: Record<string, string> = {
  marriage: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  addiction:
    'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  grief: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'faith-questions':
    'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  'anxiety-depression':
    'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  financial:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  parenting:
    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  crisis: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  general: 'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
};

interface FeedbackReviewPageProps {
  setView: (view: View) => void;
  churchId?: string;
}

type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

export function FeedbackReviewPage({
  setView,
  churchId,
}: FeedbackReviewPageProps) {
  const { conversations, getLeaderProfiles, getAIPersonas } =
    usePastoralCareData(churchId);

  const leaders = getLeaderProfiles();
  const personas = getAIPersonas();

  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Conversations that have ratings
  const ratedConversations = useMemo(() => {
    return conversations.filter((c) => c.rating !== null && c.rating !== undefined);
  }, [conversations]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...ratedConversations];
    if (ratingFilter !== 'all') {
      filtered = filtered.filter((c) => c.rating === ratingFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }
    // Sort by most recent first
    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [ratedConversations, ratingFilter, categoryFilter]);

  // Computed stats
  const averageRating = useMemo(() => {
    if (ratedConversations.length === 0) return 0;
    const sum = ratedConversations.reduce((acc, c) => acc + (c.rating ?? 0), 0);
    return sum / ratedConversations.length;
  }, [ratedConversations]);

  const ratingDistribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratedConversations.forEach((c) => {
      const r = c.rating as number;
      if (r >= 1 && r <= 5) {
        dist[r as keyof typeof dist]++;
      }
    });
    return dist;
  }, [ratedConversations]);

  // Unique categories for filter
  const availableCategories = useMemo(() => {
    const cats = new Set(ratedConversations.map((c) => c.category));
    return Array.from(cats).sort();
  }, [ratedConversations]);

  const getPersonaName = (personaId: string | null) => {
    if (!personaId) return 'Unknown';
    return personas.find((p) => p.id === personaId)?.name || 'Unknown';
  };

  const getLeaderName = (leaderId: string | null) => {
    if (!leaderId) return 'Unassigned';
    return leaders.find((l) => l.id === leaderId)?.displayName || 'Unknown';
  };

  const maxDistCount = Math.max(...Object.values(ratingDistribution), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView('care-dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft
            size={18}
            className="text-gray-500 dark:text-dark-400"
          />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <Star className="text-amber-500" size={24} />
            Ratings &amp; Feedback
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-0.5 text-sm">
            Review ratings and feedback from pastoral care conversations
          </p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Average Rating */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star size={14} className="text-amber-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wide">
              Average Rating
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-dark-100">
              {ratedConversations.length > 0
                ? averageRating.toFixed(1)
                : '--'}
            </span>
            {ratedConversations.length > 0 && (
              <StarDisplay
                rating={Math.round(averageRating)}
                size={14}
              />
            )}
          </div>
        </div>

        {/* Total Ratings */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-violet-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wide">
              Total Ratings
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-dark-100">
            {ratedConversations.length}
          </span>
        </div>

        {/* Would Recommend % */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wide">
              Would Recommend
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-dark-100">
            N/A
          </span>
          <span className="text-xs text-gray-400 dark:text-dark-400 ml-1">
            (per-rating tracking)
          </span>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wide">
              Distribution
            </span>
          </div>
          <div className="space-y-1">
            {([5, 4, 3, 2, 1] as const).map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-dark-400 w-3 text-right">
                  {star}
                </span>
                <Star size={10} className="text-amber-400" fill="currentColor" />
                <div className="flex-1 h-2 bg-gray-100 dark:bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${(ratingDistribution[star] / maxDistCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-dark-400 w-5 text-right">
                  {ratingDistribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-dark-400">
          {filteredConversations.length} rating
          {filteredConversations.length !== 1 ? 's' : ''}
          {ratingFilter !== 'all' && ` (${ratingFilter}-star)`}
          {categoryFilter !== 'all' &&
            ` in ${categoryLabels[categoryFilter] || categoryFilter}`}
        </p>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-dark-400 bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
        >
          <Filter size={12} />
          Filters
          <ChevronDown
            size={12}
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 flex flex-wrap items-center gap-4">
          {/* Rating filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-dark-400 mb-1 block">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {(['all', 5, 4, 3, 2, 1] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setRatingFilter(val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    ratingFilter === val
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-dark-800 dark:text-dark-400 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  {val === 'all' ? 'All' : `${val}\u2605`}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-dark-400 mb-1 block">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-md text-gray-700 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(ratingFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setRatingFilter('all');
                setCategoryFilter('all');
              }}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline mt-4"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Feedback List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-16">
          <Star
            size={40}
            className="mx-auto text-gray-300 dark:text-dark-400 mb-3"
          />
          <p className="text-gray-500 dark:text-dark-400 text-sm">
            No ratings yet. Ratings appear when help seekers rate resolved
            conversations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Star rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarDisplay rating={conv.rating ?? 0} size={16} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                      {conv.rating}/5
                    </span>
                  </div>

                  {/* Feedback text */}
                  <p className="text-sm text-gray-700 dark:text-dark-100 mb-2">
                    {conv.feedback ? (
                      <span className="italic">
                        &ldquo;{conv.feedback}&rdquo;
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-dark-400 italic">
                        No written feedback
                      </span>
                    )}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        categoryColors[conv.category] ||
                        'bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400'
                      }`}
                    >
                      {categoryLabels[conv.category] || conv.category}
                    </span>

                    {/* Leader / Persona */}
                    <span className="text-xs text-gray-500 dark:text-dark-400">
                      {getPersonaName(conv.persona_id)} &middot;{' '}
                      {getLeaderName(conv.leader_id)}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-gray-400 dark:text-dark-400">
                      {new Date(conv.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
