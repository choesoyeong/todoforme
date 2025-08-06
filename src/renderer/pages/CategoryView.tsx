import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit3, Trash2, Palette, Archive, ArchiveRestore } from 'lucide-react'
import { Category } from '@shared/types'
import { useCategoryStore } from '../stores/categoryStore'

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FFB347', '#FF69B4', '#87CEEB', '#98FB98',
  '#F0E68C', '#FFA07A', '#20B2AA', '#BA55D3', '#FF7F50'
]

function CategoryView() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#FF6B6B' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      updateCategory(editingId, formData)
      setEditingId(null)
    } else {
      addCategory(formData)
      setIsAdding(false)
    }
    
    setFormData({ name: '', color: '#FF6B6B' })
  }

  const startEdit = (category: Category) => {
    setFormData({ name: category.name, color: category.color })
    setEditingId(category.id)
    setIsAdding(false)
  }

  const startAdd = () => {
    setFormData({ name: '', color: '#FF6B6B' })
    setEditingId(null)
    setIsAdding(true)
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', color: '#FF6B6B' })
  }

  const handleDelete = (id: string) => {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
      deleteCategory(id)
    }
  }

  const handleToggleDeprecated = (category: Category) => {
    updateCategory(category.id, { 
      ...category, 
      deprecated: !category.deprecated 
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🏷️ 카테고리 관리</h2>
            <p className="text-gray-600 mt-1">투두에 사용할 카테고리를 관리하세요</p>
          </div>
          <motion.button
            onClick={startAdd}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            새 카테고리
          </motion.button>
        </div>
      </div>

      {/* 카테고리 폼 */}
      {(isAdding || editingId) && (
        <motion.div
          className="p-6 bg-white/50 border-b border-white/20"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="카테고리 이름을 입력하세요"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: formData.color }}
                  />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* 미리 정의된 색상들 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                빠른 색상 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 카테고리 목록 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className={`backdrop-blur-lg rounded-2xl border-2 p-4 hover:shadow-lg transition-all ${
                  category.deprecated 
                    ? 'bg-gray-100/60 border-gray-200/50 opacity-70' 
                    : 'bg-white/60 border-white/30'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex flex-col">
                      <span className={`font-medium ${category.deprecated ? 'text-gray-500' : 'text-gray-800'}`}>
                        {category.name}
                      </span>
                      {category.deprecated && (
                        <span className="text-xs text-gray-400">사용 중단됨</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleDeprecated(category)}
                      className={`p-2 rounded-lg transition-colors ${
                        category.deprecated
                          ? 'hover:bg-green-100 text-green-600'
                          : 'hover:bg-orange-100 text-orange-600'
                      }`}
                      title={category.deprecated ? '사용 재개' : '사용 중단'}
                    >
                      {category.deprecated ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    </button>
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-600"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {categories.length === 0 && !isAdding && (
          <motion.div
            className="flex flex-col items-center justify-center h-64 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              카테고리가 없어요!
            </h3>
            <p className="text-gray-500 mb-4">
              투두를 분류할 카테고리를 추가해보세요
            </p>
            <button
              onClick={startAdd}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              첫 카테고리 만들기
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CategoryView