import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  storage: {
    getTodos: () => ipcRenderer.invoke('storage:getTodos'),
    setTodos: (todos: any) => ipcRenderer.invoke('storage:setTodos', todos),
    getCategories: () => ipcRenderer.invoke('storage:getCategories'),
    setCategories: (categories: any) => ipcRenderer.invoke('storage:setCategories', categories),
    getSettings: () => ipcRenderer.invoke('storage:getSettings'),
    setSetting: (key: string, value: any) => ipcRenderer.invoke('storage:setSetting', key, value),
    exportData: () => ipcRenderer.invoke('storage:exportData'),
    importData: (data: any) => ipcRenderer.invoke('storage:importData', data),
    clearAll: () => ipcRenderer.invoke('storage:clearAll'),
    getStorePath: () => ipcRenderer.invoke('storage:getStorePath')
  }
})