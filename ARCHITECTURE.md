# Architecture Guide - Planning GameXP v1.2.0

## Overview

This document describes the current architectural implementation of Planning GameXP v1.2.0, featuring a service-oriented architecture with centralized services, event delegation patterns, and Lit-based web components for improved maintainability and performance.

## Tech Stack

- **Frontend Framework**: Astro (v5.10.0) with Lit web components
- **Backend Services**: Firebase (Realtime Database, Firestore, Auth, Cloud Functions, Storage, FCM)
- **Testing**: Vitest (unit tests), Playwright (E2E tests)
- **Build System**: Astro with custom service worker generation
- **Architecture Pattern**: Service-Oriented Architecture with Event Delegation

## Core Services

### 1. Firebase Service (`firebase-service.js`)

Central service for all Firebase operations including authentication, database access, and configuration.

```javascript
import { FirebaseService } from "./services/firebase-service.js";

// Initialize Firebase services
FirebaseService.init();

// Access different Firebase services
const auth = FirebaseService.getAuth();
const database = FirebaseService.getDatabase();
const firestore = FirebaseService.getFirestore();
```

### 2. Permission Service (`permission-service.js`)

Centralizes role-based access control logic across all components.

```javascript
import { permissionService } from "./services/permission-service.js";

// Initialize with user data
permissionService.init(user, userRole, viewMode);

// Get permissions for any card type
const permissions = permissionService.getCardPermissions(cardData, "task");
// Returns: { canView, canEdit, canSave, canDelete, canCreate }
```

**Role-Based Permissions:**
- **Admin**: Full access in management mode
- **User**: Limited creation rights in consultation mode
- **Consultant**: Read-only access with specific creation permissions

### 3. Card Service (`card-service.js`)

Handles all card-related business logic and CRUD operations.

```javascript
import { CardService } from "./services/card-service.js";

const cardService = new CardService(firebaseService);

// Card operations
await cardService.createCard(cardData);
await cardService.updateCard(cardId, updates);
await cardService.deleteCard(cardId);
const card = await cardService.getCard(cardId);
```

### 4. Card Realtime Service (`card-realtime-service.js`)

Manages real-time synchronization of card data across clients using Firebase Realtime Database.

```javascript
import { initCardRealtimeService } from "./services/card-realtime-service.js";

// Initialize real-time synchronization
await initCardRealtimeService();

// Automatic real-time updates for all cards
// Handles conflict resolution and data consistency
```

### 5. Filter Service (`filter-service.js`)

Generic filtering system supporting multiple card types with configurable filter options.

```javascript
import { filterService } from './services/filter-service.js';

// Register filter configuration
filterService.registerFilterConfig('task', {
  filters: {
    search: { type: 'text', fields: ['title', 'description'] },
    status: { type: 'select', multiple: true, options: [...] },
    priority: { type: 'select', options: [...] }
  },
  sortOptions: ['title', 'createdDate', 'status']
});

// Apply filters
const filteredCards = filterService.applyFilters('task', cards, filterState);
```

### 6. Modal Service (`modal-service.js`)

Centralized modal management with LIFO stacking and different modal types.

```javascript
import { modalService } from "./services/modal-service.js";

// Create basic modal
const modal = await modalService.createModal({
  title: "Edit Card",
  content: cardElement,
  maxWidth: "80vw",
});

// Create confirmation modal
const confirmed = await modalService.createConfirmationModal({
  title: "Delete Card",
  message: "Are you sure?",
  confirmText: "Delete",
  cancelText: "Cancel",
});
```

### 7. Push Notification Service (`push-notification-service.js`)

Handles Firebase Cloud Messaging for real-time notifications.

```javascript
import { pushNotificationService } from "./services/push-notification-service.js";

// Initialize push notifications
await pushNotificationService.init();

// Send notification
await pushNotificationService.sendNotification(userId, {
  title: "Task assigned",
  message: "New task has been assigned to you",
  data: { taskId, projectId }
});
```

### 8. Global Data Manager (`global-data-manager.js`)

Centralized state management for global application data.

```javascript
import { globalDataManager } from "./services/global-data-manager.js";

// Access global state
const currentProject = globalDataManager.getCurrentProject();
const userRole = globalDataManager.getUserRole();

// Listen for state changes
globalDataManager.addListener('project-changed', (project) => {
  // Handle project change
});
```

### 9. Update Service (`update-service.js`)

Manages application updates and version control.

```javascript
import { updateService } from "./services/update-service.js";

// Check for updates
const hasUpdate = await updateService.checkForUpdates();

// Apply updates
if (hasUpdate) {
  await updateService.applyUpdate();
}
```

## Event System

### Unified Event System (`unified-event-system.js`)

Advanced event delegation system that manages all application events centrally.

```javascript
import { UnifiedEventSystem } from "./events/unified-event-system.js";

// Register event handlers
UnifiedEventSystem.register(".add-button", "click", (event, element) => {
  // Handle add button clicks
});

// Event delegation with priority and options
UnifiedEventSystem.register(".critical-button", "click", handler, {
  priority: 10,
  preventDefault: true,
});
```

