# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PCDesk Frontend** is a React + TypeScript + Vite web application for managing PC inventory, customers, and service orders. The application features authentication-based access control and a clean Material-UI dashboard interface with a sidebar navigation system.

## Build & Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Run ESLint on all files
npm run lint

# Preview production build locally
npm run preview
```

**Development Setup**: The project runs on `http://localhost:5173` by default (Vite). The API is expected at `http://localhost:8080/api` (configurable via `VITE_API_URL` environment variable).

## Architecture Overview

### High-Level Structure

The application follows a clean separation of concerns with these main layers:

1. **Pages** (`src/pages/`) - Full-page components (Login, Dashboard)
2. **Components** (`src/components/`) - Reusable UI components and layout structure
3. **Contexts** (`src/contexts/`) - React Context for global state (Auth)
4. **API Layer** (`src/api/`) - Modular API endpoint handlers using Axios
5. **Types** (`src/types/index.ts`) - Centralized TypeScript interfaces
6. **Theme** (`src/theme.ts`) - Material-UI theme configuration
7. **Services** (`src/services/`) - Currently contains the axios instance setup

### Routing & Authentication

- **Router**: React Router v7 with nested routes
- **Auth Flow**: 
  - Login page (unauthenticated)
  - PrivateRoute wrapper enforces token-based access
  - AuthContext manages user state and token persistence (localStorage)
  - Dashboard wrapped in Layout component with sidebar navigation
  - Invalid paths redirect to home (`/`)

### API Integration

Two axios instances exist (potential consolidation opportunity):
- `src/services/api.ts` - Uses `VITE_API_URL` env var with timeout
- `src/api/client.ts` - Hardcoded base URL with auth interceptor for Bearer token injection and 401 redirect

**Recommendation**: These should be unified. The API client automatically:
- Injects Authorization header with stored token
- Redirects to login on 401 responses
- Handles errors with console logging

### Data Models & API Endpoints

Core entities defined in `src/types/index.ts`:
- **Computer**: Asset inventory with specs (processor, RAM, storage, GPU, OS) and status (available/allocated/maintenance/retired)
- **Customer**: Contact information with city/address
- **ServiceOrder**: Work orders with type (delivery/return/maintenance) and date tracking
- **History**: Allocation records linking computers to customers and orders

API modules in `src/api/`:
- `auth.ts` - Login endpoint
- `computers.ts` - GET computers with optional filters
- `customers.ts` - GET customers with optional filters
- `serviceOrders.ts` - GET service orders with open/type filters

### UI & Theme

- **Framework**: Material-UI (MUI) v9 with custom theme configuration
- **Colors**: Primary purple gradient (#aa3bff to #7c20d4), light background (#f6f4ff)
- **Layout**: Fixed 240px sidebar (dark #12062a) + flexible main content area with 64px header
- **Components**: Uses MUI components (Paper, Table, Chip, Skeleton, Avatar, etc.)
- **Styling**: Emotion-based (MUI's styled-components alternative)

### Dashboard Page

The dashboard is the main authenticated view displaying:
- **Stat cards**: Available, allocated, maintenance, retired computer counts + open orders + customer count
- **Open Orders table**: Recent service orders awaiting closure
- **Maintenance alert**: List of computers requiring service
- Uses `Promise.allSettled()` for resilient concurrent data loading

## Key Implementation Details

### localStorage Usage

Auth state persists via three keys:
- `token` - JWT/bearer token
- `userName` - User display name
- `userEmail` - User email address

### File Structure Notes

- `src/main.tsx` - Entry point wrapping App with BrowserRouter
- `src/App.tsx` - Root component with ThemeProvider, AuthProvider, and routing
- `src/routes.tsx` - Route definitions
- TypeScript strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`)

### Vite Configuration

Minimal config in `vite.config.ts` with React plugin for JSX/Refresh support. ESLint extends recommended configs for JS, TypeScript, React hooks, and Vite-specific rules.

## Environment Variables

No `.env` file exists in the repo. The single configurable variable:
- `VITE_API_URL` - Backend API base URL (defaults to `http://localhost:8080/api`)

## Testing

No test framework is currently configured. Jest or Vitest would be natural additions given the Vite + TypeScript setup.

