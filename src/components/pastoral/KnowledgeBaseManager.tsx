import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  FileText,
  Link,
  Mic,
  File,
  Tag,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  X,
  Database,
  Users,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import type { View } from '../../types';
import { usePastoralCareData } from '../../hooks/usePastoralCareData';

interface KBEntry {
  id: string;
  leaderId: string | null;
  title: string;
  content: string;
  category: string;
  tags: string[];
  sourceType: 'text' | 'document' | 'url' | 'sermon';
  sourceUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseManagerProps {
  setView: (view: View) => void;
  churchId?: string;
}

const CATEGORIES = [
  'general',
  'scripture',
  'counseling',
  'resources',
  'sermons',
  'faq',
  'policy',
] as const;

const SOURCE_TYPES: KBEntry['sourceType'][] = ['text', 'document', 'url', 'sermon'];

const categoryColors: Record<string, { text: string; bg: string }> = {
  general: { text: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-500/10' },
  scripture: { text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
  counseling: { text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-500/10' },
  resources: { text: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-500/10' },
  sermons: { text: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-500/10' },
  faq: { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  policy: { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-500/10' },
};

const sourceTypeIcons: Record<KBEntry['sourceType'], typeof FileText> = {
  text: FileText,
  document: File,
  url: Link,
  sermon: Mic,
};

const sourceTypeLabels: Record<KBEntry['sourceType'], string> = {
  text: 'Text',
  document: 'Document',
  url: 'URL',
  sermon: 'Sermon',
};

const SAMPLE_ENTRIES: KBEntry[] = [
  {
    id: 'kb-1',
    leaderId: 'leader-1',
    title: 'Sunday Sermon: Finding Peace in the Storm',
    content:
      'Key points from Pastor James\u2019s sermon on Mark 4:35-41. Jesus calms the storm and teaches that faith is not the absence of fear but trusting God in the midst of it. Applications for those facing anxiety, job loss, or relational turmoil. Encouragement to remember past faithfulness. Discussion questions included for small group follow-up.',
    category: 'sermons',
    tags: ['peace', 'anxiety', 'faith', 'mark-4'],
    sourceType: 'sermon',
    sourceUrl: null,
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'kb-2',
    leaderId: null,
    title: 'Grief & Loss Counseling Framework',
    content:
      'A structured approach to walking alongside those experiencing grief. Covers the five stages model, biblical lament (Psalms 42, 88, 130), practical care steps (meals, presence, follow-up schedule), and warning signs that professional referral is needed. Includes do\u2019s and don\u2019ts for conversations with the bereaved.',
    category: 'counseling',
    tags: ['grief', 'loss', 'counseling', 'lament', 'referral'],
    sourceType: 'text',
    sourceUrl: null,
    isActive: true,
    createdAt: '2026-01-10T08:30:00Z',
    updatedAt: '2026-01-22T14:00:00Z',
  },
  {
    id: 'kb-3',
    leaderId: null,
    title: 'National Crisis Hotline & Local Resources',
    content:
      'Comprehensive list of external resources for crisis situations. Includes the 988 Suicide & Crisis Lifeline, SAMHSA National Helpline (1-800-662-4357), local shelters, food banks, financial assistance programs, and professional Christian counselors in the area. Updated quarterly.',
    category: 'resources',
    tags: ['crisis', 'hotline', 'referral', 'community'],
    sourceType: 'url',
    sourceUrl: 'https://988lifeline.org',
    isActive: true,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
  },
  {
    id: 'kb-4',
    leaderId: null,
    title: 'FAQ: How to Request Pastoral Care',
    content:
      'Frequently asked questions about the pastoral care process. Covers: how to submit a help request, what to expect from your first conversation, confidentiality policies, when AI vs. live leader is used, how to switch leaders, anonymous mode, and how to escalate concerns. Written for the congregation.',
    category: 'faq',
    tags: ['faq', 'onboarding', 'process', 'confidentiality'],
    sourceType: 'text',
    sourceUrl: null,
    isActive: true,
    createdAt: '2026-01-05T12:00:00Z',
    updatedAt: '2026-01-20T16:00:00Z',
  },
  {
    id: 'kb-5',
    leaderId: 'leader-2',
    title: 'Church Safeguarding & Mandatory Reporting Policy',
    content:
      'Official church policy on safeguarding vulnerable persons. Details mandatory reporting obligations for suspected abuse or neglect, procedures for documenting concerns, escalation chain, and state-specific legal requirements. All pastoral care leaders must review annually. Last board-approved revision: January 2026.',
    category: 'policy',
    tags: ['policy', 'safeguarding', 'mandatory-reporting', 'compliance'],
    sourceType: 'document',
    sourceUrl: null,
    isActive: true,
    createdAt: '2025-11-20T14:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
  },
];

const emptyEntry: Omit<KBEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  leaderId: null,
  title: '',
  content: '',
  category: 'general',
  tags: [],
  sourceType: 'text',
  sourceUrl: null,
  isActive: true,
};

export function KnowledgeBaseManager({ setView, churchId }: KnowledgeBaseManagerProps) {
  const { getLeaderProfiles } = usePastoralCareData(churchId);
  const leaders = getLeaderProfiles();

  const [entries, setEntries] = useState<KBEntry[]>(SAMPLE_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBEntry | null>(null);
  const [formData, setFormData] = useState(emptyEntry);
  const [tagInput, setTagInput] = useState('');

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [entries, searchQuery, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = entries.filter((e) => e.isActive).length;
    const uniqueCategories = new Set(entries.map((e) => e.category)).size;
    const uniqueLeaders = new Set(entries.filter((e) => e.leaderId).map((e) => e.leaderId)).size;
    return { total: entries.length, active, categories: uniqueCategories, leaders: uniqueLeaders };
  }, [entries]);

  const getLeaderName = (leaderId: string | null) => {
    if (!leaderId) return 'All Leaders';
    return leaders.find((l) => l.id === leaderId)?.displayName || 'Unknown';
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setFormData({ ...emptyEntry });
    setTagInput('');
    setShowModal(true);
  };

  const openEditModal = (entry: KBEntry) => {
    setEditingEntry(entry);
    setFormData({
      leaderId: entry.leaderId,
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tags: [...entry.tags],
      sourceType: entry.sourceType,
      sourceUrl: entry.sourceUrl,
      isActive: entry.isActive,
    });
    setTagInput(entry.tags.join(', '));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
    setFormData({ ...emptyEntry });
    setTagInput('');
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntry.id
            ? { ...e, ...formData, tags: parsedTags, updatedAt: now }
            : e
        )
      );
    } else {
      const newEntry: KBEntry = {
        ...formData,
        id: `kb-${Date.now()}`,
        tags: parsedTags,
        createdAt: now,
        updatedAt: now,
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleActive = (id: string) => {
    const now = new Date().toISOString();
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive, updatedAt: now } : e))
    );
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView('care-dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500 dark:text-dark-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <BookOpen className="text-violet-600 dark:text-violet-400" size={24} />
            Knowledge Base
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-0.5 text-sm">
            Manage resources and content that inform AI personas
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400"
          />
          <input
            type="text"
            placeholder="Search by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/10">
            <Database size={16} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-400">Total Entries</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-400">Active</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10">
            <FolderOpen size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-400">Categories</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">
              {stats.categories}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10">
            <Users size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-dark-400">Leaders</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">
              {stats.leaders}
            </p>
          </div>
        </div>
      </div>

      {/* Entry List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-12 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 dark:text-dark-400 mb-3" />
          <p className="text-gray-500 dark:text-dark-400 text-sm">
            {searchQuery || categoryFilter !== 'all'
              ? 'No entries match your filters.'
              : 'No knowledge base entries yet. Click "Add Entry" to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const catStyle = categoryColors[entry.category] || categoryColors.general;
            const SourceIcon = sourceTypeIcons[entry.sourceType];
            return (
              <div
                key={entry.id}
                className={`bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4 transition-opacity ${
                  !entry.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Top row: title, badges, actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-100 truncate">
                        {entry.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${catStyle.bg} ${catStyle.text}`}
                      >
                        {entry.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400">
                        <SourceIcon size={12} />
                        {sourceTypeLabels[entry.sourceType]}
                      </span>
                    </div>

                    {/* Content preview */}
                    <p className="text-sm text-gray-600 dark:text-dark-400 mt-1.5 line-clamp-2">
                      {entry.content.length > 150
                        ? entry.content.substring(0, 150) + '...'
                        : entry.content}
                    </p>

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Tag size={12} className="text-gray-400 dark:text-dark-400 flex-shrink-0" />
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-dark-400">
                      <span>Assigned: {getLeaderName(entry.leaderId)}</span>
                      <span>Created {formatDate(entry.createdAt)}</span>
                      {entry.updatedAt !== entry.createdAt && (
                        <span>Updated {formatDate(entry.updatedAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                      title={entry.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {entry.isActive ? (
                        <ToggleRight size={18} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={18} className="text-gray-400 dark:text-dark-400" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} className="text-gray-500 dark:text-dark-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={closeModal}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200/60 dark:border-white/5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                {editingEntry ? 'Edit Entry' : 'Add Knowledge Base Entry'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              >
                <X size={18} className="text-gray-500 dark:text-dark-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Entry title"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Knowledge base content..."
                  rows={8}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-y"
                />
              </div>

              {/* Category + Source Type row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                    Source Type
                  </label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sourceType: e.target.value as KBEntry['sourceType'],
                        sourceUrl: e.target.value !== 'url' ? null : formData.sourceUrl,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    {SOURCE_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {sourceTypeLabels[st]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source URL (conditional) */}
              {formData.sourceType === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, sourceUrl: e.target.value || null })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. grief, counseling, psalms"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
                {tagInput.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagInput
                      .split(',')
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Leader Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-100 mb-1">
                  Leader Assignment
                </label>
                <select
                  value={formData.leaderId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, leaderId: e.target.value || null })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                >
                  <option value="">All Leaders</option>
                  {leaders
                    .filter((l) => l.isActive)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.displayName}
                      </option>
                    ))}
                </select>
              </div>

              {/* Active checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/10 text-violet-600 focus:ring-violet-500/40"
                />
                <span className="text-sm text-gray-700 dark:text-dark-100">Active</span>
              </label>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200/60 dark:border-white/5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-100 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.content.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {editingEntry ? 'Save Changes' : 'Create Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
