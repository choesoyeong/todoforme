import { create } from 'zustand'
import { DailyStats, WeeklyStats, MonthlyStats } from '@shared/types'
import { useTodoStore } from './todoStore'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

interface StatsStore {
  getDailyStats: (date: string) => DailyStats
  getWeeklyStats: (date: string) => WeeklyStats
  getMonthlyStats: (date: string) => MonthlyStats
  calculateCompletionRate: (date: string) => number
  calculateContextSwitches: (date: string) => number
  getTopCategories: (startDate: string, endDate: string) => Array<{ category: string; count: number }>
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  getDailyStats: (date) => {
    const todos = useTodoStore.getState().getTodosByDate(date)
    const completedTodos = todos.filter(t => t.status === 'completed').length
    const totalTime = todos.reduce((sum, todo) => sum + todo.totalTime, 0)
    
    // 카테고리별 통계
    const categories: Record<string, number> = {}
    todos.forEach(todo => {
      if (todo.category) {
        categories[todo.category] = (categories[todo.category] || 0) + 1
      }
    })

    return {
      date,
      totalTodos: todos.length,
      completedTodos,
      totalTimeSpent: totalTime,
      contextSwitches: get().calculateContextSwitches(date),
      categories
    }
  },

  getWeeklyStats: (date) => {
    const weekStart = format(startOfWeek(new Date(date)), 'yyyy-MM-dd')
    const weekEnd = format(endOfWeek(new Date(date)), 'yyyy-MM-dd')
    
    const daysInWeek = eachDayOfInterval({
      start: new Date(weekStart),
      end: new Date(weekEnd)
    })

    const dailyStats = daysInWeek.map(day => 
      get().getDailyStats(format(day, 'yyyy-MM-dd'))
    )

    const weeklyTotalTime = dailyStats.reduce((sum, day) => sum + day.totalTimeSpent, 0)
    const weeklyCompletedTodos = dailyStats.reduce((sum, day) => sum + day.completedTodos, 0)
    const weeklyContextSwitches = dailyStats.reduce((sum, day) => sum + day.contextSwitches, 0)
    
    const topCategories = get().getTopCategories(weekStart, weekEnd)

    return {
      weekStart,
      dailyStats,
      weeklyTotalTime,
      weeklyCompletedTodos,
      weeklyContextSwitches,
      topCategories
    }
  },

  getMonthlyStats: (date) => {
    const monthStart = format(startOfMonth(new Date(date)), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(new Date(date)), 'yyyy-MM-dd')
    
    // 주별 통계들 수집 (간단화를 위해 첫 주만)
    const weeklyStats = [get().getWeeklyStats(date)]
    
    const monthlyTotalTime = weeklyStats.reduce((sum, week) => sum + week.weeklyTotalTime, 0)
    const monthlyCompletedTodos = weeklyStats.reduce((sum, week) => sum + week.weeklyCompletedTodos, 0)
    const monthlyContextSwitches = weeklyStats.reduce((sum, week) => sum + week.weeklyContextSwitches, 0)
    
    const topCategories = get().getTopCategories(monthStart, monthEnd)

    return {
      month: format(new Date(date), 'yyyy-MM'),
      weeklyStats,
      monthlyTotalTime,
      monthlyCompletedTodos,
      monthlyContextSwitches,
      topCategories
    }
  },

  calculateCompletionRate: (date) => {
    const todos = useTodoStore.getState().getTodosByDate(date)
    if (todos.length === 0) return 0
    
    const completed = todos.filter(t => t.status === 'completed').length
    return Math.round((completed / todos.length) * 100)
  },

  calculateContextSwitches: (date) => {
    // 간단화: 날짜별 완료된 할 일 수를 기반으로 추정
    const todos = useTodoStore.getState().getTodosByDate(date)
    const completedTodos = todos.filter(t => t.status === 'completed')
    return Math.max(0, completedTodos.length - 1)
  },

  getTopCategories: (startDate, endDate) => {
    const allTodos = useTodoStore.getState().todos
    const relevantTodos = allTodos.filter(todo => 
      todo.dateCreated >= startDate && todo.dateCreated <= endDate
    )

    const categoryCount: Record<string, number> = {}
    relevantTodos.forEach(todo => {
      if (todo.category) {
        categoryCount[todo.category] = (categoryCount[todo.category] || 0) + 1
      }
    })

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }
}))