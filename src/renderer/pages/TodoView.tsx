import React, { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { ChevronLeft, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import TodoList from '../components/TodoList'
import QuickAddTodo from '../components/QuickAddTodo'
import { useTodoStore } from '../stores/todoStore'
import { SortOption } from '@shared/types'

function TodoView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sortOption, setSortOption] = useState<SortOption>('recommended')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const copyIncompleteTodosFromYesterday = useTodoStore(state => state.copyIncompleteTodosFromYesterday)

  const sortOptions = [
    { value: 'created' as SortOption, label: '등록순', emoji: '📝' },
    { value: 'recommended' as SortOption, label: '추천순', emoji: '⭐' },
    { value: 'category' as SortOption, label: '카테고리순', emoji: '🏷️' },
  ]

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(prev => subDays(prev, 1))
    } else {
      setSelectedDate(prev => addDays(prev, 1))
    }
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd')

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
                <span className="text-sm text-blue-600 font-medium mt-1 inline-block">오늘</span>
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

          {/* 정렬 옵션 */}
          <div className="relative" style={{ WebkitAppRegion: 'no-drag' }}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-coral-100/40 backdrop-blur-sm rounded-xl hover:bg-coral-100/60 transition-all text-sm shadow-sm"
            >
              <span>{sortOptions.find(opt => opt.value === sortOption)?.emoji}</span>
              <span>{sortOptions.find(opt => opt.value === sortOption)?.label}</span>
              <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-coral-200/50 py-2 z-10 min-w-[140px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-coral-50/80 flex items-center gap-2 transition-all ${
                      sortOption === option.value ? 'bg-coral-100/80 text-coral-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 빠른 할 일 추가 */}
      <div className="px-6 pb-3">
        <QuickAddTodo selectedDate={format(selectedDate, 'yyyy-MM-dd')} />

        {/* 어제 미완료 업무 불러오기 버튼 */}
        {isToday && (
          <div className="mt-3">
            <button
              onClick={copyIncompleteTodosFromYesterday}
              className="flex items-center gap-2 px-4 py-2 bg-coral-100/40 backdrop-blur-sm hover:bg-coral-100/60 text-coral-700 rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              <RotateCcw size={16} />
              <span>어제 미완료 업무 불러오기</span>
            </button>
          </div>
        )}
      </div>

      {/* 투두 리스트 */}
      <div className="flex-1 min-h-0">
        <TodoList selectedDate={selectedDateString} sortOption={sortOption} />
      </div>
    </div>
  )
}

export default TodoView
