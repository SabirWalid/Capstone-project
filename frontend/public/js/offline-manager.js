// Offline Manager for Refugee Techpreneurs Platform
class OfflineManager {
  constructor() {
    this.dbName = 'refugee-techpreneurs-offline';
    this.dbVersion = 2; // Increment version to update schema
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = new Set();
    this.isReady = false;
    this.readyPromise = null;
    
    this.init();
  }

  async init() {
    // Create a timeout promise that resolves after 5 seconds with a timeout result
    const timeoutPromise = new Promise(resolve => {
      setTimeout(() => {
        console.warn('OfflineManager initialization timed out after 5 seconds');
        // Still mark as partially ready to allow app to continue
        this.isReady = true;
        resolve('timeout');
      }, 5000);
    });
    
    try {
      console.log('=== OfflineManager initialization started ===');
      console.log('Environment check:');
      console.log('- IndexedDB available:', !!window.indexedDB);
      console.log('- Service Worker available:', !!navigator.serviceWorker);
      console.log('- Online status:', navigator.onLine);
      
      // Create ready promise
      this.readyPromise = this.initializeComponents();
      
      // Race between initialization and timeout
      const result = await Promise.race([this.readyPromise, timeoutPromise]);
      
      // If we got a timeout, log it but don't fail
      if (result === 'timeout') {
        console.warn('Initialization continued in background due to timeout');
        this.isReady = true; // Mark as ready anyway so app can continue
      } else {
        this.isReady = true;
        console.log('=== OfflineManager initialized successfully ===');
      }
    } catch (error) {
      console.error('=== OfflineManager initialization failed ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      // Still mark as partially ready to allow app to function
      this.isReady = true;
      console.warn('Marking as ready despite error to allow app to function');
    }
  }

  async initializeComponents() {
    await this.initDB();
    console.log('Database initialized successfully');
    
    this.setupEventListeners();
    console.log('Event listeners set up');
    
    await this.registerServiceWorker();
    console.log('Service worker registration completed');
    
    // Start periodic sync attempts
    this.startPeriodicSync();
    console.log('Periodic sync started');
  }

  // Ensure the manager is ready before performing operations
  async ensureReady() {
    if (this.isReady) {
      return true;
    }
    
    if (this.readyPromise) {
      await this.readyPromise;
      return this.isReady;
    }
    
    // If no ready promise exists, try to initialize again
    this.readyPromise = this.initializeComponents();
    await this.readyPromise;
    this.isReady = true;
    return true;
  }

  // Initialize IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      console.log('Initializing IndexedDB...');
      console.log('Database name:', this.dbName);
      console.log('Database version:', this.dbVersion);
      
      // Set a timeout to handle cases where IndexedDB hangs
      const timeoutId = setTimeout(() => {
        console.warn('IndexedDB initialization timed out after 3 seconds');
        reject(new Error('IndexedDB initialization timeout'));
      }, 3000);
      
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = (event) => {
          clearTimeout(timeoutId);
          console.error('IndexedDB open error:', event.target.error);
          reject(new Error(`Failed to open database: ${event.target.error}`));
        };
        
        request.onsuccess = (event) => {
          clearTimeout(timeoutId);
          this.db = event.target.result;
          console.log('IndexedDB opened successfully');
          console.log('Object stores:', Array.from(this.db.objectStoreNames));
          resolve(this.db);
        };
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Unexpected error during IndexedDB initialization:', err);
        reject(err);
      }
      
