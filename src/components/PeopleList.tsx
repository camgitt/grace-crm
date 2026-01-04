import { useState } from 'react';
import { Search, UserPlus, ChevronRight, Mail, X, CheckSquare, Square } from 'lucide-react';
import { Person, MemberStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface PeopleListProps {
  people: Person[];
  onViewPerson: (id: string) => void;
  onAddPerson: () => void;
  onSendMessage?: (recipients: Person[]) => void;
}

const statusLabels: Record<MemberStatus, string> = {
  visitor: 'Visitor',
  regular: 'Regular',
  member: 'Member',
  leader: 'Leader',
  inactive: 'Inactive'
};

export function PeopleList({ people, onViewPerson, onAddPerson, onSendMessage }: PeopleListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const filtered = people.filter((person) => {
    const matchesSearch =
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      person.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: people.length,
    visitor: people.filter(p => p.status === 'visitor').length,
    regular: people.filter(p => p.status === 'regular').length,
    member: people.filter(p => p.status === 'member').length,
    leader: people.filter(p => p.status === 'leader').length,
    inactive: people.filter(p => p.status === 'inactive').length,
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const selectedPeople = people.filter(p => selectedIds.has(p.id));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">People</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{people.length} total people in your congregation</p>
        </div>
        <div className="flex items-center gap-3">
          {onSendMessage && (
            <button
              onClick={() => setSelectionMode(!selectionMode)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                selectionMode
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {selectionMode ? <X size={18} /> : <CheckSquare size={18} />}
              {selectionMode ? 'Cancel' : 'Select'}
            </button>
          )}
          <button
            onClick={onAddPerson}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <UserPlus size={18} />
            Add Person
          </button>
        </div>
      </div>

      {/* Selection Actions Bar */}
      {selectionMode && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {selectedIds.size} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium"
            >
              Select all ({filtered.length})
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>
          {selectedIds.size > 0 && onSendMessage && (
            <button
              onClick={() => onSendMessage(selectedPeople)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Mail size={16} />
              Send Message ({selectedIds.size})
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'visitor', 'regular', 'member', 'leader', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all' ? 'All' : statusLabels[status]} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((person) => (
          <div
            key={person.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center justify-between transition-all group ${
              selectedIds.has(person.id)
                ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              {selectionMode && (
                <button
                  onClick={() => toggleSelection(person.id)}
                  className="flex-shrink-0"
                >
                  {selectedIds.has(person.id) ? (
                    <CheckSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square size={20} className="text-gray-400 hover:text-indigo-500" />
                  )}
                </button>
              )}
              <button
                onClick={() => selectionMode ? toggleSelection(person.id) : onViewPerson(person.id)}
                className="flex items-center gap-4 text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {person.firstName[0]}{person.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{person.firstName} {person.lastName}</p>
                  <p className="text-sm text-gray-400">{person.email}</p>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {person.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md hidden sm:inline">
                  {tag}
                </span>
              ))}
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[person.status]}`}>
                {statusLabels[person.status]}
              </span>
              {!selectionMode && (
                <button onClick={() => onViewPerson(person.id)}>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No people found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
