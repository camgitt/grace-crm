import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmallGroupHub, SmallGroupData } from './SmallGroupHub';

describe('SmallGroupHub', () => {
  const mockGroup: SmallGroupData = {
    id: 'group-1',
    name: "Men's Bible Study",
    description: 'Weekly study group for men',
    meetingDay: 'Tuesday',
    meetingTime: '7:00 PM',
    location: 'Room 201',
    members: [
      {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isLeader: true,
      },
      {
        id: 'user-2',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        isLeader: false,
      },
      {
        id: 'user-3',
        firstName: 'Mike',
        lastName: 'Johnson',
        isLeader: false,
      },
    ],
    announcements: [
      {
        id: 'ann-1',
        content: 'No meeting next week due to holiday',
        authorName: 'John Doe',
        createdAt: '2024-01-15T10:00:00Z',
        isPinned: true,
      },
      {
        id: 'ann-2',
        content: 'Bring your study guides',
        authorName: 'John Doe',
        createdAt: '2024-01-14T08:00:00Z',
        isPinned: false,
      },
    ],
    messages: [
      {
        id: 'msg-1',
        content: 'Looking forward to tonight!',
        authorId: 'user-2',
        authorName: 'Bob Smith',
        authorInitials: 'BS',
        createdAt: '2024-01-16T14:00:00Z',
      },
    ],
    prayerRequests: [
      {
        id: 'prayer-1',
        content: 'Please pray for my job interview',
        authorName: 'Mike Johnson',
        createdAt: '2024-01-15T09:00:00Z',
        isAnswered: false,
        prayerCount: 3,
      },
      {
        id: 'prayer-2',
        content: 'Thank God for my recovery',
        authorName: 'Bob Smith',
        createdAt: '2024-01-10T12:00:00Z',
        isAnswered: true,
        prayerCount: 5,
      },
    ],
    upcomingMeetings: [
      {
        id: 'meeting-1',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        attendees: ['user-1', 'user-2'],
        notes: 'Chapter 5 discussion',
      },
    ],
  };

  const mockOnSendMessage = vi.fn();
  const mockOnPostAnnouncement = vi.fn();
  const mockOnSubmitPrayer = vi.fn();
  const mockOnPrayFor = vi.fn();
  const mockOnRSVP = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the group header with name and description', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.getByText("Men's Bible Study")).toBeInTheDocument();
    expect(screen.getByText('Weekly study group for men')).toBeInTheDocument();
  });

  it('displays meeting schedule and location', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.getByText('Tuesdays at 7:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Room 201')).toBeInTheDocument();
    expect(screen.getByText('3 members')).toBeInTheDocument();
    expect(screen.getByText('Led by John')).toBeInTheDocument();
  });

  it('shows announcements on the feed tab', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.getByText('No meeting next week due to holiday')).toBeInTheDocument();
    expect(screen.getByText('Bring your study guides')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('shows next meeting card with RSVP buttons', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.getByText('Next Meeting')).toBeInTheDocument();
    expect(screen.getByText('2 confirmed')).toBeInTheDocument();
    expect(screen.getByText('Going')).toBeInTheDocument();
    expect(screen.getByText("Can't Go")).toBeInTheDocument();
  });

  it('calls onRSVP when clicking Going button', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-3"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByText('Going'));
    expect(mockOnRSVP).toHaveBeenCalledWith('group-1', 'meeting-1', true);
  });

  it('shows announcement form for leaders', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1" // Leader
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.getByText('Post Announcement')).toBeInTheDocument();
  });

  it('hides announcement form for non-leaders', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-2" // Non-leader
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.queryByText('Post Announcement')).not.toBeInTheDocument();
  });

  it('submits announcement when form is filled', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Post Announcement'));

    // Fill and submit
    const textarea = screen.getByPlaceholderText('Write an announcement for your group...');
    fireEvent.change(textarea, { target: { value: 'New announcement' } });
    fireEvent.click(screen.getByText('Post'));

    expect(mockOnPostAnnouncement).toHaveBeenCalledWith('group-1', 'New announcement');
  });

  it('switches to messages tab and displays messages', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Messages/i }));

    expect(screen.getByText('Looking forward to tonight!')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a message to your group...')).toBeInTheDocument();
  });

  it('sends a message', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Messages/i }));

    const input = screen.getByPlaceholderText('Write a message to your group...');
    fireEvent.change(input, { target: { value: 'Hello everyone!' } });

    // Find and click the send button
    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(mockOnSendMessage).toHaveBeenCalledWith('group-1', 'Hello everyone!');
  });

  it('switches to prayer tab and displays prayer requests', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Prayer/i }));

    expect(screen.getByText('Please pray for my job interview')).toBeInTheDocument();
    expect(screen.getByText('Thank God for my recovery')).toBeInTheDocument();
    expect(screen.getByText('Answered')).toBeInTheDocument();
    expect(screen.getByText('3 praying')).toBeInTheDocument();
  });

  it('submits a prayer request', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Prayer/i }));

    const textarea = screen.getByPlaceholderText('Share a prayer request with your group...');
    fireEvent.change(textarea, { target: { value: 'Pray for my family' } });
    fireEvent.click(screen.getByText('Share Prayer Request'));

    expect(mockOnSubmitPrayer).toHaveBeenCalledWith('group-1', 'Pray for my family');
  });

  it('calls onPrayFor when clicking pray button', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Prayer/i }));

    // Find the first "Pray" button (for unanswered prayer)
    const prayButtons = screen.getAllByText('Pray');
    fireEvent.click(prayButtons[0]);

    expect(mockOnPrayFor).toHaveBeenCalledWith('group-1', 'prayer-1');
  });

  it('disables pray button after clicking', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Prayer/i }));

    const prayButtons = screen.getAllByText('Pray');
    fireEvent.click(prayButtons[0]);

    expect(screen.getByText('Praying')).toBeInTheDocument();
  });

  it('switches to members tab and displays all members', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Members/i }));

    expect(screen.getByText('Group Members (3)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Johnson')).toBeInTheDocument();
    expect(screen.getByText('Leader')).toBeInTheDocument();
  });

  it('shows member email when available', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Members/i }));

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows empty state for no announcements', () => {
    const groupWithNoAnnouncements = {
      ...mockGroup,
      announcements: [],
    };

    render(
      <SmallGroupHub
        group={groupWithNoAnnouncements}
        currentUserId="user-2"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    expect(screen.getByText('No announcements yet')).toBeInTheDocument();
  });

  it('shows empty state for no messages', () => {
    const groupWithNoMessages = {
      ...mockGroup,
      messages: [],
    };

    render(
      <SmallGroupHub
        group={groupWithNoMessages}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Messages/i }));

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation with your group')).toBeInTheDocument();
  });

  it('shows empty state for no prayer requests', () => {
    const groupWithNoPrayers = {
      ...mockGroup,
      prayerRequests: [],
    };

    render(
      <SmallGroupHub
        group={groupWithNoPrayers}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Prayer/i }));

    expect(screen.getByText('No prayer requests yet')).toBeInTheDocument();
  });

  it('cancels announcement form', () => {
    render(
      <SmallGroupHub
        group={mockGroup}
        currentUserId="user-1"
        onSendMessage={mockOnSendMessage}
        onPostAnnouncement={mockOnPostAnnouncement}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        onRSVP={mockOnRSVP}
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Post Announcement'));
    expect(screen.getByPlaceholderText('Write an announcement for your group...')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Write an announcement for your group...')).not.toBeInTheDocument();
    expect(screen.getByText('Post Announcement')).toBeInTheDocument();
  });
});
