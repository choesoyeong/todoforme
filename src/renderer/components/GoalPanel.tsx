import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { useGoalStore } from '../stores/goalStore'
import { useThemeStore } from '../stores/themeStore'

interface GoalPanelProps {
  monthPeriod: string
  weekPeriod: string
}

function GoalSection({ type, period, label }: { type: 'monthly' | 'weekly'; period: string; label: string }) {
  const { getGoalsByPeriod, addGoal, toggleGoal, updateGoal, deleteGoal } = useGoalStore()
  const { theme } = useThemeStore()
  const c = theme.colors
  const goals = getGoalsByPeriod(type, period)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const completedCount = goals.filter(g => g.completed).length
  const totalCount = goals.length

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addGoal(type, period, newTitle.trim())
    setNewTitle('')
    setIsAdding(false)
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isComposing) { e.preventDefault(); handleAdd() }
    else if (e.key === 'Escape') { setIsAdding(false); setNewTitle('') }
  }

  const startEdit = (id: string, title: string) => { setEditingId(id); setEditValue(title) }
  const saveEdit = () => {
    if (editingId && editValue.trim()) updateGoal(editingId, { title: editValue.trim() })
    setEditingId(null); setEditValue('')
  }
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isComposing) { e.preventDefault(); saveEdit() }
    else if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: c.textMuted, letterSpacing: '0.05em' }}
        >
          {label}
          {totalCount > 0 && <span style={{ fontFamily: "'SF Mono','Menlo',monospace" }}>{completedCount}/{totalCount}</span>}
        </button>
        <div className="flex items-center gap-1">
          {/* 점 인디케이터 */}
          <div className="flex gap-1">
            {goals.map(g => (
              <div key={g.id} className="w-1.5 h-1.5 rounded-full" style={{ background: g.completed ? c.green : c.textMuted }} />
            ))}
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} style={{ color: c.textMuted }}>
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        </div>
      </div>

      {/* 목표 리스트 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="space-y-1">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleGoal(goal.id)}
                    className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: goal.completed ? c.green : 'transparent',
                      border: goal.completed ? `1.5px solid ${c.green}` : `1.5px solid ${c.textMuted}`,
                    }}
                  >
                    {goal.completed && <Check size={8} color={theme.dark ? '#0a0a0b' : '#fff'} strokeWidth={3} />}
                  </button>
                  {editingId === goal.id ? (
                    <input value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={handleEditKeyDown}
                      onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
                      className="flex-1 text-xs rounded px-1.5 py-0.5 outline-none"
                      style={{ background: c.cardHover, color: c.textPrimary }} autoFocus />
                  ) : (
                    <span onClick={() => startEdit(goal.id, goal.title)}
                      className="flex-1 text-xs cursor-pointer rounded px-1 py-0.5 transition-colors"
                      style={{ color: goal.completed ? c.textMuted : c.textSecondary, textDecoration: goal.completed ? 'line-through' : 'none' }}
                    >{goal.title}</span>
                  )}
                  <button onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all"
                    style={{ color: c.textMuted }}
                  ><X size={10} /></button>
                </div>
              ))}
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5" />
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={handleAddKeyDown}
                    onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
                    onBlur={() => { if (!newTitle.trim()) setIsAdding(false) }}
                    placeholder="목표 입력..." className="flex-1 text-xs rounded px-1.5 py-0.5 outline-none"
                    style={{ background: c.cardHover, color: c.textPrimary }} autoFocus />
                </div>
              ) : (
                <button onClick={() => { setIsAdding(true); setIsExpanded(true) }}
                  className="flex items-center gap-1 text-[11px] transition-colors" style={{ color: c.textMuted }}
                ><Plus size={10} /> 추가</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GoalPanel({ monthPeriod, weekPeriod }: GoalPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <GoalSection type="monthly" period={monthPeriod} label={`${parseInt(monthPeriod.split('-')[1])}월 목표`} />
      <GoalSection type="weekly" period={weekPeriod} label="이번 주 목표" />
    </div>
  )
}

export default GoalPanel
