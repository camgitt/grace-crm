import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Person } from '../../types';

interface MemberAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  member: Person | null;
  error: string | null;
}

interface MemberAuthContextType extends MemberAuthState {
  // Lookup member by phone or email
  lookupMember: (identifier: string, type: 'phone' | 'email') => Promise<{ found: boolean; maskedContact?: string }>;
  // Send verification code
  sendVerificationCode: (identifier: string, type: 'phone' | 'email') => Promise<boolean>;
  // Verify code and log in
  verifyCode: (code: string) => Promise<boolean>;
  // Log out
  logout: () => void;
  // Clear error
  clearError: () => void;
}

const MemberAuthContext = createContext<MemberAuthContextType | null>(null);

const MEMBER_SESSION_KEY = 'grace_member_session';
const MEMBER_SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

interface StoredSession {
  memberId: string;
  expiresAt: number;
}

interface MemberAuthProviderProps {
  children: ReactNode;
  people: Person[];
  onAuthChange?: (member: Person | null) => void;
}

export function MemberAuthProvider({ children, people, onAuthChange }: MemberAuthProviderProps) {
  const [state, setState] = useState<MemberAuthState>({
    isAuthenticated: false,
    isLoading: true,
    member: null,
    error: null,
  });

  // Pending verification state
  const [pendingVerification, setPendingVerification] = useState<{
    identifier: string;
    type: 'phone' | 'email';
    code: string;
    memberId: string;
    expiresAt: number;
  } | null>(null);

  // Restore session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(MEMBER_SESSION_KEY);
    if (storedSession) {
      try {
        const session: StoredSession = JSON.parse(storedSession);
        if (session.expiresAt > Date.now()) {
          const member = people.find(p => p.id === session.memberId);
          if (member) {
            setState({
              isAuthenticated: true,
              isLoading: false,
              member,
              error: null,
            });
            onAuthChange?.(member);
            return;
          }
        }
        // Session expired or member not found
        localStorage.removeItem(MEMBER_SESSION_KEY);
      } catch {
        localStorage.removeItem(MEMBER_SESSION_KEY);
      }
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, [people, onAuthChange]);

  // Look up member by phone or email
  const lookupMember = async (identifier: string, type: 'phone' | 'email'): Promise<{ found: boolean; maskedContact?: string }> => {
    setState(prev => ({ ...prev, error: null }));

    // Normalize identifier
    const normalizedIdentifier = type === 'phone'
      ? identifier.replace(/\D/g, '') // Remove non-digits
      : identifier.toLowerCase().trim();

    // Find member
    const member = people.find(p => {
      if (type === 'phone') {
        const memberPhone = p.phone?.replace(/\D/g, '') || '';
        return memberPhone === normalizedIdentifier || memberPhone.endsWith(normalizedIdentifier);
      } else {
        return p.email?.toLowerCase() === normalizedIdentifier;
      }
    });

    if (!member) {
      return { found: false };
    }

    // Return masked contact info for verification
    const maskedContact = type === 'phone'
      ? maskPhone(member.phone || '')
      : maskEmail(member.email || '');

    return { found: true, maskedContact };
  };

  // Send verification code
  const sendVerificationCode = async (identifier: string, type: 'phone' | 'email'): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null }));

    // Normalize identifier
    const normalizedIdentifier = type === 'phone'
      ? identifier.replace(/\D/g, '')
      : identifier.toLowerCase().trim();

    // Find member
    const member = people.find(p => {
      if (type === 'phone') {
        const memberPhone = p.phone?.replace(/\D/g, '') || '';
        return memberPhone === normalizedIdentifier || memberPhone.endsWith(normalizedIdentifier);
      } else {
        return p.email?.toLowerCase() === normalizedIdentifier;
      }
    });

    if (!member) {
      setState(prev => ({ ...prev, error: 'Member not found' }));
      return false;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending verification (expires in 10 minutes)
    setPendingVerification({
      identifier: normalizedIdentifier,
      type,
      code,
      memberId: member.id,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // In a real app, send the code via SMS or email
    // For demo/development, we'll log it to console
    console.log(`[Member Auth] Verification code for ${type === 'phone' ? member.phone : member.email}: ${code}`);

    // Try to send via API
    try {
      const endpoint = type === 'phone' ? '/api/sms/send' : '/api/email/send';
      const body = type === 'phone'
        ? { to: member.phone, message: `Your Grace Church verification code is: ${code}` }
        : {
            to: [member.email],
            subject: 'Your Grace Church Verification Code',
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
          };

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      // API might not be configured, but we still allow login for demo purposes
      console.log('[Member Auth] Could not send verification via API, code logged to console');
    }

    return true;
  };

  // Verify code and log in
  const verifyCode = async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null }));

    if (!pendingVerification) {
      setState(prev => ({ ...prev, error: 'No verification pending' }));
      return false;
    }

    if (Date.now() > pendingVerification.expiresAt) {
      setPendingVerification(null);
      setState(prev => ({ ...prev, error: 'Verification code expired' }));
      return false;
    }

    if (code !== pendingVerification.code) {
      setState(prev => ({ ...prev, error: 'Invalid verification code' }));
      return false;
    }

    // Find member and log in
    const member = people.find(p => p.id === pendingVerification.memberId);
    if (!member) {
      setState(prev => ({ ...prev, error: 'Member not found' }));
      return false;
    }

    // Store session
    const session: StoredSession = {
      memberId: member.id,
      expiresAt: Date.now() + MEMBER_SESSION_EXPIRY,
    };
    localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));

    // Update state
    setState({
      isAuthenticated: true,
      isLoading: false,
      member,
      error: null,
    });

    setPendingVerification(null);
    onAuthChange?.(member);

    return true;
  };

  // Log out
  const logout = () => {
    localStorage.removeItem(MEMBER_SESSION_KEY);
    setState({
      isAuthenticated: false,
      isLoading: false,
      member: null,
      error: null,
    });
    setPendingVerification(null);
    onAuthChange?.(null);
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <MemberAuthContext.Provider
      value={{
        ...state,
        lookupMember,
        sendVerificationCode,
        verifyCode,
        logout,
        clearError,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
}

// Helper functions
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***-***-${digits.slice(-4)}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  const maskedLocal = local.length > 2
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : local[0] + '*';
  return `${maskedLocal}@${domain}`;
}
