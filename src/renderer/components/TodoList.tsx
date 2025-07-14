import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TodoItem from './TodoItem'
import { useTodoStore } from '../stores/todoStore'
import { SortOption } from '@shared/types'

interface TodoListProps {
  selectedDate: string
  sortOption: SortOption
}

function TodoList({ selectedDate, sortOption }: TodoListProps) {
  const { getSortedTodos } = useTodoStore()
  const todosForDate = getSortedTodos(selectedDate, sortOption)
  const rootTodos = todosForDate.filter(todo => !todo.parentId)

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
    <div className="h-full overflow-y-auto p-6">
      <AnimatePresence>
        <div className="space-y-2">
          {rootTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <TodoItem todo={todo} level={0} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}

export default TodoList