/**
 * LifeApps Component
 *
 * Spiritual growth tools including daily devotionals, Bible reading plans,
 * prayer journals, and faith milestones. Designed to equip and care for members.
 */

import { useState } from 'react';
import {
  BookOpen,
  Heart,
  Calendar,
  Star,
  Award,
  ChevronLeft,
  Play,
  Share2,
  Bookmark,
  BookMarked,
  Sun,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
} from 'lucide-react';
import type { Person } from '../types';
import { PageHeader, PAGE_GRADIENTS } from './PageHeader';

interface LifeAppsProps {
  people: Person[];
  onBack: () => void;
}

interface Devotional {
  id: string;
  date: string;
  title: string;
  verse: string;
  verseReference: string;
  content: string;
  prayer: string;
  reflection: string[];
}

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  progress: number;
  currentDay: number;
  totalDays: number;
  todayReading: string;
  category: 'beginner' | 'intermediate' | 'advanced';
}

// Sample devotional data
const TODAY_DEVOTIONAL: Devotional = {
  id: '1',
  date: new Date().toISOString().split('T')[0],
  title: 'Finding Peace in the Storm',
  verse: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
  verseReference: 'John 14:27',
  content: `In our fast-paced world, peace can feel like a distant dream. We're constantly bombarded with worries about work, family, health, and the future. Yet Jesus offers us something different – His peace.

This isn't the temporary peace the world offers, which depends on circumstances. Christ's peace transcends our situations. It's a deep, abiding calm that comes from knowing we're held by the One who holds all things together.

Today, wherever you find yourself – in the middle of a storm or in a moment of calm – remember that Jesus has already given you His peace. It's not something you need to earn or achieve. It's a gift, freely given.`,
  prayer: "Lord Jesus, thank You for the gift of Your peace. Help me to receive it fully today, regardless of what I'm facing. When anxiety rises, remind me that You are with me. Let Your peace guard my heart and mind. Amen.",
  reflection: [
    'What situations in your life are causing you to feel troubled or afraid?',
    'How can you actively receive the peace Jesus offers today?',
    'Who in your life might need to hear about the peace of Christ?',
  ],
};

// Sample reading plans
const READING_PLANS: ReadingPlan[] = [
  {
    id: '1',
    name: 'New Testament in 90 Days',
    description: 'Read through the entire New Testament in three months',
    duration: '90 days',
    progress: 34,
    currentDay: 31,
    totalDays: 90,
    todayReading: 'Luke 5-6',
    category: 'intermediate',
  },
  {
    id: '2',
    name: 'Psalms & Proverbs',
    description: 'Daily wisdom from Psalms and Proverbs',
    duration: '31 days',
    progress: 65,
    currentDay: 20,
    totalDays: 31,
    todayReading: 'Psalm 20, Proverbs 20',
    category: 'beginner',
  },
  {
    id: '3',
    name: 'Bible in a Year',
    description: 'Complete Bible reading plan for the year',
    duration: '365 days',
    progress: 5,
    currentDay: 21,
    totalDays: 365,
    todayReading: 'Genesis 42-43, Matthew 14',
    category: 'advanced',
  },
];

function DevotionalCard({ devotional }: { devotional: Devotional }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            <span className="text-sm opacity-90">Today's Devotional</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isBookmarked ? (
                <BookMarked className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{devotional.title}</h2>
        <p className="text-sm opacity-90">
          {new Date(devotional.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Verse */}
      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
        <blockquote className="text-lg italic text-gray-700 dark:text-gray-300">
          "{devotional.verse}"
        </blockquote>
        <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          — {devotional.verseReference}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className={`prose dark:prose-invert max-w-none ${!showFullContent ? 'line-clamp-4' : ''}`}>
          {devotional.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-gray-600 dark:text-gray-300 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
        {!showFullContent && (
          <button
            onClick={() => setShowFullContent(true)}
            className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 hover:underline"
          >
            Read more...
          </button>
        )}

        {showFullContent && (
          <>
            {/* Prayer */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4" />
                Prayer
              </h3>
              <p className="text-amber-700 dark:text-amber-200 italic">
                {devotional.prayer}
              </p>
            </div>

            {/* Reflection Questions */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4" />
                Reflection Questions
              </h3>
              <ul className="space-y-2">
                {devotional.reflection.map((question, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                  >
                    <span className="text-indigo-500 font-bold">{i + 1}.</span>
                    {question}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowFullContent(false)}
              className="text-indigo-600 dark:text-indigo-400 font-medium mt-4 hover:underline"
            >
              Show less
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ReadingPlanCard({ plan }: { plan: ReadingPlan }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {plan.description}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            plan.category === 'beginner'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : plan.category === 'intermediate'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {plan.category}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Day {plan.currentDay} of {plan.totalDays}
          </span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            {plan.progress}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${plan.progress}%` }}
          />
        </div>
      </div>

      {/* Today's Reading */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Today's Reading</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {plan.todayReading}
          </p>
        </div>
        <button className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
          <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: <BookOpen className="w-5 h-5" />, label: 'Bible', color: 'bg-blue-500' },
    { icon: <Heart className="w-5 h-5" />, label: 'Prayer', color: 'bg-red-500' },
    { icon: <Users className="w-5 h-5" />, label: 'Groups', color: 'bg-green-500' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Events', color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className={`p-3 ${action.color} text-white rounded-full`}>
            {action.icon}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function FaithJourney({ people: _people }: { people: Person[] }) {
  const milestones = [
    { type: 'baptism', label: 'Baptisms', count: 12, icon: <Heart className="w-5 h-5" />, color: 'text-blue-500' },
    { type: 'membership', label: 'New Members', count: 28, icon: <Users className="w-5 h-5" />, color: 'text-green-500' },
    { type: 'small-group', label: 'Group Joiners', count: 45, icon: <MessageCircle className="w-5 h-5" />, color: 'text-purple-500' },
    { type: 'volunteer', label: 'Volunteers', count: 32, icon: <Star className="w-5 h-5" />, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-indigo-500" />
        Faith Journey Milestones
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Track spiritual growth and celebrate milestones
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.type}
            className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
          >
            <div className={`mx-auto mb-2 ${milestone.color}`}>
              {milestone.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {milestone.count}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {milestone.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LifeApps({ people, onBack }: LifeAppsProps) {
  const [activeTab, setActiveTab] = useState<'devotional' | 'reading' | 'journey'>('devotional');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <PageHeader
        title="LifeApps"
        subtitle="Tools for spiritual growth and faith journey"
        icon={<Sparkles className="w-6 h-6" />}
        gradient={PAGE_GRADIENTS.lifeApps}
        image="/images/headers/lifeapps.jpg"
      />

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'devotional', label: 'Daily Devotional', icon: <Sun className="w-4 h-4" /> },
          { id: 'reading', label: 'Reading Plans', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'journey', label: 'Faith Journey', icon: <Target className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'devotional' && (
        <div className="space-y-6">
          <DevotionalCard devotional={TODAY_DEVOTIONAL} />
        </div>
      )}

      {activeTab === 'reading' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Reading Plans
            </h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Browse All Plans
            </button>
          </div>
          <div className="grid gap-4">
            {READING_PLANS.map((plan) => (
              <ReadingPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="space-y-6">
          <FaithJourney people={people} />

          {/* Growth Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Growth Tracking
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Weekly Attendance</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">87%</p>
                <p className="text-xs text-green-500">+5% from last month</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">Group Participation</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">62%</p>
                <p className="text-xs text-blue-500">+12% from last quarter</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400">Serving Rate</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">34%</p>
                <p className="text-xs text-purple-500">+8% from last year</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LifeApps;
