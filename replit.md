# Overview

Momentum is a Progressive Web App (PWA) habit tracker that replicates the design and functionality of Streaks App. The application allows users to create, manage, and track daily habits with comprehensive progress visualization, streak tracking, and social sharing features. Built as a full-stack web application with modern technologies, it provides offline functionality and cross-platform compatibility through PWA standards.

## Recent Changes (August 2025)
- ✅ **Navigation Simplification (Aug 12)**: Completely removed mobile footer navigation and non-functional pagination dots for cleaner, full-screen mobile experience with simplified navigation
- ✅ **Mobile Tile Enlargement (Aug 12)**: Significantly increased mobile habit tiles - changed to single-column layout with 144px progress rings, text-5xl icons, and full-width tiles for enhanced touch experience and visibility
- ✅ **Responsive Tile Sizing**: Mobile tiles now 50% larger in all dimensions with w-36 h-36 progress containers, p-8 padding, and text-base typography while maintaining desktop compact design
- ✅ **Responsive Action Icons**: Implemented adaptive interface for habit card actions - mobile devices use hamburger menu for clean UI, while desktop shows hover-activated individual icons for direct access
- ✅ **Mobile-First Action Menu**: Optimized mobile experience with hamburger menu containing all actions (Start/Pause, View, Edit, Delete) since hover effects don't work on touch devices
- ✅ **Desktop Hover Icons**: Enhanced desktop experience with compact individual action icons that appear on card hover, providing quick access without menu navigation
- ✅ **Cross-Device Consistency**: Maintained all functionality across platforms while optimizing interaction patterns for each device type
- ✅ **Streamlined Habit Creation**: Successfully removed intermediate "Add Habit" selection screen - clicking "ADD A HABIT" now goes directly to the "Save Habit" configuration screen for faster habit setup, with proper null-safe handling for new habits
- ✅ **Notification System Overhaul**: Removed all intrusive toast notifications throughout the app for smoother user experience - visual feedback and state changes now provide sufficient confirmation for user actions
- ✅ **Back Button Navigation Fix**: Fixed Settings page back button navigation to correctly return to Profile page instead of Home page for both mobile and desktop views
- ✅ **Profile Menu Spacing Fix**: Fixed inconsistent spacing between profile menu items by replacing space-y utility with explicit margin-bottom classes for uniform spacing across all menu options
- ✅ **Mobile UI Optimization**: Removed mobile status bar header (time, signal indicators, battery) from all pages for cleaner interface and better screen space utilization
- ✅ **Icon Enhancement**: Updated all signout icons to attractive Power icon from lucide-react, replacing LogOut icon and door emoji for consistent theme-matching design
- ✅ **Comprehensive Documentation**: Added detailed README.md with complete project architecture, database schema with ER diagrams, technology stack overview, and deployment guidelines
- ✅ **Production Deployment Fixes**: Fixed all deployment issues including correct static file path (`dist/public`), enhanced error handling for missing environment variables, graceful server startup with fallback handling, and proper host binding to `0.0.0.0` for autoscale compatibility
- ✅ **Server Error Handling**: Complete error handling wrapper with try-catch blocks, graceful shutdown handlers (SIGTERM/SIGINT), environment variable validation for production, and detailed logging for debugging deployment issues
- ✅ **Build System Optimization**: Fixed static file serving path mismatch between Vite build output and server configuration, created custom static file handler with proper error fallbacks
- ✅ **Complete Terminology Update**: Successfully renamed all "Task" references to "Habit" throughout the entire application - UI components, modals, forms, navigation, statistics pages, and TypeScript interfaces now consistently use habit-focused language
- ✅ **App Rebranding**: Changed app name from "Stride" to "Momentum" for better brand identity representing habit building momentum
- ✅ **Custom Dropdown System**: Replaced problematic Radix dropdowns with custom positioned dropdowns for task cards and profile menus - fixed "flying from right top" positioning issues
- ✅ **Timer Persistence System**: Critical bug fix - Start/Pause states now persist across page refreshes with database synchronization, daily reset logic, and real-time state updates
- ✅ **Task Timer State Management**: Complete timer state system with database fields (timerState, timerStartedAt, timerElapsedSeconds, lastActiveDate) and PATCH API endpoint
- ✅ **Dark Mode System**: Complete dark mode implementation with smooth 300ms transitions, theme context provider, localStorage persistence, system preference detection, and database synchronization
- ✅ **Theme Management**: Centralized ThemeContext with theme toggle buttons in Settings and desktop header, CSS variable system for seamless light/dark mode switching
- ✅ **User Profile System**: Complete user profile functionality with dropdown menus, avatar display, and navigation
- ✅ **Persistent Settings**: Full settings management with database persistence for notifications, sound, vibration, dark mode, and reminder preferences
- ✅ **Profile Navigation**: Fixed all profile page links (App Settings, Notifications, Share App, Export Data)
- ✅ **Task Configuration**: Fixed Day-Long Task toggle and Task Days scheduling with comprehensive options
- ✅ **More Options Menu**: Added functional task options dialog with task type selection and advanced settings
- ✅ **Enhanced Task Cards**: Added goal display in thumbnails, task state management system, hamburger context menu system, and cross-platform drag-and-drop reordering
- ✅ **Cross-Platform Drag & Drop**: Implemented @dnd-kit library for seamless drag and drop functionality on both mobile touch devices and desktop mouse interactions
- ✅ **Task Management**: Complete CRUD operations with visual feedback and real-time updates
- ✅ **Responsive Design**: Enhanced mobile and desktop layouts for all settings and profile components with theme-aware styling
- ✅ **Database Integration**: User preferences and task configurations stored in PostgreSQL with real-time updates

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **PWA Implementation**: 
  - Service worker for offline functionality and caching
  - Web App Manifest for installability across platforms
  - Background sync and push notifications support

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with strict type checking
- **API Design**: RESTful API endpoints with proper HTTP status codes
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Centralized error handling middleware with proper logging

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Client-side Storage**: IndexedDB through service worker for offline data persistence
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

