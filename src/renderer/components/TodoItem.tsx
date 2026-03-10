import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Check, MoreHorizontal, ChevronRight, ChevronDown, Plus, Tag } from 'lucide-react'
import { Todo } from '@shared/types'
import { useTodoStore } from '../stores/todoStore'
import { useCategoryStore } from '../stores/categoryStore'
import QuickAddTodo from './QuickAddTodo'

interface TodoItemProps {
  todo: Todo
  level: number
}

const statusColors = {
  waiting: 'bg-coral-50/60 backdrop-blur-sm shadow-md hover:shadow-lg',
  completed: 'bg-green-50/60 backdrop-blur-sm shadow-sm opacity-75 hover:opacity-90'
}

function TodoItem({ todo, level }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [menuButtonRect, setMenuButtonRect] = useState<DOMRect | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const { toggleTodoStatus, deleteTodo, todos, updateTodo } = useTodoStore()
  const { categories } = useCategoryStore()

  const childTodos = todos.filter(t => t.parentId === todo.id)
  const hasChildren = childTodos.length > 0
  const isCompleted = todo.status === 'completed'

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

          {/* 완료 체크박스 */}
          <motion.button
            onClick={() => toggleTodoStatus(todo.id)}
            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-coral-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCompleted && <Check size={12} />}
          </motion.button>

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
                  className={`text-sm font-medium cursor-pointer hover:bg-white/40 rounded-lg px-2 py-1 transition-all ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}
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

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-1">
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
