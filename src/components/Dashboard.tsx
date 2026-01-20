import { useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import { Person, Task, Giving } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { GivingWidget } from './GivingWidget';
import { ActionFeed } from './ActionFeed';
import { useAuthContext } from '../contexts/AuthContext';

interface DashboardProps {
  people: Person[];
  tasks: Task[];
  giving?: Giving[];
  onViewPerson: (id: string) => void;
  onViewTasks: () => void;
  onViewGiving?: () => void;
}

export function Dashboard({ people, tasks, giving = [], onViewPerson, onViewTasks: _onViewTasks, onViewGiving }: DashboardProps) {
  const { user } = useAuthContext();
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Compute key metrics
  const metrics = useMemo(() => {
    const visitors = people.filter(p => p.status === 'visitor').length;
    const inactive = people.filter(p => p.status === 'inactive').length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const overdueTasks = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;

    return { visitors, inactive, pendingTasks, overdueTasks, total: people.length };
  }, [people, tasks]);

  // Calculate urgent count for header
  const urgentCount = metrics.visitors + metrics.overdueTasks;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-100">
          {user?.firstName ? `Hey ${user.firstName}` : 'Welcome back'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
          {urgentCount > 0
            ? `You have ${urgentCount} ${urgentCount === 1 ? 'thing' : 'things'} that need attention`
            : "You're all caught up for now"
          }
        </p>

        {/* Inline Stats */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-dark-800 rounded-full text-xs font-medium text-gray-600 dark:text-dark-300">
            <Users size={12} />
            {metrics.total} people
          </span>
          {metrics.visitors > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400">
              <UserPlus size={12} />
              {metrics.visitors} new
            </span>
          )}
          {metrics.overdueTasks > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-500/20 rounded-full text-xs font-medium text-red-700 dark:text-red-400">
              <AlertCircle size={12} />
              {metrics.overdueTasks} overdue
            </span>
          )}
          {metrics.pendingTasks > 0 && metrics.overdueTasks === 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
              <Clock size={12} />
              {metrics.pendingTasks} tasks
            </span>
          )}
        </div>
      </div>

      {/* Action Feed - The Main Event */}
      <div className="mb-6">
        <ActionFeed
          people={people}
          tasks={tasks}
          onViewPerson={onViewPerson}
        />
      </div>

      {/* Giving Widget - Secondary */}
      {onViewGiving && giving.length > 0 && (
        <div className="mb-6">
          <GivingWidget giving={giving} onViewGiving={onViewGiving} />
        </div>
      )}

      {/* Collapsible Analytics */}
      <div className="border-t border-gray-200 dark:border-dark-700 pt-4">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <BarChart3 size={16} />
            Analytics & Trends
          </span>
          {showAnalytics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAnalytics && (
          <div className="mt-4 space-y-4">
            <DashboardCharts people={people} />
          </div>
        )}
      </div>
    </div>
  );
}
