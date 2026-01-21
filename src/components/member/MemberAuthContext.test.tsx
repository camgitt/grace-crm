import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemberAuthProvider, useMemberAuth } from './MemberAuthContext';
import type { Person } from '../../types';

// The predictable verification code - Math.random will return 0.5
// Code = Math.floor(100000 + 0.5 * 900000) = Math.floor(100000 + 450000) = 550000
const PREDICTABLE_CODE = '550000';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock console.log for debugging
vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock Math.random to return predictable value for verification codes
const originalRandom = Math.random;
vi.spyOn(Math, 'random').mockImplementation(() => 0.5);

describe('MemberAuthContext', () => {
  const mockPeople: Person[] = [
    {
      id: 'person-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '555-123-4567',
      status: 'member',
      tags: [],
      smallGroups: [],
    },
    {
      id: 'person-2',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@email.com',
      phone: '555-987-6543',
      status: 'visitor',
      tags: [],
      smallGroups: [],
    },
    {
      id: 'person-3',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@email.com',
      phone: null,
      status: 'regular',
      tags: [],
      smallGroups: [],
    },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemberAuthProvider people={mockPeople}>{children}</MemberAuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  // Note: Math.random mock persists across tests to ensure predictable verification codes

  describe('initial state', () => {
    it('starts with unauthenticated state', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.member).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useMemberAuth());
      }).toThrow('useMemberAuth must be used within a MemberAuthProvider');
    });
  });

  describe('lookupMember', () => {
    it('finds member by email', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let lookupResult: { found: boolean; maskedContact?: string };
      await act(async () => {
        lookupResult = await result.current.lookupMember('john.smith@email.com', 'email');
      });

      expect(lookupResult!.found).toBe(true);
      expect(lookupResult!.maskedContact).toMatch(/j.*h@email\.com/);
    });

    it('finds member by phone number', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let lookupResult: { found: boolean; maskedContact?: string };
      await act(async () => {
        lookupResult = await result.current.lookupMember('555-123-4567', 'phone');
      });

      expect(lookupResult!.found).toBe(true);
      expect(lookupResult!.maskedContact).toBe('***-***-4567');
    });

    it('finds member by partial phone number (last digits)', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let lookupResult: { found: boolean; maskedContact?: string };
      await act(async () => {
        lookupResult = await result.current.lookupMember('1234567', 'phone');
      });

      expect(lookupResult!.found).toBe(true);
    });

    it('returns not found for non-existent email', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let lookupResult: { found: boolean; maskedContact?: string };
      await act(async () => {
        lookupResult = await result.current.lookupMember('unknown@email.com', 'email');
      });

      expect(lookupResult!.found).toBe(false);
      expect(lookupResult!.maskedContact).toBeUndefined();
    });

    it('normalizes email lookup (case insensitive)', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let lookupResult: { found: boolean; maskedContact?: string };
      await act(async () => {
        lookupResult = await result.current.lookupMember('JOHN.SMITH@EMAIL.COM', 'email');
      });

      expect(lookupResult!.found).toBe(true);
    });

    it('normalizes phone lookup (removes non-digits)', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let lookupResult: { found: boolean; maskedContact?: string };
      await act(async () => {
        lookupResult = await result.current.lookupMember('(555) 123-4567', 'phone');
      });

      expect(lookupResult!.found).toBe(true);
    });
  });

  describe('sendVerificationCode', () => {
    it('sends code for valid email lookup', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let sent: boolean;
      await act(async () => {
        sent = await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      expect(sent!).toBe(true);
      expect(PREDICTABLE_CODE).toMatch(/^\d{6}$/);
    });

    it('sends code for valid phone lookup', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let sent: boolean;
      await act(async () => {
        sent = await result.current.sendVerificationCode('555-123-4567', 'phone');
      });

      expect(sent!).toBe(true);
      expect(PREDICTABLE_CODE).toMatch(/^\d{6}$/);
    });

    it('returns false for non-existent member', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let sent: boolean;
      await act(async () => {
        sent = await result.current.sendVerificationCode('unknown@email.com', 'email');
      });

      expect(sent!).toBe(false);
      expect(result.current.error).toBe('Member not found');
    });

    it('attempts to call API to send code', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      expect(fetchMock).toHaveBeenCalledWith('/api/email/send', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  describe('verifyCode', () => {
    it('verifies correct code and logs in member', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Send verification code first
      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      // Use captured code
      const code = PREDICTABLE_CODE;
      expect(code).toMatch(/^\d{6}$/);

      // Verify the code
      let verified: boolean;
      await act(async () => {
        verified = await result.current.verifyCode(code);
      });

      expect(verified!).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.member?.id).toBe('person-1');
      expect(result.current.member?.firstName).toBe('John');
    });

    it('rejects invalid code', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Send verification code first
      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      // Try wrong code
      let verified: boolean;
      await act(async () => {
        verified = await result.current.verifyCode('000000');
      });

      expect(verified!).toBe(false);
      expect(result.current.error).toBe('Invalid verification code');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('rejects verification without pending code', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let verified: boolean;
      await act(async () => {
        verified = await result.current.verifyCode('123456');
      });

      expect(verified!).toBe(false);
      expect(result.current.error).toBe('No verification pending');
    });

    it('stores session in localStorage after successful verification', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Send and verify code
      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      const code = PREDICTABLE_CODE;
      expect(code).toMatch(/^\d{6}$/);

      await act(async () => {
        await result.current.verifyCode(code);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'grace_member_session',
        expect.stringContaining('person-1')
      );
    });
  });

  describe('logout', () => {
    it('clears authentication state', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Log in first
      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      const code = PREDICTABLE_CODE;
      expect(code).toMatch(/^\d{6}$/);

      await act(async () => {
        await result.current.verifyCode(code);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Now logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.member).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('grace_member_session');
    });
  });

  describe('session restoration', () => {
    it('restores valid session from localStorage', async () => {
      const session = {
        memberId: 'person-1',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day from now
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(session));

      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.member?.id).toBe('person-1');
    });

    it('clears expired session', async () => {
      const session = {
        memberId: 'person-1',
        expiresAt: Date.now() - 1000, // Expired
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(session));

      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('grace_member_session');
    });

    it('clears session for non-existent member', async () => {
      const session = {
        memberId: 'non-existent-person',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(session));

      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('grace_member_session');
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      const { result } = renderHook(() => useMemberAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger an error
      await act(async () => {
        await result.current.sendVerificationCode('unknown@email.com', 'email');
      });

      expect(result.current.error).toBe('Member not found');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('onAuthChange callback', () => {
    it('calls onAuthChange when member logs in', async () => {
      const onAuthChange = vi.fn();

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <MemberAuthProvider people={mockPeople} onAuthChange={onAuthChange}>
          {children}
        </MemberAuthProvider>
      );

      const { result } = renderHook(() => useMemberAuth(), { wrapper: customWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Log in
      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      const code = PREDICTABLE_CODE;
      expect(code).toMatch(/^\d{6}$/);

      await act(async () => {
        await result.current.verifyCode(code);
      });

      expect(onAuthChange).toHaveBeenCalledWith(expect.objectContaining({
        id: 'person-1',
        firstName: 'John',
      }));
    });

    it('calls onAuthChange with null when member logs out', async () => {
      const onAuthChange = vi.fn();

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <MemberAuthProvider people={mockPeople} onAuthChange={onAuthChange}>
          {children}
        </MemberAuthProvider>
      );

      const { result } = renderHook(() => useMemberAuth(), { wrapper: customWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Log in first
      await act(async () => {
        await result.current.sendVerificationCode('john.smith@email.com', 'email');
      });

      const code = PREDICTABLE_CODE;
      expect(code).toMatch(/^\d{6}$/);

      await act(async () => {
        await result.current.verifyCode(code);
      });

      onAuthChange.mockClear();

      // Now logout
      act(() => {
        result.current.logout();
      });

      expect(onAuthChange).toHaveBeenCalledWith(null);
    });
  });
});
