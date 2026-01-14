import { useState } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  Clock,
  Tag,
  Users,
  Bell,
  Zap,
  Plus,
  Trash2,
  ChevronDown,
  Save,
} from 'lucide-react';
import type { AIAgent, AgentConfig, AgentTrigger, AgentTriggerType, AgentAction, AgentActionType, MemberStatus } from '../types';

interface AgentConfigModalProps {
  agent: AIAgent;
  onSave: (agentId: string, config: AgentConfig, triggers: AgentTrigger[], actions: AgentAction[]) => void;
  onClose: () => void;
}

const triggerLabels: Record<AgentTriggerType, string> = {
  new_donation: 'New Donation Received',
  new_member: 'New Member Added',
  birthday: 'Birthday Coming Up',
  anniversary: 'Membership Anniversary',
  attendance_drop: 'Attendance Drop Detected',
  giving_change: 'Significant Giving Change',
  prayer_request: 'New Prayer Request',
  task_due: 'Task Due Soon',
  schedule: 'Scheduled Time',
};

const actionLabels: Record<AgentActionType, string> = {
  send_email: 'Send Email',
  send_sms: 'Send SMS',
  create_task: 'Create Follow-up Task',
  add_tag: 'Add Tag to Person',
  update_status: 'Update Member Status',
  notify_staff: 'Notify Staff Member',
  log_interaction: 'Log Interaction',
};

const statusOptions: MemberStatus[] = ['visitor', 'regular', 'member', 'leader', 'inactive'];

export function AgentConfigModal({ agent, onSave, onClose }: AgentConfigModalProps) {
  const [config, setConfig] = useState<AgentConfig>(agent.config || {
    sendEmails: false,
    sendSMS: false,
    runSchedule: 'realtime',
    notifyOnRun: false,
  });

  const [triggers, setTriggers] = useState<AgentTrigger[]>(agent.triggers || []);
  const [actions, setActions] = useState<AgentAction[]>(agent.actions || []);
  const [activeTab, setActiveTab] = useState<'general' | 'triggers' | 'actions'>('general');

  const handleAddTrigger = (type: AgentTriggerType) => {
    const newTrigger: AgentTrigger = {
      id: `trigger-${Date.now()}`,
      type,
      isActive: true,
    };
    setTriggers([...triggers, newTrigger]);
  };

  const handleRemoveTrigger = (triggerId: string) => {
    setTriggers(triggers.filter(t => t.id !== triggerId));
  };

  const handleAddAction = (type: AgentActionType) => {
    const newAction: AgentAction = {
      id: `action-${Date.now()}`,
      type,
      config: {},
      order: actions.length,
    };
    setActions([...actions, newAction]);
  };

  const handleRemoveAction = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId));
  };

  const handleSave = () => {
    onSave(agent.id, config, triggers, actions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-850 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
              Configure {agent.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
              Set up triggers, actions, and preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-700">
          {(['general', 'triggers', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'triggers' && triggers.length > 0 && (
                <span className="ml-1.5 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 rounded">
                  {triggers.length}
                </span>
              )}
              {tab === 'actions' && actions.length > 0 && (
                <span className="ml-1.5 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 rounded">
                  {actions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Communication */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                  <Mail size={16} />
                  Communication
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Send Emails</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Agent can send automated emails</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.sendEmails}
                      onChange={(e) => setConfig({ ...config, sendEmails: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  {config.sendEmails && (
                    <div className="ml-4 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                      <label className="block text-xs text-gray-500 dark:text-dark-400 mb-1">
                        Email Template
                      </label>
                      <textarea
                        value={config.emailTemplate || ''}
                        onChange={(e) => setConfig({ ...config, emailTemplate: e.target.value })}
                        placeholder="Hi {firstName}, thank you for..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Use {'{firstName}'}, {'{lastName}'}, {'{amount}'} for placeholders
                      </p>
                    </div>
                  )}

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Send SMS</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Agent can send text messages</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.sendSMS}
                      onChange={(e) => setConfig({ ...config, sendSMS: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                  <Clock size={16} />
                  Schedule
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['realtime', 'hourly', 'daily', 'weekly'] as const).map((schedule) => (
                    <button
                      key={schedule}
                      onClick={() => setConfig({ ...config, runSchedule: schedule })}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        config.runSchedule === schedule
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                          : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        config.runSchedule === schedule
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-dark-200'
                      }`}>
                        {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {schedule === 'realtime' && 'Run immediately on trigger'}
                        {schedule === 'hourly' && 'Batch process every hour'}
                        {schedule === 'daily' && 'Run once per day'}
                        {schedule === 'weekly' && 'Run once per week'}
                      </p>
                    </button>
                  ))}
                </div>

                {(config.runSchedule === 'daily' || config.runSchedule === 'weekly') && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 dark:text-dark-400 mb-1">
                      Run at time
                    </label>
                    <input
                      type="time"
                      value={config.runTime || '09:00'}
                      onChange={(e) => setConfig({ ...config, runTime: e.target.value })}
                      className="px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                    />
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Target Audience
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-dark-400 mb-1">
                      Filter by Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            const current = config.targetStatuses || [];
                            const newStatuses = current.includes(status)
                              ? current.filter(s => s !== status)
                              : [...current, status];
                            setConfig({ ...config, targetStatuses: newStatuses });
                          }}
                          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                            (config.targetStatuses || []).includes(status)
                              ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                              : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Leave empty to target all</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-dark-400 mb-1">
                      Filter by Tags
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas"
                      value={(config.targetTags || []).join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        targetTags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3 flex items-center gap-2">
                  <Bell size={16} />
                  Staff Notifications
                </h3>
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Notify on Run</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">Get notified when agent takes action</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.notifyOnRun}
                    onChange={(e) => setConfig({ ...config, notifyOnRun: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                {config.notifyOnRun && (
                  <div className="mt-2">
                    <input
                      type="email"
                      placeholder="Notification email address"
                      value={config.notifyEmail || ''}
                      onChange={(e) => setConfig({ ...config, notifyEmail: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Triggers Tab */}
          {activeTab === 'triggers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  Define what events trigger this agent
                </p>
                <div className="relative group">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1.5">
                    <Plus size={14} />
                    Add Trigger
                    <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 py-1 hidden group-hover:block z-10">
                    {Object.entries(triggerLabels).map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() => handleAddTrigger(type as AgentTriggerType)}
                        disabled={triggers.some(t => t.type === type)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {triggers.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="mx-auto text-gray-300 dark:text-dark-600 mb-2" size={32} />
                  <p className="text-sm text-gray-500 dark:text-dark-400">No triggers configured</p>
                  <p className="text-xs text-gray-400 dark:text-dark-500">Add a trigger to activate this agent</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Zap size={16} className="text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-dark-200">
                            {triggerLabels[trigger.type]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-400">
                            {trigger.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTrigger(trigger.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  Define what the agent does when triggered
                </p>
                <div className="relative group">
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-1.5">
                    <Plus size={14} />
                    Add Action
                    <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 py-1 hidden group-hover:block z-10">
                    {Object.entries(actionLabels).map(([type, label]) => (
                      <button
                        key={type}
                        onClick={() => handleAddAction(type as AgentActionType)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-700"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {actions.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="mx-auto text-gray-300 dark:text-dark-600 mb-2" size={32} />
                  <p className="text-sm text-gray-500 dark:text-dark-400">No actions configured</p>
                  <p className="text-xs text-gray-400 dark:text-dark-500">Add actions for the agent to perform</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-dark-200">
                            {actionLabels[action.type]}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAction(action.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save size={14} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
