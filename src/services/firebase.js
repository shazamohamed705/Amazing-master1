import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

let messagingInstance = null;
let appInstance = null;
let messageListenerSetup = false;

// Send config to service worker
const sendConfigToServiceWorker = (config) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'FIREBASE_CONFIG',
        config: config,
      });
    }).catch((error) => {
      console.warn('Error sending config to service worker:', error);
    });
  }
};

// Initialize Firebase app
export const initializeFirebase = (config) => {
  if (!config || !config.firebase_api_key) {
    console.warn('Firebase config is missing or incomplete');
    return null;
  }

  // If app already initialized, return existing instance
  if (appInstance) {
    return appInstance;
  }

  try {
    const firebaseConfig = {
      apiKey: config.firebase_api_key,
      authDomain: config.firebase_auth_domain,
      projectId: config.firebase_project_id,
      storageBucket: config.firebase_storage_bucket,
      messagingSenderId: config.firebase_messaging_sender_id,
      appId: config.firebase_app_id,
      measurementId: config.firebase_measurement_id,
    };

    // Check if Firebase app already exists
    const existingApps = getApps();
    if (existingApps.length > 0) {
      appInstance = existingApps[0];
    } else {
      appInstance = initializeApp(firebaseConfig);
    }

    // Send config to service worker for background messages
    sendConfigToServiceWorker(config);

    return appInstance;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

// Get messaging instance
export const getMessagingInstance = async () => {
  if (messagingInstance) {
    return messagingInstance;
  }

  // Check if browser supports service workers
  const supported = await isSupported();
  if (!supported) {
    console.warn('This browser does not support Firebase Cloud Messaging');
    return null;
  }

  if (!appInstance) {
    console.warn('Firebase app not initialized. Call initializeFirebase first.');
    return null;
  }

  try {
    messagingInstance = getMessaging(appInstance);
    return messagingInstance;
  } catch (error) {
    console.error('Error getting messaging instance:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (vapidKey) => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return { token: null, permission: 'unsupported' };
    }

    // Check current permission
    const currentPermission = Notification.permission;
    
    // If already granted, try to get token
    if (currentPermission === 'granted') {
      const messaging = await getMessagingInstance();
      if (messaging) {
        try {
          const token = await getToken(messaging, { vapidKey: vapidKey });
          if (token) {
            console.log('FCM Token:', token);
            return { token, permission: 'granted' };
          }
        } catch (tokenError) {
          console.warn('Error getting token:', tokenError);
        }
      }
      return { token: null, permission: 'granted' };
    }

    // If denied, cannot request again
    if (currentPermission === 'denied') {
      console.warn('Notification permission was denied. User must enable it from browser settings.');
      return { token: null, permission: 'denied' };
    }

    // Ensure Firebase is initialized before requesting permission
    if (!appInstance) {
      console.warn('Firebase not initialized. Cannot request permission.');
      return { token: null, permission: currentPermission, error: 'Firebase not initialized' };
    }

    // Request permission (default state)
    const permission = await Notification.requestPermission();
    
    // Update permission state immediately
    if (permission === 'denied') {
      console.warn('User denied notification permission');
      return { token: null, permission: 'denied' };
    }
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted, current state:', permission);
      return { token: null, permission };
    }

    // Get messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('Messaging instance not available');
      return { token: null, permission: 'granted', error: 'Messaging not available' };
    }

    // Get FCM token
    try {
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        console.log('FCM Token obtained successfully');
        return { token, permission: 'granted' };
      } else {
        console.warn('No registration token available');
        return { token: null, permission: 'granted', error: 'No token available' };
      }
    } catch (tokenError) {
      console.error('Error getting FCM token:', tokenError);
      return { token: null, permission: 'granted', error: tokenError.message };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { token: null, permission: Notification.permission || 'default', error: error.message };
  }
};

// Listen for foreground messages
export const onMessageListener = (callback) => {
  // Prevent multiple listener setups
  if (messageListenerSetup) {
    return;
  }
  
  getMessagingInstance()
    .then((messaging) => {
      if (messaging && !messageListenerSetup) {
        messageListenerSetup = true;
        onMessage(messaging, (payload) => {
          callback(payload);
        });
      }
    })
    .catch((error) => {
      console.error('Error setting up message listener:', error);
      messageListenerSetup = false; // Allow retry on error
    });
};

export default {
  initializeFirebase,
  getMessagingInstance,
  requestNotificationPermission,
  onMessageListener,
};

