import { useState } from 'react';
import {
  Heart,
  Shield,
  CloudRain,
  BookOpen,
  Brain,
  DollarSign,
  Baby,
  AlertTriangle,
  MessageCircle,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { HelpCategory } from '../../types';

interface HelpIntakeFormProps {
  onSubmit: (category: HelpCategory, description: string, isAnonymous: boolean) => void;
  onBack: () => void;
}

const categories: { id: HelpCategory; label: string; description: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  {
    id: 'marriage',
    label: 'Marriage & Relationships',
    description: 'Couples, communication, family',
    icon: <Heart size={24} />,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border-rose-200 dark:border-rose-500/20',
  },
  {
    id: 'addiction',
    label: 'Addiction & Recovery',
    description: 'Substance abuse, behavioral, recovery',
    icon: <Shield size={24} />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 border-orange-200 dark:border-orange-500/20',
  },
  {
    id: 'grief',
    label: 'Grief & Loss',
    description: 'Death, loss, life transitions',
    icon: <CloudRain size={24} />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/20',
  },
  {
    id: 'faith-questions',
    label: 'Faith & Questions',
    description: 'Exploring, doubts, spiritual growth',
    icon: <BookOpen size={24} />,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border-violet-200 dark:border-violet-500/20',
  },
  {
    id: 'anxiety-depression',
    label: 'Anxiety & Depression',
    description: 'Emotional support, coping strategies',
    icon: <Brain size={24} />,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 border-teal-200 dark:border-teal-500/20',
  },
  {
    id: 'financial',
    label: 'Financial Struggles',
    description: 'Money stress, budgeting, resources',
    icon: <DollarSign size={24} />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/20',
  },
  {
    id: 'parenting',
    label: 'Parenting',
    description: 'Raising kids, family challenges',
    icon: <Baby size={24} />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/20',
  },
  {
    id: 'crisis',
    label: 'Crisis / Urgent',
    description: 'Immediate help needed',
    icon: <AlertTriangle size={24} />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/20',
  },
  {
    id: 'general',
    label: 'Just Need to Talk',
    description: 'General support, listening ear',
    icon: <MessageCircle size={24} />,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-500/10 hover:bg-gray-100 dark:hover:bg-gray-500/20 border-gray-200 dark:border-gray-500/20',
  },
];

export function HelpIntakeForm({ onSubmit, onBack }: HelpIntakeFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showCrisisWarning, setShowCrisisWarning] = useState(false);

  const handleCategorySelect = (id: HelpCategory) => {
    setSelectedCategory(id);
    if (id === 'crisis') {
      setShowCrisisWarning(true);
    } else {
      setShowCrisisWarning(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedCategory) return;
    onSubmit(selectedCategory, description, isAnonymous);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Care Team
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-2">
          How Can We Help?
        </h1>
        <p className="text-gray-500 dark:text-dark-400 max-w-lg mx-auto">
          Select the area you'd like to talk about. You'll be connected with a trained care leader who specializes in that area.
        </p>
      </div>

      {/* Crisis Warning */}
      {showCrisisWarning && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                If you are in immediate danger, please call 911
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                You can also reach these resources 24/7:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                <li><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                <li><strong>Domestic Violence Hotline:</strong> 1-800-799-7233</li>
              </ul>
              <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                You can still continue to chat with one of our care team — we're here for you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedCategory === cat.id
                ? `${cat.bgColor} border-current ring-2 ring-offset-2 dark:ring-offset-dark-900 ring-current`
                : `${cat.bgColor} border-transparent`
            }`}
          >
            <span className={`mt-0.5 ${cat.color}`}>{cat.icon}</span>
            <div>
              <p className={`font-medium text-sm ${cat.color}`}>{cat.label}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                {cat.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Description (optional) */}
      {selectedCategory && (
        <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1.5">
              Tell us more <span className="text-gray-400 dark:text-dark-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share anything that would help us understand your situation better..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm text-gray-900 dark:text-dark-100 placeholder:text-gray-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Anonymous Toggle */}
          <button
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-colors ${
              isAnonymous
                ? 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20'
                : 'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:bg-gray-100 dark:hover:bg-dark-750'
            }`}
          >
            {isAnonymous ? (
              <EyeOff size={18} className="text-violet-600 dark:text-violet-400" />
            ) : (
              <Eye size={18} className="text-gray-400 dark:text-dark-500" />
            )}
            <div className="text-left flex-1">
              <p className={`text-sm font-medium ${isAnonymous ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-dark-300'}`}>
                {isAnonymous ? 'Anonymous mode — on' : 'Remain anonymous'}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-400">
                {isAnonymous ? 'Your identity will not be shared' : 'No one will know who you are'}
              </p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${
              isAnonymous ? 'bg-violet-600 justify-end' : 'bg-gray-300 dark:bg-dark-600 justify-start'
            }`}>
              <span className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
            </div>
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md"
          >
            Start Conversation
          </button>

          {/* Privacy Note */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-dark-500">
            <Lock size={12} />
            Private & confidential — you'll be connected with a trained care leader
          </p>
        </div>
      )}
    </div>
  );
}
