import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { useGoalStore } from '../stores/goalStore'

interface GoalPanelProps {
  monthPeriod: string  // 'YYYY-MM'
  weekPeriod: string   // 'YYYY-MM-DD' (주 시작일)
}

function GoalSection({
  type,
  period,
  label,
  emoji,
}: {
  type: 'monthly' | 'weekly'
  period: string
  label: string
  emoji: string
}) {
  const { getGoalsByPeriod, addGoal, toggleGoal, updateGoal, deleteGoal } = useGoalStore()
  const goals = getGoalsByPeriod(type, period)
  const [isExpanded, setIsExpanded] = useState(false)
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
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isComposing) {
      e.preventDefault()
      handleAdd()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTitle('')
    }
  }

  const startEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditValue(title)
  }

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      updateGoal(editingId, { title: editValue.trim() })
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isComposing) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditValue('')
    }
  }

  return (
    <div>
      {/* 헤더 — 접기/펼치기 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/30 transition-all"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{emoji} {label}</span>
          {totalCount > 0 && (
            <span className="text-xs text-gray-500 font-normal">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {!isExpanded && totalCount > 0 && (
          <div className="flex gap-0.5">
            {goals.map(g => (
              <div
                key={g.id}
                className={`w-1.5 h-1.5 rounded-full ${g.completed ? 'bg-green-400' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </button>

      {/* 펼친 내용 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-7 pr-3 pb-1 space-y-1">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center gap-2 group"
                >
                  {/* 체크박스 */}
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      goal.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-coral-400'
                    }`}
                  >
                    {goal.completed && <Check size={10} />}
                  </button>

                  {/* 제목 */}
                  {editingId === goal.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleEditKeyDown}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      className="flex-1 text-xs bg-white/80 rounded-lg px-2 py-1 outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(goal.id, goal.title)}
                      className={`flex-1 text-xs cursor-pointer rounded-lg px-1 py-0.5 hover:bg-white/40 transition-all ${
                        goal.completed ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {goal.title}
                    </span>
                  )}

                  {/* 삭제 */}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* 추가 입력 */}
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4" />
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={handleAddKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onBlur={() => {
                      if (!newTitle.trim()) setIsAdding(false)
                    }}
                    placeholder="목표를 입력하세요..."
                    className="flex-1 text-xs bg-white/80 rounded-lg px-2 py-1 outline-none placeholder-gray-400"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => { setIsAdding(true); setIsExpanded(true) }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-coral-600 pl-1 py-0.5 transition-all"
                >
                  <Plus size={12} />
                  <span>추가</span>
                </button>
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
    <div className="flex gap-2">
      <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-2xl px-2 py-1.5 shadow-sm border border-white/20">
        <GoalSection
          type="monthly"
          period={monthPeriod}
          label={`${parseInt(monthPeriod.split('-')[1])}월 목표`}
          emoji="🎯"
        />
      </div>
      <div className="flex-1 bg-white/30 backdrop-blur-sm rounded-2xl px-2 py-1.5 shadow-sm border border-white/20">
        <GoalSection
          type="weekly"
          period={weekPeriod}
          label="이번 주 목표"
          emoji="📌"
        />
      </div>
    </div>
  )
}

export default GoalPanel
