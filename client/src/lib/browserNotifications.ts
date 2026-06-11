import { useNotificationPermission } from '@/hooks/useNotificationPermission';

export interface BrowserNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

/**
 * Invia una notifica del browser se i permessi sono concessi
 */
export function sendBrowserNotification(options: BrowserNotificationOptions) {
  if (!('Notification' in window)) {
    console.warn('Web Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge,
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? false,
      silent: options.silent ?? false,
    });

    // Chiudi la notifica dopo 5 secondi se non richiede interazione
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    return notification;
  } catch (error) {
    console.error('Error sending browser notification:', error);
  }
}

/**
 * Richiedi permessi per le notifiche del browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Web Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Invia una notifica per un report con priorità ALTA
 */
export function notifyHighPriorityReport(reportType: 'ANDREANI' | 'DDT', title: string) {
  const body = reportType === 'ANDREANI' 
    ? `Nuova email da Fabio Andreani con priorità ALTA: ${title}`
    : `Nuovo DDT prodotto HERO: ${title}`;

  sendBrowserNotification({
    title: '🔔 Nuovo Report Importante',
    body,
    icon: '/favicon.ico',
    tag: `report-${Date.now()}`,
    requireInteraction: true,
  });
}
