import { useState, useEffect } from 'react';
import {
  Church,
  CheckCircle2,
  Circle,
  Mic,
  Newspaper,
  Sparkles,
  Gift,
  Heart,
  Users,
  Calendar,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { Person, PrayerRequest } from '../types';

interface SundayPrepProps {
  people: Person[];
  prayers: PrayerRequest[];
  onViewPerson?: (id: string) => void;
}

interface PrepTask {
  id: string;
  label: string;
  completed: boolean;
  category: 'before' | 'during' | 'after';
}

interface NewsTheme {
  headline: string;
  connection: string;
  category: string;
}

const defaultTasks: PrepTask[] = [
  { id: '1', label: 'Review prayer requests from this week', completed: false, category: 'before' },
  { id: '2', label: 'Check for birthdays & anniversaries to announce', completed: false, category: 'before' },
  { id: '3', label: 'Prepare welcome message for visitors', completed: false, category: 'before' },
  { id: '4', label: 'Review sermon notes and key points', completed: false, category: 'before' },
  { id: '5', label: 'Welcome first-time visitors by name', completed: false, category: 'during' },
  { id: '6', label: 'Acknowledge answered prayers', completed: false, category: 'during' },
  { id: '7', label: 'Make announcements', completed: false, category: 'during' },
  { id: '8', label: 'Follow up with visitors', completed: false, category: 'after' },
];

// Simulated trending themes - in production this could come from an API
const trendingThemes: NewsTheme[] = [
  {
    headline: 'Mental Health Awareness Rising',
    connection: 'Connect to messages of hope, community support, and "casting your anxieties" (1 Peter 5:7)',
    category: 'Health & Wellness',
  },
  {
    headline: 'Community Coming Together After Challenges',
    connection: 'Tie to the power of fellowship, Acts 2:42-47, and bearing one another\'s burdens',
    category: 'Community',
  },
  {
    headline: 'Finding Purpose in Uncertain Times',
    connection: 'Link to Jeremiah 29:11, Romans 8:28, and trusting God\'s plan',
    category: 'Faith & Purpose',
  },
];

export function SundayPrep({ people, prayers, onViewPerson }: SundayPrepProps) {
  const [tasks, setTasks] = useState<PrepTask[]>(() => {
    const saved = localStorage.getItem('sundayPrepTasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultTasks;
      }
    }
    return defaultTasks;
  });

  const [sermonTheme, setSermonTheme] = useState(() => {
    return localStorage.getItem('sermonTheme') || '';
  });

  const [talkingPoints, setTalkingPoints] = useState(() => {
    return localStorage.getItem('sermonTalkingPoints') || '';
  });

  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsThemes, setNewsThemes] = useState<NewsTheme[]>(trendingThemes);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('sundayPrepTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('sermonTheme', sermonTheme);
  }, [sermonTheme]);

  useEffect(() => {
    localStorage.setItem('sermonTalkingPoints', talkingPoints);
  }, [talkingPoints]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const resetTasks = () => {
    setTasks(defaultTasks);
    setSermonTheme('');
    setTalkingPoints('');
  };

  const refreshNews = () => {
    setIsLoadingNews(true);
    // Simulate API call - in production this would fetch real news
    setTimeout(() => {
      setNewsThemes([...trendingThemes].sort(() => Math.random() - 0.5));
      setIsLoadingNews(false);
    }, 1000);
  };

  // Get upcoming birthdays (next 7 days)
  const upcomingBirthdays = people.filter(p => {
    if (!p.birthDate) return false;
    const today = new Date();
    const birthday = new Date(p.birthDate);
    birthday.setFullYear(today.getFullYear());
    const diffDays = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  // Get recent visitors (last 30 days)
  const recentVisitors = people.filter(p => {
    if (p.status !== 'visitor') return false;
    if (!p.firstVisit) return false;
    const visitDate = new Date(p.firstVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return visitDate >= thirtyDaysAgo;
  });

  // Get active prayer requests (not answered)
  const activePrayers = prayers.filter(p => !p.isAnswered).slice(0, 5);

  const beforeTasks = tasks.filter(t => t.category === 'before');
  const duringTasks = tasks.filter(t => t.category === 'during');
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Church className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sunday Prep</h2>
              <p className="text-white/80">Get ready for an amazing service</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{progress}%</p>
              <p className="text-sm text-white/70">ready</p>
            </div>
            <button
              onClick={resetTasks}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Reset for new week"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Checklist & Sermon */}
        <div className="space-y-6">
          {/* Pre-Service Checklist */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Before Service</h3>
                  <p className="text-xs text-white/80">Complete these first</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {beforeTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    task.completed
                      ? 'bg-emerald-50 dark:bg-emerald-500/10'
                      : 'bg-gray-50 dark:bg-dark-750 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-gray-300 dark:text-dark-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-gray-700 dark:text-dark-200'}`}>
                    {task.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* During Service */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Mic className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">During Service</h3>
                  <p className="text-xs text-white/80">Don't forget these</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {duringTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    task.completed
                      ? 'bg-violet-50 dark:bg-violet-500/10'
                      : 'bg-gray-50 dark:bg-dark-750 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} className="text-violet-500 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-gray-300 dark:text-dark-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${task.completed ? 'text-violet-700 dark:text-violet-400 line-through' : 'text-gray-700 dark:text-dark-200'}`}>
                    {task.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sermon Notes */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <BookOpen className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sermon Highlights</h3>
                  <p className="text-xs text-white/80">Key points to remember</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Today's Theme
                </label>
                <input
                  type="text"
                  value={sermonTheme}
                  onChange={(e) => setSermonTheme(e.target.value)}
                  placeholder="e.g., Finding Peace in the Storm"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-750 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Talking Points
                </label>
                <textarea
                  value={talkingPoints}
                  onChange={(e) => setTalkingPoints(e.target.value)}
                  placeholder="• Main scripture reference&#10;• Key message&#10;• Call to action&#10;• Closing thought"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-750 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Context & Connections */}
        <div className="space-y-6">
          {/* What to Address */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">What to Address</h3>
                  <p className="text-xs text-white/80">Personalize your message</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Birthdays */}
              {upcomingBirthdays.length > 0 && (
                <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift size={16} className="text-pink-500" />
                    <span className="text-sm font-medium text-pink-700 dark:text-pink-400">Birthdays This Week</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {upcomingBirthdays.slice(0, 5).map((person) => (
                      <button
                        key={person.id}
                        onClick={() => onViewPerson?.(person.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-dark-800 rounded-lg text-xs font-medium text-gray-700 dark:text-dark-300 hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors"
                      >
                        {person.firstName} {person.lastName}
                        <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visitors to Welcome */}
              {recentVisitors.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Welcome These Visitors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentVisitors.slice(0, 5).map((person) => (
                      <button
                        key={person.id}
                        onClick={() => onViewPerson?.(person.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-dark-800 rounded-lg text-xs font-medium text-gray-700 dark:text-dark-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                      >
                        {person.firstName} {person.lastName}
                        <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prayer Requests */}
              {activePrayers.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={16} className="text-purple-500" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Pray For</span>
                  </div>
                  <div className="space-y-2">
                    {activePrayers.map((prayer) => {
                      const person = people.find(p => p.id === prayer.personId);
                      return (
                        <div key={prayer.id} className="text-sm text-gray-600 dark:text-dark-400">
                          <span className="font-medium text-gray-900 dark:text-dark-200">
                            {person ? `${person.firstName} ${person.lastName}` : 'Anonymous'}:
                          </span>{' '}
                          {prayer.content.length > 60 ? prayer.content.substring(0, 60) + '...' : prayer.content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {upcomingBirthdays.length === 0 && recentVisitors.length === 0 && activePrayers.length === 0 && (
                <div className="text-center py-6 text-gray-400 dark:text-dark-500">
                  <Calendar size={24} className="mx-auto mb-2" />
                  <p className="text-sm">No specific items to address this week</p>
                </div>
              )}
            </div>
          </div>

          {/* News & Themes Connection */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Newspaper className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Connect the Theme</h3>
                    <p className="text-xs text-white/80">Relevant world topics</p>
                  </div>
                </div>
                <button
                  onClick={refreshNews}
                  disabled={isLoadingNews}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={`text-white ${isLoadingNews ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {newsThemes.map((theme, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-medium rounded-full mb-1">
                        {theme.category}
                      </span>
                      <h4 className="font-medium text-gray-900 dark:text-dark-100 text-sm">{theme.headline}</h4>
                      <p className="text-xs text-gray-600 dark:text-dark-400 mt-1">{theme.connection}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Sermon Helper */}
          <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-500/10 dark:to-purple-500/10 rounded-2xl border border-fuchsia-200/50 dark:border-fuchsia-500/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-dark-100">AI Sermon Helper</h3>
                <p className="text-xs text-gray-500 dark:text-dark-400">Get AI-powered suggestions</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-400 mb-3">
              Need help crafting your message? Use the AI Assistant to generate sermon illustrations, talking points, or scripture connections.
            </p>
            <button className="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-medium rounded-xl hover:from-fuchsia-600 hover:to-purple-600 transition-all shadow-lg shadow-fuchsia-500/25">
              Open AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
