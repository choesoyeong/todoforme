import React, { useState, useEffect, useRef } from 'react'
import { motion, Reorder } from 'framer-motion'
import ReorderableItem from './ReorderableItem'
import { useTodoStore } from '../stores/todoStore'
import { SortOption, Todo } from '@shared/types'

interface TodoListProps {
  selectedDate: string
  sortOption: SortOption
}

function TodoList({ selectedDate, sortOption }: TodoListProps) {
  const { getSortedTodos, reorderTodos } = useTodoStore()
  const todosForDate = getSortedTodos(selectedDate, sortOption)
  const rootTodos = todosForDate.filter(todo => !todo.parentId)
  const [orderedTodos, setOrderedTodos] = useState<Todo[]>(rootTodos)
  const isDragging = useRef(false)

  // 스토어 변경 시 동기화 — 드래그 중에는 무시
  useEffect(() => {
    if (!isDragging.current) {
      setOrderedTodos(rootTodos)
    }
  }, [selectedDate, sortOption, rootTodos.map(t => t.id).join(','), rootTodos.map(t => t.order).join(','), rootTodos.map(t => t.status).join(',')])

  const handleReorder = (newOrder: Todo[]) => {
    setOrderedTodos(newOrder)
  }

  const handleDragStart = () => {
    isDragging.current = true
  }

  const handleDragEnd = () => {
    const ids = orderedTodos.map(t => t.id)
    reorderTodos(selectedDate, ids)
    // 약간의 지연 후 드래그 상태 해제 (스토어 업데이트 완료 대기)
    requestAnimationFrame(() => {
      isDragging.current = false
    })
  }

  if (rootTodos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">🌸</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            할 일이 없어요!
          </h3>
          <p className="text-gray-500">
            새로운 할 일을 추가해보세요
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ overscrollBehavior: 'contain' }}>
      <Reorder.Group
        axis="y"
        values={orderedTodos}
        onReorder={handleReorder}
        layoutScroll
        className="space-y-2 list-none p-0 m-0"
      >
        {orderedTodos.map((todo) => (
          <ReorderableItem
            key={todo.id}
            todo={todo}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}

export default TodoList
