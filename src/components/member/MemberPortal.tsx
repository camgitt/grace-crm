import { useState } from 'react';
import { MemberLayout } from './MemberLayout';
import { MemberHomePage } from './MemberHomePage';
import { MemberDirectoryPage } from './MemberDirectoryPage';
import { MemberGivingPage } from './MemberGivingPage';
import { MemberEventsPage } from './MemberEventsPage';
import { MemberCheckInPage } from './MemberCheckInPage';
import { MemberCarePage } from './MemberCarePage';
import type { MemberPortalTab, Person, CalendarEvent, Giving, Attendance, LeaderProfile, PastoralConversation, HelpCategory } from '../../types';
import type { ChurchProfile } from '../../hooks/useChurchSettings';

interface MemberPortalProps {
  people: Person[];
  events: CalendarEvent[];
  giving: Giving[];
  attendance: Attendance[];
  rsvps: { eventId: string; personId: string; status: 'yes' | 'no' | 'maybe'; guestCount: number }[];
  currentMember?: Person | null;
  churchName?: string;
  churchProfile?: ChurchProfile;
  onBack?: () => void;
  onRSVP?: (eventId: string, personId: string, status: 'yes' | 'no' | 'maybe', guestCount?: number) => void;
  onCheckIn?: (personId: string, eventType: Attendance['eventType'], eventName?: string) => void;
  pastoralCare?: {
    leaders: LeaderProfile[];
    conversations: PastoralConversation[];
    createHelpRequest: (request: { category: HelpCategory; description?: string; isAnonymous: boolean }) => void;
    sendMessage: (conversationId: string, content: string) => void;
    resolveConversation: (conversationId: string) => void;
  };
  embedded?: boolean;
}

export function MemberPortal({
  people,
  events,
  giving,
  attendance,
  rsvps,
  currentMember,
  churchName = 'Grace Church',
  churchProfile,
  onBack,
  onRSVP,
  onCheckIn,
  pastoralCare,
  embedded = false,
}: MemberPortalProps) {
  const [activeTab, setActiveTab] = useState<MemberPortalTab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <MemberHomePage
            churchName={churchName}
            churchProfile={churchProfile}
            events={events}
            onNavigate={setActiveTab}
          />
        );

      case 'directory':
        return <MemberDirectoryPage people={people} />;

      case 'giving':
        return (
          <MemberGivingPage
            giving={giving}
            personId={currentMember?.id}
            churchName={churchName}
          />
        );

      case 'events':
        return (
          <MemberEventsPage
            events={events}
            rsvps={rsvps}
            personId={currentMember?.id}
            onRSVP={onRSVP}
          />
        );

      case 'checkin':
        return (
          <MemberCheckInPage
            events={events}
            attendance={attendance}
            personId={currentMember?.id}
            personName={currentMember ? `${currentMember.firstName}` : undefined}
            onCheckIn={onCheckIn}
          />
        );

      case 'care':
        return (
          <MemberCarePage
            leaders={pastoralCare?.leaders ?? []}
            conversations={pastoralCare?.conversations ?? []}
            churchName={churchName}
            onCreateHelpRequest={pastoralCare?.createHelpRequest ?? (() => {})}
            onSendMessage={pastoralCare?.sendMessage ?? (() => {})}
          />
        );

      default:
        return (
          <MemberHomePage
            churchName={churchName}
            churchProfile={churchProfile}
            events={events}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <MemberLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={onBack}
      churchName={churchName}
      embedded={embedded}
    >
      {renderContent()}
    </MemberLayout>
  );
}
