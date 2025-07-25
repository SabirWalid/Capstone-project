# Sequence Diagrams

## 1. User Registration Process

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant A as API Gateway (Express)
    participant S as User Service
    participant D as MongoDB Atlas
    participant E as Email Service
    
    U->>F: Click "Register" button
    F->>U: Display registration form
    U->>F: Fill form (name, email, password, profile details)
    F->>F: Validate form data locally
    
    alt Validation successful
        F->>A: POST /api/auth/register
        A->>A: Validate request data
        A->>S: Process registration request
        
        S->>D: Check if email exists
        D-->>S: Email availability status
        
        alt Email available
            S->>S: Hash password with bcrypt
            S->>D: Create new user document
            D-->>S: User creation confirmation
            
            S->>E: Send verification email
            E-->>S: Email sent confirmation
            
            S-->>A: Registration successful response
            A-->>F: HTTP 201 - User created
            F->>U: Show success message + verification prompt
            
            Note over U,E: Email verification process
            E->>U: Verification email delivered
            U->>E: Click verification link
            E->>A: GET /api/auth/verify/:token
            A->>S: Verify email token
            S->>D: Update user verification status
            D-->>S: Verification update confirmed
            S-->>A: Verification successful
            A-->>F: Redirect to login page
            F->>U: Display "Email verified" message
            
        else Email already exists
            S-->>A: HTTP 400 - Email conflict
            A-->>F: Email already registered error
            F->>U: Show error message
        end
        
    else Validation failed
        F->>U: Show validation errors
    end
```

## 2. Career Assessment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant A as API Gateway (Express)
    participant AS as Assessment Service
    participant AI as AI Service (Python Flask)
    participant D as MongoDB Atlas
    
    U->>F: Navigate to career assessment
    F->>A: GET /api/auth/verify-session
    A-->>F: Session valid confirmation
    
    F->>A: GET /api/assessment/questions
    A->>AS: Retrieve assessment questions
    AS-->>A: Return question set
    A-->>F: Assessment questions + predefined interests
    F->>U: Display assessment form
    
    U->>F: Fill skills, experience level
    U->>F: Select predefined interests
    U->>F: Add custom interests (autocomplete)
    F->>F: Real-time interest suggestions
    U->>F: Submit assessment
    
    F->>F: Validate assessment data
    F->>A: POST /api/assessment/submit
    A->>A: Authenticate user session
    
    A->>AS: Process assessment data
    AS->>D: Save assessment to database
    D-->>AS: Assessment saved confirmation
    
    AS->>AI: POST /ai/career-recommendations
    Note over AS,AI: Send user skills, interests, custom interests
    
    AI->>AI: Load career database (25+ careers)
    AI->>AI: Apply fuzzy matching algorithms
    AI->>AI: Calculate compatibility scores
    AI->>AI: Rank career recommendations
    AI-->>AS: Return ranked career matches
    
    AS->>D: Save recommendations to database
    D-->>AS: Recommendations saved
    
    AS-->>A: Assessment complete + recommendations
    A-->>F: HTTP 200 + career recommendations
    
    F->>F: Process and format recommendations
    F->>U: Display career results with match percentages
    
    alt User bookmarks careers
        U->>F: Click bookmark on career
        F->>A: POST /api/careers/bookmark
        A->>AS: Save bookmark
        AS->>D: Update user bookmarks
        D-->>AS: Bookmark saved
        AS-->>A: Bookmark confirmation
        A-->>F: Success response
        F->>U: Update bookmark UI
    end
```

## 3. Learning Module Access

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React)
    participant SW as Service Worker
    participant A as API Gateway (Express)
    participant L as Learning Service
    participant D as MongoDB Atlas
    participant CDN as Content Delivery Network
    
    U->>F: Click on learning module
    F->>SW: Check if content cached offline
    
    alt Content available offline
        SW-->>F: Return cached content
        F->>U: Display learning module
        
    else Content not cached or online
        F->>A: GET /api/learning/module/:id
        A->>A: Verify user authentication
        A->>L: Request module content
        
        L->>D: Query module data
        D-->>L: Module metadata + content references
        
        L->>CDN: Request media content (videos, images)
        CDN-->>L: Media content URLs
        
        L-->>A: Complete module data
        A-->>F: Module content + media
        
        F->>SW: Cache content for offline use
        SW->>SW: Store in IndexedDB
        
        F->>U: Display learning module
    end
    
    Note over U,F: User interacts with content
    U->>F: Read content, watch videos
    U->>F: Take quiz/assessment
    
    F->>F: Track time spent and progress
    
    alt User completes section
        F->>A: POST /api/learning/progress
        A->>L: Update progress data
        L->>D: Save progress to database
        D-->>L: Progress saved confirmation
        L-->>A: Progress update successful
        A-->>F: Confirmation response
        F->>U: Update progress indicator
    end
    
    alt User completes entire module
        F->>A: POST /api/learning/complete
        A->>L: Mark module as completed
        L->>D: Update completion status
        L->>L: Check for certificate eligibility
        L->>D: Generate completion certificate
        D-->>L: Certificate created
        L-->>A: Module completion + certificate
        A-->>F: Completion confirmation + certificate
        F->>U: Show completion celebration + certificate
    end
    
    Note over SW,D: Background sync when online
    SW->>A: Sync offline progress when connected
    A->>L: Process queued progress updates
    L->>D: Batch update progress data
