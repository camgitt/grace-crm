/**
 * AI Error Handling Utilities
 *
 * Provides robust error handling for AI service including:
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern
 * - Fallback message templates
 * - Error categorization and logging
 */

// ============================================
// ERROR TYPES
// ============================================

export type AIErrorType =
  | 'network'        // Network/connectivity issues
  | 'rate_limit'     // API rate limiting (429)
  | 'auth'           // Authentication/API key issues (401, 403)
  | 'server'         // Server errors (5xx)
  | 'invalid_request'// Bad request (400)
  | 'content_filter' // Content filtered by safety settings
  | 'timeout'        // Request timeout
  | 'unknown';       // Unknown error

export interface AIError {
  type: AIErrorType;
  message: string;
  retryable: boolean;
  statusCode?: number;
  originalError?: unknown;
}

export function categorizeError(error: unknown, statusCode?: number): AIError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Unable to connect to AI service. Please check your internet connection.',
      retryable: true,
      originalError: error,
    };
  }

  // Timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      type: 'timeout',
      message: 'AI request timed out. Please try again.',
      retryable: true,
      originalError: error,
    };
  }

  // HTTP status code based errors
  if (statusCode) {
    if (statusCode === 429) {
      return {
        type: 'rate_limit',
        message: 'AI service is busy. Please wait a moment and try again.',
        retryable: true,
        statusCode,
      };
    }
    if (statusCode === 401 || statusCode === 403) {
      return {
        type: 'auth',
        message: 'AI service authentication failed. Please contact support.',
        retryable: false,
        statusCode,
      };
    }
    if (statusCode >= 500) {
      return {
        type: 'server',
        message: 'AI service is temporarily unavailable. Using fallback message.',
        retryable: true,
        statusCode,
      };
    }
    if (statusCode === 400) {
      return {
        type: 'invalid_request',
        message: 'Invalid request to AI service.',
        retryable: false,
        statusCode,
      };
    }
  }

  // Check for content filter in error message
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (errorMessage.toLowerCase().includes('safety') || errorMessage.toLowerCase().includes('blocked')) {
    return {
      type: 'content_filter',
      message: 'Message was filtered by content safety. Using fallback message.',
      retryable: false,
      originalError: error,
    };
  }

  return {
    type: 'unknown',
    message: errorMessage || 'An unexpected error occurred.',
    retryable: true,
    originalError: error,
  };
}

// ============================================
// CIRCUIT BREAKER
// ============================================

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of failures before opening
const CIRCUIT_BREAKER_RESET_TIME = 60000; // 1 minute before trying again

// In-memory circuit breaker state
let circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
};

export function isCircuitOpen(): boolean {
  if (!circuitBreaker.isOpen) return false;

  // Check if enough time has passed to try again
  const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailure;
  if (timeSinceLastFailure > CIRCUIT_BREAKER_RESET_TIME) {
    // Half-open state - allow one request through
    return false;
  }

  return true;
}

export function recordSuccess(): void {
  circuitBreaker = {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
  };
}

export function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();

  if (circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitBreaker.isOpen = true;
    console.warn(`[AI Circuit Breaker] Circuit opened after ${circuitBreaker.failures} failures`);
  }
}

export function getCircuitBreakerStatus(): { isOpen: boolean; failures: number; resetIn?: number } {
  if (circuitBreaker.isOpen) {
    const resetIn = Math.max(0, CIRCUIT_BREAKER_RESET_TIME - (Date.now() - circuitBreaker.lastFailure));
    return { isOpen: true, failures: circuitBreaker.failures, resetIn };
  }
  return { isOpen: false, failures: circuitBreaker.failures };
}

// ============================================
// RETRY LOGIC
// ============================================

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxRetries || !shouldRetry(error)) {
        throw error;
      }

      console.warn(`[AI Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// FALLBACK TEMPLATES
// ============================================

export interface FallbackTemplates {
  welcome: (firstName: string, churchName: string) => string;
  birthday: (firstName: string, churchName: string) => string;
  anniversary: (firstName: string, churchName: string, years: number) => string;
  donation: (firstName: string, amount: number, fund: string) => string;
  followUp: (visitorName: string) => string;
  reengagement: (firstName: string) => string;
  eventInvite: (firstName: string, eventName: string, eventDate: string) => string;
  volunteer: (firstName: string, role: string) => string;
  condolence: (firstName: string) => string;
  seasonal: (firstName: string, occasion: string) => string;
}

export const fallbackTemplates: FallbackTemplates = {
  welcome: (firstName, churchName) =>
    `Hi ${firstName}! We're so glad you visited ${churchName}. We'd love to have you back anytime. If you have any questions or want to learn more about getting involved, just let us know!`,

  birthday: (firstName, churchName) =>
    `Happy birthday, ${firstName}! We hope your day is filled with joy and celebration. You're a valued part of our ${churchName} family!`,

  anniversary: (firstName, churchName, years) =>
    `Happy ${years}-year anniversary, ${firstName}! Thank you for being part of ${churchName}. We're so grateful for your presence in our community.`,

  donation: (firstName, amount, fund) =>
    `Thank you, ${firstName}, for your generous gift of $${amount.toFixed(2)} to the ${fund} fund. Your generosity makes a real difference in our community.`,

  followUp: (visitorName) =>
    `It was great to meet you, ${visitorName}! We hope you enjoyed your visit and would love to see you again soon.`,

  reengagement: (firstName) =>
    `Hi ${firstName}, just wanted to check in and see how you're doing. We've been thinking of you and hope all is well!`,

  eventInvite: (firstName, eventName, eventDate) =>
    `Hi ${firstName}! You're invited to ${eventName} on ${eventDate}. We'd love to see you there!`,

  volunteer: (firstName, role) =>
    `Thank you, ${firstName}, for serving as ${role}. Your dedication makes such a difference in our community!`,

  condolence: (firstName) =>
    `${firstName}, we're thinking of you during this difficult time. Please know that our community is here for you.`,

  seasonal: (firstName, occasion) =>
    `Wishing you a wonderful ${occasion}, ${firstName}! May this season bring you peace and joy.`,
};

