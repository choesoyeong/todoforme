import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openMain: () => ipcRenderer.invoke('tray:openMain'),
  addTodo: (title: string) => ipcRenderer.invoke('tray:addTodo', title),
  toggleTodo: (id: string) => ipcRenderer.invoke('tray:toggleTodo', id),
})
