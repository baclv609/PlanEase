// public/service-worker.js
self.addEventListener('push', function (event) {
    const options = {
        body: event.data ? event.data.text() : 'Có thông báo mới!',
        icon: '/icon.png',
        badge: '/badge.png',
    };

    event.waitUntil(
        self.registration.showNotification('Thông báo nhắc nhở', options)
    );
});