// ============================================
// HELPER: GENERATE WITH FALLBACK
// ============================================

export interface GenerateWithFallbackOptions<T> {
  generateFn: () => Promise<{ success: boolean; text?: string; error?: string }>;
  fallbackFn: () => T;
  operationName: string;
  skipRetry?: boolean;
}

export interface GenerateWithFallbackResult<T> {
  result: T;
  source: 'ai' | 'fallback';
  error?: AIError;
  attempts?: number;
}

export async function generateWithFallback<T extends string>({
  generateFn,
  fallbackFn,
  operationName,
  skipRetry = false,
}: GenerateWithFallbackOptions<T>): Promise<GenerateWithFallbackResult<T>> {
  // Check circuit breaker first
  if (isCircuitOpen()) {
    console.warn(`[AI] Circuit breaker open, using fallback for ${operationName}`);
    return {
      result: fallbackFn(),
      source: 'fallback',
      error: {
        type: 'rate_limit',
        message: 'AI service temporarily disabled due to repeated failures',
        retryable: false,
      },
    };
  }

  let attempts = 0;
  let lastError: AIError | undefined;

  const operation = async () => {
    attempts++;
    const result = await generateFn();

    if (!result.success) {
      const error = categorizeError(result.error);
      recordFailure();
      throw error;
    }

    recordSuccess();
    return result.text as T;
  };

  try {
    if (skipRetry) {
      const text = await operation();
      return { result: text, source: 'ai', attempts };
    }

    const text = await withRetry(
      operation,
      (error) => {
        const aiError = error as AIError;
        lastError = aiError;
        return aiError.retryable === true;
      },
      { maxRetries: 2 }
    );

    return { result: text, source: 'ai', attempts };
  } catch (error) {
    lastError = error instanceof Error && 'type' in error
      ? (error as unknown as AIError)
      : categorizeError(error);

    console.warn(`[AI] ${operationName} failed after ${attempts} attempts, using fallback:`, lastError.message);

    return {
      result: fallbackFn(),
      source: 'fallback',
      error: lastError,
      attempts,
    };
  }
}

// ============================================
// ERROR LOGGING
// ============================================

export interface AIErrorLog {
  timestamp: string;
  operation: string;
  error: AIError;
  attempts: number;
  usedFallback: boolean;
}

const errorLogs: AIErrorLog[] = [];
const MAX_ERROR_LOGS = 100;

export function logAIError(operation: string, error: AIError, attempts: number, usedFallback: boolean): void {
  const log: AIErrorLog = {
    timestamp: new Date().toISOString(),
    operation,
    error,
    attempts,
    usedFallback,
  };

  errorLogs.unshift(log);
  if (errorLogs.length > MAX_ERROR_LOGS) {
    errorLogs.pop();
  }

  // Also log to console for debugging
  console.error(`[AI Error] ${operation}:`, {
    type: error.type,
    message: error.message,
    attempts,
    usedFallback,
  });
}

export function getRecentAIErrors(limit: number = 10): AIErrorLog[] {
  return errorLogs.slice(0, limit);
}

export function getAIErrorStats(): {
  total: number;
  byType: Record<AIErrorType, number>;
  fallbackRate: number;
} {
  const byType: Record<AIErrorType, number> = {
    network: 0,
    rate_limit: 0,
    auth: 0,
    server: 0,
    invalid_request: 0,
    content_filter: 0,
    timeout: 0,
    unknown: 0,
  };

  let fallbackCount = 0;

  for (const log of errorLogs) {
    byType[log.error.type]++;
    if (log.usedFallback) fallbackCount++;
  }

  return {
    total: errorLogs.length,
    byType,
    fallbackRate: errorLogs.length > 0 ? fallbackCount / errorLogs.length : 0,
  };
}

export function clearAIErrorLogs(): void {
  errorLogs.length = 0;
}
