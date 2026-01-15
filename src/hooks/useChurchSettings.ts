/**
 * Hook for managing church-specific settings including integrations
 *
 * Each church stores their own configuration in the database,
 * making it easy to onboard new churches without code changes.
 *
 * SECURITY: Secret API keys (Stripe secret key, Twilio auth token, Resend API key)
 * are NOT stored here. They must be configured via environment variables on the
 * backend server. Only non-sensitive configuration like publishable keys,
 * from addresses, and phone numbers are stored in the database.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface IntegrationCredentials {
  // Email (Resend) - Only non-secret fields
  // Note: API key should be set via RESEND_API_KEY env var on the backend
  emailFromAddress?: string;
  emailFromName?: string;

  // SMS (Twilio) - Only non-secret fields
  // Note: Account SID and Auth Token should be set via env vars on the backend
  // TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
  twilioPhoneNumber?: string;

  // Payments (Stripe) - Only publishable key (safe for frontend)
  // Note: Secret key should be set via STRIPE_SECRET_KEY env var on the backend
  stripePublishableKey?: string;

  // Auth (Clerk) - Usually set at app level via env var, not per-church
  clerkPublishableKey?: string;
}

export interface ChurchSettings {
  integrations: IntegrationCredentials;
  notifications: {
    newVisitorAlerts: boolean;
    taskReminders: boolean;
    prayerNotifications: boolean;
    birthdayReminders: boolean;
  };
  branding: {
    primaryColor?: string;
    logoUrl?: string;
  };
}

const DEFAULT_SETTINGS: ChurchSettings = {
  integrations: {},
  notifications: {
    newVisitorAlerts: true,
    taskReminders: true,
    prayerNotifications: false,
    birthdayReminders: true,
  },
  branding: {},
};

export function useChurchSettings(churchId: string = 'demo-church') {
  const [settings, setSettings] = useState<ChurchSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from database
  const loadSettings = useCallback(async () => {
    if (!supabase) {
      // Demo mode - use localStorage
      const stored = localStorage.getItem(`grace-crm-settings-${churchId}`);
      if (stored) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('churches')
        .select('settings')
        .eq('id', churchId)
        .single();

      if (fetchError) {
        console.error('Error loading church settings:', fetchError);
        setError(fetchError.message);
      } else if (data?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (err) {
      console.error('Error loading church settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    }

    setIsLoading(false);
  }, [churchId]);

  // Save settings to database
  const saveSettings = useCallback(async (newSettings: Partial<ChurchSettings>): Promise<boolean> => {
    const updatedSettings = { ...settings, ...newSettings };

    if (!supabase) {
      // Demo mode - use localStorage
      localStorage.setItem(`grace-crm-settings-${churchId}`, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      return true;
    }

    try {
      const { error: updateError } = await supabase
        .from('churches')
        .update({ settings: updatedSettings })
        .eq('id', churchId);

      if (updateError) {
        console.error('Error saving church settings:', updateError);
        setError(updateError.message);
        return false;
      }

      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('Error saving church settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      return false;
    }
  }, [churchId, settings]);

  // Save just integration credentials (only non-secret fields allowed)
  const saveIntegrations = useCallback(async (integrations: Partial<IntegrationCredentials>): Promise<boolean> => {
    return saveSettings({
      integrations: { ...settings.integrations, ...integrations }
    });
  }, [saveSettings, settings.integrations]);

  // Clear a specific integration
  const clearIntegration = useCallback(async (integration: 'email' | 'sms' | 'payments' | 'auth'): Promise<boolean> => {
    const clearedIntegrations = { ...settings.integrations };

    switch (integration) {
      case 'email':
        delete clearedIntegrations.emailFromAddress;
        delete clearedIntegrations.emailFromName;
        break;
      case 'sms':
        delete clearedIntegrations.twilioPhoneNumber;
        break;
      case 'payments':
        delete clearedIntegrations.stripePublishableKey;
        break;
      case 'auth':
        delete clearedIntegrations.clerkPublishableKey;
        break;
    }

    return saveSettings({ integrations: clearedIntegrations });
  }, [saveSettings, settings.integrations]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    saveIntegrations,
    clearIntegration,
    reloadSettings: loadSettings,
  };
}
