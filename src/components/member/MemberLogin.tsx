import { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useMemberAuth } from './MemberAuthContext';

interface MemberLoginProps {
  churchName?: string;
  onBack?: () => void;
}

type LoginStep = 'method' | 'identifier' | 'verify' | 'success';

export function MemberLogin({ churchName = 'Grace Church', onBack }: MemberLoginProps) {
  const {
    lookupMember,
    sendVerificationCode,
    verifyCode,
    error,
    clearError,
  } = useMemberAuth();

  const [step, setStep] = useState<LoginStep>('method');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [maskedContact, setMaskedContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Verification code state (6 digits)
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'verify') {
      setCanResend(true);
    }
  }, [resendCountdown, step]);

  const handleMethodSelect = (selectedMethod: 'phone' | 'email') => {
    setMethod(selectedMethod);
    setStep('identifier');
    clearError();
  };

  const handleIdentifierSubmit = async () => {
    if (!identifier.trim()) return;

    setIsLoading(true);
    clearError();

    try {
      const result = await lookupMember(identifier, method);

      if (!result.found) {
        // Member not found - could show helpful message
        setIsLoading(false);
        return;
      }

      setMaskedContact(result.maskedContact || '');

      // Send verification code
      const sent = await sendVerificationCode(identifier, method);
      if (sent) {
        setStep('verify');
        setResendCountdown(60);
        setCanResend(false);
        // Focus first code input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerifyCode(fullCode);
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    // Focus appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const verifyCodeStr = codeString || code.join('');
    if (verifyCodeStr.length !== 6) return;

    setIsLoading(true);
    clearError();

    try {
      const success = await verifyCode(verifyCodeStr);
      if (success) {
        setStep('success');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setCanResend(false);

    try {
      await sendVerificationCode(identifier, method);
      setResendCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    clearError();
    if (step === 'identifier') {
      setStep('method');
      setIdentifier('');
    } else if (step === 'verify') {
      setStep('identifier');
      setCode(['', '', '', '', '', '']);
    } else if (onBack) {
      onBack();
    }
  };

  // Success step auto-closes
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        // The parent component will handle showing the authenticated view
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-dark-900 dark:to-dark-850 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-850 rounded-3xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{churchName}</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">Member Portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Step: Method Selection */}
        {step === 'method' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-dark-400 mb-6">
              How would you like to sign in?
            </p>

            <button
              onClick={() => handleMethodSelect('phone')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border-2 border-transparent hover:border-indigo-500 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
                <Phone className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Phone Number</p>
                <p className="text-sm text-gray-500 dark:text-dark-400">We'll text you a code</p>
              </div>
              <ArrowRight className="ml-auto text-gray-400" size={20} />
            </button>

            <button
              onClick={() => handleMethodSelect('email')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border-2 border-transparent hover:border-indigo-500 transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Mail className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Email Address</p>
                <p className="text-sm text-gray-500 dark:text-dark-400">We'll email you a code</p>
              </div>
              <ArrowRight className="ml-auto text-gray-400" size={20} />
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="w-full mt-4 py-3 text-gray-500 dark:text-dark-400 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Step: Enter Identifier */}
        {step === 'identifier' && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 dark:text-dark-400 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                {method === 'phone' ? 'Phone Number' : 'Email Address'}
              </label>
              <div className="relative">
                {method === 'phone' ? (
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                ) : (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                )}
                <input
                  type={method === 'phone' ? 'tel' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'phone' ? '(555) 123-4567' : 'you@example.com'}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                  autoComplete={method === 'phone' ? 'tel' : 'email'}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-dark-400">
                Enter the {method === 'phone' ? 'phone number' : 'email'} associated with your membership
              </p>
            </div>

            <button
              onClick={handleIdentifierSubmit}
              disabled={!identifier.trim() || isLoading}
              className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Looking up...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step: Verify Code */}
        {step === 'verify' && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 dark:text-dark-400 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Enter verification code
              </h2>
              <p className="text-gray-500 dark:text-dark-400">
                We sent a code to {maskedContact}
              </p>
            </div>

            {/* Code Input */}
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleCodePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ))}
            </div>

            <button
              onClick={() => handleVerifyCode()}
              disabled={code.some(d => !d) || isLoading}
              className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>

            {/* Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={16} />
                  Resend code
                </button>
              ) : (
                <p className="text-gray-500 dark:text-dark-400 text-sm">
                  Resend code in {resendCountdown}s
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-500 dark:text-dark-400">
              You're now signed in
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
