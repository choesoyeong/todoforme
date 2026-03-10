import React from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Todo } from '@shared/types'
import TodoItem from './TodoItem'

interface ReorderableItemProps {
  todo: Todo
  onDragStart: () => void
  onDragEnd: () => void
}

function ReorderableItem({ todo, onDragStart, onDragEnd }: ReorderableItemProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={todo}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        cursor: 'grabbing',
      }}
      style={{ position: 'relative', userSelect: 'none', WebkitUserSelect: 'none' }}
      className="list-none"
    >
      <TodoItem todo={todo} level={0} dragControls={dragControls} />
    </Reorder.Item>
  )
}

export default ReorderableItem
