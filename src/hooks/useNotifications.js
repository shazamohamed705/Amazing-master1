import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from './useSettings';
import { initializeFirebase, requestNotificationPermission, onMessageListener } from '../services/firebase';

// Notification sound URL
const NOTIFICATION_SOUND_URL = 'https://storage-te.com/backend/storage/app/public/settings/sounds/cULGUWCR2ie7ku1ay5jaWKsmJe2XuPElfstBkpAs.mp3';

// Play notification sound
const playNotificationSound = async () => {
  try {
    // Create audio instance with preload for better performance
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.preload = 'auto';
    audio.volume = 0.7; // Set reasonable volume

    // Play the sound
    await audio.play();
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
    // Some browsers block autoplay, this is expected
  }
};

const TOKEN_STORAGE_KEY = 'fcm_token';
const NOTIFICATIONS_STORAGE_KEY = 'notifications_list';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

// Check if Notification API is supported
const isNotificationSupported = typeof Notification !== 'undefined';

// Load notifications from localStorage
const loadNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn('Failed to save notifications:', error);
  }
};

// Add notification to list
const addNotification = (notification) => {
  const notifications = loadNotifications();
  const newNotification = {
    id: Date.now().toString(),
    title: notification.notification?.title || notification.data?.title || 'إشعار جديد',
    body: notification.notification?.body || notification.data?.body || '',
    icon: notification.notification?.icon || notification.data?.icon || '/logo192.png',
    timestamp: Date.now(),
    read: false,
    data: notification.data || {},
  };

  // Add to beginning of array (newest first)
  notifications.unshift(newNotification);

  // Keep only last 100 notifications
  if (notifications.length > 100) {
    notifications.splice(100);
  }

  saveNotifications(notifications);
  return newNotification;
};

export const useNotifications = () => {
  const { settings = {} } = useSettings();
  const [notifications, setNotifications] = useState(loadNotifications);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [permission, setPermission] = useState(() =>
    isNotificationSupported ? Notification.permission : 'unsupported'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  const initializedRef = useRef(false);
  const serviceWorkerRegisteredRef = useRef(false);
  const messageListenerSetupRef = useRef(false);
  const notificationsEnabledRef = useRef(notificationsEnabled);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  // Register service worker (once)
  useEffect(() => {
    if (serviceWorkerRegisteredRef.current) return;

    if ('serviceWorker' in navigator) {
      serviceWorkerRegisteredRef.current = true;
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
          serviceWorkerRegisteredRef.current = false;
        });
    }
  }, []);

  // Initialize Firebase when settings are loaded (once)
  useEffect(() => {
    if (initializedRef.current) return;
    if (!settings || !settings.firebase_api_key || !settings.firebase_vapid_key) return;

    initializedRef.current = true;

    const initFirebase = async () => {
      try {
        const app = initializeFirebase({
          firebase_api_key: settings.firebase_api_key,
          firebase_auth_domain: settings.firebase_auth_domain,
          firebase_project_id: settings.firebase_project_id,
          firebase_storage_bucket: settings.firebase_storage_bucket,
          firebase_messaging_sender_id: settings.firebase_messaging_sender_id,
          firebase_app_id: settings.firebase_app_id,
          firebase_measurement_id: settings.firebase_measurement_id,
        });

        if (!app) {
          console.warn('Firebase initialization failed');
          initializedRef.current = false;
          return;
        }

        const currentPermission = isNotificationSupported ? Notification.permission : 'unsupported';
        setPermission(currentPermission);

        if (currentPermission === 'granted') {
          const result = await requestNotificationPermission(settings.firebase_vapid_key);
          if (result?.token) {
            setToken(result.token);
            localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
          }
        }

        // Setup message listener
        if (!messageListenerSetupRef.current) {
          messageListenerSetupRef.current = true;
          onMessageListener((payload) => {
            const notification = addNotification(payload);
            setNotifications((prev) => [notification, ...prev]);

            if (isNotificationSupported && Notification.permission === 'granted' && notificationsEnabledRef.current) {
              try {
                new Notification(notification.title, {
                  body: notification.body,
                  icon: notification.icon,
                  badge: '/logo192.png',
                });
              } catch (notifError) {
                console.warn('Error showing notification:', notifError);
              }
            }

            // Play notification sound if notifications are enabled
            if (notificationsEnabledRef.current) {
              playNotificationSound();
            }
          });
        }
      } catch (err) {
        console.error('Error initializing notifications:', err);
        setError(err.message);
        initializedRef.current = false;
      }
    };

    initFirebase();
  }, [settings?.firebase_api_key, settings?.firebase_vapid_key]);

  // Periodically update permission state
  useEffect(() => {
    if (!isNotificationSupported) return;

    const updatePermission = () => {
      setPermission(Notification.permission || 'default');
    };

    const interval = setInterval(updatePermission, 1000);
    return () => clearInterval(interval);
  }, []);

  // Request permission manually
  const requestPermission = useCallback(async () => {
    if (!isNotificationSupported) {
      setPermission('unsupported');
      return 'unsupported';
    }

    setLoading(true);
    setError(null);

    try {
      if (!settings?.firebase_vapid_key) throw new Error('Firebase settings not loaded');

      const result = await requestNotificationPermission(settings.firebase_vapid_key);
      const currentPermission = result?.permission || Notification.permission;
      setPermission(currentPermission);

      if (result?.token) {
        setToken(result.token);
        localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      }

      return currentPermission;
    } catch (err) {
      setError(err.message);
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      return currentPermission;
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const toggleNotifications = useCallback(() => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, newState.toString());

    // Play sound when enabling notifications as confirmation
    if (newState) {
      playNotificationSound();
    }
  }, [notificationsEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    token,
    permission,
    loading,
    error,
    unreadCount,
    notificationsEnabled,
    requestPermission,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};

export default useNotifications;
