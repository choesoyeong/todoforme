import React, { useState, useEffect, useRef } from 'react'
import { Reorder } from 'framer-motion'
import ReorderableItem from './ReorderableItem'
import TodoItem from './TodoItem'
import { useTodoStore } from '../stores/todoStore'
import { useThemeStore } from '../stores/themeStore'
import { SortOption, Todo } from '@shared/types'

interface TodoListProps {
  selectedDate: string
  sortOption: SortOption
}

function TodoList({ selectedDate, sortOption }: TodoListProps) {
  const { getSortedTodos, reorderTodos } = useTodoStore()
  const { theme } = useThemeStore()
  const c = theme.colors
  const todosForDate = getSortedTodos(selectedDate, sortOption)
  const rootTodos = todosForDate.filter(todo => !todo.parentId)
  const pendingTodos = rootTodos.filter(t => t.status === 'waiting')
  const completedTodos = rootTodos.filter(t => t.status === 'completed')
  const [orderedPending, setOrderedPending] = useState<Todo[]>(pendingTodos)
  const isDragging = useRef(false)

  useEffect(() => {
    if (!isDragging.current) setOrderedPending(pendingTodos)
  }, [selectedDate, sortOption, JSON.stringify(pendingTodos)])

  const handleReorder = (newOrder: Todo[]) => setOrderedPending(newOrder)
  const handleDragStart = () => { isDragging.current = true }
  const handleDragEnd = () => {
    reorderTodos(selectedDate, [...orderedPending.map(t => t.id), ...completedTodos.map(t => t.id)])
    requestAnimationFrame(() => { isDragging.current = false })
  }

  if (rootTodos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm font-medium" style={{ color: c.textMuted }}>할 일이 없어요</div>
          <div className="text-xs mt-1" style={{ color: c.textMuted }}>위에서 새로운 할 일을 추가해보세요</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-4 pb-6" style={{ overscrollBehavior: 'contain' }}>
      {/* 진행 중 */}
      {pendingTodos.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: c.sectionLabelColor, letterSpacing: '0.05em' }}>
            진행 중 · {pendingTodos.length}
          </span>
          <div className="flex-1 h-px" style={{ background: c.borderLight }} />
        </div>
      )}

      <Reorder.Group axis="y" values={orderedPending} onReorder={handleReorder} layoutScroll className="list-none p-0 m-0">
        {orderedPending.map(todo => (
          <ReorderableItem key={todo.id} todo={todo} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
        ))}
      </Reorder.Group>

      {/* 완료 */}
      {completedTodos.length > 0 && (
        <>
          <div className="flex items-center gap-2 py-2 mt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: c.sectionLabelColor, letterSpacing: '0.05em' }}>
              완료 · {completedTodos.length}
            </span>
            <div className="flex-1 h-px" style={{ background: c.borderLight }} />
          </div>
          {completedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} level={0} />
          ))}
        </>
      )}
    </div>
  )
}

export default TodoList
