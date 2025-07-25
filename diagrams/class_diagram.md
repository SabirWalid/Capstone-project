# Class Diagram

```mermaid
classDiagram
    class User {
        -ObjectId _id
        -String name
        -String email
        -String password
        -String phoneNumber
        -Date dateOfBirth
        -String nationality
        -String educationLevel
        -String[] skills
        -String[] interests
        -String[] customInterests
        -Date registrationDate
        -Boolean isActive
        -String profilePicture
        +register()
        +login()
        +updateProfile()
        +addCustomInterest()
        +removeCustomInterest()
        +deactivateAccount()
    }
    
    class CareerPath {
        -ObjectId _id
        -String title
        -String description
        -String category
        -String[] requiredSkills
        -String[] relatedInterests
        -String salaryRange
        -String jobOutlook
        -String experienceLevel
        -String[] synonyms
        -Number skillsWeight
        -Number interestsWeight
        -Date createdDate
        -Date updatedDate
        +getCareerDetails()
        +updateCareerInfo()
        +addSynonym()
        +calculateMatch()
    }
    
    class LearningModule {
        -ObjectId _id
        -String title
        -String description
        -String content
        -String category
        -String difficulty
        -Number duration
        -String[] prerequisites
        -String[] learningObjectives
        -Boolean offlineAvailable
        -String mediaContent
        -Date createdDate
        +getContent()
        +markComplete()
        +trackProgress()
        +downloadOffline()
    }
    
    class Mentor {
        -ObjectId _id
        -String name
        -String bio
        -String title
        -String[] expertiseAreas
        -String[] tags
        -String avatar
        -String readMoreLink
        -String calendarLink
        -String status
        -Number rating
        -Number totalMentees
        -Date joinDate
        +updateProfile()
        +acceptMentee()
        +scheduleSession()
        +provideFeedback()
    }
    
    class StartupPlan {
        -ObjectId _id
        -ObjectId userId
        -String businessName
        -String description
        -String industry
        -String targetMarket
        -String revenueModel
        -String[] challenges
        -String[] solutions
        -Number fundingRequired
        -String currentStage
        -Date createdDate
        -Date lastUpdated
        +createPlan()
        +updatePlan()
        +validateIdea()
        +generatePitch()
    }
    
    class Opportunity {
        -ObjectId _id
        -String title
        -String description
        -String type
        -String organization
        -Number fundingAmount
        -String eligibilityCriteria
        -Date applicationDeadline
        -String applicationLink
        -String[] requiredDocuments
        -String status
        -Date postedDate
        +applyForOpportunity()
        +checkEligibility()
        +trackApplication()
    }
    
    class UserProgress {
        -ObjectId _id
        -ObjectId userId
        -ObjectId moduleId
        -Number completionPercentage
        -Date startDate
        -Date completionDate
        -Number timeSpent
        -Number quizScore
        -String status
        +updateProgress()
        +calculateCompletion()
        +generateCertificate()
    }
    
    class CareerAssessment {
        -ObjectId _id
        -ObjectId userId
        -String[] skills
        -String[] interests
        -String[] customInterests
        -String experienceLevel
        -String[] preferences
        -Date assessmentDate
        -Number accuracyScore
        +generateRecommendations()
        +calculateMatch()
        +updateAssessment()
    }
    
    class MentorshipRelationship {
        -ObjectId _id
        -ObjectId menteeId
        -ObjectId mentorId
        -Date startDate
        -Date endDate
        -String status
        -String[] goals
        -Number sessionCount
        -Number rating
        +establishRelationship()
        +scheduleSession()
        +endRelationship()
        +provideFeedback()
    }
    
    class Application {
        -ObjectId _id
        -ObjectId userId
        -ObjectId opportunityId
        -String status
        -Date submissionDate
        -String[] submittedDocuments
        -String feedback
        -Date lastUpdated
        +submitApplication()
        +updateStatus()
        +withdrawApplication()
    }
    
    class CustomInterest {
        -ObjectId _id
        -String name
        -String category
        -Number usageCount
        -String[] relatedCareers
        -Date createdDate
        +addInterest()
        +linkToCareer()
        +incrementUsage()
    }
    
    class Notification {
        -ObjectId _id
        -ObjectId userId
        -String title
        -String message
        -String type
        -Boolean isRead
        -Date createdDate
        -Date readDate
        +sendNotification()
        +markAsRead()
        +deleteNotification()
    }
    
    User ||--o{ UserProgress
    User ||--o{ CareerAssessment
    User ||--o{ StartupPlan
    User ||--o{ Application
    User ||--o{ CustomInterest
    User ||--o{ Notification
    
    Mentor ||--o{ MentorshipRelationship
    User ||--o{ MentorshipRelationship
    
    LearningModule ||--o{ UserProgress
    CareerPath ||--o{ CareerAssessment
    Opportunity ||--o{ Application
    
    CareerAssessment ||--o{ CareerPath
    CustomInterest }o--|| CareerPath
    
    Mentor --|> User
```

