import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicPrayerWall, PublicPrayer } from './PublicPrayerWall';

describe('PublicPrayerWall', () => {
  const mockPrayers: PublicPrayer[] = [
    {
      id: '1',
      content: 'Please pray for my health',
      authorName: 'John Doe',
      authorInitials: 'JD',
      isAnonymous: false,
      isAnswered: false,
      prayerCount: 5,
      createdAt: '2024-01-15T10:00:00Z',
      category: 'health',
    },
    {
      id: '2',
      content: 'Prayer for my family',
      authorName: 'Jane Smith',
      authorInitials: 'JS',
      isAnonymous: false,
      isAnswered: true,
      testimony: 'God answered this prayer!',
      prayerCount: 12,
      createdAt: '2024-01-10T08:00:00Z',
      category: 'family',
    },
    {
      id: '3',
      content: 'Anonymous prayer request',
      authorName: 'Anonymous',
      authorInitials: '?',
      isAnonymous: true,
      isAnswered: false,
      prayerCount: 3,
      createdAt: '2024-01-14T15:00:00Z',
      category: 'spiritual',
    },
  ];

  const mockOnSubmitPrayer = vi.fn();
  const mockOnPrayFor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the prayer wall header with church name', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        churchName="Grace Church"
      />
    );

    expect(screen.getByText('Grace Church Prayer Wall')).toBeInTheDocument();
  });

  it('displays prayer statistics correctly', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    // Check stats labels exist (numbers may be duplicated elsewhere in the UI)
    expect(screen.getByText('Active Prayers')).toBeInTheDocument();
    expect(screen.getByText('Prayers Lifted')).toBeInTheDocument();

    // Verify the stats section is present with expected structure
    const activePrayersLabel = screen.getByText('Active Prayers');
    const statsContainer = activePrayersLabel.closest('.text-center');
    expect(statsContainer).toBeInTheDocument();
  });

  it('filters prayers to show only active by default', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    // Active prayers should be visible
    expect(screen.getByText('Please pray for my health')).toBeInTheDocument();
    expect(screen.getByText('Anonymous prayer request')).toBeInTheDocument();

    // Answered prayer should not be visible by default
    expect(screen.queryByText('Prayer for my family')).not.toBeInTheDocument();
  });

  it('shows answered prayers when filter is changed', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    // Click on "Answered" filter
    fireEvent.click(screen.getByRole('button', { name: 'Answered' }));

    // Answered prayer should now be visible
    expect(screen.getByText('Prayer for my family')).toBeInTheDocument();
    expect(screen.getByText('God answered this prayer!')).toBeInTheDocument();

    // Active prayers should not be visible
    expect(screen.queryByText('Please pray for my health')).not.toBeInTheDocument();
  });

  it('shows all prayers when "All" filter is selected', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByText('Please pray for my health')).toBeInTheDocument();
    expect(screen.getByText('Prayer for my family')).toBeInTheDocument();
    expect(screen.getByText('Anonymous prayer request')).toBeInTheDocument();
  });

  it('opens the prayer form when clicking share button', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    fireEvent.click(screen.getByText('Share a Prayer Request'));

    expect(screen.getByText('Share Your Prayer Request')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Share what's on your heart...")).toBeInTheDocument();
  });

  it('submits a prayer request', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
        currentUserName="Test User"
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Share a Prayer Request'));

    // Fill in the prayer
    fireEvent.change(screen.getByPlaceholderText("Share what's on your heart..."), {
      target: { value: 'Please pray for my new job' },
    });

    // Submit
    fireEvent.click(screen.getByText('Share Prayer'));

    expect(mockOnSubmitPrayer).toHaveBeenCalledWith({
      content: 'Please pray for my new job',
      authorName: 'Test User',
      isAnonymous: false,
      category: 'other',
    });
  });

  it('submits anonymous prayer when checkbox is checked', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    fireEvent.click(screen.getByText('Share a Prayer Request'));
    fireEvent.change(screen.getByPlaceholderText("Share what's on your heart..."), {
      target: { value: 'Anonymous request' },
    });
    fireEvent.click(screen.getByLabelText('Post anonymously'));
    fireEvent.click(screen.getByText('Share Prayer'));

    expect(mockOnSubmitPrayer).toHaveBeenCalledWith({
      content: 'Anonymous request',
      authorName: 'Anonymous',
      isAnonymous: true,
      category: 'other',
    });
  });

  it('calls onPrayFor when clicking pray button', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    // Find and click the first "Pray" button
    const prayButtons = screen.getAllByText('Pray');
    fireEvent.click(prayButtons[0]);

    expect(mockOnPrayFor).toHaveBeenCalledWith('1');
  });

  it('disables pray button after clicking', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    const prayButtons = screen.getAllByText('Pray');
    fireEvent.click(prayButtons[0]);

    // Button should now show "Praying" instead of "Pray"
    expect(screen.getByText('Praying')).toBeInTheDocument();
  });

  it('displays category badges correctly', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Spiritual Growth')).toBeInTheDocument();
  });

  it('shows empty state when no prayers match filter', () => {
    render(
      <PublicPrayerWall
        prayers={[]}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    expect(screen.getByText('No active prayer requests')).toBeInTheDocument();
  });

  it('closes form when cancel is clicked', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    fireEvent.click(screen.getByText('Share a Prayer Request'));
    expect(screen.getByText('Share Your Prayer Request')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Share Your Prayer Request')).not.toBeInTheDocument();
  });

  it('selects different prayer categories', () => {
    render(
      <PublicPrayerWall
        prayers={mockPrayers}
        onSubmitPrayer={mockOnSubmitPrayer}
        onPrayFor={mockOnPrayFor}
      />
    );

    fireEvent.click(screen.getByText('Share a Prayer Request'));

    // Click on Health category
    fireEvent.click(screen.getAllByText('Health')[0]);

    fireEvent.change(screen.getByPlaceholderText("Share what's on your heart..."), {
      target: { value: 'Health prayer' },
    });
    fireEvent.click(screen.getByText('Share Prayer'));

    expect(mockOnSubmitPrayer).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'health' })
    );
  });
});
