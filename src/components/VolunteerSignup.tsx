/**
 * Volunteer Signup Portal
 *
 * A public-facing portal where members can:
 * - Browse volunteer opportunities by ministry
 * - View role requirements and time commitments
 * - Sign up for volunteer positions
 * - Manage their current volunteer roles
 */

import { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Search,
  Filter,
  Clock,
  Calendar,
  Users,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Music,
  Baby,
  Coffee,
  Megaphone,
  Wrench,
  BookOpen,
} from 'lucide-react';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  ministry: string;
  description: string;
  requirements?: string[];
  commitment: string;
  schedule?: string;
  location?: string;
  spotsAvailable: number;
  totalSpots: number;
  leaderName?: string;
  leaderEmail?: string;
  isSignedUp: boolean;
  signupDate?: string;
}

interface VolunteerSignupProps {
  opportunities: VolunteerOpportunity[];
  myRoles: VolunteerOpportunity[];
  churchName?: string;
  userName?: string;
  onSignup: (opportunityId: string) => void;
  onWithdraw: (opportunityId: string) => void;
  onContact: (leaderEmail: string, roleName: string) => void;
}

const MINISTRY_ICONS: Record<string, React.ElementType> = {
  worship: Music,
  children: Baby,
  hospitality: Coffee,
  outreach: Megaphone,
  facilities: Wrench,
  education: BookOpen,
  care: Heart,
  default: HeartHandshake,
};

const MINISTRY_COLORS: Record<string, string> = {
  worship: 'from-purple-500 to-indigo-600',
  children: 'from-pink-500 to-rose-600',
  hospitality: 'from-amber-500 to-orange-600',
  outreach: 'from-green-500 to-emerald-600',
  facilities: 'from-gray-500 to-slate-600',
  education: 'from-blue-500 to-cyan-600',
  care: 'from-red-500 to-pink-600',
  default: 'from-indigo-500 to-purple-600',
};

export function VolunteerSignup({
  opportunities,
  myRoles,
  churchName = 'Our Church',
  userName,
  onSignup,
  onWithdraw,
  onContact,
}: VolunteerSignupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [showMyRoles, setShowMyRoles] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Get unique ministries
  const ministries = useMemo(() => {
    const unique = [...new Set(opportunities.map((o) => o.ministry))];
    return unique.sort();
  }, [opportunities]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        !searchQuery ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.ministry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMinistry = !selectedMinistry || opp.ministry === selectedMinistry;

      return matchesSearch && matchesMinistry && !opp.isSignedUp;
    });
  }, [opportunities, searchQuery, selectedMinistry]);

  // Get ministry icon
  const getMinistryIcon = (ministry: string) => {
    const key = ministry.toLowerCase();
    return MINISTRY_ICONS[key] || MINISTRY_ICONS.default;
  };

  // Get ministry color
  const getMinistryColor = (ministry: string) => {
    const key = ministry.toLowerCase();
    return MINISTRY_COLORS[key] || MINISTRY_COLORS.default;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <HeartHandshake size={48} className="mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-4xl font-bold">Serve at {churchName}</h1>
            <p className="text-indigo-100 mt-3 text-lg">
              Use your gifts to make a difference in our community
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{opportunities.length}</div>
              <div className="text-indigo-200 text-sm">Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{ministries.length}</div>
              <div className="text-indigo-200 text-sm">Ministries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {opportunities.reduce((sum, o) => sum + (o.totalSpots - o.spotsAvailable), 0)}
              </div>
              <div className="text-indigo-200 text-sm">Volunteers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* My Roles Toggle */}
        {myRoles.length > 0 && (
          <button
            onClick={() => setShowMyRoles(!showMyRoles)}
            className="w-full mb-6 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-4 flex items-center justify-between hover:border-indigo-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/15 rounded-lg flex items-center justify-center">
                <Check className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-dark-100">
                  My Volunteer Roles ({myRoles.length})
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  {userName ? `Signed up as ${userName}` : 'View your current commitments'}
                </p>
              </div>
            </div>
            {showMyRoles ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}

        {/* My Roles List */}
        {showMyRoles && myRoles.length > 0 && (
          <div className="mb-8 space-y-4">
            {myRoles.map((role) => {
              const Icon = getMinistryIcon(role.ministry);
              return (
                <div
                  key={role.id}
                  className="bg-white dark:bg-dark-850 rounded-xl border border-green-200 dark:border-green-500/20 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMinistryColor(role.ministry)} flex items-center justify-center text-white`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-dark-100">
                          {role.title}
                        </h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {role.ministry}
                        </p>
                        {role.signupDate && (
                          <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                            Signed up {new Date(role.signupDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onWithdraw(role.id)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Withdraw
                    </button>
                  </div>
                  {role.schedule && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
                      <Calendar size={16} />
                      {role.schedule}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-dark-100"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={selectedMinistry || ''}
              onChange={(e) => setSelectedMinistry(e.target.value || null)}
              className="pl-12 pr-8 py-3 bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-dark-100 appearance-none cursor-pointer"
            >
              <option value="">All Ministries</option>
              {ministries.map((ministry) => (
                <option key={ministry} value={ministry}>
                  {ministry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => {
            const Icon = getMinistryIcon(opp.ministry);
            const isExpanded = expandedRole === opp.id;

            return (
              <div
                key={opp.id}
                className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedRole(isExpanded ? null : opp.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMinistryColor(opp.ministry)} flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-dark-100">
                          {opp.title}
                        </h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {opp.ministry}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-dark-300 mt-2 line-clamp-2">
                          {opp.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          opp.spotsAvailable <= 2
                            ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {opp.spotsAvailable} spots left
                      </span>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-dark-400">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {opp.commitment}
                    </span>
                    {opp.schedule && (
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {opp.schedule}
                      </span>
                    )}
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {opp.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {opp.totalSpots - opp.spotsAvailable}/{opp.totalSpots} filled
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 dark:border-dark-700 pt-4">
                    {opp.requirements && opp.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-dark-100 mb-2">
                          Requirements
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-dark-300 space-y-1">
                          {opp.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {opp.leaderName && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-dark-100 mb-2">
                          Ministry Leader
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-dark-300">
                          {opp.leaderName}
                          {opp.leaderEmail && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onContact(opp.leaderEmail!, opp.title);
                              }}
                              className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Contact
                            </button>
                          )}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSignup(opp.id);
                      }}
                      disabled={opp.spotsAvailable === 0}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {opp.spotsAvailable === 0 ? 'No Spots Available' : 'Sign Up to Serve'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700">
            <HeartHandshake className="mx-auto text-gray-300 dark:text-dark-600 mb-4" size={64} />
            <p className="text-gray-500 dark:text-dark-400 text-lg">
              {searchQuery || selectedMinistry
                ? 'No opportunities match your search'
                : 'No volunteer opportunities available'}
            </p>
            {(searchQuery || selectedMinistry) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMinistry(null);
                }}
                className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
