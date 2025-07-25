const CACHE_NAME = 'refugee-techpreneurs-v4';
const DATA_CACHE_NAME = 'refugee-techpreneurs-data-v4';

console.log('[SW] Service Worker loading...');

// Install event - simplified caching
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache opened');
      return Promise.resolve(); // Don't pre-cache anything to avoid failures
    }).then(() => {
      console.log('[SW] Install complete');
      return self.skipWaiting();
    }).catch(error => {
      console.error('[SW] Install failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, network, or show offline page
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with cache-first strategy for better offline experience
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          // If we have cached data, return it
          if (cachedResponse) {
            // Try to fetch fresh data in background if online
            if (navigator.onLine) {
              fetch(request).then(response => {
                if (response.ok) {
                  cache.put(request, response.clone());
                }
              }).catch(() => {
                // Ignore network errors for background sync
              });
            }
            return cachedResponse;
          }

          // No cached data, try network
          return fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Return empty array for failed API requests when offline
            return new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If request fails and it's a navigation request, show offline page
        if (request.destination === 'document') {
          return caches.match('/dashboard.html');
        }
      });
    })
  );
});

// Background sync event
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncOfflineProgress());
  }
  
  if (event.tag === 'sync-enrollments') {
    event.waitUntil(syncOfflineEnrollments());
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'CACHE_COURSE_CONTENT') {
    event.waitUntil(cacheCourseContent(event.data.courseId, event.data.course));
  }
  
  if (event.data && event.data.type === 'CACHE_RESOURCE_CONTENT') {
    event.waitUntil(cacheResourceContent(event.data.resourceId));
  }
  
  if (event.data && event.data.type === 'FORCE_SYNC') {
    event.waitUntil(syncAllOfflineData());
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache course content for offline access
async function cacheCourseContent(courseId, courseData = null) {
  try {
    console.log('[SW] Starting to cache course content:', courseId);
    const cache = await caches.open(DATA_CACHE_NAME);
    
    // Cache the main course API endpoint
    const courseApiUrl = `http://localhost:5000/api/courses/${courseId}`;
    
    let course = courseData;
    if (!course) {
      const courseResponse = await fetch(courseApiUrl);
      if (courseResponse.ok) {
        await cache.put(courseApiUrl, courseResponse.clone());
        course = await courseResponse.json();
        console.log('[SW] Course API cached:', courseApiUrl);
      } else {
        console.error('[SW] Failed to fetch course:', courseResponse.status);
        return;
      }
    } else {
      // Cache the provided course data
      const courseResponse = new Response(JSON.stringify(course), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(courseApiUrl, courseResponse);
      console.log('[SW] Course data cached from provided data');
    }
    
    // Cache course materials if they exist
    if (course && course.materials && Array.isArray(course.materials)) {
      console.log('[SW] Caching course materials:', course.materials.length);
      for (const materialUrl of course.materials) {
        try {
          let fullUrl = materialUrl;
          
          // Handle relative URLs
          if (!materialUrl.startsWith('http')) {
            if (materialUrl.startsWith('/')) {
              fullUrl = `http://localhost:5000${materialUrl}`;
            } else {
              fullUrl = `http://localhost:5000/${materialUrl}`;
            }
          }
          
          console.log('[SW] Caching material:', fullUrl);
          const materialResponse = await fetch(fullUrl);
          if (materialResponse.ok) {
            await cache.put(fullUrl, materialResponse);
            // Also cache with original URL for local access
            if (fullUrl !== materialUrl) {
              await cache.put(materialUrl, materialResponse.clone());
            }
            console.log('[SW] Material cached successfully:', materialUrl);
          } else {
            console.warn('[SW] Failed to cache material:', fullUrl, materialResponse.status);
          }
        } catch (error) {
          console.warn('[SW] Error caching material:', materialUrl, error.message);
        }
      }
    }
    
    // Cache course thumbnails/images if they exist
    if (course && course.thumbnail) {
      try {
        let thumbnailUrl = course.thumbnail;
        if (!thumbnailUrl.startsWith('http')) {
          thumbnailUrl = `http://localhost:5000${course.thumbnail}`;
        }
        
        const thumbnailResponse = await fetch(thumbnailUrl);
        if (thumbnailResponse.ok) {
          await cache.put(thumbnailUrl, thumbnailResponse);
          await cache.put(course.thumbnail, thumbnailResponse.clone());
          console.log('[SW] Course thumbnail cached:', course.thumbnail);
        }
      } catch (error) {
        console.warn('[SW] Failed to cache course thumbnail:', error.message);
      }
    }
    
    console.log('[SW] Course content cached successfully:', courseId);
  } catch (error) {
    console.error('[SW] Error caching course content:', error);
  }
}

// Cache resource content for offline access
async function cacheResourceContent(resourceId) {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const resourceResponse = await fetch(`/api/resources/${resourceId}`);
    
    if (resourceResponse.ok) {
      await cache.put(`/api/resources/${resourceId}`, resourceResponse.clone());
      
      const resource = await resourceResponse.json();
      
      // Cache resource URL if it's a file
      if (resource.url && !resource.url.startsWith('http')) {
        try {
          const fileResponse = await fetch(resource.url);
          if (fileResponse.ok) {
            await cache.put(resource.url, fileResponse);
          }
        } catch (error) {
          console.log('[SW] Failed to cache resource file:', resource.url);
        }
      }
    }
    
    console.log('[SW] Resource content cached:', resourceId);
  } catch (error) {
    console.error('[SW] Error caching resource content:', error);
  }
}

// Sync offline progress data
async function syncOfflineProgress() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['offlineProgress'], 'readonly');
    const store = tx.objectStore('offlineProgress');
    const offlineProgress = await store.getAll();
    
    if (offlineProgress.length > 0) {
      const response = await fetch('/api/sync/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ progressData: offlineProgress })
      });
      
      if (response.ok) {
        // Clear synced progress
        const clearTx = db.transaction(['offlineProgress'], 'readwrite');
        const clearStore = clearTx.objectStore('offlineProgress');
        await clearStore.clear();
        console.log('[SW] Progress synced successfully');
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing progress:', error);
  }
}

// Sync offline enrollments
async function syncOfflineEnrollments() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['offlineEnrollments'], 'readonly');
    const store = tx.objectStore('offlineEnrollments');
    const offlineEnrollments = await store.getAll();
    
    if (offlineEnrollments.length > 0) {
      for (const enrollment of offlineEnrollments) {
        try {
          const response = await fetch('/api/enrollments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(enrollment.data)
          });
          
          if (response.ok) {
            // Remove synced enrollment
            const deleteTx = db.transaction(['offlineEnrollments'], 'readwrite');
            const deleteStore = deleteTx.objectStore('offlineEnrollments');
            await deleteStore.delete(enrollment.id);
          }
        } catch (error) {
          console.error('[SW] Error syncing enrollment:', error);
        }
      }
      console.log('[SW] Enrollments synced successfully');
    }
  } catch (error) {
    console.error('[SW] Error syncing enrollments:', error);
  }
}

// Sync all offline data
async function syncAllOfflineData() {
  await Promise.all([
    syncOfflineProgress(),
    syncOfflineEnrollments()
  ]);
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('refugee-techpreneurs-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('offlineProgress')) {
        db.createObjectStore('offlineProgress', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineEnrollments')) {
        db.createObjectStore('offlineEnrollments', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineCourses')) {
        db.createObjectStore('offlineCourses', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offlineResources')) {
        db.createObjectStore('offlineResources', { keyPath: 'id' });
      }
    };
  });
}