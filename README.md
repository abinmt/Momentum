# Momentum

> Build lasting habits, track your progress

Momentum is a Progressive Web App (PWA) habit tracker that replicates the design and functionality of Streaks App. The application allows users to create, manage, and track daily habits with comprehensive progress visualization, streak tracking, and social sharing features.

## Features

### 🎯 Habit Management
- **Create Custom Habits**: Design personalized habits with flexible scheduling options
- **Multiple Habit Types**: Support for timer-based, counter-based, and simple completion habits
- **Smart Scheduling**: Configure habits for specific days of the week or daily routines
- **Goal Tracking**: Set and monitor progress toward specific targets

### 📊 Progress Visualization
- **Streak Tracking**: Monitor consecutive days of habit completion
- **Visual Progress**: Beautiful charts and progress rings showing your journey
- **Statistics Dashboard**: Comprehensive analytics of your habit performance
- **Calendar View**: Month-by-month visualization of your consistency

### ⚡ Real-time Features
- **Timer Persistence**: Start/pause states persist across page refreshes
- **Live Updates**: Real-time synchronization across all your devices
- **Offline Support**: Continue tracking habits even without internet connection
- **Cross-platform Sync**: Seamless experience across mobile and desktop

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Responsive Design**: Optimized for all screen sizes and orientations
- **Drag & Drop**: Intuitive habit reordering with touch and mouse support
- **PWA Support**: Install as a native app on any device

### 📱 Modern Technology
- **Progressive Web App**: Full offline functionality and installability
- **Real-time Persistence**: All changes saved instantly to the database
- **Cross-device Compatibility**: Works seamlessly on mobile, tablet, and desktop
- **Push Notifications**: Smart reminders and motivation messages

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **Shadcn/ui** components built on Radix UI primitives
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **@dnd-kit** for accessible drag-and-drop functionality

### Backend
- **Node.js** with Express.js server
- **TypeScript** with strict type checking
- **PostgreSQL** database with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Replit OIDC** authentication integration
- **Express sessions** with PostgreSQL store

### Development & Deployment
- **ESBuild** for fast JavaScript bundling
- **PostCSS** with Tailwind CSS processing
- **Drizzle Kit** for database migrations
- **Replit Deployments** for production hosting

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon serverless)
- Replit account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abinmt/Momentum.git
   cd Momentum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your DATABASE_URL and other required variables
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Run TypeScript type checking

## Project Structure

```
momentum/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── routes.ts          # API endpoint definitions
│   ├── storage.ts         # Database operations
│   └── static.ts          # Static file serving
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── dist/                  # Production build output
```

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Profile information and authentication data
- **Tasks/Habits**: Habit definitions with scheduling and goals
- **Task Entries**: Daily progress tracking records
- **Journal Entries**: Daily reflection and notes
- **Sessions**: Secure session management

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Set to "production"

### Replit Deployment
The application is optimized for Replit Deployments with:
- Automatic build process
- Static file serving from `dist/public`
- Environment variable validation
- Graceful error handling and shutdown

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Streaks App design and functionality
- Built with modern web technologies for optimal performance
- Designed for cross-platform compatibility and accessibility

---

**Start building better habits today with Momentum!** 🚀