import { useState } from 'react';
import {
  Save,
  X,
  Plus,
  Trash2,
  ChevronDown,
  BookOpen,
  Brain,
  Globe,
  Sparkles,
  Users,
  Shield,
  Heart,
} from 'lucide-react';
import type { LeaderProfile, HelpCategory } from '../../types';

interface LeaderSettingsFormProps {
  leader?: LeaderProfile;
  onSave: (data: Partial<LeaderProfile>) => void;
  onCancel: () => void;
}

const EXPERTISE_OPTIONS: { value: HelpCategory; label: string }[] = [
  { value: 'marriage', label: 'Marriage & Relationships' },
  { value: 'addiction', label: 'Addiction & Recovery' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'faith-questions', label: 'Faith Questions' },
  { value: 'crisis', label: 'Crisis/Urgent' },
  { value: 'financial', label: 'Financial Help' },
  { value: 'anxiety-depression', label: 'Anxiety & Depression' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'general', label: 'General Pastoral Care' },
];

const PERSONALITY_OPTIONS = [
  'Warm', 'Patient', 'Empathetic', 'Direct', 'Gentle', 'Comforting',
  'Nurturing', 'Encouraging', 'Coaching', 'Scholarly', 'Humorous',
  'Curious', 'Compassionate', 'Firm', 'Calming', 'Motivating',
  'Reflective', 'Analytical', 'Supportive', 'Authoritative',
];

const SPIRITUAL_FOCUS_OPTIONS = [
  'Prayer Ministry', 'Marriage Enrichment', 'Family Restoration',
  'Grief Support', 'Crisis Intervention', 'Contemplative Prayer',
  'Recovery Ministry', 'Accountability Groups', 'Financial Stewardship',
  'Apologetics', 'Bible Study', 'Youth Discipleship',
  'Worship & Praise', 'Missions', 'Community Outreach',
  'Inner Healing', 'Deliverance Ministry', 'Prophetic Ministry',
];

const SUITABLE_FOR_OPTIONS = [
  'Adults', 'Young Adults', 'Youth', 'Seniors', 'Couples',
  'Families', 'Students', 'Men', 'Women', 'Children',
];

const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'Portuguese', 'Korean',
  'Mandarin', 'Arabic', 'Swahili', 'Hindi', 'Tagalog',
];

