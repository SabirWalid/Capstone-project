// Simple Service Worker for testing
console.log('[SW] Simple service worker loading...');

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  self.clients.claim();
});

// Message handler
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'CACHE_COURSE_CONTENT') {
    console.log('[SW] Cache course content request received for:', event.data.courseId);
    // For now, just acknowledge the message
    event.ports[0]?.postMessage({ success: true });
  }
});

console.log('[SW] Simple service worker loaded');