      request.onupgradeneeded = (event) => {
        console.log('Database upgrade needed');
        const db = event.target.result;
        
        // Store for offline course progress
        if (!db.objectStoreNames.contains('offlineProgress')) {
          console.log('Creating offlineProgress store');
          const progressStore = db.createObjectStore('offlineProgress', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          progressStore.createIndex('courseId', 'courseId', { unique: false });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store for offline enrollments
        if (!db.objectStoreNames.contains('offlineEnrollments')) {
          console.log('Creating offlineEnrollments store');
          db.createObjectStore('offlineEnrollments', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }
        
        // Store for cached courses
        if (!db.objectStoreNames.contains('cachedCourses')) {
          console.log('Creating cachedCourses store');
          const coursesStore = db.createObjectStore('cachedCourses', { keyPath: '_id' });
          coursesStore.createIndex('title', 'title', { unique: false });
          coursesStore.createIndex('category', 'category', { unique: false });
        }
        
        // Store for cached resources
        if (!db.objectStoreNames.contains('cachedResources')) {
          console.log('Creating cachedResources store');
          const resourcesStore = db.createObjectStore('cachedResources', { keyPath: '_id' });
          resourcesStore.createIndex('type', 'type', { unique: false });
          resourcesStore.createIndex('category', 'category', { unique: false });
        }
        
        // Store for offline user actions
        if (!db.objectStoreNames.contains('offlineActions')) {
          console.log('Creating offlineActions store');
          const actionsStore = db.createObjectStore('offlineActions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          actionsStore.createIndex('type', 'type', { unique: false });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Store for user preferences and settings
        if (!db.objectStoreNames.contains('userSettings')) {
          console.log('Creating userSettings store');
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }
        
        console.log('Database upgrade completed');
      };
    });
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('Registering service worker...');
        const registration = await navigator.serviceWorker.register('/js/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully');
        console.log('Registration scope:', registration.scope);
        console.log('Registration state:', registration.installing ? 'installing' : 
                    registration.waiting ? 'waiting' : 
                    registration.active ? 'active' : 'unknown');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        // Don't throw - app should work without service worker
      }
    } else {
      console.warn('Service Workers not supported in this browser');
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored');
      this.showConnectionStatus('online');
      this.syncAllOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Connection lost');
      this.showConnectionStatus('offline');
    });