### Event Delegation Manager (`event-delegation-manager.js`)

Core event delegation implementation for performance optimization.

```javascript
import { eventDelegationManager } from "./events/event-delegation-manager.js";

// Single event listener per event type on document
// Automatic cleanup and memory management
// Priority-based handler execution
```

## Factory Patterns

### Card Factory (`card-factory.js`)

Creates appropriate card types based on configuration.

```javascript
import { CardFactory } from "./factories/card-factory.js";

// Create different card types
const taskCard = await CardFactory.createCard("task", taskConfig);
const bugCard = await CardFactory.createCard("bug", bugConfig);
```

### View Factory (`view-factory.js`)

Creates different view renderers (List, Kanban, Sprint, Gantt).

```javascript
import { ViewFactory } from "./factories/view-factory.js";

// Create view renderers
const listView = ViewFactory.createRenderer("list", config);
const kanbanView = ViewFactory.createRenderer("kanban", config);
```

## Rendering System

### Card Renderer (`card-renderer.js`)

Handles rendering logic for all card types.

### View Renderers
- **List Renderer** (`list-renderer.js`): Traditional list view
- **Kanban Renderer** (`kanban-renderer.js`): Kanban board view
- **Sprint Renderer** (`sprint-renderer.js`): Sprint-specific view
- **Gantt Renderer** (`gantt-renderer.js`): Timeline view
- **Table Renderer** (`table-renderer.js`): Tabular view

## Web Components Architecture

### Base Components

All components extend from base classes with shared functionality:

- **BaseCard** (`base-card.js`): Base class for all card components
- **EditableCard** (`editable-card.js`): Enhanced base with editing capabilities

### Card Components
- **TaskCard** (`TaskCard.js`): Task management cards
- **BugCard** (`BugCard.js`): Bug tracking cards
- **SprintCard** (`SprintCard.js`): Sprint planning cards
- **EpicCard** (`EpicCard.js`): Epic management cards
- **ProposalCard** (`ProposalCard.js`): Proposal cards
- **QACard** (`QACard.js`): Quality assurance cards

### UI Components
- **AppManager** (`AppManager.js`): Main application manager
- **AppModal** (`AppModal.js`): Modal dialog system
- **ProjectSelector** (`ProjectSelector.js`): Project selection interface
- **NotificationBell** (`NotificationBell.js`): Notification center
- **MenuNav** (`MenuNav.js`): Navigation menu
- **GanttChart** (`GanttChart.js`): Gantt chart visualization
- **SprintPointsChart** (`SprintPointsChart.js`): Sprint analytics

### Filter Components
- **TaskFilters** (`TaskFilters.js`): Task filtering interface
- **BugFilters** (`BugFilters.js`): Bug filtering interface
- **MultiSelect** (`MultiSelect.js`): Multi-selection component

## Utility System

### Core Utils
- **Common Functions** (`common-functions.js`): Shared utility functions
- **UI Utils** (`ui-utils.js`): UI-specific utilities
- **URL Utils** (`url-utils.js`): URL manipulation utilities
- **Service Communicator** (`service-communicator.js`): Inter-service communication
- **Modal Manager** (`modal-manager.js`): Modal management utilities
- **Cache Manager** (`cache-manager.js`): Caching system
- **Lazy Loader** (`lazy-loader.js`): Dynamic loading utilities
- **Email Sanitizer** (`email-sanitizer.js`): Email processing utilities
- **User Display Utils** (`user-display-utils.js`): User presentation utilities
- **Sinsole** (`sinsole.js`): Custom logging system

## Theming and Styling

### Theme System
- **Theme Variables** (`theme-variables.js`): CSS custom properties
- **Base Styles** (`base-card-styles.js`, `base-tab-styles.js`): Common styling
- **Component-Specific Themes**:
  - Task Theme (`task-theme.js`)
  - Bug Theme (`bug-theme.js`)
  - Sprint Theme (`sprint-theme.js`)
  - Story Theme (`story-theme.js`)

### Style Architecture
Each component has its own dedicated style file maintaining separation of concerns while allowing for shared theming.

## Controllers

### App Controller (`app-controller.js`)

Main application controller that orchestrates all services and components.

```javascript
import { AppController } from './controllers/app-controller.js';

// Create and initialize application
const appController = await AppController.create();
```

### Specialized Controllers
- **Project Controller** (`project-controller.js`): Project management logic
- **Tab Controller** (`tab-controller.js`): Tab navigation management

## Configuration System

### App Constants (`app-constants.js`)

Centralized configuration for application-wide constants.

### Client Config (`client-config.js`)

Client-specific configuration settings.

### Theme Config (`theme-config.js`)

Theme and styling configuration.

## File Structure

