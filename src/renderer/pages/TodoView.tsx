import React, { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import TodoList from '../components/TodoList'
import QuickAddTodo from '../components/QuickAddTodo'

function TodoView() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(prev => subDays(prev, 1))
    } else {
      setSelectedDate(prev => addDays(prev, 1))
    }
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-white/20" style={{ WebkitAppRegion: 'drag', userSelect: 'none' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                📅 {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
              </h2>
              {isToday && (
                <span className="text-sm text-blue-600 font-medium">오늘</span>
              )}
            </div>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              style={{ WebkitAppRegion: 'no-drag' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </div>

      {/* 빠른 할 일 추가 */}
      <div className="px-6 pb-4">
        <QuickAddTodo selectedDate={format(selectedDate, 'yyyy-MM-dd')} />
      </div>

      {/* 투두 리스트 */}
      <div className="flex-1 min-h-0">
        <TodoList selectedDate={format(selectedDate, 'yyyy-MM-dd')} />
      </div>
    </div>
  )
}

export default TodoView