import { useMemo } from 'react';
import {
  UserPlus,
  AlertCircle,
  Clock,
  Gift,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Person, Task } from '../types';

interface ActionItem {
  id: string;
  type: 'visitor' | 'overdue' | 'due_today' | 'birthday' | 'inactive' | 'upcoming';
  priority: number; // Lower = more urgent
  title: string;
  subtitle: string;
  person?: Person;
  task?: Task;
  icon: React.ReactNode;
  iconBg: string;
  actionLabel?: string;
}

interface ActionFeedProps {
  people: Person[];
  tasks: Task[];
  onViewPerson: (id: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

export function ActionFeed({ people, tasks, onViewPerson, onCompleteTask }: ActionFeedProps) {
  const actionItems = useMemo(() => {
    const items: ActionItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();

    // 1. New visitors (HIGHEST PRIORITY) - within last 7 days
    const recentVisitors = people.filter(p => {
      if (p.status !== 'visitor') return false;
      if (!p.firstVisit) return true; // No date = assume recent
      const visitDate = new Date(p.firstVisit);
      const daysSince = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 7;
    });

    recentVisitors.forEach((person, idx) => {
      const visitDate = person.firstVisit ? new Date(person.firstVisit) : null;
      const daysSince = visitDate
        ? Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      items.push({
        id: `visitor-${person.id}`,
        type: 'visitor',
        priority: 10 + idx, // Visitors are top priority
        title: `Follow up with ${person.firstName} ${person.lastName}`,
        subtitle: daysSince === 0 ? 'Visited today' : daysSince === 1 ? 'Visited yesterday' : `Visited ${daysSince} days ago`,
        person,
        icon: <UserPlus size={16} />,
        iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
        actionLabel: 'Reach out',
      });
    });

    // 2. Overdue tasks (HIGH PRIORITY)
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdueTasks = pendingTasks.filter(t => new Date(t.dueDate) < today);

    overdueTasks.forEach((task, idx) => {
      const dueDate = new Date(task.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const person = task.personId ? people.find(p => p.id === task.personId) : undefined;

      items.push({
        id: `overdue-${task.id}`,
        type: 'overdue',
        priority: 20 + idx,
        title: task.title,
        subtitle: `Overdue by ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}${person ? ` • ${person.firstName} ${person.lastName}` : ''}`,
        person,
        task,
        icon: <AlertCircle size={16} />,
        iconBg: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
        actionLabel: 'Complete',
      });
    });

    // 3. Tasks due today
    const todayTasks = pendingTasks.filter(t => new Date(t.dueDate).toDateString() === todayStr);

    todayTasks.forEach((task, idx) => {
      const person = task.personId ? people.find(p => p.id === task.personId) : undefined;

      items.push({
        id: `today-${task.id}`,
        type: 'due_today',
        priority: 30 + idx,
        title: task.title,
        subtitle: `Due today${person ? ` • ${person.firstName} ${person.lastName}` : ''}`,
        person,
        task,
        icon: <Clock size={16} />,
        iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
        actionLabel: 'Complete',
      });
    });

    // 4. Birthdays today
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const birthdaysToday = people.filter(p => {
      if (!p.birthday) return false;
      const bday = new Date(p.birthday);
      return bday.getMonth() === todayMonth && bday.getDate() === todayDate;
    });

    birthdaysToday.forEach((person, idx) => {
      items.push({
        id: `birthday-${person.id}`,
        type: 'birthday',
        priority: 40 + idx,
        title: `Wish ${person.firstName} a happy birthday!`,
        subtitle: person.birthday ? `Turning ${new Date().getFullYear() - new Date(person.birthday).getFullYear()}` : 'Birthday today',
        person,
        icon: <Gift size={16} />,
        iconBg: 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400',
        actionLabel: 'Send wishes',
      });
    });

    // 5. Inactive members needing care
    const inactiveMembers = people.filter(p => p.status === 'inactive').slice(0, 3);

    inactiveMembers.forEach((person, idx) => {
      items.push({
        id: `inactive-${person.id}`,
        type: 'inactive',
        priority: 50 + idx,
        title: `Check in with ${person.firstName} ${person.lastName}`,
        subtitle: 'Haven\'t been active recently',
        person,
        icon: <Phone size={16} />,
        iconBg: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
        actionLabel: 'Reach out',
      });
    });

    // 6. Upcoming tasks (next 3 days, excluding today)
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingTasks = pendingTasks
      .filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate > today && dueDate <= threeDaysFromNow;
      })
      .slice(0, 3);

    upcomingTasks.forEach((task, idx) => {
      const person = task.personId ? people.find(p => p.id === task.personId) : undefined;
      const dueDate = new Date(task.dueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      items.push({
        id: `upcoming-${task.id}`,
        type: 'upcoming',
        priority: 60 + idx,
        title: task.title,
        subtitle: `Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}${person ? ` • ${person.firstName} ${person.lastName}` : ''}`,
        person,
        task,
        icon: <Mail size={16} />,
        iconBg: 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400',
      });
    });

    // Sort by priority
    return items.sort((a, b) => a.priority - b.priority);
  }, [people, tasks]);

  const urgentItems = actionItems.filter(item =>
    item.type === 'visitor' || item.type === 'overdue'
  );

  const todayItems = actionItems.filter(item =>
    item.type === 'due_today' || item.type === 'birthday'
  );

  const otherItems = actionItems.filter(item =>
    item.type === 'inactive' || item.type === 'upcoming'
  );

  if (actionItems.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-1">
          You're all caught up!
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-400">
          No urgent actions right now. Great job staying on top of things.
        </p>
      </div>
    );
  }

  const renderItem = (item: ActionItem) => (
    <button
      key={item.id}
      onClick={() => item.person && onViewPerson(item.person.id)}
      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all group text-left"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
          {item.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
          {item.subtitle}
        </p>
      </div>
      <ChevronRight size={16} className="text-gray-300 dark:text-dark-600 group-hover:text-indigo-500 flex-shrink-0" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Urgent Section */}
      {urgentItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
              Urgent
            </span>
            <span className="text-xs text-gray-400 dark:text-dark-500">
              {urgentItems.length} {urgentItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="space-y-2">
            {urgentItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Today Section */}
      {todayItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Today
            </span>
            <span className="text-xs text-gray-400 dark:text-dark-500">
              {todayItems.length} {todayItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="space-y-2">
            {todayItems.map(renderItem)}
          </div>
        </div>
      )}

      {/* Coming Up Section */}
      {otherItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wide">
              Coming Up
            </span>
            <span className="text-xs text-gray-400 dark:text-dark-500">
              {otherItems.length} {otherItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="space-y-2">
            {otherItems.map(renderItem)}
          </div>
        </div>
      )}
    </div>
  );
}
