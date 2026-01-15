/**
 * Small Group Hub
 *
 * Enhanced small group management with communication features:
 * - Group announcements
 * - Message threads between members
 * - Prayer requests within the group
 * - Attendance tracking
 * - Resource sharing
 */

import { useState, useMemo } from 'react';
import {
  Users2,
  MapPin,
  Clock,
  User,
  MessageCircle,
  Bell,
  Heart,
  Send,
  ChevronRight,
  Plus,
  Check,
  X,
} from 'lucide-react';

interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  isLeader: boolean;
}

interface GroupAnnouncement {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  isPinned: boolean;
}

interface GroupMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  createdAt: string;
}

interface GroupPrayerRequest {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  isAnswered: boolean;
  prayerCount: number;
}

interface GroupMeeting {
  id: string;
  date: string;
  attendees: string[];
  notes?: string;
}

export interface SmallGroupData {
  id: string;
  name: string;
  description?: string;
  meetingDay: string;
  meetingTime: string;
  location?: string;
  members: GroupMember[];
  announcements: GroupAnnouncement[];
  messages: GroupMessage[];
  prayerRequests: GroupPrayerRequest[];
  upcomingMeetings: GroupMeeting[];
}

interface SmallGroupHubProps {
  group: SmallGroupData;
  currentUserId: string;
  onSendMessage: (groupId: string, content: string) => void;
  onPostAnnouncement: (groupId: string, content: string) => void;
  onSubmitPrayer: (groupId: string, content: string) => void;
  onPrayFor: (groupId: string, prayerId: string) => void;
  onRSVP: (groupId: string, meetingId: string, attending: boolean) => void;
}

type Tab = 'feed' | 'messages' | 'prayer' | 'members';

