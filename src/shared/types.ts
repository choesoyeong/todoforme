export type TodoStatus = 'waiting' | 'in_progress' | 'paused' | 'completed'

export interface Todo {
  id: string
  title: string
  emoji?: string
  description?: string
  status: TodoStatus
  dateCreated: string // YYYY-MM-DD
  startTime?: number // timestamp
  endTime?: number // timestamp
  totalTime: number // minutes
  parentId?: string
  children: string[]
  category?: string
  order: number
}

export interface TimerState {
  activeTodoId?: string
  startTime?: number
  elapsedTime: number // seconds
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  totalTodos: number
  completedTodos: number
  totalTimeSpent: number // minutes
  contextSwitches: number
  categories: Record<string, number>
}

export interface WeeklyStats {
  weekStart: string // YYYY-MM-DD
  dailyStats: DailyStats[]
  weeklyTotalTime: number
  weeklyCompletedTodos: number
  weeklyContextSwitches: number
  topCategories: Array<{ category: string; count: number }>
}

export interface MonthlyStats {
  month: string // YYYY-MM
  weeklyStats: WeeklyStats[]
  monthlyTotalTime: number
  monthlyCompletedTodos: number
  monthlyContextSwitches: number
  topCategories: Array<{ category: string; count: number }>
}

export interface Category {
  id: string
  name: string
  color: string // hex color like #FF6B6B
}

export type SortOption = 'created' | 'recommended' | 'category' | 'workTime'