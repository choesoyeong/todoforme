import { create } from 'zustand'
import { Todo, TodoStatus, SortOption } from '@shared/types'

interface TodoStore {
  todos: Todo[]
  addTodo: (todoData: Partial<Todo>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  toggleTodoStatus: (id: string) => void
  deleteTodo: (id: string) => void
  addChildTodo: (parentId: string, dateCreated: string) => void
  getTodosByDate: (date: string) => Todo[]
  getSortedTodos: (date: string, sortOption: SortOption) => Todo[]
  reorderTodos: (date: string, reorderedIds: string[]) => void
  saveTodos: () => void
  loadTodos: () => void
  copyIncompleteTodosFromRecent: () => void
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

  toggleTodoStatus: (id) => {
    set(state => {
      const todoIndex = state.todos.findIndex(t => t.id === id)
      if (todoIndex === -1) return state

      const todo = state.todos[todoIndex]
      const newStatus: TodoStatus = todo.status === 'completed' ? 'waiting' : 'completed'

      const updatedTodos = [...state.todos]
      updatedTodos[todoIndex] = { ...todo, status: newStatus }

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
        // 미완료 -> 완료 순으로 정렬
        const statusOrder = { 'waiting': 0, 'completed': 1 }
        return todos.sort((a, b) => {
          const statusDiff = statusOrder[a.status] - statusOrder[b.status]
          if (statusDiff !== 0) return statusDiff
          return a.order - b.order
        })

      case 'category':
        return todos.sort((a, b) => {
          const categoryA = a.category || 'Z_미분류'
          const categoryB = b.category || 'Z_미분류'
          const categoryDiff = categoryA.localeCompare(categoryB)
          if (categoryDiff !== 0) return categoryDiff
          return a.order - b.order
        })

      default:
        return todos.sort((a, b) => a.order - b.order)
    }
  },

  reorderTodos: (date, reorderedIds) => {
    set(state => {
      const updatedTodos = state.todos.map(todo => {
        if (todo.dateCreated !== date || todo.parentId) return todo
        const newOrder = reorderedIds.indexOf(todo.id)
        if (newOrder === -1) return todo
        return { ...todo, order: newOrder }
      })
      return { todos: updatedTodos }
    })
    get().saveTodos()
  },

  saveTodos: async () => {
    try {
      if (window.electronAPI?.storage) {
        await window.electronAPI.storage.setTodos(get().todos)
      } else {
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

  copyIncompleteTodosFromRecent: () => {
    const now = new Date()
    const today = new Date(now.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0]

    // 이전 10일 중 미완료 업무가 있는 가장 최근 날짜를 찾기
    let sourceDate: string | null = null
    for (let i = 1; i <= 10; i++) {
      const checkDate = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      const hasIncomplete = get().todos.some(todo =>
        todo.dateCreated === checkDate &&
        todo.status === 'waiting' &&
        !todo.parentId
      )
      if (hasIncomplete) {
        sourceDate = checkDate
        break
      }
    }

    if (!sourceDate) {
      alert('최근 10일 내 미완료 업무가 없습니다.')
      return
    }

    const incompleteTodos = get().todos.filter(todo =>
      todo.dateCreated === sourceDate &&
      todo.status === 'waiting' &&
      !todo.parentId
    )

    const todayTodos = get().todos.filter(todo => todo.dateCreated === today)
    const minOrder = todayTodos.length > 0 ? Math.min(...todayTodos.map(t => t.order)) : 1

    const newTodos = incompleteTodos.map((todo, index) => ({
      id: generateId(),
      title: todo.title,
      emoji: todo.emoji,
      description: todo.description,
      status: 'waiting' as TodoStatus,
      dateCreated: today,
      children: [],
      category: todo.category,
      order: minOrder - incompleteTodos.length + index
    }))

    set(state => ({
      todos: [...state.todos, ...newTodos]
    }))

    alert(`${newTodos.length}개의 이전 미완료 업무를 복사했습니다.`)
    get().saveTodos()
  }
}))

// 앱 시작 시 데이터 로드
if (typeof window !== 'undefined') {
  useTodoStore.getState().loadTodos()
}
