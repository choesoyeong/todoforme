import React, { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { ChevronLeft, ChevronRight, Clock, ChevronDown, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import TodoList from '../components/TodoList'
import QuickAddTodo from '../components/QuickAddTodo'
import { useTodoStore } from '../stores/todoStore'
import { SortOption } from '@shared/types'

function TodoView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sortOption, setSortOption] = useState<SortOption>('created')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const getTodayWorkTime = useTodoStore(state => state.getTodayWorkTime)
  const copyIncompleteTodosFromYesterday = useTodoStore(state => state.copyIncompleteTodosFromYesterday)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}시간 ${mins}분`
  }

  const sortOptions = [
    { value: 'created' as SortOption, label: '등록순', emoji: '📝' },
    { value: 'recommended' as SortOption, label: '추천순', emoji: '⭐' },
    { value: 'category' as SortOption, label: '카테고리순', emoji: '🏷️' },
    { value: 'workTime' as SortOption, label: '업무시간순', emoji: '⏰' }
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
  const workTime = getTodayWorkTime(selectedDateString)

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
              <div className="flex items-center justify-center gap-4 mt-1">
                {isToday && (
                  <span className="text-sm text-blue-600 font-medium">오늘</span>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{formatTime(workTime)}</span>
                </div>
              </div>
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
              className="flex items-center gap-2 px-3 py-2 bg-purple-100/40 rounded-lg hover:bg-purple-100/60 transition-colors text-sm"
            >
              <span>{sortOptions.find(opt => opt.value === sortOption)?.emoji}</span>
              <span>{sortOptions.find(opt => opt.value === sortOption)?.label}</span>
              <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-purple-200 py-1 z-10 min-w-[140px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 flex items-center gap-2 ${
                      sortOption === option.value ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-100/40 hover:bg-blue-100/60 text-blue-700 rounded-lg transition-colors text-sm font-medium"
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