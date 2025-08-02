# Overview

Stride is a Progressive Web App (PWA) habit tracker that replicates the design and functionality of Streaks App. The application allows users to create, manage, and track daily habits with comprehensive progress visualization, streak tracking, and social sharing features. Built as a full-stack web application with modern technologies, it provides offline functionality and cross-platform compatibility through PWA standards.

## Recent Changes (August 2025)
- ✅ **User Profile System**: Complete user profile functionality with dropdown menus, avatar display, and navigation
- ✅ **Persistent Settings**: Full settings management with database persistence for notifications, sound, vibration, dark mode, and reminder preferences
- ✅ **Responsive Design**: Enhanced mobile and desktop layouts for all settings and profile components
- ✅ **Database Integration**: User preferences stored in PostgreSQL with real-time updates and proper authentication

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
- **Tasks**: Habit definitions with customizable scheduling, goals, and appearance
- **Task Entries**: Daily progress tracking with completion status and optional metrics
- **Journal Entries**: Daily reflection and notes functionality
- **Shared Tasks**: Social features for habit sharing and accountability
- **Sessions**: Secure session management with PostgreSQL storage

## Component Architecture
- **Design System**: Consistent component library with variants and theming
- **Responsive Design**: Mobile-first approach with desktop adaptations
- **Accessibility**: WCAG compliant components with proper ARIA attributes
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

## Monitoring and Error Handling
- **Replit Development Tools**: Development-time error overlays and debugging
- **Custom Logging**: Request/response logging with performance metrics
- **Error Boundaries**: React error boundaries for graceful failure handling