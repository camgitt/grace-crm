import { useState } from 'react';
import { X, Mail, MessageSquare, Send, FileText, ChevronDown } from 'lucide-react';
import { Person, EmailTemplate, Communication } from '../types';
import { emailTemplates } from '../data/emailTemplates';

interface ComposeMessageProps {
  recipients: Person[];
  onClose: () => void;
  onSend: (communications: Omit<Communication, 'id' | 'sentAt'>[]) => void;
}

export function ComposeMessage({ recipients, onClose, onSend }: ComposeMessageProps) {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [sending, setSending] = useState(false);

  const templateCategories = ['welcome', 'follow-up', 'care', 'event', 'general'] as const;

  const applyTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setContent(template.body);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

  const replaceVariables = (text: string, person: Person): string => {
    return text
      .replace(/\{\{firstName\}\}/g, person.firstName)
      .replace(/\{\{lastName\}\}/g, person.lastName)
      .replace(/\{\{email\}\}/g, person.email)
      .replace(/\{\{senderName\}\}/g, 'Church Staff');
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    if (messageType === 'email' && !subject.trim()) return;

    setSending(true);

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const communications: Omit<Communication, 'id' | 'sentAt'>[] = recipients.map(person => ({
      personId: person.id,
      type: messageType,
      subject: messageType === 'email' ? replaceVariables(subject, person) : undefined,
      content: replaceVariables(content, person),
      templateUsed: selectedTemplate || undefined,
      sentBy: 'You',
      status: 'sent' as const
    }));

    onSend(communications);
    setSending(false);
    onClose();
  };

  const previewContent = recipients[0] ? replaceVariables(content, recipients[0]) : content;
  const previewSubject = recipients[0] ? replaceVariables(subject, recipients[0]) : subject;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {messageType === 'email' ? (
              <Mail className="text-indigo-600 dark:text-indigo-400" size={24} />
            ) : (
              <MessageSquare className="text-green-600 dark:text-green-400" size={24} />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Compose {messageType === 'email' ? 'Email' : 'Text Message'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Message Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMessageType('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                messageType === 'email'
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Mail size={16} />
              Email
            </button>
            <button
              onClick={() => setMessageType('sms')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                messageType === 'sms'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <MessageSquare size={16} />
              Text
            </button>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To ({recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'})
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-24 overflow-y-auto">
              {recipients.map(person => (
                <span
                  key={person.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-500"
                >
                  {person.firstName} {person.lastName}
                </span>
              ))}
            </div>
          </div>

          {/* Templates (Email only) */}
          {messageType === 'email' && (
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                <FileText size={16} />
                Use Template
                <ChevronDown size={16} className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>

              {showTemplates && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  {templateCategories.map(category => {
                    const categoryTemplates = emailTemplates.filter(t => t.category === category);
                    if (categoryTemplates.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {category}
                        </div>
                        {categoryTemplates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{template.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{template.subject}</p>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subject (Email only) */}
          {messageType === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={messageType === 'email' ? 'Compose your email...' : 'Type your message (160 characters recommended for SMS)'}
              rows={messageType === 'email' ? 10 : 4}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            {messageType === 'sms' && (
              <p className={`text-xs mt-1 ${content.length > 160 ? 'text-amber-600' : 'text-gray-400'}`}>
                {content.length}/160 characters
              </p>
            )}
          </div>

          {/* Variable hints */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Available variables:</p>
            <div className="flex flex-wrap gap-2">
              {['{{firstName}}', '{{lastName}}', '{{email}}', '{{senderName}}'].map(v => (
                <code key={v} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
                  {v}
                </code>
              ))}
            </div>
          </div>

          {/* Preview */}
          {recipients.length > 0 && content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview (for {recipients[0].firstName})
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                {messageType === 'email' && previewSubject && (
                  <p className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                    Subject: {previewSubject}
                  </p>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {previewContent}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!content.trim() || (messageType === 'email' && !subject.trim()) || sending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <span className="animate-spin">⏳</span>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send {messageType === 'email' ? 'Email' : 'Text'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
