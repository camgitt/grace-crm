import { AlertTriangle, Phone, X, ChevronRight } from 'lucide-react';
import type { CrisisAlert } from '../../types';

interface CrisisBannerProps {
  alerts: CrisisAlert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onViewConversation: (conversationId: string) => void;
}

const SEVERITY_STYLES = {
  critical: {
    bg: 'bg-red-600 dark:bg-red-700',
    text: 'text-white',
    icon: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
  },
  high: {
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-white',
    icon: 'text-white',
    button: 'bg-white/20 hover:bg-white/30 text-white',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20',
    text: 'text-amber-800 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    button: 'bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300',
  },
};

export function CrisisBanner({ alerts, onAcknowledge, onDismiss, onViewConversation }: CrisisBannerProps) {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {activeAlerts.map(alert => {
        const styles = SEVERITY_STYLES[alert.severity];
        return (
          <div
            key={alert.id}
            className={`rounded-xl px-4 py-3 ${styles.bg} ${alert.severity === 'critical' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className={styles.icon} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${styles.text}`}>
                  {alert.severity === 'critical' ? 'CRISIS ALERT' : alert.severity === 'high' ? 'High Priority Alert' : 'Care Alert'}
                  {alert.triggerDetail && (
                    <span className="font-normal ml-2 opacity-90">— {alert.triggerDetail}</span>
                  )}
                </p>
                <p className={`text-xs mt-0.5 opacity-80 ${styles.text}`}>
                  Detected: {new Date(alert.createdAt).toLocaleTimeString()} via {alert.triggerType}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onViewConversation(alert.conversationId)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${styles.button}`}
                >
                  View <ChevronRight size={12} />
                </button>
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${styles.button}`}
                >
                  <Phone size={12} />
                  Respond
                </button>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className={`p-1.5 rounded-lg transition-colors ${styles.button}`}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
