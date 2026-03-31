import { create } from 'zustand'
import { DailyStats, WeeklyStats, MonthlyStats } from '@shared/types'
import { useTodoStore } from './todoStore'
import { useCategoryStore } from './categoryStore'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, subDays } from 'date-fns'

interface StatsStore {
  getDailyStats: (date: string) => DailyStats
  getWeeklyStats: (date: string) => WeeklyStats
  getMonthlyStats: (date: string) => MonthlyStats
  calculateCompletionRate: (date: string) => number
  calculateContextSwitches: (date: string) => number
  getTopCategories: (startDate: string, endDate: string) => Array<{ category: string; count: number }>
  getStreak: (date: string) => number
  getRecentDailyStats: (date: string, days: number) => DailyStats[]
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  getDailyStats: (date) => {
    const todos = useTodoStore.getState().getTodosByDate(date)
    const rootTodos = todos.filter(t => !t.parentId)
    const completedTodos = rootTodos.filter(t => t.status === 'completed').length

    // todo.category는 카테고리 ID — 이름으로 변환하여 집계
    const allCategories = useCategoryStore.getState().categories
    const categories: Record<string, number> = {}
    rootTodos.forEach(todo => {
      const catObj = allCategories.find(c => c.id === todo.category)
      const catName = catObj?.name || '미분류'
      categories[catName] = (categories[catName] || 0) + 1
    })

    return {
      date,
      totalTodos: rootTodos.length,
      completedTodos,
      contextSwitches: get().calculateContextSwitches(date),
      categories
    }
  },

  getWeeklyStats: (date) => {
    const weekStart = format(startOfWeek(new Date(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(date), { weekStartsOn: 1 }), 'yyyy-MM-dd')

    const daysInWeek = eachDayOfInterval({
      start: new Date(weekStart),
      end: new Date(weekEnd)
    })

    const dailyStats = daysInWeek.map(day =>
      get().getDailyStats(format(day, 'yyyy-MM-dd'))
    )

    const weeklyCompletedTodos = dailyStats.reduce((sum, day) => sum + day.completedTodos, 0)
    const weeklyContextSwitches = dailyStats.reduce((sum, day) => sum + day.contextSwitches, 0)

    const topCategories = get().getTopCategories(weekStart, weekEnd)

    return {
      weekStart,
      dailyStats,
      weeklyCompletedTodos,
      weeklyContextSwitches,
      topCategories
    }
  },

  getMonthlyStats: (date) => {
    const monthStart = startOfMonth(new Date(date))
    const monthEnd = endOfMonth(new Date(date))
    const monthStartStr = format(monthStart, 'yyyy-MM-dd')
    const monthEndStr = format(monthEnd, 'yyyy-MM-dd')

    // 해당 월의 모든 주 시작일 수집
    const weekStarts = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    )

    const weeklyStats = weekStarts.map(ws =>
      get().getWeeklyStats(format(ws, 'yyyy-MM-dd'))
    )

    // 월 전체 일별 통계에서 직접 합산 (주간 중복 방지)
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const allDailyStats = allDays.map(d => get().getDailyStats(format(d, 'yyyy-MM-dd')))
    const monthlyCompletedTodos = allDailyStats.reduce((sum, day) => sum + day.completedTodos, 0)
    const monthlyContextSwitches = allDailyStats.reduce((sum, day) => sum + day.contextSwitches, 0)

    const topCategories = get().getTopCategories(monthStartStr, monthEndStr)

    return {
      month: format(new Date(date), 'yyyy-MM'),
      weeklyStats,
      monthlyCompletedTodos,
      monthlyContextSwitches,
      topCategories
    }
  },

  calculateCompletionRate: (date) => {
    const todos = useTodoStore.getState().getTodosByDate(date)
    const rootTodos = todos.filter(t => !t.parentId)
    if (rootTodos.length === 0) return 0

    const completed = rootTodos.filter(t => t.status === 'completed').length
    return Math.round((completed / rootTodos.length) * 100)
  },

  calculateContextSwitches: (date) => {
    const todos = useTodoStore.getState().getTodosByDate(date)
    const completedTodos = todos.filter(t => t.status === 'completed' && !t.parentId)
    return Math.max(0, completedTodos.length - 1)
  },

  getTopCategories: (startDate, endDate) => {
    const allTodos = useTodoStore.getState().todos
    const relevantTodos = allTodos.filter(todo =>
      todo.dateCreated >= startDate && todo.dateCreated <= endDate && !todo.parentId
    )

    const allCategories = useCategoryStore.getState().categories
    const categoryCount: Record<string, number> = {}
    relevantTodos.forEach(todo => {
      const catObj = allCategories.find(c => c.id === todo.category)
      const catName = catObj?.name || '미분류'
      categoryCount[catName] = (categoryCount[catName] || 0) + 1
    })

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  },

  // 연속 달성일 계산: 해당 날짜부터 과거로 몇 일 연속 할 일을 완료했는지
  getStreak: (date) => {
    let streak = 0
    let currentDate = new Date(date)

    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const stats = get().getDailyStats(dateStr)

      if (stats.totalTodos === 0) {
        // 할 일이 없는 날은 건너뜀 (스트릭 유지)
        currentDate = subDays(currentDate, 1)
        continue
      }

      if (stats.completedTodos > 0) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }

    return streak
  },

  // 최근 N일 일별 통계
  getRecentDailyStats: (date, days) => {
    const result: DailyStats[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(date), i)
      result.push(get().getDailyStats(format(d, 'yyyy-MM-dd')))
    }
    return result
  }
}))
