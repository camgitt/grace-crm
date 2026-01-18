import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VolunteerSignup, VolunteerOpportunity } from './VolunteerSignup';

describe('VolunteerSignup', () => {
  const mockOpportunities: VolunteerOpportunity[] = [
    {
      id: 'opp-1',
      title: 'Greeter',
      ministry: 'Hospitality',
      description: 'Welcome visitors at the door',
      requirements: ['Friendly personality', 'Available Sundays'],
      commitment: '1 Sunday/month',
      schedule: 'Sunday 9:00 AM - 10:30 AM',
      location: 'Main Entrance',
      spotsAvailable: 3,
      totalSpots: 5,
      leaderName: 'Mary Johnson',
      leaderEmail: 'mary@church.com',
      isSignedUp: false,
    },
    {
      id: 'opp-2',
      title: 'Worship Singer',
      ministry: 'Worship',
      description: 'Lead worship through singing',
      requirements: ['Musical ability', 'Committed Christian'],
      commitment: '2 Sundays/month',
      spotsAvailable: 2,
      totalSpots: 6,
      leaderName: 'David Lee',
      isSignedUp: false,
    },
    {
      id: 'opp-3',
      title: 'Sound Tech',
      ministry: 'Worship',
      description: 'Operate sound equipment during services',
      commitment: '2 Sundays/month',
      spotsAvailable: 1,
      totalSpots: 4,
      isSignedUp: true,
      signupDate: '2024-01-10',
    },
  ];

  const mockMyRoles: VolunteerOpportunity[] = [
    {
      id: 'opp-3',
      title: 'Sound Tech',
      ministry: 'Worship',
      description: 'Operate sound equipment during services',
      commitment: '2 Sundays/month',
      schedule: 'Sunday 8:30 AM',
      spotsAvailable: 1,
      totalSpots: 4,
      isSignedUp: true,
      signupDate: '2024-01-10',
    },
  ];

  const mockOnSignup = vi.fn();
  const mockOnWithdraw = vi.fn();
  const mockOnContact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the volunteer signup header with church name', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        churchName="Grace Church"
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    expect(screen.getByText('Serve at Grace Church')).toBeInTheDocument();
    expect(screen.getByText('Use your gifts to make a difference in our community')).toBeInTheDocument();
  });

  it('displays opportunity statistics', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Total opportunities: 3
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();

    // Ministries count: 2 (Hospitality, Worship)
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Ministries')).toBeInTheDocument();
  });

  it('shows available opportunities (excludes signed up)', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={mockMyRoles}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Should show Greeter and Worship Singer in main list
    expect(screen.getByText('Greeter')).toBeInTheDocument();
    expect(screen.getByText('Worship Singer')).toBeInTheDocument();

    // My Roles is collapsed by default, so Sound Tech shouldn't be visible yet
    // Sound Tech is excluded from main list because isSignedUp: true in mockOpportunities
    // Expand My Roles to verify Sound Tech appears there
    fireEvent.click(screen.getByText('My Volunteer Roles (1)'));

    // Now Sound Tech should be visible in My Roles section
    expect(screen.getByText('Sound Tech')).toBeInTheDocument();
  });

  it('toggles My Roles section', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={mockMyRoles}
        userName="John Doe"
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // My Roles toggle should be visible
    expect(screen.getByText('My Volunteer Roles (1)')).toBeInTheDocument();
    expect(screen.getByText('Signed up as John Doe')).toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('My Volunteer Roles (1)'));

    // Should show the role details
    expect(screen.getByText('Sunday 8:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });

  it('calls onWithdraw when clicking withdraw button', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={mockMyRoles}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Expand My Roles
    fireEvent.click(screen.getByText('My Volunteer Roles (1)'));

    // Click withdraw
    fireEvent.click(screen.getByText('Withdraw'));

    expect(mockOnWithdraw).toHaveBeenCalledWith('opp-3');
  });

  it('filters opportunities by search query', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search opportunities...');
    fireEvent.change(searchInput, { target: { value: 'Greeter' } });

    expect(screen.getByText('Greeter')).toBeInTheDocument();
    expect(screen.queryByText('Worship Singer')).not.toBeInTheDocument();
  });

  it('filters opportunities by ministry', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Select Worship ministry
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Worship' } });

    expect(screen.getByText('Worship Singer')).toBeInTheDocument();
    expect(screen.queryByText('Greeter')).not.toBeInTheDocument();
  });

  it('expands opportunity details when clicked', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Click on Greeter opportunity
    fireEvent.click(screen.getByText('Greeter'));

    // Should show requirements
    expect(screen.getByText('Requirements')).toBeInTheDocument();
    expect(screen.getByText('Friendly personality')).toBeInTheDocument();
    expect(screen.getByText('Available Sundays')).toBeInTheDocument();

    // Should show ministry leader
    expect(screen.getByText('Ministry Leader')).toBeInTheDocument();
    expect(screen.getByText('Mary Johnson')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('calls onSignup when clicking sign up button', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Expand Greeter opportunity
    fireEvent.click(screen.getByText('Greeter'));

    // Click Sign Up to Serve
    fireEvent.click(screen.getByText('Sign Up to Serve'));

    expect(mockOnSignup).toHaveBeenCalledWith('opp-1');
  });

  it('calls onContact when clicking contact button', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Expand Greeter opportunity
    fireEvent.click(screen.getByText('Greeter'));

    // Click Contact
    fireEvent.click(screen.getByText('Contact'));

    expect(mockOnContact).toHaveBeenCalledWith('mary@church.com', 'Greeter');
  });

  it('shows spots available badge with correct styling', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // 3 spots left should be green (> 2)
    expect(screen.getByText('3 spots left')).toBeInTheDocument();

    // 2 spots should be in the document
    expect(screen.getByText('2 spots left')).toBeInTheDocument();
  });

  it('shows empty state when no opportunities match filters', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search opportunities...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent role' } });

    expect(screen.getByText('No opportunities match your search')).toBeInTheDocument();
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('clears filters when clicking clear filters button', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search opportunities...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent role' } });

    // Click clear filters
    fireEvent.click(screen.getByText('Clear filters'));

    // Should show all opportunities again
    expect(screen.getByText('Greeter')).toBeInTheDocument();
    expect(screen.getByText('Worship Singer')).toBeInTheDocument();
  });

  it('displays commitment and schedule information', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    expect(screen.getByText('1 Sunday/month')).toBeInTheDocument();
    expect(screen.getByText('Sunday 9:00 AM - 10:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Main Entrance')).toBeInTheDocument();
  });

  it('shows filled spots count', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    // For Greeter: 5-3 = 2 filled out of 5
    expect(screen.getByText('2/5 filled')).toBeInTheDocument();

    // For Worship Singer: 6-2 = 4 filled out of 6
    expect(screen.getByText('4/6 filled')).toBeInTheDocument();
  });

  it('hides my roles section when empty', () => {
    render(
      <VolunteerSignup
        opportunities={mockOpportunities}
        myRoles={[]}
        onSignup={mockOnSignup}
        onWithdraw={mockOnWithdraw}
        onContact={mockOnContact}
      />
    );

    expect(screen.queryByText(/My Volunteer Roles/i)).not.toBeInTheDocument();
  });
});
