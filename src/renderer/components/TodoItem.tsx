import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Play, Pause, Check, MoreHorizontal, ChevronRight, ChevronDown, Plus, Tag } from 'lucide-react'
import { Todo } from '@shared/types'
import { useTodoStore } from '../stores/todoStore'
import { useCategoryStore } from '../stores/categoryStore'
import QuickAddTodo from './QuickAddTodo'

interface TodoItemProps {
  todo: Todo
  level: number
}

const statusEmojis = {
  waiting: '🕒', 
  in_progress: '🔥',
  paused: '⏸',
  completed: '✅'
}

const statusColors = {
  waiting: 'bg-coral-50/60 backdrop-blur-sm shadow-md hover:shadow-lg',
  in_progress: 'bg-coral-100/80 backdrop-blur-sm shadow-xl hover:shadow-2xl',
  paused: 'bg-amber-50/60 backdrop-blur-sm shadow-md hover:shadow-lg',
  completed: 'bg-green-50/60 backdrop-blur-sm shadow-sm opacity-75 hover:opacity-90'
}

function TodoItem({ todo, level }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editTimeValue, setEditTimeValue] = useState('')
  const [menuButtonRect, setMenuButtonRect] = useState<DOMRect | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  
  const { updateTodoStatus, deleteTodo, addChildTodo, todos, updateTodo } = useTodoStore()
  const { categories } = useCategoryStore()
  
  const childTodos = todos.filter(t => t.parentId === todo.id)
  const hasChildren = childTodos.length > 0
  const isActive = todo.status === 'in_progress'

  // 진행 중인 투두의 시간을 1초마다 업데이트
  useEffect(() => {
    if (todo.status === 'in_progress') {
      const interval = setInterval(() => {
        setCurrentTime(Date.now())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [todo.status])

  const handleStatusChange = (newStatus: Todo['status']) => {
    updateTodoStatus(todo.id, newStatus)
  }

  const startEdit = () => {
    setEditValue(todo.title)
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (editValue.trim() && editValue.trim() !== todo.title) {
      updateTodo(todo.id, { title: editValue.trim() })
    }
    setIsEditing(false)
    setEditValue('')
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    updateTodo(todo.id, { category: categoryId || undefined })
    setIsEditingCategory(false)
  }

  const startTimeEdit = () => {
    setEditTimeValue(getCurrentTime().toString())
    setIsEditingTime(true)
  }

  const saveTimeEdit = () => {
    const newTime = parseInt(editTimeValue) || 0
    if (newTime >= 0 && newTime !== getCurrentTime()) {
      updateTodo(todo.id, { totalTime: newTime })
    }
    setIsEditingTime(false)
    setEditTimeValue('')
  }

  const cancelTimeEdit = () => {
    setIsEditingTime(false)
    setEditTimeValue('')
  }

  const handleTimeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTimeEdit()
    } else if (e.key === 'Escape') {
      cancelTimeEdit()
    }
  }

  const currentCategory = categories.find(cat => cat.id === todo.category)

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const getCurrentTime = () => {
    let totalMinutes = todo.totalTime
    
    // 현재 진행 중이면 시작 시간부터 지금까지의 시간 추가
    if (todo.status === 'in_progress' && todo.startTime) {
      const currentSessionMinutes = Math.floor((currentTime - todo.startTime) / 60000)
      totalMinutes += currentSessionMinutes
    }
    
    return totalMinutes
  }


  return (
    <>
    <div className={`rounded-2xl transition-all ${statusColors[todo.status]}`}>
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* 확장/축소 버튼 */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-xl hover:bg-white/60 transition-all"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          )}

          {/* 상태 이모지 */}
          <div className="text-lg">
            {statusEmojis[todo.status]}
          </div>

          {/* 할 일 제목 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {todo.emoji && <span className="text-base">{todo.emoji}</span>}
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none shadow-inner"
                  autoFocus
                  maxLength={100}
                />
              ) : (
                <span 
                  className={`text-sm font-medium cursor-pointer hover:bg-white/40 rounded-lg px-2 py-1 transition-all ${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}
                  onClick={startEdit}
                >
                  {todo.title}
                </span>
              )}
              
              {/* 카테고리를 제목 옆에 표시 */}
              {isEditingCategory ? (
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="px-2 py-0.5 text-xs bg-gray-200/70 backdrop-blur-sm text-gray-600 rounded-full hover:bg-gray-300/70 transition-all shadow-sm"
                  >
                    없음
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white/70 backdrop-blur-sm rounded-full hover:bg-white/90 transition-all shadow-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  {currentCategory ? (
                    <button
                      onClick={() => setIsEditingCategory(true)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white/70 backdrop-blur-sm rounded-full hover:bg-white/90 transition-all shadow-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentCategory.color }}
                      />
                      {currentCategory.name}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingCategory(true)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-200/70 backdrop-blur-sm text-gray-500 rounded-full hover:bg-gray-300/70 transition-all shadow-sm"
                    >
                      <Tag size={8} />
                      카테고리
                    </button>
                  )}
                </div>
              )}
            </div>
            {todo.description && (
              <p className="text-xs text-gray-600 mt-1">{todo.description}</p>
            )}
          </div>

          {/* 시간 표시 */}
          <div className="text-xs text-gray-600 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            {isEditingTime ? (
              <div className="flex items-center gap-1">
                <span>⏰</span>
                <input
                  type="number"
                  value={editTimeValue}
                  onChange={(e) => setEditTimeValue(e.target.value)}
                  onBlur={saveTimeEdit}
                  onKeyDown={handleTimeKeyPress}
                  className="w-12 bg-transparent text-center outline-none border-b border-coral-300"
                  min="0"
                  autoFocus
                />
                <span className="text-xs">분</span>
              </div>
            ) : (
              <span
                onClick={startTimeEdit}
                className="cursor-pointer hover:text-coral-600 transition-colors"
              >
                ⏰ {formatTime(getCurrentTime())}
              </span>
            )}
            {isActive && !isEditingTime && (
              <motion.span
                className="ml-1 text-orange-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                •
              </motion.span>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-1">
            {todo.status === 'waiting' && (
              <motion.button
                onClick={() => handleStatusChange('in_progress')}
                className="p-1.5 rounded-full bg-coral-200/80 text-coral-800 hover:bg-coral-300/80 transition-all shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={12} />
              </motion.button>
            )}

            {todo.status === 'in_progress' && (
              <>
                <motion.button
                  onClick={() => handleStatusChange('paused')}
                  className="p-1.5 rounded-full bg-amber-200/80 text-amber-800 hover:bg-amber-300/80 transition-all shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pause size={12} />
                </motion.button>
                <motion.button
                  onClick={() => handleStatusChange('completed')}
                  className="p-1.5 rounded-full bg-green-200/80 text-green-800 hover:bg-green-300/80 transition-all shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Check size={12} />
                </motion.button>
              </>
            )}

            {todo.status === 'paused' && (
              <>
                <motion.button
                  onClick={() => handleStatusChange('in_progress')}
                  className="p-1.5 rounded-full bg-coral-200/80 text-coral-800 hover:bg-coral-300/80 transition-all shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play size={12} />
                </motion.button>
                <motion.button
                  onClick={() => handleStatusChange('completed')}
                  className="p-1.5 rounded-full bg-green-200/80 text-green-800 hover:bg-green-300/80 transition-all shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Check size={12} />
                </motion.button>
              </>
            )}

            {todo.status === 'completed' && (
              <motion.button
                onClick={() => handleStatusChange('waiting')}
                className="p-1.5 rounded-full bg-coral-200/80 text-coral-800 hover:bg-coral-300/80 transition-all shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={12} />
              </motion.button>
            )}

            {/* 하위 할 일 추가 버튼 */}
            <motion.button
              onClick={() => setShowAddChild(!showAddChild)}
              className={`p-1.5 rounded-full transition-all shadow-sm hover:shadow-md ${
                showAddChild 
                  ? 'bg-coral-300/90 text-coral-900' 
                  : 'bg-coral-200/80 text-coral-800 hover:bg-coral-300/80'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={12} />
            </motion.button>

            {/* 메뉴 버튼 */}
            <button
              ref={menuButtonRef}
              onClick={() => {
                if (menuButtonRef.current) {
                  const rect = menuButtonRef.current.getBoundingClientRect()
                  setMenuButtonRect(rect)
                }
                setShowMenu(!showMenu)
              }}
              className="p-1.5 rounded-full hover:bg-white/60 transition-all shadow-sm"
            >
              <MoreHorizontal size={14} className="text-gray-600" />
              
            </button>
          </div>
        </div>
      </div>

      {/* 하위 할 일 추가 폼 */}
      {showAddChild && (
        <motion.div
          className="px-3 pb-3"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <QuickAddTodo 
            selectedDate={todo.dateCreated} 
            parentId={todo.id}
          />
        </motion.div>
      )}

      {/* 하위 할 일들 */}
      {hasChildren && isExpanded && (
        <motion.div
          className="pl-6 pb-3"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {childTodos.map(childTodo => (
            <div key={childTodo.id} className="mt-2">
              <TodoItem todo={childTodo} level={level + 1} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
    
    {/* 메뉴 드롭다운을 포털로 렌더링 */}
    {showMenu && menuButtonRect && createPortal(
      <motion.div
        className="fixed bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-coral-200/50 p-2 min-w-32"
        style={{ 
          top: menuButtonRect.bottom + 4,
          right: window.innerWidth - menuButtonRect.right,
          zIndex: 9999
        }}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
      >
        <button
          onClick={() => {
            deleteTodo(todo.id)
            setShowMenu(false)
          }}
          className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-100/80 text-red-600 text-sm transition-all"
        >
          🗑️ 삭제
        </button>
      </motion.div>,
      document.body
    )}
    </>
  )
}

export default TodoItem