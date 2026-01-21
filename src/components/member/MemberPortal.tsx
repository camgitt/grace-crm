import { useState } from 'react';
import { MemberLayout } from './MemberLayout';
import { MemberDirectoryPage } from './MemberDirectoryPage';
import { MemberGivingPage } from './MemberGivingPage';
import { MemberEventsPage } from './MemberEventsPage';
import { MemberCheckInPage } from './MemberCheckInPage';
import { MemberLogin } from './MemberLogin';
import { MemberAuthProvider, useMemberAuth } from './MemberAuthContext';
import { LogOut } from 'lucide-react';
import type { MemberPortalTab, Person, CalendarEvent, Giving, Attendance } from '../../types';

interface MemberPortalProps {
  people: Person[];
  events: CalendarEvent[];
  giving: Giving[];
  attendance: Attendance[];
  rsvps: { eventId: string; personId: string; status: 'yes' | 'no' | 'maybe'; guestCount: number }[];
  churchName?: string;
  onBack?: () => void;
  onRSVP?: (eventId: string, personId: string, status: 'yes' | 'no' | 'maybe', guestCount?: number) => void;
  onCheckIn?: (personId: string, eventType: Attendance['eventType'], eventName?: string) => void;
}

export function MemberPortal(props: MemberPortalProps) {
  return (
    <MemberAuthProvider people={props.people}>
      <MemberPortalContent {...props} />
    </MemberAuthProvider>
  );
}

function MemberPortalContent({
  people,
  events,
  giving,
  attendance,
  rsvps,
  churchName = 'Grace Church',
  onBack,
  onRSVP,
  onCheckIn
}: MemberPortalProps) {
  const { isAuthenticated, isLoading, member, logout } = useMemberAuth();
  const [activeTab, setActiveTab] = useState<MemberPortalTab>('directory');
  const [showProfile, setShowProfile] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <MemberLogin churchName={churchName} onBack={onBack} />;
  }

  const renderContent = () => {
    // Profile view
    if (showProfile && member) {
      return (
        <div className="p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h2>
                <p className="text-gray-500 dark:text-dark-400 capitalize">{member.status}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              {member.email && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-dark-400">
                  <span className="text-sm font-medium w-20">Email</span>
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-dark-400">
                  <span className="text-sm font-medium w-20">Phone</span>
                  <span>{member.phone}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-dark-400">
                  <span className="text-sm font-medium w-20">Address</span>
                  <span>
                    {member.address}
                    {member.city && `, ${member.city}`}
                    {member.state && ` ${member.state}`}
                    {member.zip && ` ${member.zip}`}
                  </span>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium rounded-xl"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          <button
            onClick={() => setShowProfile(false)}
            className="w-full mt-4 py-3 text-gray-500 dark:text-dark-400"
          >
            Back to Portal
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'directory':
        return <MemberDirectoryPage people={people} />;

      case 'giving':
        return (
          <MemberGivingPage
            giving={giving}
            personId={member?.id}
            churchName={churchName}
          />
        );

      case 'events':
        return (
          <MemberEventsPage
            events={events}
            rsvps={rsvps}
            personId={member?.id}
            onRSVP={onRSVP}
          />
        );

      case 'checkin':
        return (
          <MemberCheckInPage
            events={events}
            attendance={attendance}
            personId={member?.id}
            personName={member ? `${member.firstName}` : undefined}
            onCheckIn={onCheckIn}
          />
        );

      default:
        return <MemberDirectoryPage people={people} />;
    }
  };

  return (
    <MemberLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setShowProfile(false);
        setActiveTab(tab);
      }}
      onBack={onBack}
      churchName={churchName}
      headerRight={
        member && (
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            title="Profile"
          >
            {member.firstName[0]}{member.lastName[0]}
          </button>
        )
      }
    >
      {renderContent()}
    </MemberLayout>
  );
}