## Authentication and Authorization
- **Authentication Provider**: Replit OIDC integration
- **Session Management**: Secure HTTP-only cookies with 7-day TTL
- **Authorization**: Route-level protection with middleware
- **User Management**: User profile storage with automatic account creation

## Data Models
- **Users**: Profile information, settings, and authentication data with persistent preferences (notifications, sound, vibration, dark mode, reminder time)
- **Habits**: Habit definitions with customizable scheduling, goals, and appearance
- **Task Entries**: Daily progress tracking with completion status and optional metrics
- **Journal Entries**: Daily reflection and notes functionality
- **Shared Tasks**: Social features for habit sharing and accountability
- **Sessions**: Secure session management with PostgreSQL storage

## Theme System
- **ThemeContext**: React context provider managing light/dark theme state with localStorage persistence
- **CSS Variables**: Complete color system with light and dark mode variants, smooth cubic-bezier transitions
- **Theme Synchronization**: User preferences sync between localStorage, React context, and PostgreSQL database
- **System Integration**: Automatic detection and respect for user's system color scheme preference

## Component Architecture
- **Design System**: Consistent component library with variants and theming
- **Responsive Design**: Mobile-first approach with desktop adaptations
- **Drag & Drop System**: @dnd-kit library implementation with PointerSensor and KeyboardSensor for cross-platform compatibility
- **Accessibility**: WCAG compliant components with proper ARIA attributes and keyboard navigation support
- **Performance**: Optimized renders with React.memo and proper key usage

## PWA Features
- **Offline Support**: Full application functionality without network connection
- **Installability**: Native app-like installation on all major platforms
- **Push Notifications**: Habit reminders and motivation messages
- **Background Sync**: Automatic data synchronization when connection restored
- **Responsive Design**: Optimized for all screen sizes and orientations

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and query building
- **Connect PG Simple**: PostgreSQL session store for Express sessions

## Authentication Services
- **Replit OIDC**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express
- **OpenID Client**: OIDC protocol implementation

## UI and Design
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library with consistent design system
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Class Variance Authority**: Component variant management

## Development and Build Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and improved developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities
- **@dnd-kit**: Modern drag and drop library for sortable interactions with accessibility support

## Monitoring and Error Handling
- **Replit Development Tools**: Development-time error overlays and debugging
- **Custom Logging**: Request/response logging with performance metrics
- **Error Boundaries**: React error boundaries for graceful failure handling