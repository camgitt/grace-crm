/**
 * Integrations Context
 *
 * Provides access to all CRM integration services (email, SMS, payments).
 * Credentials are configured via Vercel environment variables for stability and security.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  emailService,
  smsService,
  paymentService,
  SendEmailParams,
  EmailResult,
  SendSMSParams,
  SMSResult,
  CreatePaymentParams,
  PaymentResult,
} from '../lib/services';

export interface IntegrationStatus {
  email: boolean;
  sms: boolean;
  payments: boolean;
}

interface IntegrationsContextType {
  // Status
  status: IntegrationStatus;
  isLoading: boolean;

  // Email methods
  sendEmail: (params: SendEmailParams) => Promise<EmailResult>;
  sendWelcomeEmail: (
    to: { email: string; name?: string },
    data: { firstName: string; churchName: string }
  ) => Promise<EmailResult>;
  sendBirthdayEmail: (
    to: { email: string; name?: string },
    data: { firstName: string; churchName: string }
  ) => Promise<EmailResult>;

  // SMS methods
  sendSMS: (params: SendSMSParams) => Promise<SMSResult>;
  sendWelcomeSMS: (
    to: string,
    data: { firstName: string; churchName: string }
  ) => Promise<SMSResult>;
  sendBirthdaySMS: (
    to: string,
    data: { firstName: string; churchName: string }
  ) => Promise<SMSResult>;
  sendEventReminder: (
    to: string | string[],
    data: {
      eventName: string;
      timeUntil: string;
      eventDate: string;
      eventTime: string;
      churchName: string;
    }
  ) => Promise<SMSResult>;

  // Payment methods
  createPaymentIntent: (params: CreatePaymentParams) => Promise<PaymentResult>;
  getStripe: () => ReturnType<typeof paymentService.getStripe>;
}

const IntegrationsContext = createContext<IntegrationsContextType | null>(null);

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
}

export function IntegrationsProvider({ children }: { children: React.ReactNode }) {
  const configured = useRef(false);
  const [status, setStatus] = useState<IntegrationStatus>({
    email: false,
    sms: false,
    payments: false,
  });

  // Configure services once from environment variables
  useEffect(() => {
    // Prevent re-configuration on re-renders
    if (configured.current) return;
    configured.current = true;

    // Read environment variables
    const emailFromAddress = import.meta.env.VITE_EMAIL_FROM_ADDRESS;
    const emailFromName = import.meta.env.VITE_EMAIL_FROM_NAME;
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    // Configure Email - backend API handles the actual sending
    // Email is considered configured if we have a from address or the API key is set
    const emailConfigured = !!(emailFromAddress || resendApiKey);
    if (emailConfigured) {
      emailService.configure({
        fromEmail: emailFromAddress || 'noreply@grace-crm.com',
        fromName: emailFromName || 'Grace CRM',
      });
    }

    // Configure SMS - backend API handles credentials
    // SMS is considered configured if Twilio account SID is set
    const smsConfigured = !!twilioAccountSid;
    if (smsConfigured) {
      smsService.configure({});
    }

    // Configure Payments - only publishable key needed in frontend
    const paymentsConfigured = !!stripeKey;
    if (paymentsConfigured) {
      paymentService.configure({
        publishableKey: stripeKey,
      });
    }

    // Update status based on env vars
    setStatus({
      email: emailConfigured,
      sms: smsConfigured,
      payments: paymentsConfigured,
    });
  }, []);

  // Email methods
  const sendEmail = useCallback(async (params: SendEmailParams) => {
    return emailService.send(params);
  }, []);

  const sendWelcomeEmail = useCallback(
    async (to: { email: string; name?: string }, data: { firstName: string; churchName: string }) => {
      return emailService.sendWelcomeEmail(to, data);
    },
    []
  );

  const sendBirthdayEmail = useCallback(
    async (to: { email: string; name?: string }, data: { firstName: string; churchName: string }) => {
      return emailService.sendBirthdayEmail(to, data);
    },
    []
  );

  // SMS methods
  const sendSMS = useCallback(async (params: SendSMSParams) => {
    return smsService.send(params);
  }, []);

  const sendWelcomeSMS = useCallback(
    async (to: string, data: { firstName: string; churchName: string }) => {
      return smsService.sendWelcomeSMS(to, data);
    },
    []
  );

  const sendBirthdaySMS = useCallback(
    async (to: string, data: { firstName: string; churchName: string }) => {
      return smsService.sendBirthdaySMS(to, data);
    },
    []
  );

  const sendEventReminder = useCallback(
    async (
      to: string | string[],
      data: {
        eventName: string;
        timeUntil: string;
        eventDate: string;
        eventTime: string;
        churchName: string;
      }
    ) => {
      return smsService.sendEventReminder(to, data);
    },
    []
  );

  // Payment methods
  const createPaymentIntent = useCallback(async (params: CreatePaymentParams) => {
    return paymentService.createPaymentIntent(params);
  }, []);

  const getStripe = useCallback(() => {
    return paymentService.getStripe();
  }, []);

  const value: IntegrationsContextType = {
    status,
    isLoading: false, // No async loading - configured from env vars immediately
    sendEmail,
    sendWelcomeEmail,
    sendBirthdayEmail,
    sendSMS,
    sendWelcomeSMS,
    sendBirthdaySMS,
    sendEventReminder,
    createPaymentIntent,
    getStripe,
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}
