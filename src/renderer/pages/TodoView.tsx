import React, { useState } from 'react'
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { ChevronLeft, ChevronRight, ChevronDown, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TodoList from '../components/TodoList'
import QuickAddTodo from '../components/QuickAddTodo'
import { useTodoStore } from '../stores/todoStore'
import { SortOption } from '@shared/types'

function TodoView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sortOption, setSortOption] = useState<SortOption>('recommended')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const copyIncompleteTodosFromRecent = useTodoStore(state => state.copyIncompleteTodosFromRecent)

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

  const handleDateClick = () => {
    setCalendarMonth(selectedDate)
    setShowCalendar(!showCalendar)
  }

  const handleCalendarSelect = (date: Date) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd')

  // 달력 날짜 계산
  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

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

            <div className="text-center relative" style={{ WebkitAppRegion: 'no-drag' }}>
              <button
                onClick={handleDateClick}
                className="hover:bg-white/20 rounded-xl px-3 py-1 transition-all"
              >
                <h2 className="text-2xl font-bold text-gray-800">
                  📅 {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
                </h2>
                {isToday && (
                  <span className="text-sm text-blue-600 font-medium mt-1 inline-block">오늘</span>
                )}
              </button>

              {/* 달력 팝업 */}
              <AnimatePresence>
                {showCalendar && (
                  <motion.div
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-coral-200/50 p-4 z-50 w-72"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  >
                    {/* 달력 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="p-1 rounded-lg hover:bg-coral-50 transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-bold text-gray-800">
                        {format(calendarMonth, 'yyyy년 M월', { locale: ko })}
                      </span>
                      <button
                        onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="p-1 rounded-lg hover:bg-coral-50 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* 날짜 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map(day => {
                        const isCurrentMonth = isSameMonth(day, calendarMonth)
                        const isSelected = isSameDay(day, selectedDate)
                        const isDayToday = isSameDay(day, new Date())

                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => handleCalendarSelect(day)}
                            className={`text-xs p-1.5 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-coral-400 text-white font-bold shadow-md'
                                : isDayToday
                                  ? 'bg-coral-100 text-coral-700 font-bold'
                                  : isCurrentMonth
                                    ? 'text-gray-700 hover:bg-coral-50'
                                    : 'text-gray-300'
                            }`}
                          >
                            {format(day, 'd')}
                          </button>
                        )
                      })}
                    </div>

                    {/* 오늘 버튼 */}
                    <button
                      onClick={() => handleCalendarSelect(new Date())}
                      className="w-full mt-3 py-1.5 text-xs font-medium text-coral-600 bg-coral-50 rounded-lg hover:bg-coral-100 transition-all"
                    >
                      오늘로 이동
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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

        {/* 이전 미완료 업무 불러오기 버튼 */}
        {isToday && (
          <div className="mt-3">
            <button
              onClick={copyIncompleteTodosFromRecent}
              className="flex items-center gap-2 px-4 py-2 bg-coral-100/40 backdrop-blur-sm hover:bg-coral-100/60 text-coral-700 rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              <RotateCcw size={16} />
              <span>이전 미완료 업무 불러오기</span>
            </button>
          </div>
        )}
      </div>

      {/* 투두 리스트 */}
      <div className="flex-1 min-h-0">
        <TodoList selectedDate={selectedDateString} sortOption={sortOption} />
      </div>

      {/* 달력/드롭다운 닫기용 오버레이 */}
      {(showCalendar || showSortDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCalendar(false)
            setShowSortDropdown(false)
          }}
        />
      )}
    </div>
  )
}

export default TodoView
