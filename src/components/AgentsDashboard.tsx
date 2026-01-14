import { useState, useMemo } from 'react';
import {
  Bot,
  Search,
  Play,
  Pause,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  DollarSign,
  Heart,
  BookOpen,
  Users,
  Megaphone,
  Music,
  Building2,
  Cpu,
  ChevronDown,
  Info,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react';
import type { AIAgent, AgentCategory, AgentStatus, AgentConfig, AgentTrigger, AgentAction } from '../types';
import { AgentConfigModal } from './AgentConfigModal';
import { AgentActivityLog } from './AgentActivityLog';

interface AgentsDashboardProps {
  agents: AIAgent[];
  onToggleAgent: (agentId: string, enabled: boolean) => void;
  onConfigureAgent: (agentId: string, config: AgentConfig, triggers: AgentTrigger[], actions: AgentAction[]) => void;
  onViewPerson?: (personId: string) => void;
}

const categoryConfig: Record<AgentCategory, { label: string; icon: React.ReactNode; color: string }> = {
  finance: { label: 'Finance', icon: <DollarSign size={14} />, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  'pastoral-care': { label: 'Pastoral Care', icon: <Heart size={14} />, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10' },
  education: { label: 'Education', icon: <BookOpen size={14} />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
  engagement: { label: 'Engagement', icon: <Users size={14} />, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' },
  outreach: { label: 'Outreach', icon: <Megaphone size={14} />, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10' },
  worship: { label: 'Worship & Media', icon: <Music size={14} />, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' },
  administration: { label: 'Administration', icon: <Building2 size={14} />, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10' },
  technical: { label: 'Technical', icon: <Cpu size={14} />, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10' },
};

const statusConfig: Record<AgentStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
  inactive: { label: 'Inactive', color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-500/10' },
  beta: { label: 'Beta', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
  'coming-soon': { label: 'Coming Soon', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
};

function DifficultyBadge({ level }: { level: number }) {
  const color = level <= 3 ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' :
                level <= 6 ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10' :
                'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10';
  const label = level <= 3 ? 'Easy' : level <= 6 ? 'Medium' : 'Advanced';

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${color}`}>
      {label}
    </span>
  );
}

export function AgentsDashboard({ agents, onToggleAgent, onConfigureAgent, onViewPerson }: AgentsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AgentStatus | 'all'>('all');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [configuringAgent, setConfiguringAgent] = useState<AIAgent | null>(null);
  const [activeView, setActiveView] = useState<'agents' | 'activity'>('agents');

  // Stats
  const stats = useMemo(() => {
    const active = agents.filter(a => a.isEnabled && a.status === 'active').length;
    const total = agents.length;
    const runsToday = agents.reduce((sum, a) => sum + (a.runsToday || 0), 0);
    const categories = new Set(agents.map(a => a.category)).size;
    return { active, total, runsToday, categories };
  }, [agents]);

  // All activities across all agents
  const allActivities = useMemo(() => {
    return agents
      .flatMap(a => (a.activityLog || []).map(log => ({ ...log, agentName: a.name })))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }, [agents]);

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || agent.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [agents, searchQuery, selectedCategory, selectedStatus]);

  // Group by category
  const groupedAgents = useMemo(() => {
    const groups: Record<string, AIAgent[]> = {};
    filteredAgents.forEach(agent => {
      if (!groups[agent.category]) {
        groups[agent.category] = [];
      }
      groups[agent.category].push(agent);
    });
    return groups;
  }, [filteredAgents]);

  const handleConfigureSave = (agentId: string, config: AgentConfig, triggers: AgentTrigger[], actions: AgentAction[]) => {
    onConfigureAgent(agentId, config, triggers, actions);
    setConfiguringAgent(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <Bot size={22} className="text-indigo-600" />
            AI Agents
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
            Automate church operations with intelligent agents
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => setActiveView('agents')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeView === 'agents'
                ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm'
                : 'text-gray-500 dark:text-dark-400'
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
              activeView === 'activity'
                ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm'
                : 'text-gray-500 dark:text-dark-400'
            }`}
          >
            <Activity size={14} />
            Activity
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Zap className="text-emerald-600 dark:text-emerald-400" size={16} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stats.active}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">Active agents</p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
            <Bot className="text-blue-600 dark:text-blue-400" size={16} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">Total agents</p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center mb-2">
            <TrendingUp className="text-purple-600 dark:text-purple-400" size={16} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stats.runsToday}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">Runs today</p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 rounded-lg flex items-center justify-center mb-2">
            <Building2 className="text-amber-600 dark:text-amber-400" size={16} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stats.categories}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">Categories</p>
        </div>
      </div>

      {/* Activity View */}
      {activeView === 'activity' && (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900 dark:text-dark-100">Recent Agent Activity</h2>
            <span className="text-xs text-gray-400 dark:text-dark-500">{allActivities.length} events</span>
          </div>
          <AgentActivityLog
            activities={allActivities}
            onViewPerson={onViewPerson}
            maxItems={30}
          />
        </div>
      )}

      {/* Agents View */}
      {activeView === 'agents' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AgentCategory | 'all')}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AgentStatus | 'all')}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="beta">Beta</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </div>

          {/* Agent List by Category */}
          {Object.entries(groupedAgents).length === 0 ? (
            <div className="text-center py-12">
              <Bot className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={40} />
              <p className="text-gray-500 dark:text-dark-400">No agents match your filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAgents).map(([category, categoryAgents]) => {
                const config = categoryConfig[category as AgentCategory];
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`p-1.5 rounded-lg ${config.color}`}>
                        {config.icon}
                      </span>
                      <h2 className="text-sm font-medium text-gray-900 dark:text-dark-100">
                        {config.label}
                      </h2>
                      <span className="text-xs text-gray-400 dark:text-dark-500">
                        ({categoryAgents.length})
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {categoryAgents.map((agent) => {
                        const isExpanded = expandedAgent === agent.id;
                        const statusConf = statusConfig[agent.status];
                        const isComingSoon = agent.status === 'coming-soon';
                        const hasConfig = agent.triggers && agent.triggers.length > 0;

                        return (
                          <div
                            key={agent.id}
                            className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden ${
                              isComingSoon ? 'opacity-75' : ''
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                                      {agent.name}
                                    </h3>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusConf.color}`}>
                                      {statusConf.label}
                                    </span>
                                    <DifficultyBadge level={agent.difficulty} />
                                    {hasConfig && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10">
                                        Configured
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-dark-400 line-clamp-2">
                                    {agent.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!isComingSoon && (
                                    <>
                                      <button
                                        onClick={() => onToggleAgent(agent.id, !agent.isEnabled)}
                                        className={`p-2 rounded-lg transition-colors ${
                                          agent.isEnabled
                                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20'
                                            : 'bg-gray-100 dark:bg-dark-700 text-gray-400 dark:text-dark-500 hover:bg-gray-200 dark:hover:bg-dark-600'
                                        }`}
                                        title={agent.isEnabled ? 'Pause agent' : 'Enable agent'}
                                      >
                                        {agent.isEnabled ? <Pause size={16} /> : <Play size={16} />}
                                      </button>
                                      <button
                                        onClick={() => setConfiguringAgent(agent)}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-dark-400 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                                        title="Configure"
                                      >
                                        <Settings size={16} />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-dark-400 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                                  >
                                    <ChevronDown
                                      size={16}
                                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 mb-1">
                                        Benefits
                                      </p>
                                      <p className="text-xs text-gray-700 dark:text-dark-300">
                                        {agent.benefits}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 mb-1">
                                        Integrations
                                      </p>
                                      <p className="text-xs text-gray-700 dark:text-dark-300">
                                        {agent.integrations}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Configuration Summary */}
                                  {agent.config && (
                                    <div className="mb-4">
                                      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 mb-2">
                                        Configuration
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {agent.config.sendEmails && (
                                          <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                                            Email enabled
                                          </span>
                                        )}
                                        {agent.config.sendSMS && (
                                          <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded">
                                            SMS enabled
                                          </span>
                                        )}
                                        {agent.config.runSchedule && (
                                          <span className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">
                                            {agent.config.runSchedule}
                                          </span>
                                        )}
                                        {agent.triggers && agent.triggers.length > 0 && (
                                          <span className="text-xs px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                                            {agent.triggers.length} trigger(s)
                                          </span>
                                        )}
                                        {agent.actions && agent.actions.length > 0 && (
                                          <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded">
                                            {agent.actions.length} action(s)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Activity Log */}
                                  {agent.activityLog && agent.activityLog.length > 0 && (
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500">
                                          Recent Activity
                                        </p>
                                        <button
                                          onClick={() => setActiveView('activity')}
                                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                          View all
                                          <ChevronRight size={12} />
                                        </button>
                                      </div>
                                      <AgentActivityLog
                                        activities={agent.activityLog.slice(0, 3)}
                                        onViewPerson={onViewPerson}
                                        maxItems={3}
                                      />
                                    </div>
                                  )}

                                  {/* Activity info */}
                                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-dark-400 mt-3">
                                    {agent.lastRun && (
                                      <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        Last run: {new Date(agent.lastRun).toLocaleDateString()}
                                      </span>
                                    )}
                                    {agent.runsThisWeek !== undefined && (
                                      <span>{agent.runsThisWeek} runs this week</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status bar for active agents */}
                            {agent.isEnabled && agent.status === 'active' && (
                              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/5 border-t border-emerald-100 dark:border-emerald-500/10">
                                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle size={12} />
                                  <span>Running • {agent.runsToday || 0} actions today</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Info Banner */}
      <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
              How Agents Work
            </h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
              Each agent responds to specific triggers (like new donations or birthdays) and performs configured actions
              (like sending emails or creating tasks). Click the <Settings className="inline w-3 h-3" /> icon to configure
              triggers, actions, and notification preferences for each agent.
            </p>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {configuringAgent && (
        <AgentConfigModal
          agent={configuringAgent}
          onSave={handleConfigureSave}
          onClose={() => setConfiguringAgent(null)}
        />
      )}
    </div>
  );
}
