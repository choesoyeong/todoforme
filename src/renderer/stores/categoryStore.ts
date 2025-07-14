import { create } from 'zustand'
import { Category } from '@shared/types'

interface CategoryStore {
  categories: Category[]
  addCategory: (categoryData: Omit<Category, 'id'>) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  saveCategories: () => void
  loadCategories: () => void
}

let nextId = 1

const generateId = () => `category_${Date.now()}_${nextId++}`

// 기본 카테고리들
const defaultCategories: Category[] = [
  { id: 'default_1', name: '업무', color: '#3B82F6' },
  { id: 'default_2', name: '개인', color: '#10B981' },
  { id: 'default_3', name: '공부', color: '#8B5CF6' },
  { id: 'default_4', name: '운동', color: '#F59E0B' },
  { id: 'default_5', name: '취미', color: '#EF4444' }
]

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: defaultCategories,

  addCategory: (categoryData) => {
    const newCategory: Category = {
      id: generateId(),
      name: categoryData.name,
      color: categoryData.color
    }

    set(state => ({
      categories: [...state.categories, newCategory]
    }))

    get().saveCategories()
  },

  updateCategory: (id, updates) => {
    set(state => ({
      categories: state.categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    }))
    get().saveCategories()
  },

  deleteCategory: (id) => {
    set(state => ({
      categories: state.categories.filter(category => category.id !== id)
    }))
    get().saveCategories()
  },

  saveCategories: async () => {
    try {
      if (window.electronAPI?.storage) {
        await window.electronAPI.storage.setCategories(get().categories)
      } else {
        // 브라우저 환경에서는 localStorage 사용
        localStorage.setItem('categories', JSON.stringify(get().categories))
      }
    } catch (error) {
      console.error('Failed to save categories:', error)
    }
  },

  loadCategories: async () => {
    try {
      if (window.electronAPI?.storage) {
        const categories = await window.electronAPI.storage.getCategories()
        if (categories && categories.length > 0) {
          set({ categories })
        }
      } else {
        // 브라우저 환경에서는 localStorage 사용
        const savedCategories = localStorage.getItem('categories')
        if (savedCategories) {
          const categories = JSON.parse(savedCategories)
          set({ categories })
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }
}))

// 앱 시작 시 데이터 로드
if (typeof window !== 'undefined') {
  useCategoryStore.getState().loadCategories()
}