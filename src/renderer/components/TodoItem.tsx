import React, { useState, useEffect } from 'react'
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
  waiting: 'bg-gray-100 border-gray-200',
  in_progress: 'bg-orange-100 border-orange-300 shadow-lg',
  paused: 'bg-yellow-100 border-yellow-300',
  completed: 'bg-green-100 border-green-300 opacity-75'
}

function TodoItem({ todo, level }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  
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
    <div className={`rounded-3xl border-2 transition-all ${statusColors[todo.status]}`}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* 확장/축소 버튼 */}
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-white/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          )}

          {/* 상태 이모지 */}
          <div className="text-xl">
            {statusEmojis[todo.status]}
          </div>

          {/* 할 일 제목 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {todo.emoji && <span className="text-lg">{todo.emoji}</span>}
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-white/80 border-2 border-blue-300 rounded-lg px-2 py-1 font-medium text-gray-800 focus:outline-none focus:border-blue-500"
                  autoFocus
                  maxLength={100}
                />
              ) : (
                <span 
                  className={`font-medium cursor-pointer hover:bg-white/30 rounded px-1 py-0.5 transition-colors ${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}
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
                    className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    없음
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white/60 rounded-full hover:bg-white/80 transition-colors"
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
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white/60 rounded-full hover:bg-white/80 transition-colors"
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
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-500 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <Tag size={8} />
                      카테고리
                    </button>
                  )}
                </div>
              )}
            </div>
            {todo.description && (
              <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
            )}
          </div>

          {/* 시간 표시 */}
          <div className="text-sm text-gray-600 bg-white/50 px-2 py-1 rounded-full">
            ⏰ {formatTime(getCurrentTime())}
            {isActive && (
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
          <div className="flex items-center gap-2">
            {todo.status === 'waiting' && (
              <motion.button
                onClick={() => handleStatusChange('in_progress')}
                className="p-2 rounded-full bg-blue-300 text-blue-800 hover:bg-blue-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={14} />
              </motion.button>
            )}

            {todo.status === 'in_progress' && (
              <>
                <motion.button
                  onClick={() => handleStatusChange('paused')}
                  className="p-2 rounded-full bg-orange-300 text-orange-800 hover:bg-orange-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pause size={14} />
                </motion.button>
                <motion.button
                  onClick={() => handleStatusChange('completed')}
                  className="p-2 rounded-full bg-green-300 text-green-800 hover:bg-green-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Check size={14} />
                </motion.button>
              </>
            )}

            {todo.status === 'paused' && (
              <>
                <motion.button
                  onClick={() => handleStatusChange('in_progress')}
                  className="p-2 rounded-full bg-blue-300 text-blue-800 hover:bg-blue-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play size={14} />
                </motion.button>
                <motion.button
                  onClick={() => handleStatusChange('completed')}
                  className="p-2 rounded-full bg-green-300 text-green-800 hover:bg-green-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Check size={14} />
                </motion.button>
              </>
            )}

            {todo.status === 'completed' && (
              <motion.button
                onClick={() => handleStatusChange('waiting')}
                className="p-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play size={14} />
              </motion.button>
            )}

            {/* 하위 할 일 추가 버튼 */}
            <motion.button
              onClick={() => setShowAddChild(!showAddChild)}
              className={`p-2 rounded-full transition-colors ${
                showAddChild 
                  ? 'bg-purple-400 text-purple-900' 
                  : 'bg-purple-300 text-purple-800 hover:bg-purple-400'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={14} />
            </motion.button>

            {/* 메뉴 버튼 */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-white/50 transition-colors relative"
            >
              <MoreHorizontal size={16} className="text-gray-600" />
              
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg border p-2 z-10 min-w-32">
                  <button
                    onClick={() => {
                      deleteTodo(todo.id)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-100 text-red-600 text-sm"
                  >
                    🗑️ 삭제
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 하위 할 일 추가 폼 */}
      {showAddChild && (
        <motion.div
          className="px-4 pb-4"
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
          className="pl-8 pb-4"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {childTodos.map(childTodo => (
            <div key={childTodo.id} className="mt-3">
              <TodoItem todo={childTodo} level={level + 1} />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default TodoItem