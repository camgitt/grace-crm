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
      icon: <Users className="text-slate-600 dark:text-slate-300" size={20} />,
      bg: 'bg-slate-100 dark:bg-slate-800',
      border: 'border-slate-200 dark:border-slate-700',
    },
    {
      label: 'New Visitors',
      value: visitors.length,
      icon: <UserPlus className="text-amber-600 dark:text-amber-400" size={20} />,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      highlight: visitors.length > 0
    },
    {
      label: 'Need Attention',
      value: inactive.length,
      icon: <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />,
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-800',
      highlight: inactive.length > 0
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks.length,
      icon: <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />,
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Header with Photo */}
      <div className="mb-6 relative overflow-hidden rounded-2xl h-48">
        {/* Background Image - Church/Community themed */}
        <img
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&h=400&fit=crop"
          alt="Church community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-slate-900/60" />
        <div className="relative h-full p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="text-amber-300" size={18} />
                <span className="text-white/70 text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome to Grace CRM</h1>
              <p className="text-white/60 mt-1 text-sm">Here's what needs your attention today.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Heart className="text-white/80" size={28} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-800 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sunday-prep')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sunday-prep'
                  ? 'bg-white text-slate-800 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-5 ${stat.bg} rounded-xl border ${stat.border} transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white dark:bg-dark-700 rounded-lg flex items-center justify-center shadow-sm">
                {stat.icon}
              </div>
              {stat.highlight && (
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                  Action
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Visitors */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          {/* Section Header */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white dark:bg-dark-700 rounded-lg flex items-center justify-center shadow-sm">
                  <UserPlus className="text-amber-600 dark:text-amber-400" size={18} />
                </div>
                <div>
                  <h2 className="font-medium text-gray-900 dark:text-dark-100">Recent Visitors</h2>
                  <span className="text-xs text-gray-500 dark:text-dark-400">Last 30 days</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-amber-700 dark:text-amber-400">{visitors.length}</span>
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
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          {/* Section Header */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white dark:bg-dark-700 rounded-lg flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="text-indigo-600 dark:text-indigo-400" size={18} />
                </div>
                <div>
                  <h2 className="font-medium text-gray-900 dark:text-dark-100">Priority Follow-Ups</h2>
                  <span className="text-xs text-gray-500 dark:text-dark-400">Tasks needing attention</span>
                </div>
              </div>
              <button
                onClick={onViewTasks}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
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
        <div className="mt-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl p-4 border border-rose-200 dark:border-rose-800/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white dark:bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Heart className="text-rose-500" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">Members Need Care</h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
                {inactive.length} {inactive.length === 1 ? 'person hasn\'t' : 'people haven\'t'} been active recently.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {inactive.slice(0, 3).map((person) => (
                  <button
                    key={person.id}
                    onClick={() => onViewPerson(person.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-dark-800 rounded-lg text-xs font-medium text-gray-700 dark:text-dark-300 hover:bg-rose-100 dark:hover:bg-dark-750 border border-gray-200 dark:border-dark-600 transition-colors"
                  >
                    {person.firstName} {person.lastName}
                    <ChevronRight size={12} />
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
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={18} />
          </div>
          <div>
            <h2 className="font-medium text-gray-900 dark:text-dark-100">Analytics</h2>
            <p className="text-xs text-gray-500 dark:text-dark-400">Track your congregation's growth</p>
          </div>
        </div>
        <DashboardCharts people={people} />
      </div>

      {/* Birthday Widget */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
            <Cake className="text-pink-600 dark:text-pink-400" size={18} />
          </div>
          <div>
            <h2 className="font-medium text-gray-900 dark:text-dark-100">Upcoming Birthdays</h2>
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
