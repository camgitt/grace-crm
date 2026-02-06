import { useState } from 'react';
import {
  CheckCircle,
  Mail,
  Eye,
  Globe,
  Brain,
  Quote,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LeaderProfile, HelpCategory } from '../../types';

interface LeaderProfileCardProps {
  leader: LeaderProfile;
  persona?: {
    language: string;
    personalityDescription: string;
    systemPrompt: string;
  };
  onStartSession?: (leaderId: string) => void;
  onEdit?: (leaderId: string) => void;
}

const CATEGORY_LABELS: Record<HelpCategory, string> = {
  'marriage': 'Marriage & Relationships',
  'addiction': 'Addiction & Recovery',
  'grief': 'Grief & Loss',
  'faith-questions': 'Faith Questions',
  'crisis': 'Crisis/Urgent',
  'financial': 'Financial Help',
  'anxiety-depression': 'Anxiety & Depression',
  'parenting': 'Parenting',
  'general': 'General Pastoral Care',
};

export function LeaderProfileCard({ leader, persona, onStartSession, onEdit }: LeaderProfileCardProps) {
  const [activeTab, setActiveTab] = useState<'expertise' | 'spiritual'>('expertise');
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const initials = leader.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
      {/* Profile Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {leader.photo ? (
              <img
                src={leader.photo}
                alt={leader.displayName}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {initials}
              </div>
            )}
            {leader.isAvailable && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {leader.displayName}
              </h3>
              {leader.isVerified && (
                <CheckCircle size={18} className="text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
              {leader.title}
            </p>

            {/* Credential tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {leader.credentials.slice(0, 3).map(cred => (
                <span
                  key={cred}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400"
                >
                  {cred}
                </span>
              ))}
              {leader.yearsOfPractice && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400">
                  {leader.yearsOfPractice} years of Practice
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit?.(leader.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Mail size={14} />
            Contact Information
          </button>
          <button
            onClick={() => onEdit?.(leader.id)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <Eye size={14} />
            View Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-dark-700">
        <button
          onClick={() => setActiveTab('expertise')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'expertise'
              ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
              : 'text-gray-500 dark:text-dark-400 hover:text-gray-700'
          }`}
        >
          Areas & Expertise
        </button>
        <button
          onClick={() => setActiveTab('spiritual')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            activeTab === 'spiritual'
              ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
              : 'text-gray-500 dark:text-dark-400 hover:text-gray-700'
          }`}
        >
          Spiritual Insights
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 space-y-5">
        {activeTab === 'expertise' && (
          <>
            {/* Education & Credentials */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle size={12} />
                Education & Credentials
              </h4>
              <p className="text-sm text-gray-700 dark:text-dark-300">
                {leader.credentials.join(' | ')}
              </p>
            </div>

            {/* Areas of Expertise */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} />
                Areas of Expertise
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {leader.expertiseAreas.map(area => (
                  <span
                    key={area}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  >
                    {CATEGORY_LABELS[area]}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Agent Info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Brain size={12} />
                AI Agent Info
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-dark-300">
                    {persona?.language || leader.language || 'English'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Personality</p>
                  <p className="text-sm text-gray-700 dark:text-dark-300">
                    {persona?.personalityDescription || leader.personalityTraits.join(', ') || 'Wise and compassionate'}
                  </p>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            {persona?.systemPrompt && (
              <div>
                <button
                  onClick={() => setShowFullPrompt(!showFullPrompt)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2"
                >
                  <Quote size={12} />
                  Persona
                  {showFullPrompt ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <div className={`text-sm text-gray-600 dark:text-dark-400 italic bg-gray-50 dark:bg-dark-700 rounded-xl p-3 ${
                  showFullPrompt ? '' : 'line-clamp-3'
                }`}>
                  "{persona.systemPrompt}"
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'spiritual' && (
          <>
            {/* Spiritual Focus Areas */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                Spiritual Focus Areas
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {leader.spiritualFocusAreas.map(area => (
                  <span
                    key={area}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Personality Traits */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                Personality Traits
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {leader.personalityTraits.map(trait => (
                  <span
                    key={trait}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Anchor Verse */}
            {leader.anchorVerse && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                  Guiding Scripture
                </h4>
                <p className="text-sm text-gray-700 dark:text-dark-300 italic bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
                  "{leader.anchorVerse}"
                </p>
              </div>
            )}

            {/* Suitable For */}
            {leader.suitableFor.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                  Suitable For
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {leader.suitableFor.map(s => (
                    <span
                      key={s}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">
                About
              </h4>
              <p className="text-sm text-gray-700 dark:text-dark-300 leading-relaxed">
                {leader.bio}
              </p>
            </div>
          </>
        )}
      </div>

      {/* CTA Card */}
      <div className="mx-6 mb-6 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-center">
        <Sparkles className="w-8 h-8 text-violet-200 mx-auto mb-2" />
        <h4 className="text-white font-semibold mb-1">Ready to begin your spiritual journey?</h4>
        <p className="text-violet-200 text-xs mb-3">
          Connect with {leader.displayName.split(' ')[0]} for personalized guidance, deep insights, and compassionate support on your path.
        </p>
        <button
          onClick={() => onStartSession?.(leader.id)}
          className="px-6 py-2.5 bg-white text-violet-700 font-semibold text-sm rounded-xl hover:bg-violet-50 transition-colors"
        >
          Start Your Session
        </button>
      </div>
    </div>
  );
}
