const Store = require('electron-store')
import { Todo } from '../shared/types'

interface StoreSchema {
  todos: Todo[]
  settings: {
    theme: string
    notifications: boolean
    autoSave: boolean
  }
}

export const store = new Store({
  defaults: {
    todos: [],
    settings: {
      theme: 'pink',
      notifications: true,
      autoSave: true
    }
  },
  // 데이터 파일이 저장될 위치 설정
  name: 'todoforme-data',
  // 백업 파일 생성
  clearInvalidConfig: true
})

export const storageAPI = {
  // 할 일 데이터
  getTodos: () => store.get('todos', []),
  setTodos: (todos: Todo[]) => store.set('todos', todos),
  
  // 설정 데이터
  getSettings: () => store.get('settings'),
  setSetting: (key: string, value: any) => {
    const settings = store.get('settings')
    store.set('settings', { ...settings, [key]: value })
  },
  
  // 백업 및 복원
  exportData: () => ({
    todos: store.get('todos'),
    settings: store.get('settings'),
    exportDate: new Date().toISOString()
  }),
  
  importData: (data: { todos: Todo[], settings?: any }) => {
    if (data.todos) store.set('todos', data.todos)
    if (data.settings) store.set('settings', data.settings)
  },
  
  // 데이터 초기화
  clearAll: () => store.clear(),
  
  // 파일 경로 조회
  getStorePath: () => store.path
}