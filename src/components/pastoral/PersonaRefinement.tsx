import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Pencil,
  Save,
  Bot,
  User,
  Send,
  Loader2,
  Plus,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import type { View, AIPersona, LeaderProfile, CareMessage } from '../../types';
import { usePastoralCareData } from '../../hooks/usePastoralCareData';
import { generatePersonaResponse } from '../../lib/services/personaChat';

interface PersonaRefinementProps {
  setView: (view: View) => void;
  churchId?: string;
}

type TabId = 'review' | 'test' | 'tone';

type ToneKey = keyof AIPersona['tone'];

interface Correction {
  messageId: string;
  personaId: string;
  conversationId: string;
  original: string;
  corrected: string;
  note: string;
  status: 'pending';
}

interface TestChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
}

const TONE_FIELDS: { key: ToneKey; label: string; low: string; high: string }[] = [
  { key: 'warmth', label: 'Warmth', low: 'Cool', high: 'Warm' },
  { key: 'formality', label: 'Formality', low: 'Casual', high: 'Formal' },
  { key: 'directness', label: 'Directness', low: 'Gentle', high: 'Direct' },
  { key: 'humor', label: 'Humor', low: 'Serious', high: 'Humorous' },
  { key: 'faithLevel', label: 'Faith Level', low: 'Light', high: 'Scripture-rich' },
];