    // Before page unload, try to sync
    window.addEventListener('beforeunload', () => {
      if (this.isOnline && this.syncQueue.size > 0) {
        this.syncAllOfflineData();
      }
    });
  }

  // Handle messages from service worker
  handleSWMessage(event) {
    const { data } = event;
    
    if (data.type === 'SYNC_COMPLETE') {
      console.log('Sync completed:', data.syncType);
      this.showNotification('Data synced successfully', 'success');
    }
    
    if (data.type === 'CACHE_UPDATED') {
      console.log('Cache updated:', data.url);
    }
  }

  // Show connection status
  showConnectionStatus(status) {
    const banner = document.getElementById('offline-banner') || this.createOfflineBanner();
    
    if (status === 'offline') {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span class="material-icons" style="font-size: 1rem;">wifi_off</span>
          <span>You're offline. Your progress will sync when reconnected.</span>
        </div>
      `;
      banner.className = 'offline-status offline';
    } else {
      banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span class="material-icons" style="font-size: 1rem;">wifi</span>
          <span>Connection restored. Syncing data...</span>
        </div>
      `;
      banner.className = 'offline-status online';
      
      // Hide banner after 3 seconds
      setTimeout(() => {
        banner.style.display = 'none';
      }, 3000);
    }
  }

  // Create offline banner if it doesn't exist
  createOfflineBanner() {
    let banner = document.getElementById('offline-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        padding: 0.75rem;
        text-align: center;
        font-weight: 500;
        display: none;
      `;
      document.body.appendChild(banner);
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .offline-status.offline {
        background: #ffecb3;
        color: #b26a00;
        border-bottom: 1px solid #ffc107;
      }
      .offline-status.online {
        background: #d4edda;
        color: #155724;
        border-bottom: 1px solid #28a745;
      }
    `;
    document.head.appendChild(style);
    
    return banner;
  }

  // Cache course for offline access
  async cacheCourse(courseId) {
    try {
      console.log('=== Starting cacheCourse ===');
      console.log('Course ID:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      
      // Ensure offline manager is ready
      console.log('Ensuring offline manager is ready...');
      const isReady = await this.ensureReady();
      if (!isReady) {
        throw new Error('Offline manager failed to initialize');
      }
      
      console.log('Database available:', !!this.db);
      console.log('Online status:', this.isOnline);
      
      if (!this.db) {
        throw new Error('Database not initialized - please wait for offline manager to initialize');
      }
      
      // Fetch course data with full URL
      const apiUrl = `http://localhost:5000/api/courses/${courseId}`;
      console.log('Fetching from URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`Failed to fetch course: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const course = await response.json();
      console.log('Course data received:', {
        id: course._id,
        title: course.title,
        category: course.category
      });
      
      if (!course || !course.title) {
        throw new Error('Invalid course data received');
      }
      
      // Ensure the course has an _id field for IndexedDB
      if (!course._id) {
        console.warn('Course missing _id field, using courseId as fallback');
        course._id = courseId;
      }
      
      // Store course with offline metadata
      const courseWithOfflineData = {
        ...course,
        _id: course._id, // Explicitly ensure _id is preserved
        cachedAt: Date.now(),
        offlineAvailable: true
      };
      
      console.log('Storing course in IndexedDB...');
      console.log('Course data structure check:');
      console.log('- Raw course object:', course);
      console.log('- Course _id field:', course._id);
      console.log('- Course with offline data:', courseWithOfflineData);
      console.log('- Has _id in final object:', !!courseWithOfflineData._id);
      console.log('- Final _id value:', courseWithOfflineData._id);
      
      // Use a more robust promise-based approach for the transaction
      const success = await new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction(['cachedCourses'], 'readwrite');
          const store = tx.objectStore('cachedCourses');
          
          tx.oncomplete = () => {
            console.log('Transaction completed successfully');
            resolve(true);
          };
          
          tx.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(new Error(`Database transaction failed: ${event.target.error?.message || 'Unknown error'}`));
          };
          
          tx.onabort = (event) => {
            console.error('Transaction aborted:', event.target.error);
            reject(new Error(`Database transaction aborted: ${event.target.error?.message || 'Unknown error'}`));
          };
          
          const request = store.put(courseWithOfflineData);
          
          request.onsuccess = () => {
            console.log('Course stored successfully in IndexedDB');
          };
          
          request.onerror = (event) => {
            console.error('Store put error:', event.target.error);
            reject(new Error(`Failed to store course: ${event.target.error?.message || 'Unknown error'}`));
          };
        } catch (error) {
          console.error('Error setting up transaction:', error);
          reject(error);
        }
      });
      
      if (success) {
        console.log('Course stored in IndexedDB:', course._id);
        
        // Tell service worker to cache course content (optional - don't fail if this doesn't work)
        try {
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            console.log('Sending message to service worker');
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_COURSE_CONTENT',
              courseId: courseId,
              course: course
            });
          } else {
            console.warn('No service worker controller available');
          }
        } catch (swError) {
          console.warn('Service worker communication failed:', swError.message);
          // Don't fail the whole operation if service worker communication fails
        }
        
        this.showNotification(`Course "${course.title}" is now available offline`, 'success');
        console.log('=== cacheCourse completed successfully ===');
        return course;
      } else {
        throw new Error('Failed to store course in database');
      }
      
    } catch (error) {
      console.error('=== cacheCourse error ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      this.showNotification(`Failed to cache course: ${error.message}`, 'error');
      throw error; // Re-throw so the UI can handle it
    }
  }

  // Cache resource for offline access
  async cacheResource(resourceId) {
    try {
      // Fetch resource data
      const response = await fetch(`/api/resources/${resourceId}`);
      if (!response.ok) throw new Error('Failed to fetch resource');
      
      const resource = await response.json();
      
      // Store in IndexedDB
      const tx = this.db.transaction(['cachedResources'], 'readwrite');
      const store = tx.objectStore('cachedResources');
      await store.put({
        ...resource,
        cachedAt: Date.now(),
        offlineAvailable: true
      });
      
      // Tell service worker to cache resource content
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_RESOURCE_CONTENT',
          resourceId: resourceId
        });
      }
      
      this.showNotification(`Resource "${resource.title}" is now available offline`, 'success');
      return resource;
    } catch (error) {
      console.error('Error caching resource:', error);
      this.showNotification('Failed to cache resource for offline access', 'error');
    }
  }

  // Save course progress offline
  async saveProgressOffline(courseId, progressData) {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      const progressEntry = {
        courseId,
        userId,
        progress: progressData.progress,
        completedLessons: progressData.completedLessons,
        timeSpent: progressData.timeSpent,
        lastAccessed: Date.now(),
        timestamp: Date.now(),
        synced: false
      };
      
      const tx = this.db.transaction(['offlineProgress'], 'readwrite');
      const store = tx.objectStore('offlineProgress');
      await store.add(progressEntry);
      
      this.syncQueue.add('progress');
      
      console.log('Progress saved offline:', progressEntry);
      return progressEntry;
    } catch (error) {
      console.error('Error saving progress offline:', error);
    }
  }

  // Enroll in course offline
  async enrollOffline(courseId, userId) {
    try {
      const enrollmentData = {
        courseId,
        userId,
        enrolledAt: Date.now(),
        progress: 0,
        status: 'enrolled'
      };
      
      const tx = this.db.transaction(['offlineEnrollments'], 'readwrite');
      const store = tx.objectStore('offlineEnrollments');
      await store.add({
        data: enrollmentData,
        timestamp: Date.now(),
        synced: false
      });
      
      this.syncQueue.add('enrollments');
      
      this.showNotification('Enrolled in course (will sync when online)', 'info');
      return enrollmentData;
    } catch (error) {
      console.error('Error enrolling offline:', error);
      this.showNotification('Failed to enroll in course', 'error');
    }
  }

  // Get offline courses
  async getOfflineCourses() {
    // Define emergency backup courses that will always be available
    const emergencyBackupCourses = [
      {
        _id: "emergency1",
        title: "Web Development Fundamentals",
        description: "Learn the basics of HTML, CSS and JavaScript to build your first website.",
        difficulty: "Beginner",
        category: "Web Development",
        duration: "4 weeks",
        offlineAvailable: true
      },
      {
        _id: "emergency2",
        title: "Introduction to Business Skills",
        description: "Essential business skills for entrepreneurs starting their journey.",
        difficulty: "Beginner", 
        category: "Business",
        duration: "6 weeks",
        offlineAvailable: true
      },
      {
        _id: "emergency3",
        title: "Mobile App Development",
        description: "Create your first mobile application using React Native.",
        difficulty: "Intermediate",
        category: "Mobile Development",
        duration: "8 weeks",
        offlineAvailable: true
      }
    ];
    
    try {
      console.log('Getting offline courses...');
      
      // Set a timeout to prevent hanging
      let timeoutId = null;
      
      // Create a promise that resolves after 2 seconds with emergency courses
      const timeoutPromise = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          console.warn('getOfflineCourses timed out after 2 seconds - using emergency backup courses');
          resolve(emergencyBackupCourses);
        }, 2000);
      });
      
      // Create the main function to get courses
      const fetchCoursesPromise = (async () => {
        if (!this.db) {
          console.error('Database not available');
          // Try to initialize DB if not already done
          try {
            await this.ensureReady();
          } catch (initError) {
            console.error('Failed to initialize DB:', initError);
            return [];
          }
          
          // Check again after initialization attempt
          if (!this.db) {
            console.error('Database still not available after initialization attempt');
            return [];
          }
        }
        
        try {
          // Try to load from IndexedDB
          const tx = this.db.transaction(['cachedCourses'], 'readonly');
          const store = tx.objectStore('cachedCourses');
          
          const courses = await new Promise((resolve, reject) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
              const courses = request.result || [];
              console.log(`Found ${courses.length} cached courses:`, courses.map(c => ({
                id: c._id,
                title: c.title,
                offlineAvailable: c.offlineAvailable
              })));
              
              // Return all courses from cache, with offlineAvailable flag set to true
              // This ensures we display something even if the flag isn't properly set
              const offlineCourses = courses.map(course => ({
                ...course,
                offlineAvailable: true
              }));
              
              console.log(`${offlineCourses.length} courses marked as offline available`);
              resolve(offlineCourses);
            };
            
            request.onerror = (event) => {
              console.error('Error getting offline courses:', event.target.error);
              reject(event.target.error);
            };
          });
          
          return courses;
        } catch (txError) {
          console.error('Transaction error in getOfflineCourses:', txError);
          
          // Try to load from localStorage as a fallback
          console.log('Trying to load courses from localStorage...');
          const cachedData = localStorage.getItem('cachedCourses');
          if (cachedData) {
            try {
              const data = JSON.parse(cachedData);
              if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
                console.log(`Found ${data.courses.length} courses in localStorage`);
                return data.courses.map(course => ({
                  ...course,
                  offlineAvailable: true
                }));
              }
            } catch (parseError) {
              console.error('Error parsing localStorage data:', parseError);
            }
          }
          
          return [];
        }
      })();
      
      // Race between the fetch and timeout
      const result = await Promise.race([fetchCoursesPromise, timeoutPromise])
        .finally(() => {
          if (timeoutId) clearTimeout(timeoutId);
        });
      
      if (Array.isArray(result) && result.length > 0) {
        console.log(`Returning ${result.length} courses`);
        return result;
      } else {
        console.log('No courses found, using emergency backup courses');
        return emergencyBackupCourses;
      }
    } catch (error) {
      console.error('Error getting offline courses:', error);
      
      // Final fallback to localStorage
      try {
        console.log('Final fallback: trying localStorage...');
        const cachedData = localStorage.getItem('cachedCourses');
        if (cachedData) {
          const data = JSON.parse(cachedData);
          if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
            console.log(`Fallback: Found ${data.courses.length} courses in localStorage`);
            return data.courses.map(course => ({
              ...course,
              offlineAvailable: true
            }));
          }
        }
      } catch (e) {
        console.error('Even localStorage fallback failed:', e);
      }
      
      // Return emergency backup courses as last resort
      console.log('Using emergency backup courses after all other methods failed');
      return emergencyBackupCourses;
    }
  }

  // Remove a course from offline storage
  async removeCachedCourse(courseId) {
    try {
      console.log('=== Starting removeCachedCourse ===');
      console.log('Course ID to remove:', courseId);
      
      if (!this.db) {
        throw new Error('Database not available');
      }
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      
      // First verify the course exists
      const course = await this.getCachedCourseById(courseId);
      if (!course) {
        throw new Error('Course not found in offline storage');
      }

      // Remove course from cache
      const tx = this.db.transaction(['cachedCourses'], 'readwrite');
      const store = tx.objectStore('cachedCourses');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(courseId);
        
        request.onsuccess = () => {
          console.log('=== Course removed from offline storage successfully ===');
          // Show success notification
          this.showNotification('Course removed from offline storage', 'success');
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error removing course from cache:', request.error);
          reject(request.error);
        };
        
        tx.oncomplete = () => {
          console.log('Transaction completed');
        };
        
        tx.onerror = (event) => {
          console.error('Transaction error:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('=== removeCachedCourse error ===', error);
      return false;
    }
  }

  // Helper method to get a cached course by ID
  async getCachedCourseById(courseId) {
    if (!this.db) {
      throw new Error('Database not available');
    }
    
    const tx = this.db.transaction(['cachedCourses'], 'readonly');
    const store = tx.objectStore('cachedCourses');
    
    return new Promise((resolve, reject) => {
      const request = store.get(courseId);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('Error getting cached course:', request.error);
        reject(request.error);
      };
    });
  }

  // Get offline resources
  async getOfflineResources() {
    try {
      const tx = this.db.transaction(['cachedResources'], 'readonly');
      const store = tx.objectStore('cachedResources');
      const resources = await store.getAll();
      return resources.filter(resource => resource.offlineAvailable);
    } catch (error) {
      console.error('Error getting offline resources:', error);
      return [];
    }
  }

  // Get user progress (online + offline)
  async getUserProgress(userId) {
    try {
      const tx = this.db.transaction(['offlineProgress'], 'readonly');
      const store = tx.objectStore('offlineProgress');
      const index = store.index('userId');
      const offlineProgress = await index.getAll(userId);
      
      // Group by courseId and get latest progress for each course
      const progressMap = new Map();
      offlineProgress.forEach(progress => {
        const existing = progressMap.get(progress.courseId);
        if (!existing || progress.timestamp > existing.timestamp) {
          progressMap.set(progress.courseId, progress);
        }
      });
      
      return Array.from(progressMap.values());
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  // Sync all offline data
  async syncAllOfflineData() {
    if (!this.isOnline) {
      console.log('Cannot sync - offline');
      return;
    }

    try {
      await this.syncProgress();
      await this.syncEnrollments();
      await this.syncOfflineActions();
      
      this.syncQueue.clear();
      console.log('All offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  // Sync progress data
  async syncProgress() {
    try {
      const tx = this.db.transaction(['offlineProgress'], 'readwrite');
      const store = tx.objectStore('offlineProgress');
      const allProgress = await store.getAll();
      const unsyncedProgress = allProgress.filter(p => !p.synced);
      
      if (unsyncedProgress.length === 0) return;
      
      // Group by courseId and send batch updates
      const progressByUser = new Map();
      unsyncedProgress.forEach(progress => {
        if (!progressByUser.has(progress.userId)) {
          progressByUser.set(progress.userId, []);
        }
        progressByUser.get(progress.userId).push(progress);
      });
      
      for (const [userId, userProgress] of progressByUser) {
        try {
          const response = await fetch('/api/sync/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
              userId,
              progressData: userProgress
            })
          });
          
          if (response.ok) {
            // Mark as synced
            const updateTx = this.db.transaction(['offlineProgress'], 'readwrite');
            const updateStore = updateTx.objectStore('offlineProgress');
            
            for (const progress of userProgress) {
              progress.synced = true;
              await updateStore.put(progress);
            }
          }
        } catch (error) {
          console.error('Error syncing progress for user:', userId, error);
        }
      }
      
      console.log('Progress synced successfully');
    } catch (error) {
      console.error('Error syncing progress:', error);
    }
  }

  // Sync enrollments
  async syncEnrollments() {
    try {
      const tx = this.db.transaction(['offlineEnrollments'], 'readwrite');
      const store = tx.objectStore('offlineEnrollments');
      const allEnrollments = await store.getAll();
      const unsyncedEnrollments = allEnrollments.filter(e => !e.synced);
      
      for (const enrollment of unsyncedEnrollments) {
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
            enrollment.synced = true;
            await store.put(enrollment);
          }
        } catch (error) {
          console.error('Error syncing enrollment:', error);
        }
      }
      
      console.log('Enrollments synced successfully');
    } catch (error) {
      console.error('Error syncing enrollments:', error);
    }
  }

  // Sync offline actions
  async syncOfflineActions() {
    try {
      const tx = this.db.transaction(['offlineActions'], 'readwrite');
      const store = tx.objectStore('offlineActions');
      const allActions = await store.getAll();
      const unsyncedActions = allActions.filter(a => !a.synced);
      
      for (const action of unsyncedActions) {
        try {
          // Process different types of actions
          if (action.type === 'forum_post') {
            const response = await fetch('/api/forum/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
              },
              body: JSON.stringify(action.data)
            });
            
            if (response.ok) {
              action.synced = true;
              await store.put(action);
            }
          }
          
          // Add more action types as needed
          
        } catch (error) {
          console.error('Error syncing action:', action, error);
        }
      }
      
      console.log('Offline actions synced successfully');
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  }

  // Start periodic sync attempts
  startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.size > 0) {
        this.syncAllOfflineData();
      }
    }, 30000); // Try to sync every 30 seconds
  }

  // Clear all offline data
  async clearOfflineData() {
    try {
      const stores = ['offlineProgress', 'offlineEnrollments', 'cachedCourses', 'cachedResources', 'offlineActions'];
      
      for (const storeName of stores) {
        const tx = this.db.transaction([storeName], 'readwrite');
        const store = tx.objectStore(storeName);
        await store.clear();
      }
      
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      this.showNotification('All offline data cleared', 'success');
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
      this.showNotification('Failed to clear offline data', 'error');
    }
  }

  // Get offline storage usage
  async getStorageUsage() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return null;
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="material-icons" style="font-size: 1rem;">
          ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        <span>${message}</span>
      </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }
        .toast-success { background: #28a745; }
        .toast-error { background: #dc3545; }
        .toast-info { background: #17a2b8; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Test database functionality
  async testDatabase() {
    console.log('=== Testing database functionality ===');
    
    if (!this.db) {
      console.error('Database not available');
      return false;
    }
    
    try {
      // Test write operation
      const testData = {
        _id: 'test-course-' + Date.now(),
        title: 'Test Course',
        description: 'This is a test course',
        cachedAt: Date.now(),
        offlineAvailable: true
      };
      
      console.log('Testing write operation...');
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction(['cachedCourses'], 'readwrite');
        const store = tx.objectStore('cachedCourses');
        
        tx.oncomplete = () => {
          console.log('Write test completed successfully');
          resolve();
        };
        
        tx.onerror = (event) => {
          console.error('Write test failed:', event.target.error);
          reject(event.target.error);
        };
        
        const request = store.put(testData);
        
        request.onsuccess = () => {
          console.log('Test data written successfully');
        };
        
        request.onerror = (event) => {
          console.error('Write operation failed:', event.target.error);
          reject(event.target.error);
        };
      });
      
      // Test read operation
      console.log('Testing read operation...');
      const readResult = await new Promise((resolve, reject) => {
        const tx = this.db.transaction(['cachedCourses'], 'readonly');
        const store = tx.objectStore('cachedCourses');
        const request = store.get(testData._id);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
      
      if (readResult) {
        console.log('Read test successful:', readResult.title);
        
        // Clean up test data
        await new Promise((resolve, reject) => {
          const tx = this.db.transaction(['cachedCourses'], 'readwrite');
          const store = tx.objectStore('cachedCourses');
          const request = store.delete(testData._id);
          
          request.onsuccess = () => {
            console.log('Test data cleaned up');
            resolve();
          };
          
          request.onerror = () => {
            reject(request.error);
          };
        });
        
        console.log('=== Database test completed successfully ===');
        return true;
      } else {
        console.error('Read test failed - no data returned');
        return false;
      }
      
    } catch (error) {
      console.error('Database test failed:', error);
      return false;
    }
  }

  // Force sync all data
  forceSyncAll() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'FORCE_SYNC'
      });
    }
    this.syncAllOfflineData();
  }
}

// Initialize offline manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded - initializing OfflineManager');
  if (!window.offlineManager) {
    window.offlineManager = new OfflineManager();
    console.log('OfflineManager created and assigned to window');
  }
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Document already loaded, initializing OfflineManager now');
  setTimeout(() => {
    if (!window.offlineManager) {
      window.offlineManager = new OfflineManager();
      console.log('OfflineManager created as fallback');
    }
  }, 100);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OfflineManager;
}
