import React, { useState } from 'react'
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import TodoList from '../components/TodoList'
import QuickAddTodo from '../components/QuickAddTodo'
import GoalPanel from '../components/GoalPanel'
import { useTodoStore } from '../stores/todoStore'
import { useStatsStore } from '../stores/statsStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useThemeStore } from '../stores/themeStore'
import { SortOption } from '@shared/types'

function TodoView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sortOption, setSortOption] = useState<SortOption>('recommended')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const copyIncompleteTodosFromRecent = useTodoStore(state => state.copyIncompleteTodosFromRecent)
  const { theme } = useThemeStore()
  const c = theme.colors
  const { getStreak, calculateCompletionRate, getTopCategories } = useStatsStore()
  const { categories } = useCategoryStore()

  const sortOptions = [
    { value: 'created' as SortOption, label: '등록순', emoji: '📝' },
    { value: 'recommended' as SortOption, label: '추천순', emoji: '⭐' },
    { value: 'category' as SortOption, label: '카테고리순', emoji: '🏷️' },
  ]

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1))
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
  const monthPeriod = format(selectedDate, 'yyyy-MM')
  const weekPeriod = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  // Stats
  const streak = getStreak(selectedDateString)
  const completionRate = calculateCompletionRate(selectedDateString)

  // Calendar
  const mStart = startOfMonth(calendarMonth)
  const mEnd = endOfMonth(calendarMonth)
  const cStart = startOfWeek(mStart)
  const cEnd = endOfWeek(mEnd)
  const calendarDays = eachDayOfInterval({ start: cStart, end: cEnd })
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  // Categories for right panel (이번 주 기준, 월요일 시작)
  const topCats = getTopCategories(
    format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="drag-region" style={{ padding: '16px 24px 12px', borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 no-drag">
            <button onClick={() => navigateDate('prev')} className="p-1.5 rounded-md transition-colors" style={{ color: c.textSecondary }}>
              <ChevronLeft size={18} />
            </button>
            <div className="relative">
              <button onClick={handleDateClick} className="rounded-lg px-2 py-1 transition-colors" style={{ color: c.textPrimary }}>
                <span className="text-xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                  {format(selectedDate, 'M월 d일 EEEE', { locale: ko })}
                </span>
              </button>
              {isToday && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded font-semibold" style={{ background: c.accentLight, color: c.accent }}>오늘</span>
              )}

              {/* 달력 팝업 */}
              <AnimatePresence>
                {showCalendar && (
                  <motion.div
                    className="absolute top-full mt-2 left-0 rounded-xl shadow-xl p-4 z-50 w-64"
                    style={{ background: c.cardBg, border: `1px solid ${c.border}` }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} style={{ color: c.textSecondary }}><ChevronLeft size={14} /></button>
                      <span className="text-xs font-bold" style={{ color: c.textPrimary }}>{format(calendarMonth, 'yyyy년 M월', { locale: ko })}</span>
                      <button onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} style={{ color: c.textSecondary }}><ChevronRight size={14} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {weekDays.map(d => <div key={d} className="text-center text-[10px] font-medium py-0.5" style={{ color: c.textMuted }}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map(day => {
                        const isCur = isSameMonth(day, calendarMonth)
                        const isSel = isSameDay(day, selectedDate)
                        const isT = isSameDay(day, new Date())
                        return (
                          <button key={day.toISOString()} onClick={() => handleCalendarSelect(day)}
                            className="text-xs p-1 rounded-md transition-colors"
                            style={{
                              background: isSel ? c.accent : isT ? c.accentLight : 'transparent',
                              color: isSel ? '#fff' : isT ? c.accentText : isCur ? c.textPrimary : c.textMuted,
                              fontWeight: isSel || isT ? 700 : 400,
                            }}
                          >{format(day, 'd')}</button>
                        )
                      })}
                    </div>
                    <button onClick={() => handleCalendarSelect(new Date())}
                      className="w-full mt-2 py-1 text-xs font-medium rounded-md transition-colors"
                      style={{ color: c.accent, background: c.accentLight }}
                    >오늘로 이동</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => navigateDate('next')} className="p-1.5 rounded-md transition-colors" style={{ color: c.textSecondary }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 정렬 */}
          <div className="relative no-drag">
            <button onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: c.btnBg, border: `1px solid ${c.btnBorder}`, color: c.textSecondary }}
            >
              <span>{sortOptions.find(o => o.value === sortOption)?.emoji}</span>
              <span>{sortOptions.find(o => o.value === sortOption)?.label}</span>
              <ChevronDown size={12} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 rounded-lg shadow-xl py-1 z-10 min-w-[120px]"
                style={{ background: c.dropdownBg, border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}
              >
                {sortOptions.map(opt => (
                  <button key={opt.value} onClick={() => { setSortOption(opt.value); setShowSortDropdown(false) }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors"
                    style={{
                      background: sortOption === opt.value ? c.accentLight : 'transparent',
                      color: sortOption === opt.value ? c.accentText : c.textSecondary,
                      fontWeight: sortOption === opt.value ? 600 : 400,
                    }}
                  >{opt.emoji} {opt.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 2단 레이아웃 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 투두 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div style={{ padding: '12px 20px 8px' }}>
            <QuickAddTodo selectedDate={format(selectedDate, 'yyyy-MM-dd')} showCopyButton={isToday} onCopyIncomplete={copyIncompleteTodosFromRecent} />
          </div>
          <div className="flex-1 min-h-0">
            <TodoList selectedDate={selectedDateString} sortOption={sortOption} />
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className="overflow-y-auto flex-shrink-0" style={{ width: 240, borderLeft: `1px solid ${c.border}`, padding: 16 }}>
          <div className="flex flex-col gap-5">
            {/* 통계 */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>오늘의 현황</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ background: c.cardHover, border: `1px solid ${c.borderLight}` }}>
                  <div className="text-lg font-bold" style={{ color: c.green, fontFamily: "'SF Mono','Menlo',monospace" }}>{completionRate}%</div>
                  <div className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>완수율</div>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: c.cardHover, border: `1px solid ${c.borderLight}` }}>
                  <div className="text-lg font-bold" style={{ color: c.accent, fontFamily: "'SF Mono','Menlo',monospace" }}>{streak}일</div>
                  <div className="text-[10px] mt-0.5" style={{ color: c.textMuted }}>연속 달성</div>
                </div>
              </div>
            </div>

            {/* 목표 */}
            <GoalPanel monthPeriod={monthPeriod} weekPeriod={weekPeriod} />

            {/* 카테고리 */}
            {topCats.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>카테고리</div>
                <div className="flex flex-col gap-1.5">
                  {topCats.map((cat, i) => {
                    const catObj = categories.find(ct => ct.name === cat.category)
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catObj?.color || '#9ca3af' }} />
                        <span className="flex-1" style={{ color: c.textSecondary }}>{cat.category}</span>
                        <span style={{ color: c.textMuted, fontFamily: "'SF Mono','Menlo',monospace", fontSize: 11 }}>{cat.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      {(showCalendar || showSortDropdown) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowCalendar(false); setShowSortDropdown(false) }} />
      )}
    </div>
  )
}

export default TodoView