## Class Descriptions

### Core Entity Classes

#### User
**Purpose**: Represents all platform users (refugee youth, mentors)
**Key Features**:
- Profile management with personal and educational information
- Custom interest support for personalized career recommendations
- Comprehensive skill and interest tracking
- Account security and authentication

#### CareerPath
**Purpose**: Defines available career options with detailed information
**Key Features**:
- Comprehensive career information including skills, salary, outlook
- Synonym support for improved matching
- Weighted scoring for skills and interests
- Category-based organization

#### LearningModule
**Purpose**: Educational content with progress tracking capabilities
**Key Features**:
- Multimedia content support
- Offline availability for constrained environments
- Prerequisites and learning objectives
- Progress tracking and completion certification

#### Mentor
**Purpose**: Professional volunteers providing guidance (extends User)
**Key Features**:
- Expertise area specification
- Availability and scheduling management
- Rating and feedback system
- Profile customization for mentorship

### Relationship Classes

#### MentorshipRelationship
**Purpose**: Manages mentor-mentee connections and interactions
**Key Features**:
- Goal setting and tracking
- Session scheduling and management
- Performance rating and feedback
- Relationship lifecycle management

#### UserProgress
**Purpose**: Tracks individual learning advancement
**Key Features**:
- Completion percentage calculation
- Time tracking and analytics
- Assessment score recording
- Certificate generation

#### CareerAssessment
**Purpose**: AI-powered career evaluation and recommendation
**Key Features**:
- Skills and interest analysis
- Custom interest integration
- Matching algorithm execution
- Recommendation accuracy tracking

### Support Classes

#### Application
**Purpose**: Manages opportunity applications and tracking
**Key Features**:
- Document submission tracking
- Status updates and notifications
- Application lifecycle management
- Feedback and outcome recording

#### CustomInterest
**Purpose**: User-defined interests beyond predefined categories
**Key Features**:
- Dynamic interest creation
- Career path linkage
- Usage analytics and suggestions
- Community-driven interest expansion

#### Notification
**Purpose**: User communication and engagement
**Key Features**:
- Multi-type notification support
- Read status tracking
- Automated and manual messaging
- User preference management

### Business Logic Classes

#### StartupPlan
**Purpose**: Entrepreneurship support and business development
**Key Features**:
- Business plan template and guidance
- Idea validation frameworks
- Funding requirement calculation
- Stage-based progress tracking

#### Opportunity
**Purpose**: External scholarships, jobs, and funding options
**Key Features**:
- Eligibility requirement checking
- Application deadline management
- Organization and funding information
- Status and availability tracking

## Key Design Patterns

### 1. Inheritance
- **Mentor extends User**: Mentors have all user capabilities plus mentor-specific features

### 2. Composition
- **User composed of UserProgress and CareerAssessment**: Core user data includes progress and assessment information

### 3. Association
- **One-to-Many**: Users can have multiple progress records, assessments, and applications
- **Many-to-Many**: CareerPaths can relate to multiple CustomInterests and vice versa

### 4. Aggregation
- **User aggregates CustomInterests**: Users collect and manage custom interests that exist independently
