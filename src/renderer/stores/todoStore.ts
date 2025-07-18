import { create } from 'zustand'
import { Todo, TodoStatus, SortOption } from '@shared/types'

interface TodoStore {
  todos: Todo[]
  addTodo: (todoData: Partial<Todo>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  updateTodoStatus: (id: string, status: TodoStatus) => void
  deleteTodo: (id: string) => void
  addChildTodo: (parentId: string, dateCreated: string) => void
  getTodosByDate: (date: string) => Todo[]
  getSortedTodos: (date: string, sortOption: SortOption) => Todo[]
  getTodayWorkTime: (date?: string) => number
  saveTodos: () => void
  loadTodos: () => void
  copyIncompleteTodosFromYesterday: () => void
}

let nextId = 1

const generateId = () => `todo_${Date.now()}_${nextId++}`

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],

  addTodo: (todoData) => {
    const newTodo: Todo = {
      id: generateId(),
      title: todoData.title || '',
      emoji: todoData.emoji,
      description: todoData.description,
      status: 'waiting',
      dateCreated: todoData.dateCreated || new Date().toISOString().split('T')[0],
      totalTime: 0,
      parentId: todoData.parentId,
      children: [],
      category: todoData.category,
      order: todoData.order || 0,
      ...todoData
    }

    set(state => {
      const updatedTodos = [...state.todos, newTodo]
      
      // 부모가 있는 경우 부모의 children 배열에 추가
      if (newTodo.parentId) {
        const parentIndex = updatedTodos.findIndex(t => t.id === newTodo.parentId)
        if (parentIndex !== -1) {
          updatedTodos[parentIndex] = {
            ...updatedTodos[parentIndex],
            children: [...updatedTodos[parentIndex].children, newTodo.id]
          }
        }
      }

      return { todos: updatedTodos }
    })

    get().saveTodos()
  },

  updateTodo: (id, updates) => {
    set(state => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    }))
    get().saveTodos()
  },

  updateTodoStatus: (id, status) => {
    set(state => {
      const todoIndex = state.todos.findIndex(t => t.id === id)
      if (todoIndex === -1) return state

      const todo = state.todos[todoIndex]
      const updatedTodo = { ...todo, status }

      // 상태 변경에 따른 시간 계산
      if (status === 'completed' && todo.status === 'in_progress') {
        updatedTodo.endTime = Date.now()
        if (todo.startTime) {
          const additionalTime = Math.floor((Date.now() - todo.startTime) / 60000)
          updatedTodo.totalTime = todo.totalTime + additionalTime
        }
      } else if (status === 'in_progress') {
        updatedTodo.startTime = Date.now()
      } else if (status === 'paused' && todo.status === 'in_progress') {
        if (todo.startTime) {
          const additionalTime = Math.floor((Date.now() - todo.startTime) / 60000)
          updatedTodo.totalTime = todo.totalTime + additionalTime
        }
        updatedTodo.startTime = undefined
      }

      const updatedTodos = [...state.todos]
      updatedTodos[todoIndex] = updatedTodo

      return { todos: updatedTodos }
    })
    get().saveTodos()
  },

  deleteTodo: (id) => {
    set(state => {
      const todoToDelete = state.todos.find(t => t.id === id)
      if (!todoToDelete) return state

      let updatedTodos = state.todos.filter(t => t.id !== id)

      // 하위 할 일들도 삭제
      const deleteChildren = (parentId: string) => {
        const children = updatedTodos.filter(t => t.parentId === parentId)
        children.forEach(child => {
          updatedTodos = updatedTodos.filter(t => t.id !== child.id)
          deleteChildren(child.id)
        })
      }
      deleteChildren(id)

      // 부모의 children 배열에서 제거
      if (todoToDelete.parentId) {
        const parentIndex = updatedTodos.findIndex(t => t.id === todoToDelete.parentId)
        if (parentIndex !== -1) {
          updatedTodos[parentIndex] = {
            ...updatedTodos[parentIndex],
            children: updatedTodos[parentIndex].children.filter(childId => childId !== id)
          }
        }
      }

      return { todos: updatedTodos }
    })
    get().saveTodos()
  },

  addChildTodo: (parentId, dateCreated) => {
    const parentTodo = get().todos.find(t => t.id === parentId)
    if (!parentTodo) return

    get().addTodo({
      title: '새 하위 할 일',
      parentId,
      dateCreated
    })
  },

  getTodosByDate: (date) => {
    return get().todos.filter(todo => todo.dateCreated === date)
  },

  getSortedTodos: (date, sortOption) => {
    const todos = get().todos.filter(todo => todo.dateCreated === date)
    
    switch (sortOption) {
      case 'created':
        return todos.sort((a, b) => a.order - b.order)
      
      case 'recommended':
        // 일시정지 -> 미진행 -> 완료 순으로 정렬
        const statusOrder = { 'paused': 0, 'waiting': 1, 'in_progress': 2, 'completed': 3 }
        return todos.sort((a, b) => {
          const statusDiff = statusOrder[a.status] - statusOrder[b.status]
          if (statusDiff !== 0) return statusDiff
          return a.order - b.order // 같은 상태면 등록순
        })
      
      case 'category':
        return todos.sort((a, b) => {
          const categoryA = a.category || 'Z_미분류'
          const categoryB = b.category || 'Z_미분류'
          const categoryDiff = categoryA.localeCompare(categoryB)
          if (categoryDiff !== 0) return categoryDiff
          return a.order - b.order // 같은 카테고리면 등록순
        })
      
      case 'workTime':
        return todos.sort((a, b) => {
          const timeDiff = (b.totalTime || 0) - (a.totalTime || 0)
          if (timeDiff !== 0) return timeDiff
          return a.order - b.order // 같은 업무시간이면 등록순
        })
      
      default:
        return todos.sort((a, b) => a.order - b.order)
    }
  },

  getTodayWorkTime: (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const dateTodos = get().todos.filter(todo => todo.dateCreated === targetDate)
    return dateTodos.reduce((total, todo) => total + (todo.totalTime || 0), 0)
  },

  saveTodos: async () => {
    try {
      if (window.electronAPI?.storage) {
        await window.electronAPI.storage.setTodos(get().todos)
      } else {
        // 브라우저 환경에서는 localStorage 사용
        localStorage.setItem('todos', JSON.stringify(get().todos))
      }
    } catch (error) {
      console.error('Failed to save todos:', error)
    }
  },

  loadTodos: async () => {
    try {
      if (window.electronAPI?.storage) {
        const todos = await window.electronAPI.storage.getTodos()
        set({ todos })
      } else {
        // 브라우저 환경에서는 localStorage 사용
        const savedTodos = localStorage.getItem('todos')
        if (savedTodos) {
          const todos = JSON.parse(savedTodos)
          set({ todos })
        }
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  },

  copyIncompleteTodosFromYesterday: () => {
    // 한국 시간대로 날짜 계산
    const now = new Date()
    const today = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0] // UTC+9
    const yesterday = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    
    console.log('Debug - Today:', today)
    console.log('Debug - Yesterday:', yesterday)
    console.log('Debug - All todos:', get().todos.map(t => ({ id: t.id, title: t.title, dateCreated: t.dateCreated, status: t.status })))
    
    // 먼저 어제 날짜의 모든 할 일을 확인
    const allYesterdayTodos = get().todos.filter(todo => todo.dateCreated === yesterday)
    console.log('Debug - All yesterday todos:', allYesterdayTodos)
    
    // 어제의 미완료 할 일 (대기 또는 일시정지 상태)
    const yesterdayIncompleteTodos = get().todos.filter(todo => 
      todo.dateCreated === yesterday && 
      (todo.status === 'waiting' || todo.status === 'paused')
    )
    console.log('Debug - Yesterday incomplete todos (all):', yesterdayIncompleteTodos)
    
    // 상위 할 일만 (parentId가 없는 것들)
    const yesterdayTodos = yesterdayIncompleteTodos.filter(todo => !todo.parentId)
    console.log('Debug - Yesterday incomplete parent todos only:', yesterdayTodos)
    
    
    if (yesterdayTodos.length === 0) {
      alert('복사할 어제 미완료 업무가 없습니다.')
      return
    }
    
    const todayTodos = get().todos.filter(todo => todo.dateCreated === today)
    const minOrder = todayTodos.length > 0 ? Math.min(...todayTodos.map(t => t.order)) : 1
    
    const newTodos = yesterdayTodos.map((todo, index) => ({
      id: generateId(),
      title: todo.title,
      emoji: todo.emoji,
      description: todo.description,
      status: 'waiting' as TodoStatus,
      dateCreated: today,
      totalTime: 0,
      children: [],
      category: todo.category,
      order: minOrder - yesterdayTodos.length + index
    }))
    
    console.log('Debug - New todos to add:', newTodos)
    
    set(state => ({ 
      todos: [...state.todos, ...newTodos] 
    }))
    
    alert(`${newTodos.length}개의 어제 미완료 업무를 복사했습니다.`)
    get().saveTodos()
  }
}))

// 앱 시작 시 데이터 로드
if (typeof window !== 'undefined') {
  useTodoStore.getState().loadTodos()
}