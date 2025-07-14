import React, { useState } from 'react'
import { Calendar, BarChart3, Settings, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import TodoView from './pages/TodoView'
import StatsView from './pages/StatsView'
import SettingsView from './pages/SettingsView'
import CategoryView from './pages/CategoryView'

type ViewType = 'todos' | 'stats' | 'categories' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('todos')

  const navigationItems = [
    { id: 'todos' as ViewType, icon: Calendar, label: '할 일', emoji: '📅' },
    { id: 'stats' as ViewType, icon: BarChart3, label: '통계', emoji: '📊' },
    { id: 'categories' as ViewType, icon: Tag, label: '카테고리', emoji: '🏷️' },
    { id: 'settings' as ViewType, icon: Settings, label: '설정', emoji: '⚙️' },
  ]

  const renderView = () => {
    switch (currentView) {
      case 'todos':
        return <TodoView />
      case 'stats':
        return <StatsView />
      case 'categories':
        return <CategoryView />
      case 'settings':
        return <SettingsView />
      default:
        return <TodoView />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-peach via-cream to-sky">
      {/* 사이드바 */}
      <div className="w-64 bg-white/40 backdrop-blur-lg border-r border-white/20 p-4 pt-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🍎 <span>TodoForMe</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">귀여운 투두 관리</p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'bg-white/60 text-gray-800 shadow-lg' 
                    : 'text-gray-600 hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{item.emoji}</span>
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/30 rounded-2xl p-4">
            <p className="text-sm text-gray-600 text-center">
              오늘도 화이팅! 💪
            </p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden pt-8">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </div>
    </div>
  )
}

export default App