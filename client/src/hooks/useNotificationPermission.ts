import { useEffect, useState } from 'react';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionStatus>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verifica se il browser supporta le Web Notifications
    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as NotificationPermissionStatus);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermissionStatus> => {
    if (!isSupported) {
      console.warn('Web Notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermissionStatus);
      return result as NotificationPermissionStatus;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported) {
      console.warn('Web Notifications not supported');
      return;
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
  };
}