export function LeaderSettingsForm({ leader, onSave, onCancel }: LeaderSettingsFormProps) {
  const [displayName, setDisplayName] = useState(leader?.displayName || '');
  const [title, setTitle] = useState(leader?.title || '');
  const [bio, setBio] = useState(leader?.bio || '');
  const [language, setLanguage] = useState(leader?.language || 'English');
  const [expertiseAreas, setExpertiseAreas] = useState<HelpCategory[]>(leader?.expertiseAreas || []);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(leader?.personalityTraits || []);
  const [spiritualFocusAreas, setSpiritualFocusAreas] = useState<string[]>(leader?.spiritualFocusAreas || []);
  const [suitableFor, setSuitableFor] = useState<string[]>(leader?.suitableFor || []);
  const [credentials, setCredentials] = useState<string[]>(leader?.credentials || []);
  const [newCredential, setNewCredential] = useState('');
  const [anchorVerse, setAnchorVerse] = useState(leader?.anchorVerse || '');
  const [yearsOfPractice, setYearsOfPractice] = useState(leader?.yearsOfPractice?.toString() || '');
  const [isAvailable, setIsAvailable] = useState(leader?.isAvailable ?? true);

  const togglePill = <T,>(list: T[], setList: (v: T[]) => void, item: T) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const addCredential = () => {
    const trimmed = newCredential.trim();
    if (trimmed && !credentials.includes(trimmed)) {
      setCredentials([...credentials, trimmed]);
      setNewCredential('');
    }
  };

  const removeCredential = (cred: string) => {
    setCredentials(credentials.filter(c => c !== cred));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName,
      title,
      bio,
      language,
      expertiseAreas,
      personalityTraits,
      spiritualFocusAreas,
      suitableFor,
      credentials,
      anchorVerse: anchorVerse || undefined,
      yearsOfPractice: yearsOfPractice ? parseInt(yearsOfPractice, 10) : undefined,
      isAvailable,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {leader ? 'Edit Leader Profile' : 'Register New Leader'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-dark-400 bg-gray-100 dark:bg-dark-700 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors"
          >
            <Save size={16} />
            {leader ? 'Save Changes' : 'Create Leader'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-violet-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Pastor John Smith"
              required
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1.5">Title / Role</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Psycho-Spiritual Counselor"
              required
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1.5">Language</label>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                {LANGUAGE_OPTIONS.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1.5">Years of Practice</label>
            <input
              type="number"
              value={yearsOfPractice}
              onChange={e => setYearsOfPractice(e.target.value)}
              placeholder="10"
              min="0"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1.5">Bio / About</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Describe this leader's background, ministry focus, and approach to pastoral care..."
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-dark-300">
              {isAvailable ? 'Available for Sessions' : 'Currently Unavailable'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isAvailable ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-dark-600'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              isAvailable ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Education & Credentials</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {credentials.map(cred => (
            <span
              key={cred}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
            >
              {cred}
              <button type="button" onClick={() => removeCredential(cred)} className="hover:text-red-500 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCredential}
            onChange={e => setNewCredential(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCredential(); } }}
            placeholder="Add credential (e.g., M.Div — Fuller Seminary)"
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={addCredential}
            className="px-4 py-2.5 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </section>

      {/* Areas of Expertise */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-violet-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Areas of Expertise</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-400">Select the areas this leader specializes in for AI matching.</p>

        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.map(opt => {
            const selected = expertiseAreas.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => togglePill(expertiseAreas, setExpertiseAreas, opt.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selected
                    ? 'bg-violet-600 text-white border-violet-600 dark:bg-violet-500 dark:border-violet-500'
                    : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-dark-400 border-gray-200 dark:border-dark-600 hover:border-violet-300 dark:hover:border-violet-500/30'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Personality Traits */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={16} className="text-emerald-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">AI Personality Traits</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-400">Choose traits that define how the AI counselor persona will communicate.</p>

        <div className="flex flex-wrap gap-2">
          {PERSONALITY_OPTIONS.map(trait => {
            const selected = personalityTraits.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                onClick={() => togglePill(personalityTraits, setPersonalityTraits, trait)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selected
                    ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500'
                    : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-dark-400 border-gray-200 dark:border-dark-600 hover:border-emerald-300 dark:hover:border-emerald-500/30'
                }`}
              >
                {trait}
              </button>
            );
          })}
        </div>
      </section>

      {/* Spiritual Focus Areas */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Spiritual Focus Areas</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {SPIRITUAL_FOCUS_OPTIONS.map(area => {
            const selected = spiritualFocusAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => togglePill(spiritualFocusAreas, setSpiritualFocusAreas, area)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selected
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                    : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-dark-400 border-gray-200 dark:border-dark-600 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
      </section>

      {/* Suitable For */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Suitable For</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-400">Select the audiences this leader is best suited to serve.</p>

        <div className="flex flex-wrap gap-2">
          {SUITABLE_FOR_OPTIONS.map(audience => {
            const selected = suitableFor.includes(audience);
            return (
              <button
                key={audience}
                type="button"
                onClick={() => togglePill(suitableFor, setSuitableFor, audience)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  selected
                    ? 'bg-amber-500 text-white border-amber-500 dark:bg-amber-500 dark:border-amber-500'
                    : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-dark-400 border-gray-200 dark:border-dark-600 hover:border-amber-300 dark:hover:border-amber-500/30'
                }`}
              >
                {audience}
              </button>
            );
          })}
        </div>
      </section>

      {/* Guiding Scripture */}
      <section className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Guiding Scripture</h3>
        </div>

        <input
          type="text"
          value={anchorVerse}
          onChange={e => setAnchorVerse(e.target.value)}
          placeholder="Bear one another's burdens, and so fulfill the law of Christ. — Galatians 6:2"
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all italic"
        />
      </section>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2">
        {leader && (
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
            Deactivate Leader
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-dark-400 bg-gray-100 dark:bg-dark-700 rounded-xl hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Save size={16} />
            {leader ? 'Save Changes' : 'Create Leader'}
          </button>
        </div>
      </div>
    </form>
  );
}
