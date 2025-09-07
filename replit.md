# Draw & Play Universe

## Overview

Draw & Play Universe is a creative SaaS platform that transforms user drawings into interactive games using AI technology. The platform allows users (kids, hobbyists, and casual gamers) to draw characters, objects, or environments and automatically generates playable games based on their creations. The system supports multiple game types including platformers, racing games, battle arenas, and story worlds, providing instant gratification through a seamless draw-to-play experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React 18 and TypeScript, using a component-based architecture with shadcn/ui for the design system. The application uses Wouter for client-side routing and TanStack Query for state management and server communication. The UI follows a playful, kid-friendly design with custom CSS variables for theming and Tailwind CSS for styling. Key features include a drawing canvas component with real-time drawing capabilities, game preview components, and a comprehensive gallery system.

### Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API pattern. The architecture separates concerns through distinct modules for authentication, storage, AI integration, and route handling. The server implements session-based authentication through Replit's OAuth system and provides endpoints for user management, drawing operations, and game generation. Error handling is centralized with consistent JSON responses and proper HTTP status codes.

### Drawing and Game Engine
The drawing system uses HTML5 Canvas with custom tools for brush, eraser, and drawing state management. The canvas supports undo/redo functionality, multiple colors, and adjustable brush sizes. Game generation integrates with OpenAI's GPT-5 model to analyze drawings and generate game data, including character analysis, physics properties, and sprite animations.

### Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, drawings, games, and user subscriptions. Session storage is handled through connect-pg-simple for persistent authentication state. The storage layer is abstracted through an interface that supports both database and in-memory implementations.

### Authentication System
Authentication is implemented using Replit's OpenID Connect (OIDC) system with Passport.js. The system handles user session management, token refresh, and provides middleware for protecting authenticated routes. User profiles include email, name, and profile images from the Replit identity provider.

## External Dependencies

### AI Services
- **OpenAI GPT-5**: Powers the core drawing analysis and game generation features, analyzing user drawings to determine character types, suggest game mechanics, and generate physics properties

### Authentication Provider
- **Replit OIDC**: Handles user authentication and profile management through OpenID Connect integration

### Database and Storage
- **PostgreSQL**: Primary database for persistent data storage
- **Neon Database**: Serverless PostgreSQL hosting solution for scalable database operations

### UI and Component Libraries
- **Radix UI**: Provides accessible, unstyled component primitives for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for responsive design and styling
- **shadcn/ui**: Pre-built component library built on Radix UI with consistent design patterns

### Development and Build Tools
- **Vite**: Frontend build tool and development server with hot module replacement
- **Drizzle Kit**: Database migration and schema management tool
- **TypeScript**: Type safety across frontend and backend codebases
- **ESBuild**: Fast JavaScript bundler for production builds