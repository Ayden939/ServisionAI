console.log("register service worker")
self.addEventListener("push", (event) => {

    if (!event.data) {
        console.warn("Push event has no data.");
        return;
    }

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/logo.png",
            tag: data.tag || "update-notification",
            renotify: true,
        })
    );
});


self.addEventListener('notificationclick', function (event) {
    event.notification.close(); 
  
    const targetUrl = '/'; 
  
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        // Check if app is already open
        for (let client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Else, open new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  });
  