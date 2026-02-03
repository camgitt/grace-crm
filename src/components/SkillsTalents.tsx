import { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Music,
  Camera,
  Wrench,
  Heart,
  BookOpen,
  Coffee,
  Car,
  Laptop,
  Palette,
  Globe,
  Baby,
  Shield,
  X,
  Check,
} from 'lucide-react';
import type { Person } from '../types';

// Skill categories with icons
const SKILL_CATEGORIES = [
  { id: 'music', name: 'Music & Worship', icon: Music, color: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'teaching', name: 'Teaching', icon: BookOpen, color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'hospitality', name: 'Hospitality', icon: Coffee, color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'technical', name: 'Technical/AV', icon: Laptop, color: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { id: 'childcare', name: 'Children\'s Ministry', icon: Baby, color: 'bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { id: 'counseling', name: 'Counseling/Care', icon: Heart, color: 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
  { id: 'administration', name: 'Administration', icon: Shield, color: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { id: 'creative', name: 'Creative Arts', icon: Palette, color: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: 'outreach', name: 'Outreach/Missions', icon: Globe, color: 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' },
  { id: 'transportation', name: 'Transportation', icon: Car, color: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { id: 'photography', name: 'Photography/Video', icon: Camera, color: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'maintenance', name: 'Maintenance', icon: Wrench, color: 'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400' },
];

// Sample skills for people (in production, this would come from database)
const SAMPLE_PERSON_SKILLS: Record<string, string[]> = {};

interface SkillsTalentsProps {
  people: Person[];
  onViewPerson?: (personId: string) => void;
}

export function SkillsTalents({ people, onViewPerson }: SkillsTalentsProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  // Assign random skills to people for demo purposes
  const personSkills = useMemo(() => {
    const skills: Record<string, string[]> = { ...SAMPLE_PERSON_SKILLS };
    people.forEach(person => {
      if (!skills[person.id]) {
        // Randomly assign 1-3 skills for demo
        const numSkills = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...SKILL_CATEGORIES].sort(() => Math.random() - 0.5);
        skills[person.id] = shuffled.slice(0, numSkills).map(s => s.id);
      }
    });
    return skills;
  }, [people]);

  // Get people with a specific skill
  const getPeopleWithSkill = (skillId: string) => {
    return people.filter(p => personSkills[p.id]?.includes(skillId));
  };

  // Get skill stats
  const skillStats = useMemo(() => {
    const stats: Record<string, number> = {};
    SKILL_CATEGORIES.forEach(cat => {
      stats[cat.id] = getPeopleWithSkill(cat.id).length;
    });
    return stats;
  }, [personSkills, people]);

  // Filter people by search and category
  const filteredPeople = useMemo(() => {
    let filtered = people;

    if (selectedCategory) {
      filtered = filtered.filter(p => personSkills[p.id]?.includes(selectedCategory));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchLower) ||
        personSkills[p.id]?.some(skillId => {
          const skill = SKILL_CATEGORIES.find(s => s.id === skillId);
          return skill?.name.toLowerCase().includes(searchLower);
        })
      );
    }

    return filtered;
  }, [people, search, selectedCategory, personSkills]);

  const selectedCategoryData = SKILL_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">Skills & Talents</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            Track member skills for volunteer coordination
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Skill
        </button>
      </div>

      {/* Skill Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {SKILL_CATEGORIES.map(category => {
          const Icon = category.icon;
          const count = skillStats[category.id];
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-850 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${category.color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-dark-100 text-sm">{category.name}</h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                {count} {count === 1 ? 'person' : 'people'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search people or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
          >
            <X size={16} />
            Clear filter
          </button>
        )}
      </div>

      {/* People List */}
      <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="font-semibold text-gray-900 dark:text-dark-100">
            {selectedCategoryData ? `${selectedCategoryData.name} Volunteers` : 'All Members'} ({filteredPeople.length})
          </h2>
        </div>

        {filteredPeople.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
            <p className="text-gray-500 dark:text-dark-400">No members found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-700">
            {filteredPeople.map(person => {
              const skills = personSkills[person.id] || [];
              return (
                <div
                  key={person.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-dark-800"
                >
                  <div
                    onClick={() => onViewPerson?.(person.id)}
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium cursor-pointer"
                  >
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                  <div
                    onClick={() => onViewPerson?.(person.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p className="font-medium text-gray-900 dark:text-dark-100">
                      {person.firstName} {person.lastName}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {skills.map(skillId => {
                        const skill = SKILL_CATEGORIES.find(s => s.id === skillId);
                        if (!skill) return null;
                        return (
                          <span
                            key={skillId}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${skill.color}`}
                          >
                            {skill.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPerson(person)}
                    className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg"
                  >
                    Edit Skills
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Skills Modal */}
      {editingPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                Edit Skills - {editingPerson.firstName} {editingPerson.lastName}
              </h2>
              <button
                onClick={() => setEditingPerson(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-2">
              {SKILL_CATEGORIES.map(category => {
                const Icon = category.icon;
                const hasSkill = personSkills[editingPerson.id]?.includes(category.id);

                return (
                  <button
                    key={category.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      hasSkill
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-gray-200 dark:border-dark-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="flex-1 font-medium text-gray-900 dark:text-dark-100 text-sm">
                      {category.name}
                    </span>
                    {hasSkill && <Check className="text-indigo-600 dark:text-indigo-400" size={18} />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingPerson(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-dark-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingPerson(null)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Add New Skill Category</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-400 mb-4">
              Custom skill categories will be available in a future update.
              For now, use the existing categories to track member skills.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
