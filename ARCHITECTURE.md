# Architecture Guide - Tómate un Desayuno

## Overview

This document describes the architecture of the Tómate un Desayuno application, a real-time collaborative breakfast ordering system built with Astro, Lit Web Components, and Firebase.

## Tech Stack

- **Frontend Framework**: Astro (v5.12.9) - Static site generation with island architecture
- **UI Components**: Lit (v3.3.1) - Web Components with reactive properties
- **Backend**: Firebase Realtime Database - Real-time data synchronization
- **Authentication**: Firebase Auth with Google OAuth
- **Hosting**: Firebase Hosting
- **Development**: Firebase Local Emulator Suite
- **Build Tools**: Node.js, npm, concurrently, wait-on

## Application Architecture

### 1. Multi-Page Architecture

The application consists of two main pages:

- **Main Application** (`/index.astro`): Public-facing breakfast ordering interface
- **Admin Panel** (`/admin.astro`): Protected administrative dashboard

Each page loads its own controller component that manages the entire page lifecycle.

### 2. Component Architecture

```
┌─────────────────────────────────────────────┐
│            Astro Pages (SSG)                │
│  ┌──────────────┐    ┌──────────────┐      │
│  │ index.astro  │    │ admin.astro  │      │
│  └──────┬───────┘    └──────┬───────┘      │
│         │                    │               │
├─────────┼────────────────────┼───────────────┤
│         ▼                    ▼               │
│  ┌──────────────┐    ┌──────────────┐      │
│  │AppController │    │AdminApp-     │      │
│  │              │    │Controller    │      │
│  └──────┬───────┘    └──────┬───────┘      │
│         │                    │               │
│         ▼                    ▼               │
│   Lit Web Components   Lit Web Components   │
│   ├── GrupoSelector    ├── AdminLogin       │
│   ├── PersonasManager  ├── AdminPanel       │
│   ├── MenuSelector     └── (uses shared)    │
│   ├── GrupoResumen                          │
│   └── ModalSystem                           │
└─────────────────────────────────────────────┘
```

### 3. Service Layer Architecture

All business logic is encapsulated in services that handle specific domains:

```
Services Layer
├── firebase-service.js    # Firebase SDK initialization and configuration
├── auth-service.js        # Google OAuth authentication
├── grupo-service.js       # Group management and business logic
└── session-service.js     # Browser session persistence

Data Flow:
Components → Services → Firebase → Real-time Updates → Components
```

## Core Components

### Application Controllers

#### AppController (`app-controller.js`)
- **Purpose**: Main application orchestrator
- **Responsibilities**:
  - View state management (home, grupo)
  - Component lifecycle management
  - Session restoration
  - Navigation between views

#### AdminAppController (`admin-app-controller.js`)
- **Purpose**: Admin panel orchestrator
- **Responsibilities**:
  - Authentication flow management
  - Admin panel initialization
  - Access control enforcement

### User Interface Components

#### GrupoSelector (`grupo-selector.js`)
- **Purpose**: Group creation and joining interface
- **Features**:
  - Generate unique group IDs (TOMATE-XXXXX)
  - Join existing groups with validation
  - Person name management

#### PersonasManagerGrupo (`personas-manager-grupo.js`)
- **Purpose**: Group member and order management
- **Features**:
  - Real-time order synchronization
  - Individual order management
  - Total calculations
  - Member list display

#### MenuSelector (`menu-selector.js`)
- **Purpose**: Product selection interface
- **Features**:
  - Dynamic menu rendering
  - Supplement management
  - Price calculation
  - Order modification

#### GrupoResumen (`grupo-resumen.js`)
- **Purpose**: Group order summary
- **Features**:
  - Real-time total calculation
  - Individual order breakdown
  - Payment status display

### Admin Components

#### AdminLogin (`admin-login.js`)
- **Purpose**: Google OAuth authentication
- **Features**:
  - Google Sign-In integration
  - Authorization checking
  - Access logging

#### AdminPanel (`admin-panel.js`)
- **Purpose**: Administrative dashboard
- **Features**:
  - All groups overview
  - Group statistics
  - Payment management
  - Group deletion
  - Detailed order views

### System Components

#### ModalSystem (`modal-system.js`)
- **Purpose**: Centralized modal management
- **Features**:
  - Dynamic modal creation
  - Overlay management
  - Event handling
  - Accessibility features

## Service Architecture

### FirebaseService
Central service managing all Firebase interactions:

```javascript
class FirebaseService {
  - initializeApp()           // Firebase app initialization
  - connectToEmulator()       // Emulator detection and connection
  - getDatabase()            // Database reference
  - getAuth()               // Auth instance
  - saveGroup()            // Group CRUD operations
  - getGroup()
  - updateGroup()
  - deleteGroup()
  - getAllGroups()        // Admin operations
  - listenToGroup()      // Real-time listeners
}
```

### AuthService
Handles Google OAuth authentication:

```javascript
class AuthService {
  - signInWithGoogle()       // OAuth flow
  - signOut()               // Logout
  - getCurrentUser()        // User state
  - checkAuthorization()    // Access control
  - logAccess()            // Audit logging
}
```

### GrupoService
Business logic for group management:

```javascript
class GrupoService {
  - createGroup()           // Group creation with unique ID
  - joinGroup()            // Join existing group
  - validateGroupId()      // ID format validation
  - generateGroupId()      // TOMATE-XXXXX generation
  - updatePersonOrder()    // Order management
  - calculateTotals()      // Price calculations
  - cleanupInactiveGroups() // Maintenance
}
```

