import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  storage: {
    getTodos: () => ipcRenderer.invoke('storage:getTodos'),
    setTodos: (todos: any) => ipcRenderer.invoke('storage:setTodos', todos),
    getGoals: () => ipcRenderer.invoke('storage:getGoals'),
    setGoals: (goals: any) => ipcRenderer.invoke('storage:setGoals', goals),
    getCategories: () => ipcRenderer.invoke('storage:getCategories'),
    setCategories: (categories: any) => ipcRenderer.invoke('storage:setCategories', categories),
    getCategoryKeywords: () => ipcRenderer.invoke('storage:getCategoryKeywords'),
    setCategoryKeywords: (keywords: any) => ipcRenderer.invoke('storage:setCategoryKeywords', keywords),
    getSettings: () => ipcRenderer.invoke('storage:getSettings'),
    setSetting: (key: string, value: any) => ipcRenderer.invoke('storage:setSetting', key, value),
    exportData: () => ipcRenderer.invoke('storage:exportData'),
    importData: (data: any) => ipcRenderer.invoke('storage:importData', data),
    clearAll: () => ipcRenderer.invoke('storage:clearAll'),
    getStorePath: () => ipcRenderer.invoke('storage:getStorePath')
  },
  tray: {
    setEnabled: (enabled: boolean) => ipcRenderer.invoke('settings:setTrayEnabled', enabled),
    getEnabled: () => ipcRenderer.invoke('settings:getTrayEnabled'),
  },
  onTodosUpdated: (callback: () => void) => {
    ipcRenderer.on('todos:updated', callback)
    return () => ipcRenderer.removeListener('todos:updated', callback)
  },
})
