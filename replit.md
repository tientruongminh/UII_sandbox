# Overview

ParkFinder is a comprehensive parking management system designed for Ho Chi Minh City that connects parking lot owners with users seeking parking spaces. The application features real-time parking availability tracking, community-driven updates, a rewards system for user engagement, and advanced search capabilities. Built as a full-stack web application, it serves both motorcycle and car parking needs with location-based services and pricing transparency.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for full-stack type safety
- **API Design**: REST architecture with consistent JSON responses and error handling
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **Development**: Hot module replacement and middleware logging for development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Database Provider**: Neon Database (serverless PostgreSQL) for production deployment
- **Connection**: Connection pooling and environment-based configuration

## Core Data Models
- **Users**: Authentication, profile management, points system, and membership tiers
- **Parking Lots**: Location data, capacity tracking, pricing, facilities, and real-time availability
- **Reviews**: User feedback system with ratings and comments
- **Community Updates**: Real-time status updates from the community
- **Rewards System**: Points accumulation and redemption functionality

## Authentication and Authorization
- **Session-based Authentication**: Server-side session management with PostgreSQL storage
- **User Roles**: Basic user and parking lot owner roles
- **Demo Mode**: Currently using demo user data for development and testing

## Key Features Implementation
- **Real-time Availability**: Live tracking of motorcycle and car parking spots
- **Search and Filtering**: Advanced search with multiple criteria (location, price, vehicle type, facilities)
- **Community Updates**: User-generated real-time parking status updates
- **Rewards System**: Points-based engagement with membership tiers (bronze, silver, gold)
- **Mobile-Responsive Design**: Optimized for both desktop and mobile devices
- **Mapping Integration**: Simple map visualization for parking lot locations

# External Dependencies

## Core Framework Dependencies
- **@vitejs/plugin-react**: React integration for Vite build system
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React applications
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration bridge for form validation

## UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for building type-safe component variants
- **clsx**: Utility for conditional className construction
- **lucide-react**: Icon library with React components

## Database and Backend
- **drizzle-orm**: Type-safe ORM for PostgreSQL operations
- **drizzle-kit**: Database migration and introspection tools
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Development and Build Tools
- **typescript**: Static type checking for JavaScript
- **vite**: Fast build tool and development server
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for Node.js

## Validation and Data Handling
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation
- **date-fns**: Modern JavaScript date utility library

## Development Environment
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tools
- **postcss**: CSS processing with autoprefixer support