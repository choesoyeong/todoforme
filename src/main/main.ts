import { app, BrowserWindow, Menu, ipcMain, Tray, nativeImage } from 'electron'
import * as path from 'path'

const Store = require('electron-store')

// 간단한 storage 설정
const store = new Store({
  defaults: {
    todos: [],
    goals: [],
    categories: [],
    categoryKeywords: {},
    settings: {
      theme: 'light',
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
  getGoals: () => store.get('goals', []),
  setGoals: (goals: any[]) => store.set('goals', goals),
  getCategories: () => store.get('categories', []),
  setCategories: (categories: any[]) => store.set('categories', categories),
  getCategoryKeywords: () => store.get('categoryKeywords', {}),
  setCategoryKeywords: (keywords: Record<string, string[]>) => store.set('categoryKeywords', keywords),
  getSettings: () => store.get('settings'),
  setSetting: (key: string, value: any) => {
    const settings = store.get('settings')
    store.set('settings', { ...settings, [key]: value })
  },
  exportData: () => ({
    todos: store.get('todos'),
    goals: store.get('goals'),
    categories: store.get('categories'),
    settings: store.get('settings'),
    exportDate: new Date().toISOString()
  }),
  importData: (data: { todos: any[], goals?: any[], categories?: any[], settings?: any }) => {
    if (data.todos) store.set('todos', data.todos)
    if (data.goals) store.set('goals', data.goals)
    if (data.categories) store.set('categories', data.categories)
    if (data.settings) store.set('settings', data.settings)
  },
  clearAll: () => store.clear(),
  getStorePath: () => store.path
}

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let trayWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
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
    backgroundColor: '#fafafa',
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
    mainWindow!.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
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

// 트레이 미니 팝업용 HTML 생성
function getTrayHTML(): string {
  const todos = storageAPI.getTodos() as any[]
  const categories = storageAPI.getCategories() as any[]
  const settings = storageAPI.getSettings() as any
  const isDark = settings?.theme === 'dark'

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}요일`

  const todayTodos = todos.filter((t: any) => t.dateCreated === todayStr && !t.parentId).sort((a: any, b: any) => a.order - b.order)
  const pending = todayTodos.filter((t: any) => t.status === 'waiting')
  const completed = todayTodos.filter((t: any) => t.status === 'completed')
  const total = todayTodos.length
  const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0

  // 스트릭
  let streak = 0
  const d = new Date(todayStr + 'T00:00:00')
  for (let i = 0; i < 365; i++) {
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dayTodos = todos.filter((t: any) => t.dateCreated === ds && !t.parentId)
    if (dayTodos.length === 0) { d.setDate(d.getDate() - 1); continue }
    if (dayTodos.some((t: any) => t.status === 'completed')) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }

  const getCatColor = (catId: string) => {
    const cat = categories.find((c: any) => c.id === catId)
    return cat?.color || ''
  }

  // 색상
  const c = isDark ? {
    bg: '#1c1c1f', text: '#e4e4e7', text2: '#a1a1aa', text3: '#52525b',
    accent: '#818cf8', green: '#22c55e', cardBg: 'rgba(255,255,255,0.04)',
    border: '#2a2a2d', done: '#52525b', doneLine: '#3f3f46',
  } : {
    bg: '#ffffff', text: '#111827', text2: '#6b7280', text3: '#9ca3af',
    accent: '#6366f1', green: '#22c55e', cardBg: 'rgba(0,0,0,0.025)',
    border: '#f3f4f6', done: '#9ca3af', doneLine: '#d1d5db',
  }

  const todoItems = pending.map((t: any) => {
    const catColor = getCatColor(t.category)
    const dot = catColor ? `<div style="width:6px;height:6px;border-radius:50%;background:${catColor};flex-shrink:0"></div>` : ''
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
      <div onclick="window.electronAPI.toggleTodo('${t.id}')" style="width:13px;height:13px;border-radius:3px;border:1.5px solid ${c.text3};flex-shrink:0;cursor:pointer"></div>
      <span style="font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.title}</span>
      ${dot}
    </div>`
  }).join('')

  const doneItems = completed.map((t: any) => {
    return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0">
      <div onclick="window.electronAPI.toggleTodo('${t.id}')" style="width:13px;height:13px;border-radius:3px;background:${c.green};flex-shrink:0;display:flex;align-items:center;justify-content:center;color:${isDark ? '#0a0a0b' : '#fff'};font-size:8px;font-weight:700;cursor:pointer">✓</div>
      <span style="font-size:12px;color:${c.done};text-decoration:line-through;text-decoration-color:${c.doneLine};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.title}</span>
    </div>`
  }).join('')

  const divider = pending.length > 0 && completed.length > 0 ? `<div style="height:1px;background:${c.border};margin:6px 0"></div>` : ''

  const empty = total === 0 ? `<div style="text-align:center;padding:12px 0;font-size:12px;color:${c.text3}"><div style="font-size:18px;margin-bottom:4px">📝</div>오늘 할 일이 없어요</div>` : ''

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif; background:${c.bg}; color:${c.text}; padding:14px; -webkit-font-smoothing:antialiased; overflow:hidden; cursor:default; user-select:none; }
    .stat-box { flex:1; padding:6px 8px; border-radius:6px; background:${c.cardBg}; }
    .stat-num { font-size:15px; font-weight:800; font-family:'SF Mono',Menlo,monospace; }
    .stat-label { font-size:9px; color:${c.text3}; margin-top:1px; }
    .open-btn { display:block; width:100%; margin-top:8px; padding:6px; border:none; border-radius:6px; background:${c.cardBg}; color:${c.text2}; font-size:11px; font-family:inherit; cursor:pointer; }
    .open-btn:hover { background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}; }
    .add-form { display:flex; gap:6px; margin-bottom:10px; }
    .add-input { flex:1; padding:6px 10px; border:1px solid ${c.border}; border-radius:6px; background:${isDark ? 'rgba(255,255,255,0.04)' : '#fff'}; color:${c.text}; font-size:12px; font-family:inherit; outline:none; }
    .add-input:focus { border-color:${c.accent}; }
    .add-input::placeholder { color:${c.text3}; }
    .add-btn { padding:6px 10px; border:none; border-radius:6px; background:${c.accent}; color:#fff; font-size:11px; font-weight:600; font-family:inherit; cursor:pointer; white-space:nowrap; }
    .add-btn:hover { opacity:0.9; }
    .todo-scroll { max-height:200px; overflow-y:auto; }
    .todo-scroll::-webkit-scrollbar { width:3px; }
    .todo-scroll::-webkit-scrollbar-thumb { background:${c.border}; border-radius:3px; }
  </style></head><body>
    <div style="font-size:12px;font-weight:700;margin-bottom:10px;letter-spacing:-0.02em">📅 ${dateLabel}</div>
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <div class="stat-box"><div class="stat-num" style="color:${c.green}">${rate}%</div><div class="stat-label">완수율</div></div>
      <div class="stat-box"><div class="stat-num" style="color:${c.accent}">${streak}일</div><div class="stat-label">연속</div></div>
      <div class="stat-box"><div class="stat-num" style="color:${c.text}">${pending.length}</div><div class="stat-label">남은 할 일</div></div>
    </div>
    <form class="add-form" onsubmit="event.preventDefault(); const input=document.getElementById('tray-input'); if(input.value.trim()){ window.electronAPI.addTodo(input.value.trim()); input.value=''; }">
      <input id="tray-input" class="add-input" placeholder="할 일 추가..." autocomplete="off" />
      <button type="submit" class="add-btn">추가</button>
    </form>
    <div style="height:1px;background:${c.border};margin-bottom:8px"></div>
    <div class="todo-scroll">${todoItems}${divider}${doneItems}${empty}</div>
    <button class="open-btn" onclick="window.electronAPI.openMain()">앱 열기</button>
  </body></html>`
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icons/tray.png'))
  trayIcon.setTemplateImage(false)
  tray = new Tray(trayIcon.resize({ width: 20, height: 20 }))
  tray.setToolTip('TodoForMe')

  tray.on('click', (event, bounds) => {
    if (trayWindow && trayWindow.isVisible()) {
      trayWindow.hide()
      return
    }

    if (!trayWindow) {
      trayWindow = new BrowserWindow({
        width: 280,
        height: 400,
        show: false,
        frame: false,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        transparent: false,
        vibrancy: 'popover',
        backgroundColor: '#00000000',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'tray-preload.js'),
        },
      })

      trayWindow.on('blur', () => {
        trayWindow?.hide()
      })

      trayWindow.on('closed', () => {
        trayWindow = null
      })
    }

    // 위치: 트레이 아이콘 아래
    const x = Math.round(bounds.x - 140 + bounds.width / 2)
    const y = Math.round(bounds.y + bounds.height)
    trayWindow.setPosition(x, y)

    // HTML 갱신
    trayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getTrayHTML())}`)
    trayWindow.show()
  })
}

app.whenReady().then(() => {
  createWindow()
  const settings = storageAPI.getSettings() as any
  if (settings?.trayEnabled !== false) {
    createTray()
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: 트레이에서 메인 앱 열기
ipcMain.handle('tray:openMain', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  } else {
    createWindow()
  }
})

// IPC: 트레이에서 할일 추가
ipcMain.handle('tray:addTodo', (_, title: string) => {
  const todos = storageAPI.getTodos() as any[]
  const today = new Date()
  const dateCreated = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const newTodo = {
    id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    status: 'waiting',
    dateCreated,
    children: [],
    order: todos.filter((t: any) => t.dateCreated === dateCreated && !t.parentId).length,
  }
  storageAPI.setTodos([...todos, newTodo])

  // 메인 윈도우에 알림 (실시간 반영)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('todos:updated')
  }

  // 트레이 팝업 새로고침
  if (trayWindow && !trayWindow.isDestroyed()) {
    trayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getTrayHTML())}`)
  }
})