export function SmallGroupHub({
  group,
  currentUserId,
  onSendMessage,
  onPostAnnouncement,
  onSubmitPrayer,
  onPrayFor,
  onRSVP,
}: SmallGroupHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [newMessage, setNewMessage] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());

  // Check if current user is a leader
  const isLeader = useMemo(() => {
    return group.members.some((m) => m.id === currentUserId && m.isLeader);
  }, [group.members, currentUserId]);

  // Get leader info
  const leader = useMemo(() => {
    return group.members.find((m) => m.isLeader);
  }, [group.members]);

  // Handle sending message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(group.id, newMessage.trim());
    setNewMessage('');
  };

  // Handle submitting prayer
  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.trim()) return;
    onSubmitPrayer(group.id, newPrayer.trim());
    setNewPrayer('');
  };

  // Handle posting announcement
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    onPostAnnouncement(group.id, newAnnouncement.trim());
    setNewAnnouncement('');
    setShowAnnouncementForm(false);
  };

  // Handle praying for someone
  const handlePrayFor = (prayerId: string) => {
    if (prayedFor.has(prayerId)) return;
    setPrayedFor(new Set([...prayedFor, prayerId]));
    onPrayFor(group.id, prayerId);
  };

  // Get next meeting
  const nextMeeting = useMemo(() => {
    const now = new Date();
    return group.upcomingMeetings
      .filter((m) => new Date(m.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [group.upcomingMeetings]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-purple-100 mt-1">{group.description}</p>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-purple-100">
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {group.meetingDay}s at {group.meetingTime}
            </span>
            {group.location && (
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                {group.location}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Users2 size={16} />
              {group.members.length} members
            </span>
            {leader && (
              <span className="flex items-center gap-2">
                <User size={16} />
                Led by {leader.firstName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-dark-850 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'feed', label: 'Feed', icon: Bell },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'prayer', label: 'Prayer', icon: Heart },
              { id: 'members', label: 'Members', icon: Users2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                      : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Next Meeting Card */}
            {nextMeeting && (
              <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-6 border border-purple-200 dark:border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                      Next Meeting
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 mt-1">
                      {new Date(nextMeeting.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      at {group.meetingTime}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                      {nextMeeting.attendees.length} confirmed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRSVP(group.id, nextMeeting.id, true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        nextMeeting.attendees.includes(currentUserId)
                          ? 'bg-green-600 text-white'
                          : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-200 hover:bg-green-50 dark:hover:bg-green-500/10'
                      }`}
                    >
                      <Check size={16} />
                      Going
                    </button>
                    <button
                      onClick={() => onRSVP(group.id, nextMeeting.id, false)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-200 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <X size={16} />
                      Can't Go
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Post Announcement (Leaders only) */}
            {isLeader && (
              <div>
                {!showAnnouncementForm ? (
                  <button
                    onClick={() => setShowAnnouncementForm(true)}
                    className="w-full p-4 bg-white dark:bg-dark-850 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-600 hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-gray-500 dark:text-dark-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    <Plus size={20} className="mx-auto mb-1" />
                    Post Announcement
                  </button>
                ) : (
                  <form
                    onSubmit={handlePostAnnouncement}
                    className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-4"
                  >
                    <textarea
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Write an announcement for your group..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setShowAnnouncementForm(false)}
                        className="px-4 py-2 text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Announcements */}
            <div className="space-y-4">
              {group.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`bg-white dark:bg-dark-850 rounded-xl border p-6 ${
                    announcement.isPinned
                      ? 'border-purple-200 dark:border-purple-500/20'
                      : 'border-gray-200 dark:border-dark-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Bell
                      size={16}
                      className={
                        announcement.isPinned
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-400'
                      }
                    />
                    <span className="font-medium text-gray-900 dark:text-dark-100">
                      {announcement.authorName}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-dark-500">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                    {announcement.isPinned && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-dark-200">{announcement.content}</p>
                </div>
              ))}
            </div>

            {group.announcements.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
                <Bell className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
                <p className="text-gray-400 dark:text-dark-400">No announcements yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            {/* Message Form */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-4"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message to your group..."
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>

            {/* Messages */}
            <div className="space-y-3">
              {group.messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {message.authorInitials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-dark-100">
                          {message.authorName}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-dark-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-dark-200 mt-1">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {group.messages.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
                <MessageCircle className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
                <p className="text-gray-400 dark:text-dark-400">No messages yet</p>
                <p className="text-sm text-gray-400 dark:text-dark-500 mt-1">
                  Start a conversation with your group
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prayer' && (
          <div className="space-y-4">
            {/* Prayer Form */}
            <form
              onSubmit={handleSubmitPrayer}
              className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-4"
            >
              <textarea
                value={newPrayer}
                onChange={(e) => setNewPrayer(e.target.value)}
                placeholder="Share a prayer request with your group..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newPrayer.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share Prayer Request
                </button>
              </div>
            </form>

            {/* Prayer Requests */}
            <div className="space-y-4">
              {group.prayerRequests.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`bg-white dark:bg-dark-850 rounded-xl border p-6 ${
                    prayer.isAnswered
                      ? 'border-green-200 dark:border-green-500/20'
                      : 'border-gray-200 dark:border-dark-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Heart
                      size={16}
                      className={prayer.isAnswered ? 'text-green-600' : 'text-red-400'}
                    />
                    <span className="font-medium text-gray-900 dark:text-dark-100">
                      {prayer.authorName}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-dark-500">
                      {new Date(prayer.createdAt).toLocaleDateString()}
                    </span>
                    {prayer.isAnswered && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Answered
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-dark-200">{prayer.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
                    <span className="text-sm text-gray-500 dark:text-dark-400">
                      {prayer.prayerCount} praying
                    </span>
                    {!prayer.isAnswered && (
                      <button
                        onClick={() => handlePrayFor(prayer.id)}
                        disabled={prayedFor.has(prayer.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          prayedFor.has(prayer.id)
                            ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-purple-100 dark:hover:bg-purple-500/20'
                        }`}
                      >
                        <Heart size={16} className={prayedFor.has(prayer.id) ? 'fill-current' : ''} />
                        {prayedFor.has(prayer.id) ? 'Praying' : 'Pray'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {group.prayerRequests.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
                <Heart className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
                <p className="text-gray-400 dark:text-dark-400">No prayer requests yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100">
              Group Members ({group.members.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex items-center gap-4"
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-dark-100">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.isLeader && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                          Leader
                        </span>
                      )}
                    </div>
                    {member.email && (
                      <p className="text-sm text-gray-500 dark:text-dark-400">{member.email}</p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
