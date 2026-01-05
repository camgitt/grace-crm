import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && isStripeConfigured()) {
    stripePromise = loadStripe(stripePublishableKey!);
  }
  return stripePromise;
};

export const isStripeConfigured = () => {
  return !!stripePublishableKey && stripePublishableKey !== 'pk_test_xxx';
};

// Donation fund options
export const DONATION_FUNDS = [
  { id: 'tithe', name: 'Tithe', description: 'Regular tithe giving' },
  { id: 'offering', name: 'General Offering', description: 'General church fund' },
  { id: 'missions', name: 'Missions', description: 'Support global missions' },
  { id: 'building', name: 'Building Fund', description: 'Church building projects' },
  { id: 'other', name: 'Other', description: 'Designated giving' },
] as const;

export type DonationFund = typeof DONATION_FUNDS[number]['id'];
