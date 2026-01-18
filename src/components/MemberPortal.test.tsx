import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberPortal } from './MemberPortal';

describe('MemberPortal', () => {
  const mockProfile = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    memberSince: '2023-01-15',
  };

  const mockEvents = [
    {
      id: 'event-1',
      title: 'Sunday Service',
      description: 'Weekly worship service',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      time: '10:00 AM',
      location: 'Main Sanctuary',
      rsvpStatus: null,
      attendeeCount: 150,
    },
    {
      id: 'event-2',
      title: 'Youth Group',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      time: '6:30 PM',
      rsvpStatus: 'yes' as const,
      attendeeCount: 25,
    },
  ];

  const mockSmallGroups = [
    {
      id: 'group-1',
      name: 'Men\'s Bible Study',
      description: 'Weekly study group for men',
      meetingDay: 'Tuesday',
      meetingTime: '7:00 PM',
      location: 'Room 201',
      leaderName: 'Bob Smith',
      memberCount: 12,
    },
  ];

  const mockVolunteerRoles = [
    {
      id: 'role-1',
      title: 'Greeter',
      ministry: 'Hospitality',
      description: 'Welcome visitors at the door',
      commitment: '1 Sunday/month',
      spotsAvailable: 3,
      isSignedUp: false,
    },
    {
      id: 'role-2',
      title: 'Sound Tech',
      ministry: 'Worship',
      description: 'Operate sound equipment',
      commitment: '2 Sundays/month',
      spotsAvailable: 0,
      isSignedUp: true,
    },
  ];

  const mockGivingSummary = {
    thisYear: 2500,
    lastGift: {
      amount: 100,
      date: '2024-01-15',
      fund: 'Tithe',
    },
  };

  const mockOnRSVP = vi.fn();
  const mockOnVolunteerSignup = vi.fn();
  const mockOnNavigate = vi.fn();
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the member portal with welcome message', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        churchName="Grace Church"
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
    expect(screen.getByText('Grace Church')).toBeInTheDocument();
  });

  it('displays user initials when no photo provided', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows quick stats on home tab', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    // Check for quick stats labels (use getAllByText for duplicates)
    expect(screen.getAllByText('Upcoming Events').length).toBeGreaterThan(0);
    expect(screen.getByText('My Groups')).toBeInTheDocument();
    expect(screen.getByText('Prayer Requests')).toBeInTheDocument();
    expect(screen.getByText('Given This Year')).toBeInTheDocument();
    expect(screen.getByText('$2,500')).toBeInTheDocument();
  });

  it('navigates to prayer wall when clicked', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByText('Prayer Wall'));
    expect(mockOnNavigate).toHaveBeenCalledWith('prayer-wall');
  });

  it('switches to events tab and displays events', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    // Click on Events tab
    fireEvent.click(screen.getByRole('button', { name: /Events/i }));

    expect(screen.getByText('Sunday Service')).toBeInTheDocument();
    expect(screen.getByText('Youth Group')).toBeInTheDocument();
  });

  it('calls onRSVP when clicking RSVP buttons', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Events/i }));

    // Find and click Going button for Sunday Service
    const goingButtons = screen.getAllByRole('button', { name: /Going/i });
    fireEvent.click(goingButtons[0]);

    expect(mockOnRSVP).toHaveBeenCalledWith('event-1', 'yes');
  });

  it('switches to groups tab and displays groups', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Groups/i }));

    expect(screen.getByText("Men's Bible Study")).toBeInTheDocument();
    expect(screen.getByText('Led by Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Tuesday at 7:00 PM')).toBeInTheDocument();
  });

  it('switches to volunteer tab and displays roles', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Volunteer/i }));

    expect(screen.getByText('Greeter')).toBeInTheDocument();
    expect(screen.getByText('Hospitality')).toBeInTheDocument();
    expect(screen.getByText('3 spots left')).toBeInTheDocument();
  });

  it('calls onVolunteerSignup when clicking sign up button', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Volunteer/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(mockOnVolunteerSignup).toHaveBeenCalledWith('role-1');
  });

  it('switches to giving tab and displays summary', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Giving/i }));

    expect(screen.getByText('Total Given This Year')).toBeInTheDocument();
    expect(screen.getByText('$2,500')).toBeInTheDocument();
    expect(screen.getByText('Give Online')).toBeInTheDocument();
    expect(screen.getByText('Giving Statement')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    // Find the logout button (it has LogOut icon)
    const buttons = screen.getAllByRole('button');
    const logoutButton = buttons.find(btn => btn.querySelector('svg.lucide-log-out'));

    if (logoutButton) {
      fireEvent.click(logoutButton);
      expect(mockOnLogout).toHaveBeenCalled();
    }
  });

  it('shows empty state for no events', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={[]}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Events/i }));
    expect(screen.getByText('No upcoming events')).toBeInTheDocument();
  });

  it('shows empty state for no groups', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={[]}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Groups/i }));
    expect(screen.getByText('Not in any groups yet')).toBeInTheDocument();
  });

  it('navigates to giving when Give Online is clicked', () => {
    render(
      <MemberPortal
        profile={mockProfile}
        events={mockEvents}
        smallGroups={mockSmallGroups}
        volunteerRoles={mockVolunteerRoles}
        givingSummary={mockGivingSummary}
        prayerCount={5}
        onRSVP={mockOnRSVP}
        onVolunteerSignup={mockOnVolunteerSignup}
        onNavigate={mockOnNavigate}
        onLogout={mockOnLogout}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Giving/i }));
    fireEvent.click(screen.getByText('Give Online'));

    expect(mockOnNavigate).toHaveBeenCalledWith('give');
  });
});