```

## 4. Mentorship Matching

```mermaid
sequenceDiagram
    participant U as User (Mentee)
    participant F as Frontend (React)
    participant A as API Gateway (Express)
    participant M as Mentorship Service
    participant D as MongoDB Atlas
    participant N as Notification Service
    participant MF as Mentor Frontend
    participant MU as Mentor User
    
    U->>F: Navigate to mentorship section
    F->>A: GET /api/mentors/available
    A->>M: Request available mentors
    
    M->>D: Query mentor profiles
    D-->>M: Return mentor list with expertise
    M-->>A: Available mentors data
    A-->>F: Mentor profiles + filtering options
    
    F->>U: Display mentor grid with filters
    U->>F: Apply filters (expertise, availability, rating)
    F->>F: Filter mentors locally
    
    U->>F: Select preferred mentor
    U->>F: Fill mentorship request form
    Note over U,F: Goals, availability, preferred communication
    
    F->>A: POST /api/mentorship/request
    A->>A: Validate user session
    A->>M: Process mentorship request
    
    M->>D: Check mentor availability
    D-->>M: Mentor availability status
    
    alt Mentor available
        M->>D: Create mentorship request record
        D-->>M: Request created
        
        M->>N: Send notification to mentor
        N->>MF: Push notification/email to mentor
        MF->>MU: Display mentorship request
        
        M-->>A: Request submitted successfully
        A-->>F: Success confirmation
        F->>U: Show "Request sent" message
        
        Note over MU,U: Mentor response process
        MU->>MF: Review mentee profile and request
        
        alt Mentor accepts
            MU->>MF: Click "Accept" button
            MF->>A: POST /api/mentorship/accept
            A->>M: Process acceptance
            
            M->>D: Create active mentorship relationship
            M->>D: Update mentor availability
            D-->>M: Relationship established
            
            M->>N: Notify mentee of acceptance
            N->>F: Push notification to mentee
            F->>U: Show acceptance notification
            
            M->>M: Generate initial meeting scheduling options
            M-->>A: Relationship created + scheduling
            A-->>MF: Success + next steps
            MF->>MU: Show scheduling interface
            
            Note over MU,U: Schedule first meeting
            MU->>MF: Select available time slots
            MF->>A: POST /api/mentorship/schedule
            A->>M: Create meeting event
            M->>D: Save meeting details
            M->>N: Send calendar invites to both parties
            N->>F: Notify mentee of scheduled meeting
            N->>MF: Confirm mentor's calendar
            
        else Mentor declines
            MU->>MF: Click "Decline" with optional reason
            MF->>A: POST /api/mentorship/decline
            A->>M: Process decline
            M->>D: Update request status
            M->>N: Notify mentee of decline
            N->>F: Push decline notification
            F->>U: Show decline message + suggest alternatives
        end
        
    else Mentor not available
        M-->>A: HTTP 400 - Mentor unavailable
        A-->>F: Availability error
        F->>U: Show error + suggest alternatives
    end
```

## Sequence Diagram Explanations

### 1. User Registration Process
**Purpose**: Secure user onboarding with email verification
**Key Features**:
- Form validation (client and server-side)
- Email uniqueness checking
- Password hashing with bcrypt
- Email verification workflow
- Error handling for conflicts

**Flow Highlights**:
- Multi-layer validation ensures data integrity
- Asynchronous email verification allows immediate platform access
- Clear user feedback throughout the process

### 2. Career Assessment Flow
**Purpose**: AI-powered career recommendation generation
**Key Features**:
- Dynamic question loading
- Custom interest input with autocomplete
- AI processing with fuzzy matching
- Real-time recommendation generation
- Bookmark functionality for future reference

**Flow Highlights**:
- Seamless integration between frontend and AI services
- Persistent storage of assessments and recommendations
- User engagement through interactive elements

### 3. Learning Module Access
**Purpose**: Content delivery with offline capability
**Key Features**:
- Offline-first architecture with Service Worker
- Progressive content loading
- Real-time progress tracking
- Certificate generation upon completion
- Background synchronization

**Flow Highlights**:
- Intelligent caching strategy for low-bandwidth environments
- Seamless online/offline transitions
- Comprehensive progress tracking and certification

### 4. Mentorship Matching
**Purpose**: Intelligent mentor-mentee connection process
**Key Features**:
- Advanced filtering and search capabilities
- Structured request and approval workflow
- Automated notification system
- Integrated scheduling functionality
- Feedback and rating mechanisms

**Flow Highlights**:
- User-driven mentor selection process
- Clear communication channels between parties
- Automated workflow management
- Calendar integration for meeting coordination

## Technical Implementation Notes

### Authentication & Security
- JWT token-based authentication
- Session validation on sensitive operations
- Password hashing with bcrypt
- Secure email verification process

### Data Management
- MongoDB Atlas for scalable data storage
- Real-time data synchronization
- Efficient querying and indexing
- Data validation at multiple layers

### Performance Optimization
- Service Worker for offline functionality
- Content Delivery Network for media
- Progressive loading strategies
- Local caching and storage

### User Experience
- Real-time feedback and updates
- Intuitive error handling
- Progressive disclosure of information
- Mobile-responsive interaction patterns
