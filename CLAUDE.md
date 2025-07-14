# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TodoForMe is a Korean desktop todo application built with Electron, React, and TypeScript. It features hierarchical todo management, built-in timers, and statistics tracking.

## Development Commands

### Core Commands
- `npm run dev` - Start development mode (runs main and renderer concurrently)
- `npm run build` - Build all components (main, preload, renderer)
- `npm start` - Start Electron app (after building)

### Build Commands
- `npm run build:main` - Compile main process TypeScript
- `npm run build:preload` - Compile preload script
- `npm run build:renderer` - Build React app with Vite
- `npm run pack` - Package app for distribution
- `npm run dist` - Full build and distribution

### Development Workflow
1. Run `npm run dev` to start development servers
2. In another terminal, run `npm start` to launch Electron
3. Renderer auto-reloads on changes, main process requires restart

## Architecture

### Directory Structure
```
src/
├── main/              # Electron main process
│   ├── main.ts        # App entry, window management
│   ├── preload.ts     # Bridge between main/renderer
│   └── storage.ts     # Not present - storage handled in main.ts
├── renderer/          # React application
│   ├── components/    # Reusable UI components
│   ├── pages/         # Main application views
│   ├── stores/        # Zustand state management
│   ├── types/         # Renderer-specific types
│   └── utils/         # Helper functions
└── shared/           # Common types between processes
```

### Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Electron 28
- **State Management**: Zustand stores
- **Styling**: Tailwind CSS + Framer Motion
- **Storage**: electron-store for persistence
- **Date Handling**: date-fns library

### State Management Architecture
Three main Zustand stores:
- `todoStore` - Todo CRUD operations, hierarchical relationships
- `timerStore` - Active timer state and elapsed time tracking  
- `statsStore` - Statistics calculations and analytics

### Data Models
Todos support hierarchical structure with parent-child relationships:
- `parentId` field links child todos to parents
- `children` array maintains child todo IDs
- Timer integration tracks time per todo with automatic status transitions

### Storage Implementation
Uses electron-store for cross-platform data persistence:
- Main process handles storage operations via IPC
- Preload script exposes safe storage API to renderer
- Fallback to localStorage for browser development

### Path Aliases
- `@/*` → `src/renderer/*`
- `@shared/*` → `src/shared/*`

## Key Implementation Details

### Timer System
- Only one todo can have active timer at a time
- Automatic time accumulation when status changes from 'in_progress'
- Time tracked in minutes, stored in `totalTime` field

### Todo Status Flow
- `waiting` → `in_progress` → `paused`/`completed`
- Status changes automatically update timer state
- Deletion cascades to all child todos

### Development Notes
- No test framework currently configured
- No linting commands in package.json (ESLint configured via tsconfig)
- Korean UI text throughout the application
- Statistics feature is basic implementation requiring enhancement