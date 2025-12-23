// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Firebase configuration will be set dynamically from the main app
// This is a placeholder - the actual config will be injected by the app
let firebaseConfig = null;

// Listen for messages from the main thread to set Firebase config
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    
    if (firebaseConfig && firebaseConfig.firebase_api_key) {
      try {
        firebase.initializeApp({
          apiKey: firebaseConfig.firebase_api_key,
          authDomain: firebaseConfig.firebase_auth_domain,
          projectId: firebaseConfig.firebase_project_id,
          storageBucket: firebaseConfig.firebase_storage_bucket,
          messagingSenderId: firebaseConfig.firebase_messaging_sender_id,
          appId: firebaseConfig.firebase_app_id,
          measurementId: firebaseConfig.firebase_measurement_id,
        });

        const messaging = firebase.messaging();

        // Handle background messages
        messaging.onBackgroundMessage((payload) => {
          const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
          const notificationOptions = {
            body: payload.notification?.body || payload.data?.body || '',
            icon: payload.notification?.icon || payload.data?.icon || '/logo192.png',
            badge: '/logo192.png',
            data: payload.data || {},
          };

          self.registration.showNotification(notificationTitle, notificationOptions);
        });
      } catch (error) {
        console.error('Error initializing Firebase in service worker:', error);
      }
    }
  }
});

// Default notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

