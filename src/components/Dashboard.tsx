import { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Cake,
  Heart,
  LayoutDashboard,
  Church,
} from 'lucide-react';
import { Person, Task, Giving, Interaction, PrayerRequest } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { DashboardCharts } from './DashboardCharts';
import { BirthdayWidget } from './BirthdayWidget';
import { GivingWidget } from './GivingWidget';
import { ActivityFeed } from './ActivityFeed';
import { SundayPrep } from './SundayPrep';

interface DashboardProps {
  people: Person[];
  tasks: Task[];
  giving?: Giving[];
  interactions?: Interaction[];
  prayers?: PrayerRequest[];
  onViewPerson: (id: string) => void;
  onViewTasks: () => void;
  onViewGiving?: () => void;
}

type DashboardTab = 'overview' | 'sunday-prep';

export function Dashboard({ people, tasks, giving = [], interactions = [], prayers = [], onViewPerson, onViewTasks, onViewGiving }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Memoize filtered arrays to prevent recalculation on every render
  const { visitors, inactive, pendingTasks } = useMemo(() => ({
    visitors: people.filter(p => p.status === 'visitor'),
    inactive: people.filter(p => p.status === 'inactive'),
    pendingTasks: tasks.filter(t => !t.completed),
  }), [people, tasks]);

  // Memoize sorted pending tasks
  const sortedPendingTasks = useMemo(() =>
    [...pendingTasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 5),
    [pendingTasks]
  );

  // Memoize person lookup map for O(1) access
  const personMap = useMemo(() => new Map(people.map(p => [p.id, p])), [people]);

  const stats = [
    {
      label: 'Total People',
      value: people.length,
      icon: <Users className="text-white" size={20} />,
      gradient: 'from-blue-500 to-cyan-400',
      lightBg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10',
    },
    {
      label: 'New Visitors',
      value: visitors.length,
      icon: <UserPlus className="text-white" size={20} />,
      gradient: 'from-amber-500 to-orange-400',
      lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10',
      highlight: visitors.length > 0
    },
    {
      label: 'Need Attention',
      value: inactive.length,
      icon: <AlertCircle className="text-white" size={20} />,
      gradient: 'from-rose-500 to-pink-400',
      lightBg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10',
      highlight: inactive.length > 0
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks.length,
      icon: <Clock className="text-white" size={20} />,
      gradient: 'from-violet-500 to-purple-400',
      lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Header with Gradient */}
      <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="text-yellow-300" size={20} />
                <span className="text-white/80 text-sm font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome to Grace CRM</h1>
              <p className="text-white/80 mt-1">Here's what needs your attention today.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Heart className="text-white" size={32} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sunday-prep')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'sunday-prep'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Church size={16} />
              Sunday Prep
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'sunday-prep' ? (
        <SundayPrep people={people} prayers={prayers} onViewPerson={onViewPerson} />
      ) : (
        <>

      {/* Stats Grid - Colorful Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`relative p-5 ${stat.lightBg} rounded-2xl border border-white/50 dark:border-dark-700 overflow-hidden group hover:scale-[1.02] transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                {stat.icon}
              </div>
              {stat.highlight && (
                <span className="text-[10px] font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 rounded-full shadow-sm">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-dark-100">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-dark-400 mt-1 font-medium">{stat.label}</p>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Visitors */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          {/* Section Header with Gradient */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <UserPlus className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Recent Visitors</h2>
                  <span className="text-xs text-white/80">Last 30 days</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">{visitors.length}</span>
            </div>
          </div>
          <div className="p-4">

          {visitors.length === 0 ? (
            <p className="text-gray-400 dark:text-dark-500 text-sm py-6 text-center">No recent visitors</p>
          ) : (
            <div className="space-y-1">
              {visitors.slice(0, 5).map((person) => (
                <button
                  key={person.id}
                  onClick={() => onViewPerson(person.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-750 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-400 text-xs font-medium">
                      {person.firstName[0]}{person.lastName[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{person.firstName} {person.lastName}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-500">
                        {person.firstVisit ? new Date(person.firstVisit).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-dark-600 group-hover:text-gray-400 dark:group-hover:text-dark-500" />
                </button>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Priority Tasks */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          {/* Section Header with Gradient */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Priority Follow-Ups</h2>
                  <span className="text-xs text-white/80">Tasks needing attention</span>
                </div>
              </div>
              <button
                onClick={onViewTasks}
                className="text-xs text-white/90 hover:text-white font-medium flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full"
              >
                View all
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
          <div className="p-4">
          {pendingTasks.length === 0 ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>
              <p className="text-gray-500 dark:text-dark-400 text-sm font-medium">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedPendingTasks.map((task) => {
                  const person = task.personId ? personMap.get(task.personId) : undefined;
                  const isOverdue = new Date(task.dueDate) < new Date();

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border ${isOverdue ? 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5' : 'border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-850'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">{task.title}</p>
                          {person && (
                            <p className="text-xs text-gray-400 dark:text-dark-500 mt-0.5">
                              {person.firstName} {person.lastName}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock size={10} className={isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-dark-500'} />
                        <span className={`text-[10px] ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-dark-500'}`}>
                          {isOverdue ? 'Overdue' : 'Due'}: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed
          people={people}
          tasks={tasks}
          interactions={interactions}
          prayers={prayers}
          giving={giving}
          onViewPerson={onViewPerson}
          limit={8}
        />
      </div>

      {/* Giving Widget */}
      {onViewGiving && (
        <div className="mt-4">
          <GivingWidget giving={giving} onViewGiving={onViewGiving} />
        </div>
      )}

      {/* Inactive Members Alert */}
      {inactive.length > 0 && (
        <div className="mt-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-500/5 dark:to-pink-500/5 rounded-2xl p-5 border border-rose-200/50 dark:border-rose-500/20 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full opacity-10" />
          <div className="flex items-start gap-4 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Heart className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-dark-100">Members Need Care</h3>
              <p className="text-sm text-gray-600 dark:text-dark-400 mt-1">
                {inactive.length} {inactive.length === 1 ? 'person hasn\'t' : 'people haven\'t'} been active recently. Let's reach out!
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {inactive.slice(0, 3).map((person) => (
                  <button
                    key={person.id}
                    onClick={() => onViewPerson(person.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-800 rounded-xl text-sm font-medium text-gray-700 dark:text-dark-300 hover:bg-rose-50 dark:hover:bg-dark-750 border border-gray-200 dark:border-dark-600 transition-colors shadow-sm"
                  >
                    {person.firstName} {person.lastName}
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-dark-100">Analytics</h2>
            <p className="text-xs text-gray-500 dark:text-dark-400">Track your congregation's growth</p>
          </div>
        </div>
        <DashboardCharts people={people} />
      </div>

      {/* Birthday Widget */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-400 rounded-xl flex items-center justify-center shadow-lg">
            <Cake className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-dark-100">Upcoming Birthdays</h2>
            <p className="text-xs text-gray-500 dark:text-dark-400">Celebrate with your community</p>
          </div>
        </div>
        <BirthdayWidget people={people} onViewPerson={onViewPerson} />
      </div>
      </>
      )}
    </div>
  );
}