// IPC: 트레이에서 할일 완료/미완료 토글
ipcMain.handle('tray:toggleTodo', (_, id: string) => {
  const todos = storageAPI.getTodos() as any[]
  const idx = todos.findIndex((t: any) => t.id === id)
  if (idx === -1) return
  todos[idx].status = todos[idx].status === 'completed' ? 'waiting' : 'completed'
  storageAPI.setTodos(todos)

  // 메인 윈도우에 알림 (실시간 반영)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('todos:updated')
  }

  // 트레이 팝업 새로고침
  if (trayWindow && !trayWindow.isDestroyed()) {
    trayWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getTrayHTML())}`)
  }
})

// IPC: 트레이 활성화/비활성화
ipcMain.handle('settings:setTrayEnabled', (_, enabled: boolean) => {
  storageAPI.setSetting('trayEnabled', enabled)
  if (enabled && !tray) {
    createTray()
  } else if (!enabled && tray) {
    tray.destroy()
    tray = null
    if (trayWindow) {
      trayWindow.destroy()
      trayWindow = null
    }
  }
})

ipcMain.handle('settings:getTrayEnabled', () => {
  const settings = storageAPI.getSettings() as any
  return settings?.trayEnabled !== false // 기본값 true
})

// IPC 핸들러 등록
ipcMain.handle('storage:getTodos', () => storageAPI.getTodos())
ipcMain.handle('storage:setTodos', (_, todos) => storageAPI.setTodos(todos))
ipcMain.handle('storage:getGoals', () => storageAPI.getGoals())
ipcMain.handle('storage:setGoals', (_, goals) => storageAPI.setGoals(goals))
ipcMain.handle('storage:getCategories', () => storageAPI.getCategories())
ipcMain.handle('storage:setCategories', (_, categories) => storageAPI.setCategories(categories))
ipcMain.handle('storage:getCategoryKeywords', () => storageAPI.getCategoryKeywords())
ipcMain.handle('storage:setCategoryKeywords', (_, keywords) => storageAPI.setCategoryKeywords(keywords))
ipcMain.handle('storage:getSettings', () => storageAPI.getSettings())
ipcMain.handle('storage:setSetting', (_, key, value) => storageAPI.setSetting(key, value))
ipcMain.handle('storage:exportData', () => storageAPI.exportData())
ipcMain.handle('storage:importData', (_, data) => storageAPI.importData(data))
ipcMain.handle('storage:clearAll', () => storageAPI.clearAll())
ipcMain.handle('storage:getStorePath', () => storageAPI.getStorePath())
