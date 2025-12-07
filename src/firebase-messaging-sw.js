importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDYfVmUpqrnoaLUSEmWIHu12f32Dg9aZgk",
  authDomain: "gestor-turnos-6d05b.firebaseapp.com",
  projectId: "gestor-turnos-6d05b",
  storageBucket: "gestor-turnos-6d05b.firebasestorage.app",
  messagingSenderId: "151900514510",
  appId: "1:151900514510:web:22154d60b1ae51cc65489f"
});

const messaging = firebase.messaging();

// Manejo de notificaciones en background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje en background:', payload);
  
  const notificationTitle = payload.notification?.title || 'Nuevo turno';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/assets/icon/favicon.png',
    badge: '/assets/icon/favicon.png',
    data: payload.data,
    tag: payload.data?.turnoId || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver turno'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    // Abrir la aplicación o enfocar si ya está abierta
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const turnoId = event.notification.data?.turnoId;
        const url = turnoId ? `/turnos/${turnoId}` : '/';
        
        // Verificar si ya hay una ventana abierta
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NAVIGATE',
              url: url
            });
            return;
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
