# Offline Functionality Implementation

This document outlines the offline functionality implemented for the Refugee Techpreneurs platform, enabling users to access courses and resources without internet connectivity and sync progress when back online.

## Overview

The offline functionality provides:
- **Offline Course Access**: Download and access courses without internet
- **Offline Resource Access**: Cache resources for offline viewing
- **Progress Tracking**: Track learning progress offline and sync when online
- **Data Synchronization**: Automatic sync when internet connection is restored
- **Storage Management**: Manage offline content and storage usage

## Architecture

### Components

1. **Service Worker** (`js/sw.js`)
   - Caches static assets and API responses
   - Handles offline/online state management
   - Provides background sync capabilities

2. **Offline Manager** (`js/offline-manager.js`)
   - Main controller for offline functionality
   - Manages IndexedDB operations
   - Handles data synchronization
   - Provides offline/online state detection

3. **Sync API** (`backend/routes/sync.js`)
   - Backend endpoints for syncing offline data
   - Handles progress synchronization
   - Manages enrollment data sync

4. **Enhanced UI Components**
   - Dashboard with offline indicators
   - Course pages with download buttons
   - Settings page for offline management

## Features

### 1. Offline Course Access

Users can download courses for offline access:
- **Download Button**: Each course has a download button for offline access
- **Progress Tracking**: Continue tracking progress while offline
- **Material Caching**: Course materials are cached locally
- **Offline Indicator**: Visual indicators show which courses are available offline

### 2. Data Synchronization

Automatic sync when connection is restored:
- **Progress Sync**: Learning progress is synced with the server
- **Enrollment Sync**: Course enrollments made offline are synced
- **Background Sync**: Uses service worker for background synchronization
- **Conflict Resolution**: Server data takes precedence in case of conflicts

### 3. Storage Management

Users can manage their offline content:
- **Storage Usage**: View current storage usage
- **Content Management**: Remove offline courses and resources
- **Auto-download**: Option to automatically download enrolled courses
- **WiFi-only Sync**: Option to sync only on WiFi connections

## Usage

### For Users

1. **Download Courses for Offline**:
   - Go to the Courses page
   - Click the download button on any course
   - Course will be available offline

2. **Track Progress Offline**:
   - Continue learning while offline
   - Progress is saved locally and will sync when online

3. **Manage Offline Content**:
   - Go to Settings → Offline Storage
   - View and manage downloaded content
   - Check storage usage and sync status

### For Developers

1. **Service Worker Registration**:
   ```javascript
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/js/sw.js');
   }
   ```

2. **Using Offline Manager**:
   ```javascript
   // Cache a course for offline access
   await offlineManager.cacheCourse(courseId);
   
   // Save progress offline
   await offlineManager.saveProgressOffline(courseId, progressData);
   
   // Sync all offline data
   await offlineManager.syncAllOfflineData();
   ```

3. **Backend Sync Endpoints**:
   ```javascript
   // Sync progress data
   POST /api/sync/progress
   
   // Sync enrollment data
   POST /api/sync/enrollments
   
   // Sync other actions
   POST /api/sync/actions
   ```

## Database Schema

### IndexedDB Stores

1. **offlineProgress**
   - `id` (auto-increment)
   - `courseId`
   - `userId`
   - `progress`
   - `completedLessons`
   - `timeSpent`
   - `timestamp`
   - `synced`

2. **cachedCourses**
   - `id`
   - `title`
   - `description`
   - `materials`
   - `cachedAt`
   - `offlineAvailable`

3. **cachedResources**
   - `id`
   - `title`
   - `type`
   - `url`
   - `cachedAt`
   - `offlineAvailable`

4. **offlineEnrollments**
   - `id` (auto-increment)
   - `data` (enrollment data)
   - `timestamp`
   - `synced`

## API Endpoints

### Sync Routes (`/api/sync`)

- `POST /progress` - Sync progress data from offline storage
- `POST /enrollments` - Sync enrollment data from offline storage
- `POST /actions` - Sync other offline actions (forum posts, etc.)
- `GET /progress/:userId` - Get user's complete progress data
- `GET /health` - Health check for sync functionality

## Configuration

### Environment Variables

No additional environment variables needed for offline functionality.

### Browser Requirements

- **Service Workers**: Supported in modern browsers
- **IndexedDB**: Required for offline data storage
- **Cache API**: Used for asset caching

## Limitations

1. **Storage Quota**: Limited by browser storage quotas
2. **Content Size**: Large course materials may affect performance
3. **Sync Conflicts**: Server data takes precedence during conflicts
4. **Network Detection**: Relies on browser's online/offline detection

## Future Enhancements

1. **Selective Sync**: Choose which data to sync
2. **Compression**: Compress cached content to save space
3. **Background Downloads**: Download content in background
4. **Peer-to-peer Sharing**: Share offline content between users
5. **Advanced Conflict Resolution**: More sophisticated conflict handling

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**:
   - Check browser console for errors
   - Ensure service worker file is accessible
   - Verify HTTPS (required for service workers in production)

2. **Data Not Syncing**:
   - Check network connectivity
   - Verify sync API endpoints are working
   - Check browser storage permissions

3. **Storage Full**:
   - Clear offline data from settings
   - Increase browser storage quota if possible
   - Remove unused offline content

### Debug Tools

1. **Browser Dev Tools**:
   - Application tab → Service Workers
   - Application tab → Storage → IndexedDB
   - Network tab → Offline checkbox

2. **Console Logging**:
   - Offline manager logs sync operations
   - Service worker logs cache operations

## Support

For technical support or questions about the offline functionality:
1. Check the browser console for error messages
2. Verify network connectivity and server status
3. Clear browser cache and offline data if issues persist
4. Contact the development team for persistent issues
