import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleCheckBig, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStatsStore } from '../stores/statsStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useThemeStore } from '../stores/themeStore'
import { format, subDays, subWeeks, subMonths, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ko } from 'date-fns/locale'

type StatsTab = 'daily' | 'weekly' | 'monthly'

function StatsView() {
  const [activeTab, setActiveTab] = useState<StatsTab>('daily')
  const [baseDate, setBaseDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const { getDailyStats, getWeeklyStats, getMonthlyStats, calculateCompletionRate, getStreak, getRecentDailyStats, getTopCategories } = useStatsStore()
  const { categories } = useCategoryStore()
  const { theme } = useThemeStore()
  const c = theme.colors

  const tabs = [
    { id: 'daily' as StatsTab, label: '일간' },
    { id: 'weekly' as StatsTab, label: '주간' },
    { id: 'monthly' as StatsTab, label: '월간' },
  ]

  const navigateDate = (dir: -1 | 1) => {
    const cur = new Date(baseDate)
    const next = activeTab === 'daily' ? (dir === -1 ? subDays(cur, 1) : addDays(cur, 1))
      : activeTab === 'weekly' ? (dir === -1 ? subWeeks(cur, 1) : addWeeks(cur, 1))
      : (dir === -1 ? subMonths(cur, 1) : addMonths(cur, 1))
    setBaseDate(format(next, 'yyyy-MM-dd'))
  }

  const periodLabel = useMemo(() => {
    const d = new Date(baseDate)
    if (activeTab === 'daily') return format(d, 'M월 d일 (EEE)', { locale: ko })
    if (activeTab === 'weekly') { const ws = startOfWeek(d, { weekStartsOn: 1 }); const we = endOfWeek(d, { weekStartsOn: 1 }); return `${format(ws, 'M/d')} ~ ${format(we, 'M/d')}` }
    return format(d, 'yyyy년 M월', { locale: ko })
  }, [baseDate, activeTab])

  const stats = useMemo(() => {
    if (activeTab === 'daily') {
      const daily = getDailyStats(baseDate)
      const rate = daily.totalTodos > 0 ? Math.round((daily.completedTodos / daily.totalTodos) * 100) : 0
      return { totalTodos: daily.totalTodos, completedTodos: daily.completedTodos, rate }
    }
    if (activeTab === 'weekly') {
      const weekly = getWeeklyStats(baseDate)
      const total = weekly.dailyStats.reduce((s, d) => s + d.totalTodos, 0)
      return { totalTodos: total, completedTodos: weekly.weeklyCompletedTodos, rate: total > 0 ? Math.round((weekly.weeklyCompletedTodos / total) * 100) : 0 }
    }
    const monthly = getMonthlyStats(baseDate)
    const ms = startOfMonth(new Date(baseDate)); const me = endOfMonth(new Date(baseDate))
    const total = eachDayOfInterval({ start: ms, end: me }).reduce((s, d) => s + getDailyStats(format(d, 'yyyy-MM-dd')).totalTodos, 0)
    return { totalTodos: total, completedTodos: monthly.monthlyCompletedTodos, rate: total > 0 ? Math.round((monthly.monthlyCompletedTodos / total) * 100) : 0 }
  }, [baseDate, activeTab])

  const streak = useMemo(() => getStreak(baseDate), [baseDate])

  const trendData = useMemo(() => {
    if (activeTab === 'daily') {
      return getRecentDailyStats(baseDate, 7).map(d => ({ label: format(new Date(d.date), 'EEE', { locale: ko }), total: d.totalTodos, completed: d.completedTodos, rate: d.totalTodos > 0 ? Math.round((d.completedTodos / d.totalTodos) * 100) : 0 }))
    }
    if (activeTab === 'weekly') {
      return Array.from({ length: 4 }, (_, i) => { const wd = format(subWeeks(new Date(baseDate), 3 - i), 'yyyy-MM-dd'); const w = getWeeklyStats(wd); const t = w.dailyStats.reduce((s, d) => s + d.totalTodos, 0); return { label: `${format(new Date(w.weekStart), 'M/d')}~`, total: t, completed: w.weeklyCompletedTodos, rate: t > 0 ? Math.round((w.weeklyCompletedTodos / t) * 100) : 0 } })
    }
    return Array.from({ length: 6 }, (_, i) => { const md = format(subMonths(new Date(baseDate), 5 - i), 'yyyy-MM-dd'); const m = getMonthlyStats(md); const ms = startOfMonth(new Date(md)); const me = endOfMonth(new Date(md)); const t = eachDayOfInterval({ start: ms, end: me }).reduce((s, d) => s + getDailyStats(format(d, 'yyyy-MM-dd')).totalTodos, 0); return { label: format(new Date(md), 'M월', { locale: ko }), total: t, completed: m.monthlyCompletedTodos, rate: t > 0 ? Math.round((m.monthlyCompletedTodos / t) * 100) : 0 } })
  }, [baseDate, activeTab])

  const categoryData = useMemo(() => {
    const d = new Date(baseDate)
    let s: string, e: string
    if (activeTab === 'daily') { s = e = baseDate }
    else if (activeTab === 'weekly') { s = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'); e = format(endOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd') }
    else { s = format(startOfMonth(d), 'yyyy-MM-dd'); e = format(endOfMonth(d), 'yyyy-MM-dd') }
    const topCats = getTopCategories(s, e)
    const total = topCats.reduce((sum, ct) => sum + ct.count, 0)
    return topCats.map(ct => { const cat = categories.find(x => x.name === ct.category); return { name: ct.category, count: ct.count, percent: total > 0 ? Math.round((ct.count / total) * 100) : 0, color: cat?.color || '#94a3b8' } })
  }, [baseDate, activeTab, categories])

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold" style={{ color: c.textPrimary, letterSpacing: '-0.02em' }}>통계</h2>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{ background: activeTab === tab.id ? (theme.dark ? c.cardHover : c.cardBg) : 'transparent', color: activeTab === tab.id ? c.textPrimary : c.textMuted, border: activeTab === tab.id ? `1px solid ${c.border}` : '1px solid transparent' }}
          >{tab.label}</button>
        ))}
      </div>

      {/* 날짜 네비 */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigateDate(-1)} style={{ color: c.textMuted }}><ChevronLeft size={18} /></button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>{periodLabel}</span>
          {baseDate !== format(new Date(), 'yyyy-MM-dd') && (
            <button onClick={() => setBaseDate(format(new Date(), 'yyyy-MM-dd'))}
              className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: c.accentLight, color: c.accent }}>오늘</button>
          )}
        </div>
        <button onClick={() => navigateDate(1)} style={{ color: c.textMuted }}><ChevronRight size={18} /></button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${activeTab}-${baseDate}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {/* 요약 카드 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg p-4" style={{ background: c.cardHover, border: `1px solid ${c.borderLight}` }}>
              <div className="flex items-center gap-2 mb-1"><CircleCheckBig size={14} style={{ color: c.green }} /><span className="text-[10px]" style={{ color: c.textMuted }}>완수율</span></div>
              <div className="text-2xl font-bold" style={{ color: c.green, fontFamily: "'SF Mono','Menlo',monospace" }}>{stats.rate}%</div>
              <div className="text-[10px] mt-1" style={{ color: c.textMuted }}>{stats.completedTodos}/{stats.totalTodos}개</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: c.cardHover, border: `1px solid ${c.borderLight}` }}>
              <div className="flex items-center gap-2 mb-1"><Zap size={14} style={{ color: '#f59e0b' }} /><span className="text-[10px]" style={{ color: c.textMuted }}>연속 달성</span></div>
              <div className="text-2xl font-bold" style={{ color: c.accent, fontFamily: "'SF Mono','Menlo',monospace" }}>{streak}일</div>
              <div className="text-[10px] mt-1" style={{ color: c.textMuted }}>{streak >= 7 ? '대단해요!' : streak >= 3 ? '좋은 흐름!' : '시작이 반!'}</div>
            </div>
            <div className="rounded-lg p-4" style={{ background: c.cardHover, border: `1px solid ${c.borderLight}` }}>
              <div className="text-[10px] mb-1" style={{ color: c.textMuted }}>남은 할 일</div>
              <div className="text-2xl font-bold" style={{ color: c.textPrimary, fontFamily: "'SF Mono','Menlo',monospace" }}>{stats.totalTodos - stats.completedTodos}</div>
            </div>
          </div>

          {/* 트렌드 */}
          <div className="rounded-lg p-4 mb-5" style={{ border: `1px solid ${c.borderLight}` }}>
            <div className="text-[11px] font-semibold mb-3" style={{ color: c.textMuted }}>완수율 트렌드</div>
            {trendData.some(d => d.total > 0) ? (
              <div className="space-y-2">
                {trendData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] w-10 text-right flex-shrink-0" style={{ color: c.textMuted }}>{item.label}</span>
                    <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: c.borderLight }}>
                      <motion.div className="h-full rounded" style={{ background: item.rate >= 80 ? c.green : item.rate >= 50 ? '#f59e0b' : item.rate > 0 ? c.accent : 'transparent' }}
                        initial={{ width: 0 }} animate={{ width: `${item.rate}%` }} transition={{ duration: 0.4, delay: i * 0.04 }} />
                    </div>
                    {item.total > 0 && <span className="text-[10px] w-8 flex-shrink-0" style={{ color: c.textMuted, fontFamily: "'SF Mono','Menlo',monospace" }}>{item.rate}%</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6" style={{ color: c.textMuted }}><div className="text-xl mb-1">📭</div><div className="text-xs">데이터가 없어요</div></div>
            )}
          </div>

          {/* 카테고리 */}
          <div className="rounded-lg p-4" style={{ border: `1px solid ${c.borderLight}` }}>
            <div className="text-[11px] font-semibold mb-3" style={{ color: c.textMuted }}>카테고리 분포</div>
            {categoryData.length > 0 ? (
              <div className="space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] w-12 truncate flex-shrink-0" style={{ color: c.textSecondary }}>{cat.name}</span>
                    <div className="flex-1 h-4 rounded overflow-hidden" style={{ background: c.borderLight }}>
                      <motion.div className="h-full rounded" style={{ background: cat.color }}
                        initial={{ width: 0 }} animate={{ width: `${cat.percent}%` }} transition={{ duration: 0.4, delay: i * 0.06 }} />
                    </div>
                    <span className="text-[10px] w-14 text-right flex-shrink-0" style={{ color: c.textMuted }}>{cat.count}개 ({cat.percent}%)</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6" style={{ color: c.textMuted }}><div className="text-xl mb-1">🏷️</div><div className="text-xs">카테고리 데이터 없음</div></div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default StatsView
