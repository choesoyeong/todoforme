import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Plus, ChevronDown, History, Check } from 'lucide-react'
import { useTodoStore } from '../stores/todoStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useThemeStore } from '../stores/themeStore'

interface QuickAddTodoProps {
  selectedDate: string
  parentId?: string
  onAdded?: () => void
  showCopyButton?: boolean
  onCopyIncomplete?: () => void
}

function QuickAddTodo({ selectedDate, parentId, onAdded, showCopyButton, onCopyIncomplete }: QuickAddTodoProps) {
  const [title, setTitle] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { addTodo } = useTodoStore()
  const { categories } = useCategoryStore()
  const { theme } = useThemeStore()
  const c = theme.colors


  // 카테고리별 연관 키워드 (electron-store에서 로드)
  const [cachedKeywords, setCachedKeywords] = useState<Record<string, string[]>>({})

  React.useEffect(() => {
    const load = async () => {
      try {
        if (window.electronAPI?.storage) {
          const kw = await window.electronAPI.storage.getCategoryKeywords()
          setCachedKeywords(kw || {})
        } else {
          const saved = localStorage.getItem('categoryKeywords')
          if (saved) setCachedKeywords(JSON.parse(saved))
        }
      } catch {}
    }
    load()
  }, [])

  const getKeywords = (): Record<string, string[]> => cachedKeywords

  const getBigrams = (text: string): Set<string> => {
    const s = text.toLowerCase().replace(/\s+/g, '')
    const bigrams = new Set<string>()
    for (let i = 0; i < s.length - 1; i++) bigrams.add(s.slice(i, i + 2))
    return bigrams
  }

  const similarity = (a: string, b: string): number => {
    const bigramsA = getBigrams(a)
    const bigramsB = getBigrams(b)
    if (bigramsA.size === 0 || bigramsB.size === 0) return 0
    let intersection = 0
    bigramsA.forEach(bg => { if (bigramsB.has(bg)) intersection++ })
    return intersection / Math.min(bigramsA.size, bigramsB.size)
  }

  const detectCategoryFromTitle = (text: string): string => {
    const lower = text.toLowerCase()
    const keywords = getKeywords()
    for (const cat of categories) {
      if (cat.deprecated) continue
      if (lower.includes(cat.name.toLowerCase())) return cat.id
    }
    for (const cat of categories) {
      if (cat.deprecated) continue
      const kws = keywords[cat.name]
      if (!kws) continue
      for (const kw of kws) { if (lower.includes(kw.toLowerCase())) return cat.id }
    }
    let bestId = '', bestScore = 0
    for (const cat of categories) {
      if (cat.deprecated) continue
      let score = similarity(text, cat.name)
      const kws = keywords[cat.name] || []
      for (const kw of kws) score = Math.max(score, similarity(text, kw))
      if (score > bestScore) { bestScore = score; bestId = cat.id }
    }
    return bestScore >= 0.3 ? bestId : ''
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const categoryId = selectedCategoryId || detectCategoryFromTitle(title.trim())
    addTodo({ title: title.trim(), dateCreated: selectedDate, parentId, category: categoryId || undefined })
    setTitle('')
    setSelectedCategoryId('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !isComposing) {
      e.preventDefault(); handleSubmit(e as any)
    }
  }

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  const handleCategorySelect = (categoryId: string) => { setSelectedCategoryId(categoryId); setShowCategoryDropdown(false) }
  const handleCategoryButtonClick = () => {
    if (buttonRef.current) setButtonRect(buttonRef.current.getBoundingClientRect())
    setShowCategoryDropdown(!showCategoryDropdown)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-lg transition-all"
        style={{ padding: '8px 12px', background: c.quickAddBg, border: `1px solid ${c.quickAddBorder}` }}
      >
        {/* 카테고리 */}
        <button ref={buttonRef} type="button" onClick={handleCategoryButtonClick}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex-shrink-0"
          style={{ background: c.catSelectBg, border: `1px solid ${c.catSelectBorder}`, color: c.textSecondary }}
        >
          {selectedCategory ? (
            <><div className="w-2 h-2 rounded-full" style={{ background: selectedCategory.color }} />{selectedCategory.name}</>
          ) : (
            <span style={{ color: c.textMuted }}>카테고리</span>
          )}
          <ChevronDown size={10} style={{ color: c.textMuted }} />
        </button>

        <span style={{ color: c.textMuted, fontSize: 14 }}>+</span>
        <input ref={inputRef} type="text" value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)}
          placeholder={parentId ? "하위 할 일..." : "새로운 할 일 추가..."}
          className="flex-1 bg-transparent outline-none text-[13px]"
          style={{ color: c.textPrimary }} autoComplete="off" />
        {showCopyButton && onCopyIncomplete && (
          <button type="button" onClick={onCopyIncomplete} title="이전 미완료 불러오기"
            className="flex-shrink-0 p-1 rounded transition-colors"
            style={{ color: c.textMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = c.textMuted)}
          ><History size={13} /></button>
        )}
        <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: c.borderLight, color: c.textMuted, fontFamily: "'SF Mono','Menlo',monospace" }}>↵</span>
      </form>

      {showCategoryDropdown && buttonRect && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowCategoryDropdown(false)} />
          <motion.div
            className="fixed rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: buttonRect.bottom + 6,
              left: buttonRect.left,
              zIndex: 9999,
              background: c.dropdownBg,
              border: `1px solid ${c.border}`,
              backdropFilter: 'blur(16px)',
              minWidth: 180,
            }}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.12 }}
          >
            {/* 헤더 */}
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${c.borderLight}` }}>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>카테고리 선택</span>
            </div>

            <div className="py-1">
              {/* 없음 */}
              <button type="button" onClick={() => handleCategorySelect('')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left"
                style={{ background: !selectedCategoryId ? c.accentLight : 'transparent', color: !selectedCategoryId ? c.accentText : c.textMuted }}
                onMouseEnter={(e) => { if (selectedCategoryId) e.currentTarget.style.background = c.cardHover }}
                onMouseLeave={(e) => { if (selectedCategoryId) e.currentTarget.style.background = 'transparent' }}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ border: `1.5px dashed ${c.textMuted}` }} />
                <span className="flex-1">없음</span>
                {!selectedCategoryId && <Check size={12} style={{ color: c.accent }} />}
              </button>

              {/* 카테고리들 */}
              {categories.filter(cat => !cat.deprecated).map(cat => {
                const isSelected = selectedCategoryId === cat.id
                return (
                  <button key={cat.id} type="button" onClick={() => handleCategorySelect(cat.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left"
                    style={{ background: isSelected ? c.accentLight : 'transparent', color: isSelected ? c.accentText : c.textPrimary }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = c.cardHover }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="flex-1">{cat.name}</span>
                    {isSelected && <Check size={12} style={{ color: c.accent }} />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>, document.body
      )}
    </div>
  )
}

export default QuickAddTodo