### SessionService
Browser session management:

```javascript
class SessionService {
  - saveSession()          // LocalStorage persistence
  - getSession()          // Session restoration
  - clearSession()        // Cleanup
  - validateSession()     // Session verification
}
```

## Data Model

### Firebase Realtime Database Structure

```json
{
  "desayunos": {
    "TOMATE-12345": {
      "id": "TOMATE-12345",
      "createdAt": 1234567890,
      "lastActivity": 1234567890,
      "paid": false,
      "personas": {
        "Juan": {
          "pedido": {
            "Tostada con tomate": {
              "precio": 2.00,
              "cantidad": 1,
              "suplementos": ["Jamón"]
            }
          },
          "total": 3.50
        }
      },
      "totalGrupo": 3.50
    }
  },
  "authorizedUsers": ["admin@example.com"],
  "adminAccessLogs": {
    "userId": {
      "timestamp": 1234567890,
      "email": "admin@example.com",
      "action": "login"
    }
  }
}
```

### Security Rules

```json
{
  "desayunos": {
    ".read": true,           // Public read for group data
    ".write": true,          // Public write for collaboration
    "$groupId": {
      ".validate": "newData.hasChildren(['id', 'createdAt', 'paid'])"
    }
  },
  "authorizedUsers": {
    ".read": "auth != null",  // Authenticated read only
    ".write": false           // Manual management only
  },
  "adminAccessLogs": {
    ".read": "auth != null",  // Authenticated access
    ".write": "auth != null"
  }
}
```

## Real-time Synchronization

### Event Flow

1. **User Action** → Component event
2. **Component** → Service method call
3. **Service** → Firebase write operation
4. **Firebase** → Real-time broadcast to all clients
5. **Listeners** → Component state update
6. **Component** → UI re-render

### Conflict Resolution

- **Last-write-wins**: Firebase handles concurrent updates
- **Optimistic UI**: Updates show immediately, sync in background
- **Error recovery**: Automatic retry on connection loss

## Build and Deployment

### Build Process

```bash
npm run build
├── generate-firebase-config.js  # Generate config from .env
├── astro build                 # Build static site
└── Output to dist/            # Firebase hosting directory
```

### Environment Configuration

The build process reads from `.env`:
- `PUBLIC_FIREBASE_*` variables
- Generates `/public/js/firebase-config.js`
- Includes emulator detection logic
- Provides helper functions

### Deployment Architecture

```
Firebase Hosting
├── dist/                    # Static files
│   ├── index.html          # Main app
│   ├── admin/index.html    # Admin panel
│   └── _astro/            # Bundled assets
└── Firebase Services
    ├── Realtime Database   # Data persistence
    ├── Authentication      # Google OAuth
    └── Hosting            # CDN distribution
```

## Performance Optimizations

### Static Site Generation
- Astro pre-renders HTML at build time
- Minimal JavaScript hydration
- Optimized asset loading

### Component Loading
- Lit components loaded as ES modules
- Lazy loading from CDN
- Efficient re-rendering with reactive properties

### Real-time Updates
- Firebase SDK handles connection management
- Automatic reconnection
- Offline persistence support

### Bundle Optimization
- Tree-shaking unused code
- Minification in production
- Asset compression

## Development Workflow

### Local Development Setup

```bash
# Terminal 1: Start emulator
npm run emulator

# Terminal 2: Start dev server  
npm run dev:astro

# Or combined:
npm run dev
```

### Emulator Architecture

- **Database Emulator** (port 9000): Local Realtime Database
- **Emulator UI** (port 4000): Web interface for data inspection
- **Auto-detection**: App automatically connects to emulator in development

## Security Architecture

### Authentication Flow

```
User → Google OAuth → Firebase Auth → Check authorizedUsers → Grant Access
```

### Authorization Levels

1. **Public Users**: Create/join groups, manage own orders
2. **Authorized Admins**: Full dashboard access, all groups management
3. **System**: Automated cleanup, maintenance tasks

### Data Protection

- Environment variables for sensitive config
- Generated config files excluded from git
- HTTPS enforcement in production
- Input sanitization in components

## Testing Considerations

### Component Testing
- Lit components are testable in isolation
- Mock Firebase services for unit tests
- Use Firebase emulator for integration tests

### E2E Testing
- Test full user flows
- Emulator provides consistent test data
- Test real-time synchronization

## Scalability Considerations

### Current Architecture Limits
- Suitable for small to medium groups (< 100 concurrent users)
- Real-time sync for all group members
- No server-side processing required

### Future Scaling Options
- Firebase Cloud Functions for server-side logic
- Firestore for larger datasets
- Regional database sharding
- CDN optimization for global distribution

## Best Practices

### Code Organization
1. **Single Responsibility**: Each service/component has one clear purpose
2. **Dependency Injection**: Services passed to components
3. **Event-Driven**: Components communicate via events
4. **Immutable Updates**: State changes create new objects

### Development Guidelines
1. Always use services for business logic
2. Keep components focused on UI
3. Use TypeScript types where beneficial
4. Follow Lit best practices for web components
5. Test with emulator before production

### Deployment Checklist
1. Environment variables configured
2. Firebase project setup complete
3. Security rules deployed
4. Authorized users configured
5. Build optimization enabled

This architecture provides a robust, scalable foundation for the breakfast ordering application with real-time collaboration, secure admin access, and excellent developer experience.