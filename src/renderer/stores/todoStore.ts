import { create } from 'zustand'
import { Todo, TodoStatus } from '@shared/types'

interface TodoStore {
  todos: Todo[]
  addTodo: (todoData: Partial<Todo>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  updateTodoStatus: (id: string, status: TodoStatus) => void
  deleteTodo: (id: string) => void
  addChildTodo: (parentId: string, dateCreated: string) => void
  getTodosByDate: (date: string) => Todo[]
  saveTodos: () => void
  loadTodos: () => void
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
  }
}))

// 앱 시작 시 데이터 로드
if (typeof window !== 'undefined') {
  useTodoStore.getState().loadTodos()
}