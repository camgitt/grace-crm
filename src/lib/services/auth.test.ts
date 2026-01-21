import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, ROLE_PERMISSIONS, type User, type UserRole } from './auth';

// Mock the secureFetch function
vi.mock('../../utils/security', () => ({
  secureFetch: vi.fn(),
}));

import { secureFetch } from '../../utils/security';
const mockSecureFetch = secureFetch as ReturnType<typeof vi.fn>;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.setCurrentUser(null);
  });

  describe('configure', () => {
    it('marks service as configured with publishable key', () => {
      authService.configure({ publishableKey: 'pk_test_123' });
      expect(authService.isConfigured()).toBe(true);
    });
  });

  describe('getPermissionsForRole', () => {
    it('returns admin permissions', () => {
      const permissions = authService.getPermissionsForRole('admin');
      expect(permissions).toEqual(ROLE_PERMISSIONS.admin);
      expect(permissions.canManageUsers).toBe(true);
      expect(permissions.canManageSettings).toBe(true);
      expect(permissions.canViewGiving).toBe(true);
      expect(permissions.canExportData).toBe(true);
    });

    it('returns pastor permissions (same as admin)', () => {
      const permissions = authService.getPermissionsForRole('pastor');
      expect(permissions).toEqual(ROLE_PERMISSIONS.pastor);
      expect(permissions.canManageUsers).toBe(true);
    });

    it('returns staff permissions (no user/settings management)', () => {
      const permissions = authService.getPermissionsForRole('staff');
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canManageSettings).toBe(false);
      expect(permissions.canViewGiving).toBe(true);
      expect(permissions.canManagePeople).toBe(true);
    });

    it('returns volunteer permissions (limited access)', () => {
      const permissions = authService.getPermissionsForRole('volunteer');
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canViewGiving).toBe(false);
      expect(permissions.canViewPeople).toBe(true);
      expect(permissions.canManagePeople).toBe(false);
    });

    it('returns member permissions (view-only prayer requests)', () => {
      const permissions = authService.getPermissionsForRole('member');
      expect(permissions.canViewPrayers).toBe(true);
      expect(permissions.canManagePrayers).toBe(false);
      expect(permissions.canViewPeople).toBe(false);
      expect(permissions.canViewGiving).toBe(false);
    });
  });

  describe('hasPermission', () => {
    const createMockUser = (role: UserRole): User => ({
      id: 'user-1',
      clerkId: 'clerk_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role,
      churchId: 'church-1',
      createdAt: new Date().toISOString(),
    });

    it('returns true when user has permission', () => {
      const adminUser = createMockUser('admin');
      expect(authService.hasPermission(adminUser, 'canManageUsers')).toBe(true);
    });

    it('returns false when user lacks permission', () => {
      const volunteerUser = createMockUser('volunteer');
      expect(authService.hasPermission(volunteerUser, 'canViewGiving')).toBe(false);
    });

    it('returns false when user is null', () => {
      expect(authService.hasPermission(null, 'canViewPeople')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    const createMockUser = (role: UserRole): User => ({
      id: 'user-1',
      clerkId: 'clerk_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role,
      churchId: 'church-1',
      createdAt: new Date().toISOString(),
    });

    it('returns true when user has at least one permission', () => {
      const staffUser = createMockUser('staff');
      expect(
        authService.hasAnyPermission(staffUser, ['canManageUsers', 'canViewPeople'])
      ).toBe(true);
    });

    it('returns false when user has none of the permissions', () => {
      const memberUser = createMockUser('member');
      expect(
        authService.hasAnyPermission(memberUser, ['canManageUsers', 'canViewGiving'])
      ).toBe(false);
    });

    it('returns false when user is null', () => {
      expect(
        authService.hasAnyPermission(null, ['canViewPeople'])
      ).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    const createMockUser = (role: UserRole): User => ({
      id: 'user-1',
      clerkId: 'clerk_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role,
      churchId: 'church-1',
      createdAt: new Date().toISOString(),
    });

    it('returns true when user has all permissions', () => {
      const adminUser = createMockUser('admin');
      expect(
        authService.hasAllPermissions(adminUser, ['canManageUsers', 'canManageSettings'])
      ).toBe(true);
    });

    it('returns false when user is missing one permission', () => {
      const staffUser = createMockUser('staff');
      expect(
        authService.hasAllPermissions(staffUser, ['canViewPeople', 'canManageUsers'])
      ).toBe(false);
    });

    it('returns false when user is null', () => {
      expect(
        authService.hasAllPermissions(null, ['canViewPeople'])
      ).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    it('returns correct display name for each role', () => {
      expect(authService.getRoleDisplayName('admin')).toBe('Administrator');
      expect(authService.getRoleDisplayName('pastor')).toBe('Pastor');
      expect(authService.getRoleDisplayName('staff')).toBe('Staff Member');
      expect(authService.getRoleDisplayName('volunteer')).toBe('Volunteer');
      expect(authService.getRoleDisplayName('member')).toBe('Member');
    });
  });

  describe('getAllRoles', () => {
    it('returns all 5 roles with descriptions', () => {
      const roles = authService.getAllRoles();
      expect(roles).toHaveLength(5);
      expect(roles.map(r => r.id)).toEqual(['admin', 'pastor', 'staff', 'volunteer', 'member']);
      roles.forEach(role => {
        expect(role.name).toBeTruthy();
        expect(role.description).toBeTruthy();
      });
    });
  });

  describe('syncUserWithDatabase', () => {
    it('syncs user and returns user object on success', async () => {
      const clerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        imageUrl: 'https://example.com/avatar.jpg',
      };

      const expectedUser: User = {
        id: 'user-1',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'staff',
        churchId: 'church-1',
        createdAt: new Date().toISOString(),
      };

      mockSecureFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(expectedUser),
      });

      const result = await authService.syncUserWithDatabase(clerkUser);

      expect(mockSecureFetch).toHaveBeenCalledWith('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: 'clerk_123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          imageUrl: 'https://example.com/avatar.jpg',
        }),
      });

      expect(result).toEqual(expectedUser);
      expect(authService.getCurrentUser()).toEqual(expectedUser);
    });

    it('returns null on API failure', async () => {
      const clerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        imageUrl: '',
      };

      mockSecureFetch.mockResolvedValue({
        ok: false,
      });

      const result = await authService.syncUserWithDatabase(clerkUser);

      expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
      const clerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: null,
        lastName: null,
        imageUrl: '',
      };

      mockSecureFetch.mockRejectedValue(new Error('Network error'));

      const result = await authService.syncUserWithDatabase(clerkUser);

      expect(result).toBeNull();
    });
  });

  describe('inviteUser', () => {
    it('invites user successfully', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ inviteId: 'invite-123' }),
      });

      const result = await authService.inviteUser({
        email: 'new@example.com',
        role: 'staff',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result.success).toBe(true);
      expect(result.inviteId).toBe('invite-123');
      expect(mockSecureFetch).toHaveBeenCalledWith('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('new@example.com'),
      });
    });

    it('returns error on API failure', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid email' }),
      });

      const result = await authService.inviteUser({
        email: 'invalid',
        role: 'staff',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email');
    });

    it('returns error on network failure', async () => {
      mockSecureFetch.mockRejectedValue(new Error('Network error'));

      const result = await authService.inviteUser({
        email: 'test@example.com',
        role: 'staff',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateUserRole', () => {
    it('updates role successfully', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: true,
      });

      const result = await authService.updateUserRole('user-123', 'admin');

      expect(result.success).toBe(true);
      expect(mockSecureFetch).toHaveBeenCalledWith('/api/auth/users/user-123/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      });
    });

    it('returns error on failure', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Not authorized' }),
      });

      const result = await authService.updateUserRole('user-123', 'admin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized');
    });
  });

  describe('removeUser', () => {
    it('removes user successfully', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: true,
      });

      const result = await authService.removeUser('user-123');

      expect(result.success).toBe(true);
      expect(mockSecureFetch).toHaveBeenCalledWith('/api/auth/users/user-123', {
        method: 'DELETE',
      });
    });

    it('returns error on failure', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Cannot remove last admin' }),
      });

      const result = await authService.removeUser('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot remove last admin');
    });
  });

  describe('getOrganizationUsers', () => {
    it('returns users on success', async () => {
      const mockUsers: User[] = [
        {
          id: 'user-1',
          clerkId: 'clerk_1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          churchId: 'church-1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-2',
          clerkId: 'clerk_2',
          email: 'staff@example.com',
          firstName: 'Staff',
          lastName: 'User',
          role: 'staff',
          churchId: 'church-1',
          createdAt: new Date().toISOString(),
        },
      ];

      mockSecureFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      });

      const result = await authService.getOrganizationUsers();

      expect(result.success).toBe(true);
      expect(result.users).toHaveLength(2);
      expect(result.users?.[0].role).toBe('admin');
    });

    it('returns error on failure', async () => {
      mockSecureFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Not authorized' }),
      });

      const result = await authService.getOrganizationUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authorized');
    });
  });

  describe('getCurrentUser / setCurrentUser', () => {
    it('gets and sets current user', () => {
      const user: User = {
        id: 'user-1',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'staff',
        churchId: 'church-1',
        createdAt: new Date().toISOString(),
      };

      expect(authService.getCurrentUser()).toBeNull();

      authService.setCurrentUser(user);
      expect(authService.getCurrentUser()).toEqual(user);

      authService.setCurrentUser(null);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});

describe('ROLE_PERMISSIONS', () => {
  it('admin has all permissions', () => {
    const permissions = ROLE_PERMISSIONS.admin;
    const allTrue = Object.values(permissions).every(v => v === true);
    expect(allTrue).toBe(true);
  });

  it('pastor has all permissions', () => {
    const permissions = ROLE_PERMISSIONS.pastor;
    const allTrue = Object.values(permissions).every(v => v === true);
    expect(allTrue).toBe(true);
  });

  it('member has minimal permissions', () => {
    const permissions = ROLE_PERMISSIONS.member;
    const trueCount = Object.values(permissions).filter(v => v === true).length;
    expect(trueCount).toBe(1); // Only canViewPrayers
    expect(permissions.canViewPrayers).toBe(true);
  });

  it('volunteer has more permissions than member', () => {
    const volunteerTrue = Object.values(ROLE_PERMISSIONS.volunteer).filter(v => v === true).length;
    const memberTrue = Object.values(ROLE_PERMISSIONS.member).filter(v => v === true).length;
    expect(volunteerTrue).toBeGreaterThan(memberTrue);
  });

  it('staff has more permissions than volunteer', () => {
    const staffTrue = Object.values(ROLE_PERMISSIONS.staff).filter(v => v === true).length;
    const volunteerTrue = Object.values(ROLE_PERMISSIONS.volunteer).filter(v => v === true).length;
    expect(staffTrue).toBeGreaterThan(volunteerTrue);
  });
});
