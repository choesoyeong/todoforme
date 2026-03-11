import { create } from 'zustand'
import { Goal } from '@shared/types'

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
