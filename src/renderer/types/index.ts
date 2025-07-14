export * from '@shared/types'

declare global {
  interface Window {
    electronAPI: {
      platform: string
      storage: {
        getTodos: () => Promise<any[]>
        setTodos: (todos: any[]) => Promise<void>
        getSettings: () => Promise<any>
        setSetting: (key: string, value: any) => Promise<void>
        exportData: () => Promise<any>
        importData: (data: any) => Promise<void>
        clearAll: () => Promise<void>
        getStorePath: () => Promise<string>
      }
    }
  }
}