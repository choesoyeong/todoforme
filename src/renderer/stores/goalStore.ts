import { create } from 'zustand'
import { Goal } from '@shared/types'
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns'

interface GoalStore {
  goals: Goal[]
  addGoal: (type: 'monthly' | 'weekly', period: string, title: string) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  toggleGoal: (id: string) => void
  deleteGoal: (id: string) => void
  getGoalsByPeriod: (type: 'monthly' | 'weekly', period: string) => Goal[]
  saveGoals: () => void
  loadGoals: () => void
}

let nextId = 1
const generateId = () => `goal_${Date.now()}_${nextId++}`

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],

  addGoal: (type, period, title) => {
    const periodGoals = get().goals.filter(g => g.type === type && g.period === period)
    const newGoal: Goal = {
      id: generateId(),
      title,
      type,
      period,
      completed: false,
      order: periodGoals.length,
    }
    set(state => ({ goals: [...state.goals, newGoal] }))
    get().saveGoals()
  },

  updateGoal: (id, updates) => {
    set(state => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    }))
    get().saveGoals()
  },

  toggleGoal: (id) => {
    set(state => ({
      goals: state.goals.map(g =>
        g.id === id ? { ...g, completed: !g.completed } : g
      )
    }))
    get().saveGoals()
  },

  deleteGoal: (id) => {
    set(state => ({
      goals: state.goals.filter(g => g.id !== id)
    }))
    get().saveGoals()
  },

  getGoalsByPeriod: (type, period) => {
    if (type === 'weekly') {
      // period(월요일 시작)가 속한 주에 해당하는 모든 주간 목표를 찾기
      // 기존 데이터가 일요일 시작으로 저장되어 있을 수 있으므로 범위로 매칭
      const weekStart = startOfWeek(parseISO(period), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(parseISO(period), { weekStartsOn: 1 })
      return get().goals
        .filter(g => {
          if (g.type !== type) return false
          const goalDate = parseISO(g.period)
          return isWithinInterval(goalDate, { start: weekStart, end: weekEnd })
        })
        .sort((a, b) => a.order - b.order)
    }
    return get().goals
      .filter(g => g.type === type && g.period === period)
      .sort((a, b) => a.order - b.order)
  },

  saveGoals: async () => {
    try {
      if (window.electronAPI?.storage?.setGoals) {
        await window.electronAPI.storage.setGoals(get().goals)
      } else {
        localStorage.setItem('goals', JSON.stringify(get().goals))
      }
    } catch (error) {
      console.error('Failed to save goals:', error)
    }
  },

  loadGoals: async () => {
    try {
      if (window.electronAPI?.storage?.getGoals) {
        const goals = await window.electronAPI.storage.getGoals()
        set({ goals })
      } else {
        const saved = localStorage.getItem('goals')
        if (saved) set({ goals: JSON.parse(saved) })
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    }
  },
}))

if (typeof window !== 'undefined') {
  useGoalStore.getState().loadGoals()
}
