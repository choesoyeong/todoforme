import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PenLine, Trash2, ArchiveX, ArchiveRestore, Tag, X } from 'lucide-react'
import { Category } from '@shared/types'
import { useCategoryStore } from '../stores/categoryStore'
import { useThemeStore } from '../stores/themeStore'

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FFB347', '#FF69B4', '#87CEEB', '#98FB98',
  '#F0E68C', '#FFA07A', '#20B2AA', '#BA55D3', '#FF7F50'
]

async function loadKeywords(): Promise<Record<string, string[]>> {
  try {
    if (window.electronAPI?.storage) return await window.electronAPI.storage.getCategoryKeywords() || {}
    const saved = localStorage.getItem('categoryKeywords')
    if (saved) return JSON.parse(saved)
  } catch {}
  return {}
}

function saveKeywords(keywords: Record<string, string[]>) {
  if (window.electronAPI?.storage) window.electronAPI.storage.setCategoryKeywords(keywords)
  else localStorage.setItem('categoryKeywords', JSON.stringify(keywords))
}

function CategoryView() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const { theme } = useThemeStore()
  const c = theme.colors
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#FF6B6B' })
  const [allKeywords, setAllKeywords] = useState<Record<string, string[]>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [keywordInput, setKeywordInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  useEffect(() => { loadKeywords().then(setAllKeywords) }, [])

  const addKeyword = (catName: string) => {
    const kw = keywordInput.trim()
    if (!kw) return
    const updated = { ...allKeywords }; const existing = updated[catName] || []
    if (existing.includes(kw)) { setKeywordInput(''); return }
    updated[catName] = [...existing, kw]; setAllKeywords(updated); saveKeywords(updated); setKeywordInput('')
  }

  const removeKeyword = (catName: string, keyword: string) => {
    const updated = { ...allKeywords }; updated[catName] = (updated[catName] || []).filter(k => k !== keyword)
    if (updated[catName].length === 0) delete updated[catName]; setAllKeywords(updated); saveKeywords(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!formData.name.trim()) return
    if (editingId) {
      const old = categories.find(ct => ct.id === editingId)
      if (old && old.name !== formData.name.trim() && allKeywords[old.name]) {
        const updated = { ...allKeywords }; updated[formData.name.trim()] = updated[old.name]; delete updated[old.name]; setAllKeywords(updated); saveKeywords(updated)
      }
      updateCategory(editingId, formData); setEditingId(null)
    } else { addCategory(formData); setIsAdding(false) }
    setFormData({ name: '', color: '#FF6B6B' })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6" style={{ borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: c.textPrimary, letterSpacing: '-0.02em' }}>카테고리</h2>
          <button onClick={() => { setFormData({ name: '', color: '#FF6B6B' }); setEditingId(null); setIsAdding(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ background: c.accent, color: '#fff' }}>
            <Plus size={14} /> 새 카테고리
          </button>
        </div>
      </div>

      {/* 추가/수정 폼 */}
      {(isAdding || editingId) && (
        <div className="p-6" style={{ borderBottom: `1px solid ${c.border}` }}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="카테고리 이름" autoFocus
                className="flex-1 px-3 py-2 rounded-md text-sm outline-none"
                style={{ background: c.cardHover, border: `1px solid ${c.border}`, color: c.textPrimary }} />
              <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 rounded-md cursor-pointer" style={{ border: `1px solid ${c.border}` }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {defaultColors.map(color => (
                <button key={color} type="button" onClick={() => setFormData({ ...formData, color })}
                  className="w-6 h-6 rounded" style={{ background: color, border: formData.color === color ? `2px solid ${c.textPrimary}` : '2px solid transparent' }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: c.accent, color: '#fff' }}>{editingId ? '수정' : '추가'}</button>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null) }}
                className="px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: c.cardHover, color: c.textSecondary, border: `1px solid ${c.border}` }}>취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 카테고리 목록 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {categories.map(category => {
            const keywords = allKeywords[category.name] || []
            const isExpanded = expandedId === category.id
            return (
              <div key={category.id} className="rounded-lg transition-colors" style={{ border: `1px solid ${c.border}`, opacity: category.deprecated ? 0.5 : 1 }}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ background: category.color }} />
                    <div>
                      <span className="text-sm font-medium" style={{ color: c.textPrimary }}>{category.name}</span>
                      {category.deprecated && <span className="text-[10px] ml-2" style={{ color: c.textMuted }}>중단됨</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setExpandedId(isExpanded ? null : category.id); setKeywordInput('') }}
                      className="p-1.5 rounded transition-colors" style={{ color: isExpanded ? c.accent : c.textMuted }}><Tag size={12} /></button>
                    <button onClick={() => updateCategory(category.id, { ...category, deprecated: !category.deprecated })}
                      className="p-1.5 rounded transition-colors" style={{ color: c.textMuted }}>
                      {category.deprecated ? <ArchiveRestore size={12} /> : <ArchiveX size={12} />}
                    </button>
                    <button onClick={() => { setFormData({ name: category.name, color: category.color }); setEditingId(category.id); setIsAdding(false) }}
                      className="p-1.5 rounded transition-colors" style={{ color: c.textMuted }}><PenLine size={12} /></button>
                    <button onClick={() => { if (confirm('삭제하시겠습니까?')) deleteCategory(category.id) }}
                      className="p-1.5 rounded transition-colors text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-3 pb-3 pt-1" style={{ borderTop: `1px solid ${c.borderLight}` }}>
                        <div className="text-[10px] mb-2" style={{ color: c.textMuted }}>자동 분류 키워드</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {keywords.map(kw => (
                            <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded"
                              style={{ background: category.color + '20', color: c.textSecondary }}>
                              {kw}
                              <button onClick={() => removeKeyword(category.name, kw)}><X size={10} /></button>
                            </span>
                          ))}
                          {keywords.length === 0 && <span className="text-[10px]" style={{ color: c.textMuted }}>키워드 없음</span>}
                        </div>
                        <div className="flex gap-1">
                          <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isComposing) { e.preventDefault(); addKeyword(category.name) } }}
                            onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
                            placeholder="키워드 입력 후 Enter" className="flex-1 px-2 py-1 text-[11px] rounded outline-none"
                            style={{ background: c.cardHover, border: `1px solid ${c.border}`, color: c.textPrimary }} />
                          <button onClick={() => addKeyword(category.name)} disabled={!keywordInput.trim()}
                            className="px-2 py-1 text-[11px] rounded disabled:opacity-30"
                            style={{ background: c.cardHover, color: c.textSecondary }}>추가</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CategoryView
