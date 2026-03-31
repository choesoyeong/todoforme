import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ChartNoAxesColumn, Tags, Settings } from 'lucide-react'
import TodoView from './pages/TodoView'
import StatsView from './pages/StatsView'
import SettingsView from './pages/SettingsView'
import CategoryView from './pages/CategoryView'
import { useThemeStore } from './stores/themeStore'

type ViewType = 'todos' | 'stats' | 'categories' | 'settings'

const navIcons = {
  todos: CalendarDays,
  stats: ChartNoAxesColumn,
  categories: Tags,
  settings: Settings,
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('todos')
  const [sidebarHover, setSidebarHover] = useState(false)
  const { theme } = useThemeStore()
  const c = theme.colors

  const navigationItems = [
    { id: 'todos' as ViewType, label: '할 일' },
    { id: 'stats' as ViewType, label: '통계' },
    { id: 'categories' as ViewType, label: '카테고리' },
    { id: 'settings' as ViewType, label: '설정' },
  ]

  const renderView = () => {
    switch (currentView) {
      case 'todos': return <TodoView />
      case 'stats': return <StatsView />
      case 'categories': return <CategoryView />
      case 'settings': return <SettingsView />
      default: return <TodoView />
    }
  }

  return (
    <div className="flex h-screen" style={{ background: c.bg }}>
      {/* 아이콘 사이드바 */}
      <nav
        className="flex flex-col items-center pt-12 pb-4 drag-region transition-all duration-200 ease-out flex-shrink-0 overflow-hidden"
        style={{
          width: sidebarHover ? 180 : 52,
          background: c.sidebarBg,
          borderRight: `1px solid ${c.sidebarBorder}`,
        }}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <div className="flex flex-col gap-1 w-full px-2 no-drag">
          {navigationItems.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="flex items-center gap-3 rounded-lg transition-all duration-150 whitespace-nowrap"
                style={{
                  padding: '8px 12px',
                  background: isActive ? c.sidebarActiveBg : 'transparent',
                  color: isActive ? c.sidebarActiveText : c.textSecondary,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {React.createElement(navIcons[item.id], {
                  size: 16,
                  strokeWidth: isActive ? 2.2 : 1.8,
                  style: { flexShrink: 0, width: 20 },
                })}
                <span
                  className="transition-all duration-200"
                  style={{
                    opacity: sidebarHover ? 1 : 0,
                    transform: sidebarHover ? 'translateX(0)' : 'translateX(-8px)',
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </div>
    </div>
  )
}

export default App
