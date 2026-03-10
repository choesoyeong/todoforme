# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TodoForMe is a Korean desktop todo application built with Electron, React, and TypeScript. It features hierarchical todo management with simple completion tracking and statistics.

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
│   ├── main.ts        # App entry, window management, storage API
│   └── preload.ts     # Context isolation bridge (electronAPI)
├── renderer/          # React application
│   ├── components/    # Reusable UI components
│   ├── pages/         # Main application views
│   ├── stores/        # Zustand state management
│   └── types/         # Renderer-specific types
└── shared/           # Common types between processes
```

### Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Desktop**: Electron 28
- **State Management**: Zustand stores
- **Styling**: Tailwind CSS + Framer Motion
- **Storage**: electron-store for persistence
- **Date Handling**: date-fns library

### Navigation
State-based view switching (no URL router): `ViewType = 'todos' | 'stats' | 'categories' | 'settings'`. Sidebar triggers `setCurrentView()` with Framer Motion transitions.

### State Management Architecture
Three Zustand stores:
- `todoStore` - Todo CRUD operations, hierarchical relationships, sorting, persistence
- `statsStore` - Statistics calculations (daily/weekly/monthly) and analytics
- `categoryStore` - Category CRUD with color management and deprecation flag

### Data Models
Todos support hierarchical structure with parent-child relationships:
- `parentId` field links child todos to parents
- `children` array maintains child todo IDs
- Simple status: `waiting` (unchecked) / `completed` (checked)

### IPC Communication
**Renderer → Main (invoke):** `storage:getTodos`, `storage:setTodos`, `storage:getCategories`, `storage:setCategories`, `storage:getSettings`, `storage:setSetting`, `storage:exportData`, `storage:importData`, `storage:clearAll`, `storage:getStorePath`

### Storage Implementation
Uses electron-store for cross-platform data persistence:
- Main process handles storage operations via IPC handlers
- Preload script exposes `window.electronAPI` with storage methods
- Fallback to localStorage for browser development
- Zustand stores auto-save on every state change

### Path Aliases
- `@/*` → `src/renderer/*`
- `@shared/*` → `src/shared/*`

## Key Implementation Details

### Todo Status Flow
- `waiting` ↔ `completed` (simple checkbox toggle via `toggleTodoStatus`)
- Deletion cascades to all child todos

### Development Notes
- No test framework currently configured
- No linting commands in package.json (ESLint configured via tsconfig)
- Korean UI text throughout the application — use Korean for user-facing strings
- QuickAddTodo uses composition events for Korean IME input handling
- Vite dev server runs on port 3000
- Icons from Lucide React library
- Custom Tailwind palette: coral theme with peach, sky, cream, mint, lavender, rose shades