```
public/js/
├── services/              # Centralized business logic services
│   ├── firebase-service.js
│   ├── permission-service.js
│   ├── card-service.js
│   ├── card-realtime-service.js
│   ├── filter-service.js
│   ├── modal-service.js
│   ├── push-notification-service.js
│   ├── global-data-manager.js
│   ├── notification-service.js
│   └── update-service.js
├── events/                # Event system
│   ├── unified-event-system.js
│   ├── event-delegation-manager.js
│   └── dom-update-functions.js
├── factories/             # Factory patterns
│   ├── card-factory.js
│   └── view-factory.js
├── renderers/             # View rendering logic
│   ├── card-renderer.js
│   ├── list-renderer.js
│   ├── kanban-renderer.js
│   ├── sprint-renderer.js
│   ├── gantt-renderer.js
│   └── table-renderer.js
├── controllers/           # Application controllers
│   ├── app-controller.js
│   ├── project-controller.js
│   └── tab-controller.js
├── wc/                   # Lit Web Components
│   ├── base-card.js
│   ├── editable-card.js
│   ├── TaskCard.js
│   ├── BugCard.js
│   └── [other components...]
├── utils/                # Utility functions
│   ├── common-functions.js
│   ├── ui-utils.js
│   ├── service-communicator.js
│   └── [other utils...]
├── ui/styles/            # Theming and styles
│   ├── theme-variables.js
│   ├── themes/
│   └── [component styles...]
├── filters/              # Filter system
│   ├── filter-factory.js
│   ├── base-filter-system.js
│   └── types/
├── views/                # View managers
│   ├── list-view-manager.js
│   ├── kanban-view-manager.js
│   └── [other view managers...]
├── core/                 # Core initialization
│   └── app-initializer.js
├── config/               # Configuration
│   ├── app-constants.js
│   ├── client-config.js
│   └── theme-config.js
├── constants/            # Application constants
│   └── app-constants.js
└── main.js              # Application entry point
```

## Architecture Principles

### 1. Service-Oriented Architecture
- **Separation of Concerns**: Each service has a single responsibility
- **Dependency Injection**: Services can be easily mocked for testing
- **Centralized Logic**: Business logic is centralized in services

### 2. Event-Driven Architecture
- **Unified Event System**: All events go through centralized management
- **Loose Coupling**: Components communicate via events, not direct references
- **Performance Optimized**: Single event listeners with delegation

### 3. Component-Based Architecture
- **Lit Web Components**: Reusable, standards-based components
- **Composition**: Complex UI built from simple, composable components
- **Separation of Concerns**: Logic, styling, and templates separated

### 4. Real-time Architecture
- **Firebase Integration**: Real-time data synchronization
- **Conflict Resolution**: Automatic handling of concurrent edits
- **Offline Support**: Graceful degradation when offline

## Performance Optimizations

### Memory Management
- **Event Delegation**: O(1) event listeners instead of O(n)
- **Lazy Loading**: Components loaded on demand
- **Cache Management**: Intelligent caching of frequently accessed data

### Real-time Performance
- **Optimistic Updates**: UI updates before server confirmation
- **Batch Operations**: Multiple operations combined for efficiency
- **Connection Management**: Efficient Firebase connection handling

## Security Architecture

### Permission System
- **Role-Based Access Control**: Admin, User, Consultant roles
- **Field-Level Permissions**: Granular control over data access
- **Real-time Permission Updates**: Permissions updated in real-time

### Data Security
- **Firebase Security Rules**: Server-side validation
- **Input Sanitization**: All user input sanitized
- **Authentication Required**: All operations require authentication

## Testing Architecture

### Unit Testing (Vitest)
- **Service Testing**: All services have unit tests
- **Component Testing**: Web components tested in isolation
- **Mock Services**: Services can be mocked for testing

### E2E Testing (Playwright)
- **Comprehensive Test Suite**: Full user workflow testing
- **Automatic Authentication**: Persistent login across tests
- **Test Data Management**: Automatic cleanup of test data

## Migration and Deployment

### Build Process
- **Security Checks**: Automatic vulnerability scanning
- **Service Worker Generation**: Custom service worker for caching
- **Multi-Environment**: Development, pre-production, production builds

### Deployment
- **Firebase Hosting**: Static asset deployment
- **Cloud Functions**: Server-side logic deployment
- **Database Rules**: Security rules deployment

## Best Practices

### Development
1. **Use Services**: Always use centralized services instead of inline logic
2. **Event Communication**: Use events for component communication
3. **Proper Cleanup**: Always clean up event listeners and subscriptions
4. **Error Handling**: Comprehensive error handling and logging
5. **Performance First**: Consider performance implications of architectural decisions

### Code Organization
1. **Single Responsibility**: Each file/service has one clear purpose
2. **Consistent Naming**: Follow established naming conventions
3. **Documentation**: Code is self-documenting with clear comments
4. **Testing**: Every service and component should be testable

This architecture provides a robust, scalable foundation for the Planning GameXP application with clear separation of concerns, excellent performance characteristics, and strong maintainability.