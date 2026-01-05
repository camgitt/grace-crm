import { useState } from 'react';
import { CreditCard, DollarSign, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, isStripeConfigured, DONATION_FUNDS, DonationFund } from '../lib/stripe';

interface DonationFormProps {
  onClose: () => void;
  onSuccess?: (amount: number, fund: DonationFund) => void;
}

export function DonationForm({ onClose, onSuccess }: DonationFormProps) {
  if (!isStripeConfigured()) {
    return <DemoModeForm onClose={onClose} onSuccess={onSuccess} />;
  }

  return (
    <Elements stripe={getStripe()}>
      <StripeForm onClose={onClose} onSuccess={onSuccess} />
    </Elements>
  );
}

function DemoModeForm({ onClose, onSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState('');
  const [fund, setFund] = useState<DonationFund>('tithe');
  const [isRecurring, setIsRecurring] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(numAmount, fund);
        onClose();
      }, 2000);
    }
  };

  const presetAmounts = [25, 50, 100, 250, 500];

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-850 rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-500 dark:text-dark-400">
            Your donation of ${parseFloat(amount).toFixed(2)} has been received.
          </p>
          <p className="text-sm text-gray-400 dark:text-dark-500 mt-4">
            (Demo mode - no actual payment processed)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-850 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
              <Heart className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Give Online</h2>
              <p className="text-sm text-gray-500 dark:text-dark-400">Demo Mode</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    amount === preset.toString()
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Other amount"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Fund Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
              Designation
            </label>
            <div className="space-y-2">
              {DONATION_FUNDS.map((fundOption) => (
                <label
                  key={fundOption.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    fund === fundOption.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/10 dark:border-green-500/50'
                      : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="fund"
                    value={fundOption.id}
                    checked={fund === fundOption.id}
                    onChange={() => setFund(fundOption.id)}
                    className="w-4 h-4 text-green-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{fundOption.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">{fundOption.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Recurring Option */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-green-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Make this a monthly gift</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Automatically give each month</p>
            </div>
          </label>

          {/* Demo Mode Notice */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
            <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Demo Mode</p>
              <p className="text-xs text-amber-700 dark:text-amber-500">
                Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to enable real payments.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-dark-700 rounded-xl text-sm font-medium text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Give ${amount || '0.00'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StripeForm({ onClose, onSuccess }: DonationFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('');
  const [fund, setFund] = useState<DonationFund>('tithe');
  const [isRecurring, setIsRecurring] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError(null);

    // In a real app, you would:
    // 1. Call your backend to create a PaymentIntent
    // 2. Use the clientSecret to confirm the payment
    // For demo purposes, we'll simulate success

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(numAmount, fund);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const presetAmounts = [25, 50, 100, 250, 500];

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-850 rounded-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-500 dark:text-dark-400">
            Your donation of ${parseFloat(amount).toFixed(2)} has been processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-850 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
              <Heart className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Give Online</h2>
              <p className="text-sm text-gray-500 dark:text-dark-400">Secure payment via Stripe</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    amount === preset.toString()
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Other amount"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Fund Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
              Designation
            </label>
            <select
              value={fund}
              onChange={(e) => setFund(e.target.value as DonationFund)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {DONATION_FUNDS.map((fundOption) => (
                <option key={fundOption.id} value={fundOption.id}>
                  {fundOption.name}
                </option>
              ))}
            </select>
          </div>

          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">
              Card Details
            </label>
            <div className="p-4 border border-gray-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      '::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Recurring Option */}
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-green-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Make this a monthly gift</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">Automatically give each month</p>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-dark-700 rounded-xl text-sm font-medium text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Give ${amount || '0.00'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
