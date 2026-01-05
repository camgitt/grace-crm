// Clerk configuration
export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const isClerkConfigured = () => {
  return !!clerkPublishableKey && clerkPublishableKey !== 'pk_test_xxx';
};
