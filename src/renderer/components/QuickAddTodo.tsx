import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Plus, ChevronDown } from 'lucide-react'
import { useTodoStore } from '../stores/todoStore'
import { useCategoryStore } from '../stores/categoryStore'

interface QuickAddTodoProps {
  selectedDate: string
  parentId?: string
}

function QuickAddTodo({ selectedDate, parentId }: QuickAddTodoProps) {
  const [title, setTitle] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const { addTodo } = useTodoStore()
  const { categories } = useCategoryStore()

  // 마지막 선택한 카테고리를 기억하기 위한 로컬 스토리지 키
  const LAST_CATEGORY_KEY = 'lastSelectedCategory'

  // 컴포넌트 마운트 시 마지막 선택한 카테고리 불러오기
  React.useEffect(() => {
    const lastCategoryId = localStorage.getItem(LAST_CATEGORY_KEY)
    if (lastCategoryId && categories.some(cat => cat.id === lastCategoryId)) {
      setSelectedCategoryId(lastCategoryId)
    }
  }, [categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTodo({
      title: title.trim(),
      dateCreated: selectedDate,
      parentId,
      category: selectedCategoryId || undefined
    })

    // 마지막 선택한 카테고리 저장
    if (selectedCategoryId) {
      localStorage.setItem(LAST_CATEGORY_KEY, selectedCategoryId)
    }

    setTitle('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // 한국어 조합 중일 때는 실행하지 않음
      if (e.nativeEvent.isComposing || isComposing) {
        return
      }
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setShowCategoryDropdown(false)
  }

  const handleCategoryButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonRect(rect)
    }
    setShowCategoryDropdown(!showCategoryDropdown)
  }

  return (
    <motion.div
      className={`bg-white/50 backdrop-blur-lg rounded-2xl border-2 transition-all ${
        isFocused ? 'border-purple-300 shadow-lg bg-white/70' : 'border-purple-100/30'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-center gap-2">
          {/* 카테고리 선택 */}
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={handleCategoryButtonClick}
              className="flex items-center gap-1 px-2 py-1.5 bg-white/60 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors min-w-20"
            >
              {selectedCategory ? (
                <>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="text-xs font-medium">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-xs text-gray-500">카테고리</span>
              )}
              <ChevronDown size={12} className="text-gray-400" />
            </button>

          </div>

          {/* 할 일 제목 입력 */}
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={parentId ? "하위 할 일을 입력하세요..." : "할 일을 입력하세요..."}
            className="flex-1 px-3 py-2 bg-transparent text-gray-800 placeholder-gray-500 outline-none text-sm"
            autoComplete="off"
          />

          {/* 추가 버튼 */}
          <motion.button
            type="submit"
            disabled={!title.trim()}
            className={`p-2 rounded-lg transition-all ${
              title.trim() 
                ? 'bg-purple-300 text-purple-900 hover:bg-purple-400' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={title.trim() ? { scale: 1.05 } : {}}
            whileTap={title.trim() ? { scale: 0.95 } : {}}
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {isFocused && (
          <motion.div
            className="mt-2 text-xs text-gray-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            💡 Enter를 눌러서 빠르게 추가하세요
          </motion.div>
        )}
      </form>
      
      {/* 카테고리 드롭다운을 포털로 렌더링 */}
      {showCategoryDropdown && buttonRect && createPortal(
        <motion.div
          className="fixed bg-white rounded-xl shadow-lg border-2 border-gray-200 min-w-48"
          style={{ 
            top: buttonRect.bottom + 4,
            left: buttonRect.left,
            zIndex: 9999
          }}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
        >
          <div className="p-2">
            <button
              type="button"
              onClick={() => handleCategorySelect('')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
              <span className="text-sm text-gray-500">카테고리 없음</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>,
        document.body
      )}
    </motion.div>
  )
}

export default QuickAddTodo