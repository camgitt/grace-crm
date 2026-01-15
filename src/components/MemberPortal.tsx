/**
 * Member Portal
 *
 * A simplified dashboard for regular church members (not staff/admin).
 * Provides access to:
 * - Personal profile and family info
 * - Upcoming events with RSVP
 * - Prayer wall
 * - Small group info
 * - Volunteer opportunities
 * - Giving history
 */

import { useState, useMemo } from 'react';
import {
  User,
  Calendar,
  Users,
  Heart,
  HeartHandshake,
  Gift,
  ChevronRight,
  MapPin,
  Clock,
  Check,
  X,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';

interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  memberSince?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  rsvpStatus?: 'yes' | 'no' | 'maybe' | null;
  attendeeCount: number;
}

interface SmallGroup {
  id: string;
  name: string;
  description?: string;
  meetingDay: string;
  meetingTime: string;
  location?: string;
  leaderName: string;
  memberCount: number;
}

interface VolunteerRole {
  id: string;
  title: string;
  ministry: string;
  description: string;
  commitment: string;
  spotsAvailable: number;
  isSignedUp: boolean;
}

interface GivingSummary {
  thisYear: number;
  lastGift: { amount: number; date: string; fund: string } | null;
}

interface MemberPortalProps {
  profile: MemberProfile;
  events: Event[];
  smallGroups: SmallGroup[];
  volunteerRoles: VolunteerRole[];
  givingSummary: GivingSummary;
  prayerCount: number;
  churchName?: string;
  onRSVP: (eventId: string, status: 'yes' | 'no' | 'maybe') => void;
  onVolunteerSignup: (roleId: string) => void;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

type Tab = 'home' | 'events' | 'groups' | 'volunteer' | 'giving';

export function MemberPortal({
  profile,
  events,
  smallGroups,
  volunteerRoles,
  givingSummary,
  prayerCount,
  churchName = 'Our Church',
  onRSVP,
  onVolunteerSignup,
  onNavigate,
  onLogout,
}: MemberPortalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Get upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return events
      .filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= now && eventDate <= thirtyDaysLater;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  // Get available volunteer roles
  const availableRoles = useMemo(() => {
    return volunteerRoles.filter((r) => r.spotsAvailable > 0 && !r.isSignedUp);
  }, [volunteerRoles]);

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-850 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                  {initials}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-dark-100">
                  Welcome, {profile.firstName}!
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-400">{churchName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700">
                <Settings size={20} />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-dark-850 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'home', label: 'Home', icon: User },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'groups', label: 'Groups', icon: Users },
              { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake },
              { id: 'giving', label: 'Giving', icon: Gift },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
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
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-dark-850 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
                <Calendar className="text-indigo-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {upcomingEvents.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400">Upcoming Events</p>
              </div>
              <div className="bg-white dark:bg-dark-850 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
                <Users className="text-green-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {smallGroups.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400">My Groups</p>
              </div>
              <div className="bg-white dark:bg-dark-850 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
                <Heart className="text-red-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {prayerCount}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400">Prayer Requests</p>
              </div>
              <div className="bg-white dark:bg-dark-850 rounded-xl p-4 border border-gray-200 dark:border-dark-700">
                <Gift className="text-purple-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  ${givingSummary.thisYear.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400">Given This Year</p>
              </div>
            </div>

            {/* Prayer Wall Link */}
            <button
              onClick={() => onNavigate('prayer-wall')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 text-left hover:from-indigo-600 hover:to-purple-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Prayer Wall</h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    Share requests and pray for others
                  </p>
                </div>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Upcoming Events Preview */}
            <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-dark-100">Upcoming Events</h3>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-dark-700">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-dark-100">{event.title}</p>
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                    {event.rsvpStatus === 'yes' ? (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 rounded-full text-sm">
                        Going
                      </span>
                    ) : (
                      <button
                        onClick={() => onRSVP(event.id, 'yes')}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-500/25"
                      >
                        RSVP
                      </button>
                    )}
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="p-8 text-center text-gray-400 dark:text-dark-500">
                    No upcoming events
                  </div>
                )}
              </div>
            </div>

            {/* Volunteer Opportunities Preview */}
            {availableRoles.length > 0 && (
              <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-dark-100">
                    Volunteer Opportunities
                  </h3>
                  <button
                    onClick={() => setActiveTab('volunteer')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-dark-300">
                    {availableRoles.length} opportunities available to serve
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100">Upcoming Events</h2>
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-100 text-lg">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-gray-600 dark:text-dark-300 mt-1">{event.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-dark-400">
                    {event.attendeeCount} attending
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-dark-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {event.time}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {event.location}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRSVP(event.id, 'yes')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      event.rsvpStatus === 'yes'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-green-100 dark:hover:bg-green-500/15 hover:text-green-700 dark:hover:text-green-400'
                    }`}
                  >
                    <Check size={16} />
                    Going
                  </button>
                  <button
                    onClick={() => onRSVP(event.id, 'maybe')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      event.rsvpStatus === 'maybe'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-amber-100 dark:hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400'
                    }`}
                  >
                    Maybe
                  </button>
                  <button
                    onClick={() => onRSVP(event.id, 'no')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      event.rsvpStatus === 'no'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-red-100 dark:hover:bg-red-500/15 hover:text-red-700 dark:hover:text-red-400'
                    }`}
                  >
                    <X size={16} />
                    Can't Go
                  </button>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
                <Calendar className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
                <p className="text-gray-400 dark:text-dark-400">No upcoming events</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100">My Small Groups</h2>
            {smallGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-6"
              >
                <h3 className="font-semibold text-gray-900 dark:text-dark-100 text-lg mb-2">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-gray-600 dark:text-dark-300 mb-4">{group.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-dark-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {group.meetingDay} at {group.meetingTime}
                  </span>
                  {group.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {group.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {group.memberCount} members
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    Led by {group.leaderName}
                  </span>
                </div>
              </div>
            ))}
            {smallGroups.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
                <Users className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
                <p className="text-gray-400 dark:text-dark-400">Not in any groups yet</p>
                <p className="text-sm text-gray-400 dark:text-dark-500 mt-1">
                  Contact the church office to join a small group
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'volunteer' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100">
              Volunteer Opportunities
            </h2>
            <p className="text-gray-600 dark:text-dark-300">
              Use your gifts to serve our community
            </p>
            {volunteerRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-100">{role.title}</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{role.ministry}</p>
                  </div>
                  {role.isSignedUp ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 rounded-full text-sm">
                      Signed Up
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-dark-400">
                      {role.spotsAvailable} spots left
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-dark-300 mb-4">{role.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-dark-400">
                    Commitment: {role.commitment}
                  </span>
                  {!role.isSignedUp && role.spotsAvailable > 0 && (
                    <button
                      onClick={() => onVolunteerSignup(role.id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Sign Up
                    </button>
                  )}
                </div>
              </div>
            ))}
            {volunteerRoles.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
                <HeartHandshake className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={48} />
                <p className="text-gray-400 dark:text-dark-400">No volunteer opportunities available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'giving' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100">My Giving</h2>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
              <p className="text-indigo-100 text-sm">Total Given This Year</p>
              <p className="text-4xl font-bold mt-1">
                ${givingSummary.thisYear.toLocaleString()}
              </p>
              {givingSummary.lastGift && (
                <p className="text-indigo-100 text-sm mt-4">
                  Last gift: ${givingSummary.lastGift.amount} to {givingSummary.lastGift.fund} on{' '}
                  {new Date(givingSummary.lastGift.date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Give Button */}
            <button
              onClick={() => onNavigate('give')}
              className="w-full bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-6 text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/15 rounded-xl flex items-center justify-center">
                    <Gift className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-100">Give Online</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      Make a one-time or recurring gift
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={24}
                  className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                />
              </div>
            </button>

            {/* Giving Statement */}
            <button
              onClick={() => onNavigate('giving-statement')}
              className="w-full bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-6 text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-500/15 rounded-xl flex items-center justify-center">
                    <Calendar className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-dark-100">
                      Giving Statement
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      View and download your giving history
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={24}
                  className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                />
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
