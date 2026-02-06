import { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Shield,
  User,
  Sliders,
} from 'lucide-react';
import type { LeaderProfile, HelpCategory, AIPersona } from '../../types';

interface LeaderManagerProps {
  leaders: LeaderProfile[];
  personas: AIPersona[];
  onAddLeader: (leader: Omit<LeaderProfile, 'id' | 'createdAt'>) => void;
  onUpdateLeader: (id: string, updates: Partial<LeaderProfile>) => void;
  onRemoveLeader: (id: string) => void;
  onUpdatePersona: (leaderId: string, persona: Partial<AIPersona>) => void;
  onBack: () => void;
}

const ALL_CATEGORIES: { id: HelpCategory; label: string }[] = [
  { id: 'marriage', label: 'Marriage & Relationships' },
  { id: 'addiction', label: 'Addiction & Recovery' },
  { id: 'grief', label: 'Grief & Loss' },
  { id: 'faith-questions', label: 'Faith Questions' },
  { id: 'crisis', label: 'Crisis / Urgent' },
  { id: 'financial', label: 'Financial Help' },
  { id: 'anxiety-depression', label: 'Anxiety & Depression' },
  { id: 'parenting', label: 'Parenting' },
  { id: 'general', label: 'General' },
];

const TONE_LABELS: Record<string, { label: string; low: string; high: string }> = {
  warmth: { label: 'Warmth', low: 'Clinical', high: 'Warm' },
  formality: { label: 'Formality', low: 'Casual', high: 'Formal' },
  directness: { label: 'Directness', low: 'Gentle', high: 'Direct' },
  faithLevel: { label: 'Faith Level', low: 'Secular', high: 'Scripture-heavy' },
};

type ManagerView = 'list' | 'edit' | 'persona';

interface LeaderFormData {
  displayName: string;
  title: string;
  bio: string;
  expertiseAreas: HelpCategory[];
  isAvailable: boolean;
  isActive: boolean;
}

const EMPTY_FORM: LeaderFormData = {
  displayName: '',
  title: '',
  bio: '',
  expertiseAreas: [],
  isAvailable: false,
  isActive: true,
};

