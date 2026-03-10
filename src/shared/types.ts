export type TodoStatus = 'waiting' | 'completed'

export interface Todo {
  id: string
  title: string
  emoji?: string
  description?: string
  status: TodoStatus
  dateCreated: string // YYYY-MM-DD
  parentId?: string
  children: string[]
  category?: string
  order: number
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  totalTodos: number
  completedTodos: number
  contextSwitches: number
  categories: Record<string, number>
}

export interface WeeklyStats {
  weekStart: string // YYYY-MM-DD
  dailyStats: DailyStats[]
  weeklyCompletedTodos: number
  weeklyContextSwitches: number
  topCategories: Array<{ category: string; count: number }>
}

export interface MonthlyStats {
  month: string // YYYY-MM
  weeklyStats: WeeklyStats[]
  monthlyCompletedTodos: number
  monthlyContextSwitches: number
  topCategories: Array<{ category: string; count: number }>
}

export interface Category {
  id: string
  name: string
  color: string // hex color like #FF6B6B
  deprecated?: boolean // 더 이상 사용하지 않는 카테고리 (기본값: false)
}

export type SortOption = 'created' | 'recommended' | 'category'
