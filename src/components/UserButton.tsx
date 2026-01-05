import { UserButton as ClerkUserButton, useUser } from '@clerk/clerk-react';
import { User } from 'lucide-react';
import { isClerkConfigured } from '../lib/clerk';

export function UserButton() {
  // If Clerk is not configured, show a demo user button
  if (!isClerkConfigured()) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 dark:bg-dark-800">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          <User size={16} />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Demo User</p>
          <p className="text-xs text-gray-500 dark:text-dark-400">demo@grace.church</p>
        </div>
      </div>
    );
  }

  return <AuthenticatedUserButton />;
}

function AuthenticatedUserButton() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="w-8 h-8 bg-gray-200 dark:bg-dark-700 rounded-full animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
          {user?.firstName || 'User'}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-400">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>
      <ClerkUserButton
        appearance={{
          elements: {
            avatarBox: 'w-9 h-9',
            userButtonPopoverCard: 'dark:bg-dark-850 dark:border-dark-700',
            userButtonPopoverActionButton: 'dark:hover:bg-dark-800',
            userButtonPopoverActionButtonText: 'dark:text-dark-100',
            userButtonPopoverFooter: 'hidden'
          }
        }}
      />
    </div>
  );
}
