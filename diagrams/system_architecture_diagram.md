# System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Device]
        C[Progressive Web App]
    end
    
    subgraph "Frontend Layer"
        D[React.js Application]
        E[HTML/CSS/JavaScript]
        F[Bootstrap UI Components]
        G[Service Workers - PWA]
    end
    
    subgraph "API Gateway"
        H[Express.js Server]
        I[JWT Authentication]
        J[Route Handlers]
        K[Middleware]
    end
    
    subgraph "Microservices Layer"
        L[User Service]
        M[Learning Service]
        N[AI Service - Python Flask]
        O[Career Assessment Service]
        P[Mentorship Service]
    end
    
    subgraph "Database Layer"
        Q[MongoDB Atlas Primary]
        R[MongoDB Collections]
        S[GridFS File Storage]
        T[IndexedDB - Offline Storage]
    end
    
    subgraph "External Integrations"
        U[Scholarship APIs]
        V[Job Board APIs]
        W[Email Services]
        X[Analytics Services]
    end
    
    %% Client to Frontend
    A --> D
    B --> D
    C --> D
    
    %% Frontend Components
    D --> E
    D --> F
    D --> G
    
    %% Frontend to API Gateway
    E --> H
    F --> H
    G --> H
    
    %% API Gateway Components
    H --> I
    H --> J
    H --> K
    
    %% API Gateway to Microservices
    J --> L
    J --> M
    J --> N
    J --> O
    J --> P
    
    %% Microservices to Database
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    %% Database Components
    Q --> R
    Q --> S
    G --> T
    
    %% External Integrations
    L --> U
    M --> V
    L --> W
    H --> X
    
    %% Styling
    classDef clientLayer fill:#e1f5fe
    classDef frontendLayer fill:#f3e5f5
    classDef apiLayer fill:#e8f5e8
    classDef serviceLayer fill:#fff3e0
    classDef databaseLayer fill:#fce4ec
    classDef externalLayer fill:#f1f8e9
    
    class A,B,C clientLayer
    class D,E,F,G frontendLayer
    class H,I,J,K apiLayer
    class L,M,N,O,P serviceLayer
    class Q,R,S,T databaseLayer
    class U,V,W,X externalLayer
```

## Architecture Description

### Client Layer
- **Web Browser**: Desktop and laptop access
- **Mobile Device**: Smartphone and tablet access
- **Progressive Web App**: App-like experience with offline capabilities

### Frontend Layer
- **React.js Application**: Main user interface framework
- **HTML/CSS/JavaScript**: Core web technologies
- **Bootstrap UI Components**: Responsive design framework
- **Service Workers**: Enables offline functionality and caching

### API Gateway
- **Express.js Server**: Main backend server
- **JWT Authentication**: Secure token-based authentication
- **Route Handlers**: API endpoint management
- **Middleware**: Cross-cutting concerns (logging, validation, CORS)

### Microservices Layer
- **User Service**: User management, authentication, profiles
- **Learning Service**: Course content, progress tracking
- **AI Service**: Career recommendations, matching algorithms
- **Career Assessment Service**: Skills evaluation, interest analysis
- **Mentorship Service**: Mentor-mentee matching and communication

### Database Layer
- **MongoDB Atlas Primary**: Main cloud database
- **MongoDB Collections**: Structured data storage
- **GridFS File Storage**: Large file storage (images, videos)
- **IndexedDB**: Client-side offline storage

### External Integrations
- **Scholarship APIs**: External funding opportunities
- **Job Board APIs**: Employment opportunities
- **Email Services**: Notifications and communications
- **Analytics Services**: User behavior tracking and insights
