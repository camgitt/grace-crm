import { supabase } from './supabase';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendSmsOptions {
  to: string;
  message: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

// Check if we have the API configured
const apiUrl = import.meta.env.VITE_API_URL;
const isApiConfigured = !!apiUrl;

/**
 * Send email via backend API (Resend)
 * In production, this calls a Supabase Edge Function or your own API
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  // If API not configured, simulate success
  if (!isApiConfigured) {
    console.log('Email API not configured. Simulating send:', options);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return { success: true };
  }

  try {
    // Option 1: Call Supabase Edge Function
    if (supabase) {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          from: options.from || 'GRACE CRM <noreply@yourdomain.com>'
        }
      });

      if (error) throw error;
      return { success: true };
    }

    // Option 2: Call external API
    const response = await fetch(`${apiUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

/**
 * Send SMS via backend API (Twilio)
 * In production, this calls a Supabase Edge Function or your own API
 */
export async function sendSms(options: SendSmsOptions): Promise<EmailResult> {
  // If API not configured, simulate success
  if (!isApiConfigured) {
    console.log('SMS API not configured. Simulating send:', options);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }

  try {
    // Option 1: Call Supabase Edge Function
    if (supabase) {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: options.to,
          message: options.message
        }
      });

      if (error) throw error;
      return { success: true };
    }

    // Option 2: Call external API
    const response = await fetch(`${apiUrl}/api/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send SMS');
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS'
    };
  }
}

/**
 * Send batch emails to multiple recipients
 */
export async function sendBatchEmails(
  emails: Array<{ to: string; subject: string; html: string }>
): Promise<{ successful: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  );

  const errors: string[] = [];
  let successful = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successful++;
    } else {
      failed++;
      const error = result.status === 'rejected'
        ? result.reason?.message
        : result.value.error;
      errors.push(`Failed to send to ${emails[index].to}: ${error}`);
    }
  });

  return { successful, failed, errors };
}
