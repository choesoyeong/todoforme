import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import * as path from 'path'

const Store = require('electron-store')

// 간단한 storage 설정
const store = new Store({
  defaults: {
    todos: [],
    categories: [],
    settings: {
      theme: 'pink',
      notifications: true,
      autoSave: true
    }
  },
  name: 'todoforme-data',
  clearInvalidConfig: true
})

const storageAPI = {
  getTodos: () => store.get('todos', []),
  setTodos: (todos: any[]) => store.set('todos', todos),
  getCategories: () => store.get('categories', []),
  setCategories: (categories: any[]) => store.set('categories', categories),
  getSettings: () => store.get('settings'),
  setSetting: (key: string, value: any) => {
    const settings = store.get('settings')
    store.set('settings', { ...settings, [key]: value })
  },
  exportData: () => ({
    todos: store.get('todos'),
    categories: store.get('categories'),
    settings: store.get('settings'),
    exportDate: new Date().toISOString()
  }),
  importData: (data: { todos: any[], categories?: any[], settings?: any }) => {
    if (data.todos) store.set('todos', data.todos)
    if (data.categories) store.set('categories', data.categories)
    if (data.settings) store.set('settings', data.settings)
  },
  clearAll: () => store.clear(),
  getStorePath: () => store.path
}

const isDev = process.env.NODE_ENV === 'development'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    minHeight: 600,
    minWidth: 800,
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    backgroundColor: '#FCEFEF',
    show: false,
    frame: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      }
    ]))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC 핸들러 등록
ipcMain.handle('storage:getTodos', () => storageAPI.getTodos())
ipcMain.handle('storage:setTodos', (_, todos) => storageAPI.setTodos(todos))
ipcMain.handle('storage:getCategories', () => storageAPI.getCategories())
ipcMain.handle('storage:setCategories', (_, categories) => storageAPI.setCategories(categories))
ipcMain.handle('storage:getSettings', () => storageAPI.getSettings())
ipcMain.handle('storage:setSetting', (_, key, value) => storageAPI.setSetting(key, value))
ipcMain.handle('storage:exportData', () => storageAPI.exportData())
ipcMain.handle('storage:importData', (_, data) => storageAPI.importData(data))
ipcMain.handle('storage:clearAll', () => storageAPI.clearAll())
ipcMain.handle('storage:getStorePath', () => storageAPI.getStorePath())