export function PersonaRefinement({ setView, churchId }: PersonaRefinementProps) {
  const { conversations, getLeaderProfiles, getAIPersonas } = usePastoralCareData(churchId);

  const leaders: LeaderProfile[] = getLeaderProfiles();
  const personas: AIPersona[] = getAIPersonas();

  const [activeTab, setActiveTab] = useState<TabId>('review');

  // ============================================
  // REVIEW RESPONSES STATE
  // ============================================
  const [filterPersonaId, setFilterPersonaId] = useState<string>('all');
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [approvedMessages, setApprovedMessages] = useState<Set<string>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');

  // ============================================
  // TEST PERSONA STATE
  // ============================================
  const [testPersonaId, setTestPersonaId] = useState<string>('');
  const [testMessages, setTestMessages] = useState<TestChatMessage[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const testEndRef = useRef<HTMLDivElement>(null);
  const testInputRef = useRef<HTMLTextAreaElement>(null);

  // ============================================
  // TONE SETTINGS STATE
  // ============================================
  const [tonePersonaId, setTonePersonaId] = useState<string>('');
  const [editedTone, setEditedTone] = useState<AIPersona['tone'] | null>(null);
  const [editedBoundaries, setEditedBoundaries] = useState<string[]>([]);
  const [newBoundary, setNewBoundary] = useState('');
  const [toneSaved, setToneSaved] = useState(false);

  // ============================================
  // COMPUTED: Review items
  // ============================================
  const reviewItems = useMemo(() => {
    const items: Array<{
      aiMessageId: string;
      aiContent: string;
      userContent: string | null;
      conversationId: string;
      personaId: string;
      personaName: string;
      leaderName: string;
      createdAt: string;
    }> = [];

    for (const conv of conversations) {
      if (filterPersonaId !== 'all' && conv.persona_id !== filterPersonaId) continue;

      const persona = personas.find(p => p.id === conv.persona_id);
      const leader = leaders.find(l => l.id === conv.leader_id);

      for (let i = 0; i < conv.messages.length; i++) {
        const msg = conv.messages[i];
        if (msg.sender !== 'ai') continue;

        let userContent: string | null = null;
        for (let j = i - 1; j >= 0; j--) {
          if (conv.messages[j].sender === 'user') {
            userContent = conv.messages[j].content;
            break;
          }
        }

        items.push({
          aiMessageId: msg.id,
          aiContent: msg.content,
          userContent,
          conversationId: conv.id,
          personaId: conv.persona_id,
          personaName: persona?.name || 'Unknown',
          leaderName: leader?.displayName || 'Unknown',
          createdAt: msg.created_at,
        });
      }
    }

    return items;
  }, [conversations, personas, leaders, filterPersonaId]);

  const pendingCount = corrections.filter(c => c.status === 'pending').length;

  // ============================================
  // COMPUTED: Selected test persona/leader
  // ============================================
  const selectedTestPersona: AIPersona | undefined = personas.find(p => p.id === testPersonaId);
  const selectedTestLeader: LeaderProfile | undefined = selectedTestPersona
    ? leaders.find(l => l.id === selectedTestPersona.leaderId)
    : undefined;

  // ============================================
  // COMPUTED: Selected tone persona
  // ============================================
  const selectedTonePersona: AIPersona | undefined = personas.find(p => p.id === tonePersonaId);

  // ============================================
  // EFFECTS
  // ============================================

  // Scroll test chat on new messages
  useEffect(() => {
    testEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [testMessages]);

  // Reset test messages when persona changes
  useEffect(() => {
    setTestMessages([]);
    setTestInput('');
  }, [testPersonaId]);

  // Initialize tone settings when persona changes
  useEffect(() => {
    if (tonePersonaId) {
      const persona = personas.find(p => p.id === tonePersonaId);
      if (persona) {
        setEditedTone({ ...persona.tone });
        setEditedBoundaries([...persona.boundaries]);
        setToneSaved(false);
      }
    } else {
      setEditedTone(null);
      setEditedBoundaries([]);
    }
  }, [tonePersonaId, personas]);

  // Clear editing state when filter changes
  useEffect(() => {
    setEditingMessageId(null);
    setCorrectionText('');
    setCorrectionNote('');
  }, [filterPersonaId]);

  // ============================================
  // HANDLERS: Review
  // ============================================
  const handleApprove = (messageId: string) => {
    setApprovedMessages(prev => new Set(prev).add(messageId));
    if (editingMessageId === messageId) {
      setEditingMessageId(null);
      setCorrectionText('');
      setCorrectionNote('');
    }
  };

  const handleStartCorrection = (messageId: string, originalContent: string) => {
    setEditingMessageId(messageId);
    setCorrectionText(originalContent);
    setCorrectionNote('');
  };

  const handleSaveCorrection = (
    messageId: string,
    personaId: string,
    conversationId: string,
    original: string,
  ) => {
    const correction: Correction = {
      messageId,
      personaId,
      conversationId,
      original,
      corrected: correctionText,
      note: correctionNote,
      status: 'pending',
    };
    setCorrections(prev => [...prev, correction]);
    setEditingMessageId(null);
    setCorrectionText('');
    setCorrectionNote('');
  };

  const handleCancelCorrection = () => {
    setEditingMessageId(null);
    setCorrectionText('');
    setCorrectionNote('');
  };

  // ============================================
  // HANDLERS: Test Chat
  // ============================================
  const handleTestSend = async () => {
    const text = testInput.trim();
    if (!text || testLoading || !selectedTestPersona || !selectedTestLeader) return;

    const userMsg: TestChatMessage = {
      id: `test-${Date.now()}-user`,
      sender: 'user',
      content: text,
    };

    const updatedMessages = [...testMessages, userMsg];
    setTestMessages(updatedMessages);
    setTestInput('');
    setTestLoading(true);

    const careMessages: CareMessage[] = updatedMessages.map(m => ({
      id: m.id,
      conversationId: 'test-session',
      sender: m.sender,
      senderName: m.sender === 'user' ? 'Test User' : selectedTestPersona.name,
      content: m.content,
      timestamp: new Date().toISOString(),
    }));

    try {
      const result = await generatePersonaResponse(
        selectedTestPersona,
        selectedTestLeader,
        careMessages,
        text,
      );

      setTestMessages(prev => [
        ...prev,
        {
          id: `test-${Date.now()}-ai`,
          sender: 'ai',
          content: result.text,
        },
      ]);
    } catch {
      setTestMessages(prev => [
        ...prev,
        {
          id: `test-${Date.now()}-error`,
          sender: 'ai',
          content: "Sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    }

    setTestLoading(false);
    testInputRef.current?.focus();
  };

  const handleTestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTestSend();
    }
  };

  // ============================================
  // HANDLERS: Tone Settings
  // ============================================
  const handleToneChange = (key: ToneKey, value: number) => {
    if (!editedTone) return;
    setEditedTone({ ...editedTone, [key]: value });
    setToneSaved(false);
  };

  const handleAddBoundary = () => {
    const text = newBoundary.trim();
    if (!text) return;
    setEditedBoundaries(prev => [...prev, text]);
    setNewBoundary('');
    setToneSaved(false);
  };

  const handleRemoveBoundary = (index: number) => {
    setEditedBoundaries(prev => prev.filter((_, i) => i !== index));
    setToneSaved(false);
  };

  const handleSaveTone = () => {
    setToneSaved(true);
    setTimeout(() => setToneSaved(false), 3000);
  };

  // ============================================
  // HELPERS
  // ============================================
  const getPersonaLabel = (persona: AIPersona) => {
    const leader = leaders.find(l => l.id === persona.leaderId);
    return `${persona.name} (${leader?.displayName || 'Unknown'})`;
  };

  // ============================================
  // RENDER
  // ============================================
  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'review',
      label: 'Review Responses',
      icon: <MessageSquare size={14} />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'test', label: 'Test Persona', icon: <Bot size={14} /> },
    { id: 'tone', label: 'Tone Settings', icon: <SlidersHorizontal size={14} /> },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
            Persona Refinement
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-0.5 text-sm">
            Review AI responses, test personas, and adjust tone settings
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-200/60 dark:border-white/5 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-violet-600 dark:border-violet-400 text-violet-700 dark:text-violet-400'
                : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'review' && (
        <ReviewTab
          personas={personas}
          reviewItems={reviewItems}
          corrections={corrections}
          approvedMessages={approvedMessages}
          editingMessageId={editingMessageId}
          correctionText={correctionText}
          correctionNote={correctionNote}
          filterPersonaId={filterPersonaId}
          pendingCount={pendingCount}
          onFilterChange={setFilterPersonaId}
          onApprove={handleApprove}
          onStartCorrection={handleStartCorrection}
          onSaveCorrection={handleSaveCorrection}
          onCancelCorrection={handleCancelCorrection}
          onCorrectionTextChange={setCorrectionText}
          onCorrectionNoteChange={setCorrectionNote}
          getPersonaLabel={getPersonaLabel}
        />
      )}

      {activeTab === 'test' && (
        <TestTab
          personas={personas}
          testPersonaId={testPersonaId}
          selectedPersona={selectedTestPersona}
          selectedLeader={selectedTestLeader}
          testMessages={testMessages}
          testInput={testInput}
          testLoading={testLoading}
          testEndRef={testEndRef}
          testInputRef={testInputRef}
          onPersonaChange={setTestPersonaId}
          onInputChange={setTestInput}
          onSend={handleTestSend}
          onKeyDown={handleTestKeyDown}
          getPersonaLabel={getPersonaLabel}
        />
      )}

      {activeTab === 'tone' && (
        <ToneTab
          personas={personas}
          tonePersonaId={tonePersonaId}
          selectedPersona={selectedTonePersona}
          editedTone={editedTone}
          editedBoundaries={editedBoundaries}
          newBoundary={newBoundary}
          toneSaved={toneSaved}
          onPersonaChange={setTonePersonaId}
          onToneChange={handleToneChange}
          onAddBoundary={handleAddBoundary}
          onRemoveBoundary={handleRemoveBoundary}
          onNewBoundaryChange={setNewBoundary}
          onSave={handleSaveTone}
          getPersonaLabel={getPersonaLabel}
        />
      )}
    </div>
  );
}

// ============================================
// TAB: Review Responses
// ============================================

function ReviewTab({
  personas,
  reviewItems,
  corrections,
  approvedMessages,
  editingMessageId,
  correctionText,
  correctionNote,
  filterPersonaId,
  pendingCount,
  onFilterChange,
  onApprove,
  onStartCorrection,
  onSaveCorrection,
  onCancelCorrection,
  onCorrectionTextChange,
  onCorrectionNoteChange,
  getPersonaLabel,
}: {
  personas: AIPersona[];
  reviewItems: Array<{
    aiMessageId: string;
    aiContent: string;
    userContent: string | null;
    conversationId: string;
    personaId: string;
    personaName: string;
    leaderName: string;
    createdAt: string;
  }>;
  corrections: Correction[];
  approvedMessages: Set<string>;
  editingMessageId: string | null;
  correctionText: string;
  correctionNote: string;
  filterPersonaId: string;
  pendingCount: number;
  onFilterChange: (id: string) => void;
  onApprove: (messageId: string) => void;
  onStartCorrection: (messageId: string, original: string) => void;
  onSaveCorrection: (messageId: string, personaId: string, conversationId: string, original: string) => void;
  onCancelCorrection: () => void;
  onCorrectionTextChange: (text: string) => void;
  onCorrectionNoteChange: (note: string) => void;
  getPersonaLabel: (persona: AIPersona) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
            Filter by Persona
          </label>
          <select
            value={filterPersonaId}
            onChange={(e) => onFilterChange(e.target.value)}
            className="text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-dark-100"
          >
            <option value="all">All Personas</option>
            {personas.map(p => (
              <option key={p.id} value={p.id}>
                {getPersonaLabel(p)}
              </option>
            ))}
          </select>
        </div>

        {pendingCount > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full">
            {pendingCount} pending correction{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Review Items */}
      {reviewItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5">
          <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-dark-600 mb-3" />
          <p className="text-gray-500 dark:text-dark-400 text-sm">
            No AI responses to review yet.
          </p>
          <p className="text-gray-400 dark:text-dark-500 text-xs mt-1">
            AI messages from conversations will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviewItems.map(item => {
            const isApproved = approvedMessages.has(item.aiMessageId);
            const existingCorrection = corrections.find(c => c.messageId === item.aiMessageId);
            const isEditing = editingMessageId === item.aiMessageId;

            return (
              <div
                key={item.aiMessageId}
                className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                      {item.personaName}
                    </span>
                    <span className="text-gray-300 dark:text-dark-600">|</span>
                    <span className="text-xs text-gray-500 dark:text-dark-400">
                      {item.leaderName}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-dark-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* User Message */}
                {item.userContent && (
                  <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 mb-1 font-medium">
                      User Message
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-500/5 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-500/10">
                      <p className="text-sm text-gray-700 dark:text-dark-200">
                        {item.userContent}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Response */}
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 mb-1 font-medium">
                    AI Response
                  </p>
                  <div className="bg-gray-50 dark:bg-dark-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-white/5">
                    <p className="text-sm text-gray-700 dark:text-dark-200 whitespace-pre-wrap">
                      {item.aiContent}
                    </p>
                  </div>
                </div>

                {/* Status / Actions */}
                {isApproved ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-medium">Approved</span>
                  </div>
                ) : existingCorrection ? (
                  <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <Pencil size={14} />
                    <span className="text-xs font-medium">Corrected</span>
                    {existingCorrection.note && (
                      <span className="text-xs text-gray-400 dark:text-dark-500 ml-2">
                        Note: {existingCorrection.note}
                      </span>
                    )}
                  </div>
                ) : isEditing ? (
                  <div className="space-y-3 border-t border-gray-100 dark:border-white/5 pt-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-400 font-medium block mb-1">
                        Corrected Response
                      </label>
                      <textarea
                        value={correctionText}
                        onChange={(e) => onCorrectionTextChange(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-400 font-medium block mb-1">
                        Note (optional)
                      </label>
                      <input
                        type="text"
                        value={correctionNote}
                        onChange={(e) => onCorrectionNoteChange(e.target.value)}
                        placeholder="Why is this correction needed?"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400 dark:placeholder:text-dark-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSaveCorrection(item.aiMessageId, item.personaId, item.conversationId, item.aiContent)}
                        disabled={!correctionText.trim() || correctionText.trim() === item.aiContent}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save size={12} />
                        Save Correction
                      </button>
                      <button
                        onClick={onCancelCorrection}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 transition-colors"
                      >
                        <X size={12} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove(item.aiMessageId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => onStartCorrection(item.aiMessageId, item.aiContent)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
                    >
                      <Pencil size={12} />
                      Correct
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB: Test Persona
// ============================================

function TestTab({
  personas,
  testPersonaId,
  selectedPersona,
  selectedLeader,
  testMessages,
  testInput,
  testLoading,
  testEndRef,
  testInputRef,
  onPersonaChange,
  onInputChange,
  onSend,
  onKeyDown,
  getPersonaLabel,
}: {
  personas: AIPersona[];
  testPersonaId: string;
  selectedPersona: AIPersona | undefined;
  selectedLeader: LeaderProfile | undefined;
  testMessages: TestChatMessage[];
  testInput: string;
  testLoading: boolean;
  testEndRef: React.RefObject<HTMLDivElement | null>;
  testInputRef: React.RefObject<HTMLTextAreaElement | null>;
  onPersonaChange: (id: string) => void;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  getPersonaLabel: (persona: AIPersona) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Persona Selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
          Select Persona
        </label>
        <select
          value={testPersonaId}
          onChange={(e) => onPersonaChange(e.target.value)}
          className="text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-dark-100"
        >
          <option value="">Choose a persona...</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>
              {getPersonaLabel(p)}
            </option>
          ))}
        </select>
      </div>

      {selectedPersona && selectedLeader ? (
        <>
          {/* Persona Config Card */}
          <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                  {selectedPersona.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-dark-400">
                  AI for {selectedLeader.displayName} — {selectedLeader.title}
                </p>
              </div>
            </div>

            {/* Tone Display (read-only) */}
            <div className="space-y-2 mb-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 font-medium">
                Tone Profile
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TONE_FIELDS.map(field => {
                  const value = selectedPersona.tone[field.key];
                  return (
                    <div key={field.key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-dark-400 w-20 flex-shrink-0">
                        {field.label}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-dark-700 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 dark:bg-violet-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-dark-200 w-5 text-right">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boundaries */}
            {selectedPersona.boundaries.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-dark-500 font-medium mb-1.5">
                  Boundaries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPersona.boundaries.map((b, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 rounded-full"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test Chat Area */}
          <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 overflow-hidden flex flex-col" style={{ height: '420px' }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {testMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot size={28} className="mx-auto text-gray-300 dark:text-dark-600 mb-2" />
                  <p className="text-sm text-gray-400 dark:text-dark-500">
                    Send a test message to see how {selectedPersona.name} responds.
                  </p>
                </div>
              )}

              {testMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.sender === 'user' ? (
                    <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-gray-500 dark:text-dark-400" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-md'
                        : 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-tl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {testLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-dark-800 rounded-2xl rounded-tl-md px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-dark-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={testEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-4 py-3 border-t border-gray-200/60 dark:border-white/5">
              <div className="flex items-end gap-2">
                <textarea
                  ref={testInputRef}
                  value={testInput}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type a test message..."
                  rows={1}
                  className="flex-1 px-3.5 py-2 bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400 dark:placeholder:text-dark-500 resize-none"
                  style={{ minHeight: '38px' }}
                  disabled={testLoading}
                />
                <button
                  onClick={onSend}
                  disabled={!testInput.trim() || testLoading}
                  className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {testLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5">
          <Bot size={32} className="mx-auto text-gray-300 dark:text-dark-600 mb-3" />
          <p className="text-gray-500 dark:text-dark-400 text-sm">
            Select a persona above to start testing.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB: Tone Settings
// ============================================

function ToneTab({
  personas,
  tonePersonaId,
  selectedPersona,
  editedTone,
  editedBoundaries,
  newBoundary,
  toneSaved,
  onPersonaChange,
  onToneChange,
  onAddBoundary,
  onRemoveBoundary,
  onNewBoundaryChange,
  onSave,
  getPersonaLabel,
}: {
  personas: AIPersona[];
  tonePersonaId: string;
  selectedPersona: AIPersona | undefined;
  editedTone: AIPersona['tone'] | null;
  editedBoundaries: string[];
  newBoundary: string;
  toneSaved: boolean;
  onPersonaChange: (id: string) => void;
  onToneChange: (key: ToneKey, value: number) => void;
  onAddBoundary: () => void;
  onRemoveBoundary: (index: number) => void;
  onNewBoundaryChange: (val: string) => void;
  onSave: () => void;
  getPersonaLabel: (persona: AIPersona) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Persona Selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
          Select Persona
        </label>
        <select
          value={tonePersonaId}
          onChange={(e) => onPersonaChange(e.target.value)}
          className="text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-dark-100"
        >
          <option value="">Choose a persona...</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>
              {getPersonaLabel(p)}
            </option>
          ))}
        </select>
      </div>

      {selectedPersona && editedTone ? (
        <>
          {/* Tone Sliders */}
          <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4">
              Tone Settings
            </h3>
            <div className="space-y-4">
              {TONE_FIELDS.map(field => {
                const value = editedTone[field.key];
                return (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700 dark:text-dark-200">
                        {field.label}
                      </span>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                        {value}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 dark:text-dark-500 w-20 text-right flex-shrink-0">
                        {field.low}
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={value}
                        onChange={(e) => onToneChange(field.key, parseInt(e.target.value, 10))}
                        className="flex-1 h-2 accent-violet-600 dark:accent-violet-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-400 dark:text-dark-500 w-20 flex-shrink-0">
                        {field.high}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boundaries */}
          <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-3">
              Boundaries
            </h3>
            <div className="space-y-2 mb-3">
              {editedBoundaries.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-dark-500 italic">
                  No boundaries defined. Add one below.
                </p>
              ) : (
                editedBoundaries.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-dark-800 rounded-lg group"
                  >
                    <span className="text-sm text-gray-700 dark:text-dark-200 flex-1">{b}</span>
                    <button
                      onClick={() => onRemoveBoundary(i)}
                      className="p-0.5 text-gray-400 dark:text-dark-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBoundary}
                onChange={(e) => onNewBoundaryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddBoundary();
                  }
                }}
                placeholder="Add a new boundary..."
                className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg text-gray-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400 dark:placeholder:text-dark-500"
              />
              <button
                onClick={onAddBoundary}
                disabled={!newBoundary.trim()}
                className="p-1.5 bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* System Prompt (read-only) */}
          <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-2">
              System Prompt
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-dark-500 mb-2">
              Read-only reference of the persona's system prompt.
            </p>
            <textarea
              value={selectedPersona.systemPrompt}
              readOnly
              rows={6}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-lg text-gray-600 dark:text-dark-300 resize-y cursor-default focus:outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Save size={14} />
              Save Changes
            </button>
            {toneSaved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 size={14} />
                Changes saved locally
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5">
          <SlidersHorizontal size={32} className="mx-auto text-gray-300 dark:text-dark-600 mb-3" />
          <p className="text-gray-500 dark:text-dark-400 text-sm">
            Select a persona above to adjust tone settings.
          </p>
        </div>
      )}
    </div>
  );
}