export function LeaderManager({
  leaders,
  personas,
  onAddLeader,
  onUpdateLeader,
  onRemoveLeader,
  onUpdatePersona,
  onBack,
}: LeaderManagerProps) {
  const [view, setView] = useState<ManagerView>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LeaderFormData>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newBoundary, setNewBoundary] = useState('');

  const handleEdit = (leader: LeaderProfile) => {
    setEditingId(leader.id);
    setForm({
      displayName: leader.displayName,
      title: leader.title,
      bio: leader.bio,
      expertiseAreas: [...leader.expertiseAreas],
      isAvailable: leader.isAvailable,
      isActive: leader.isActive,
    });
    setView('edit');
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setView('edit');
  };

  const handleSave = () => {
    if (!form.displayName.trim()) return;

    if (editingId) {
      onUpdateLeader(editingId, {
        displayName: form.displayName.trim(),
        title: form.title.trim(),
        bio: form.bio.trim(),
        expertiseAreas: form.expertiseAreas,
        isAvailable: form.isAvailable,
        isActive: form.isActive,
      });
    } else {
      onAddLeader({
        displayName: form.displayName.trim(),
        title: form.title.trim(),
        bio: form.bio.trim(),
        expertiseAreas: form.expertiseAreas,
        isAvailable: form.isAvailable,
        isActive: form.isActive,
      });
    }
    setView('list');
  };

  const handleDelete = (id: string) => {
    onRemoveLeader(id);
    setConfirmDelete(null);
  };

  const toggleExpertise = (cat: HelpCategory) => {
    setForm(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(cat)
        ? prev.expertiseAreas.filter(c => c !== cat)
        : [...prev.expertiseAreas, cat],
    }));
  };

  const handlePersonaEdit = (leaderId: string) => {
    setEditingId(leaderId);
    setView('persona');
  };

  const getPersona = (leaderId: string) =>
    personas.find(p => p.leaderId === leaderId);

  // ---- Persona Editor View ----
  if (view === 'persona' && editingId) {
    const leader = leaders.find(l => l.id === editingId);
    const persona = getPersona(editingId);
    const tone = persona?.tone ?? { warmth: 7, formality: 4, directness: 5, faithLevel: 6 };
    const boundaries = persona?.boundaries ?? [];

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ChevronLeft size={16} />
          Back to leaders
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders size={20} className="text-violet-600" />
            AI Persona — {leader?.displayName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure how the AI responds on behalf of this leader
          </p>
        </div>

        {/* Tone Sliders */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tone Settings</h3>
          <div className="space-y-5">
            {Object.entries(TONE_LABELS).map(([key, config]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label}</label>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {(tone as Record<string, number>)[key]}/10
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 w-16 text-right">{config.low}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={(tone as Record<string, number>)[key]}
                    onChange={(e) => {
                      onUpdatePersona(editingId, {
                        tone: { ...tone, [key]: parseInt(e.target.value) },
                      });
                    }}
                    className="flex-1 h-2 bg-gray-200 dark:bg-dark-600 rounded-full appearance-none cursor-pointer accent-violet-600"
                  />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 w-16">{config.high}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boundaries */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Boundaries</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Topics the AI should not handle alone — it will escalate to a human leader instead
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {boundaries.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
              >
                {b}
                <button
                  onClick={() => {
                    onUpdatePersona(editingId, {
                      boundaries: boundaries.filter((_, idx) => idx !== i),
                    });
                  }}
                  className="ml-0.5 hover:text-amber-900 dark:hover:text-amber-300"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {boundaries.length === 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">No boundaries set</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newBoundary}
              onChange={(e) => setNewBoundary(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newBoundary.trim()) {
                  onUpdatePersona(editingId, {
                    boundaries: [...boundaries, newBoundary.trim()],
                  });
                  setNewBoundary('');
                }
              }}
              placeholder="e.g., Medication advice, Legal counsel..."
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                if (newBoundary.trim()) {
                  onUpdatePersona(editingId, {
                    boundaries: [...boundaries, newBoundary.trim()],
                  });
                  setNewBoundary('');
                }
              }}
              className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* System prompt */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">System Prompt</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Base instructions for the AI when responding as this leader's persona
          </p>
          <textarea
            value={persona?.systemPrompt ?? ''}
            onChange={(e) => onUpdatePersona(editingId, { systemPrompt: e.target.value })}
            placeholder="You are a compassionate pastoral care assistant representing..."
            rows={5}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-dark-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    );
  }

  // ---- Edit/Create View ----
  if (view === 'edit') {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <ChevronLeft size={16} />
          Back to leaders
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          {editingId ? 'Edit Leader' : 'Add New Leader'}
        </h2>

        <div className="space-y-5">
          {/* Name & title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Display Name *
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Pastor John Smith"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-dark-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Senior Pastor — Marriage & Family"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-dark-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief biography and background..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-dark-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Expertise areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expertise Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(cat => {
                const active = form.expertiseAreas.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleExpertise(cat.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      active
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-violet-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Available Now</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.displayName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Save size={16} />
              {editingId ? 'Save Changes' : 'Add Leader'}
            </button>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- List View ----
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield size={20} className="text-violet-600" />
              Manage Leaders
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add, edit, and configure pastoral care leaders
            </p>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Leader
        </button>
      </div>

      <div className="space-y-3">
        {leaders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No leaders yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add your first pastoral care leader to get started.
            </p>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={16} />
              Add Leader
            </button>
          </div>
        ) : (
          leaders.map(leader => {
            const persona = getPersona(leader.id);
            return (
              <div
                key={leader.id}
                className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-800 ${
                      leader.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{leader.displayName}</h3>
                      {!leader.isActive && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-500/10 text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{leader.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {leader.expertiseAreas.map(area => (
                        <span
                          key={area}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        >
                          {ALL_CATEGORIES.find(c => c.id === area)?.label ?? area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handlePersonaEdit(leader.id)}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
                      title="Configure AI Persona"
                    >
                      <Sliders size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(leader)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(leader.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Persona status */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <Sliders size={12} />
                    {persona ? (
                      <span>Persona configured — Warmth: {persona.tone.warmth}/10, Faith: {persona.tone.faithLevel}/10</span>
                    ) : (
                      <span className="italic">No persona configured</span>
                    )}
                  </div>
                  {!persona && (
                    <button
                      onClick={() => handlePersonaEdit(leader.id)}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Set up persona
                    </button>
                  )}
                </div>

                {/* Delete confirmation */}
                {confirmDelete === leader.id && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                      Remove {leader.displayName}? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(leader.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-xs font-medium hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
