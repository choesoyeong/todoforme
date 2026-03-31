import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, DragControls } from 'framer-motion'
import { Check, Ellipsis, ChevronRight, ChevronDown, GripVertical, Plus, Tag } from 'lucide-react'
import { Todo } from '@shared/types'
import { useTodoStore } from '../stores/todoStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useThemeStore } from '../stores/themeStore'
import QuickAddTodo from './QuickAddTodo'

interface TodoItemProps {
  todo: Todo
  level: number
  dragControls?: DragControls
}

function TodoItem({ todo, level, dragControls }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [menuButtonRect, setMenuButtonRect] = useState<DOMRect | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const addChildRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 서브태스크 입력 닫기
  useEffect(() => {
    if (!showAddChild) return
    const handleClickOutside = (e: MouseEvent) => {
      if (addChildRef.current && !addChildRef.current.contains(e.target as Node)) {
        setShowAddChild(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAddChild])

  const { toggleTodoStatus, deleteTodo, todos, updateTodo } = useTodoStore()
  const { categories } = useCategoryStore()
  const { theme } = useThemeStore()
  const c = theme.colors

  const childTodos = todos.filter(t => t.parentId === todo.id)
  const hasChildren = childTodos.length > 0
  const isCompleted = todo.status === 'completed'
  const currentCategory = categories.find(cat => cat.id === todo.category)

  const startEdit = () => { setEditValue(todo.title); setIsEditing(true) }
  const saveEdit = () => {
    if (editValue.trim() && editValue.trim() !== todo.title) updateTodo(todo.id, { title: editValue.trim() })
    setIsEditing(false); setEditValue('')
  }
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit()
    else if (e.key === 'Escape') { setIsEditing(false); setEditValue('') }
  }
  const handleCategorySelect = (categoryId: string) => {
    updateTodo(todo.id, { category: categoryId || undefined }); setIsEditingCategory(false)
  }

  return (
    <>
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5 group transition-colors"
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = c.cardHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {/* 드래그 핸들 — 고정 폭, 루트만 */}
        {!todo.parentId && dragControls ? (
          <div className="cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity w-3 flex-shrink-0 flex items-center justify-center"
            style={{ color: c.textMuted }} onPointerDown={(e) => dragControls.start(e)}>
            <GripVertical size={12} />
          </div>
        ) : !todo.parentId ? (
          <div className="w-3 flex-shrink-0" />
        ) : null}

        {/* 체크박스 */}
        <motion.button onClick={() => toggleTodoStatus(todo.id)}
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: isCompleted ? c.green : 'transparent',
            border: isCompleted ? `1.5px solid ${c.green}` : `1.5px solid ${c.textMuted}`,
          }}
          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        >
          {isCompleted && <Check size={10} color={theme.dark ? '#0a0a0b' : '#fff'} strokeWidth={3} />}
        </motion.button>

        {/* 제목 + 카테고리 */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {todo.emoji && <span className="text-sm">{todo.emoji}</span>}
          {isEditing ? (
            <input value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyPress}
              className="flex-1 text-[13px] font-medium rounded px-2 py-1 outline-none"
              style={{ background: c.cardHover, color: c.textPrimary }} autoFocus maxLength={100} />
          ) : (
            <span onClick={startEdit}
              className="text-[13px] font-medium cursor-pointer truncate"
              style={{
                color: isCompleted ? c.completedText : c.textPrimary,
                textDecoration: isCompleted ? 'line-through' : 'none',
                textDecorationColor: c.completedLine,
              }}
            >{todo.title}</span>
          )}

          {/* 카테고리 */}
          {isEditingCategory ? (
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleCategorySelect('')}
                className="px-2 py-0.5 text-[10px] rounded transition-colors"
                style={{ background: c.cardHover, color: c.textMuted }}>없음</button>
              {categories.filter(ct => !ct.deprecated).map(cat => (
                <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded transition-colors"
                  style={{ background: c.cardHover, color: c.textSecondary }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          ) : currentCategory ? (
            <button onClick={() => setIsEditingCategory(true)}
              className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded font-medium"
              style={{ background: currentCategory.color + '20', color: isCompleted ? c.completedText : undefined }}>
              {currentCategory.name}
            </button>
          ) : (
            <button onClick={() => setIsEditingCategory(true)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: c.textMuted, fontSize: 11 }}>
              <Tag size={10} />
            </button>
          )}

          {/* 접기/펼치기 — 카테고리 오른쪽 */}
          {hasChildren && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex-shrink-0 transition-transform"
              style={{ color: c.textMuted, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        {/* 액션 */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setShowAddChild(!showAddChild)}
            className="w-6 h-6 flex items-center justify-center rounded transition-colors"
            style={{ color: c.textMuted }}>
            <Plus size={12} />
          </button>
          <button ref={menuButtonRef} onClick={() => {
            if (menuButtonRef.current) setMenuButtonRect(menuButtonRef.current.getBoundingClientRect())
            setShowMenu(!showMenu)
          }} className="w-6 h-6 flex items-center justify-center rounded transition-colors" style={{ color: c.textMuted }}>
            <Ellipsis size={12} />
          </button>
        </div>
      </div>

      {showAddChild && (
        <div ref={addChildRef} style={{ paddingLeft: 36, paddingRight: 8, paddingBottom: 4 }}>
          <QuickAddTodo selectedDate={todo.dateCreated} parentId={todo.id} />
        </div>
      )}

      {hasChildren && isExpanded && (
        <div style={{ paddingLeft: 36 }}>
          {childTodos.map(child => (
            <TodoItem key={child.id} todo={child} level={level + 1} />
          ))}
        </div>
      )}

      {showMenu && menuButtonRect && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowMenu(false)} />
          <motion.div className="fixed rounded-lg shadow-xl p-1 min-w-[100px]"
            style={{ top: menuButtonRect.bottom + 4, right: window.innerWidth - menuButtonRect.right, zIndex: 9999, background: c.dropdownBg, border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          >
            <button onClick={() => { deleteTodo(todo.id); setShowMenu(false) }}
              className="w-full text-left px-3 py-1.5 rounded text-xs text-red-500 hover:bg-red-50 transition-colors">
              삭제
            </button>
          </motion.div>
        </>, document.body
      )}
    </>
  )
}

export default TodoItem
