import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Palette, Download, Upload, Trash2, Info } from 'lucide-react'

function SettingsView() {
  const [storePath, setStorePath] = useState<string>('')

  React.useEffect(() => {
    const getStorePath = async () => {
      if (window.electronAPI?.storage) {
        const path = await window.electronAPI.storage.getStorePath()
        setStorePath(path)
      }
    }
    getStorePath()
  }, [])

  const handleExport = async () => {
    try {
      if (window.electronAPI?.storage) {
        const data = await window.electronAPI.storage.exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `todoforme-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('데이터 내보내기에 실패했습니다.')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && window.electronAPI?.storage) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          await window.electronAPI.storage.importData(data)
          alert('데이터를 성공적으로 가져왔습니다!')
          window.location.reload()
        } catch (error) {
          console.error('Import failed:', error)
          alert('데이터 가져오기에 실패했습니다.')
        }
      }
    }
    input.click()
  }

  const handleClearAll = async () => {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        if (window.electronAPI?.storage) {
          await window.electronAPI.storage.clearAll()
          alert('모든 데이터가 삭제되었습니다.')
          window.location.reload()
        }
      } catch (error) {
        console.error('Clear failed:', error)
        alert('데이터 삭제에 실패했습니다.')
      }
    }
  }

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ⚙️ 설정
        </h2>
        <p className="text-gray-600">앱을 내 스타일로 꾸며보세요</p>
      </div>

      <div className="space-y-4">
        {/* 테마 설정 */}
        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-2xl">
              <Palette className="text-pink-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">테마</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button className="p-3 bg-gradient-to-br from-peach to-rose rounded-2xl border-2 border-pink-300">
              <div className="text-sm font-medium">🌸 핑크</div>
            </button>
            <button className="p-3 bg-gradient-to-br from-sky to-blue-200 rounded-2xl border-2 border-transparent hover:border-blue-300">
              <div className="text-sm font-medium">💙 블루</div>
            </button>
            <button className="p-3 bg-gradient-to-br from-mint to-green-200 rounded-2xl border-2 border-transparent hover:border-green-300">
              <div className="text-sm font-medium">💚 그린</div>
            </button>
          </div>
        </motion.div>

        {/* 알림 설정 */}
        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-2xl">
              <Bell className="text-blue-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">알림</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">작업 완료 알림</span>
              <button className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">휴식 시간 알림</span>
              <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 데이터 관리 */}
        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-2xl">
              <Download className="text-green-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">데이터</h3>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/30 transition-colors"
            >
              <Download size={18} />
              📥 데이터 내보내기
            </button>
            <button 
              onClick={handleImport}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/30 transition-colors"
            >
              <Upload size={18} />
              📤 데이터 가져오기
            </button>
            <button 
              onClick={handleClearAll}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-100 text-red-600 transition-colors"
            >
              <Trash2 size={18} />
              🗑️ 모든 데이터 삭제
            </button>
            {storePath && (
              <div className="text-xs text-gray-500 mt-3 p-3 bg-gray-50 rounded-xl">
                💾 저장 위치: {storePath}
              </div>
            )}
          </div>
        </motion.div>

        {/* 앱 정보 */}
        <motion.div
          className="bg-white/40 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-2xl">
              <Info className="text-gray-600" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">앱 정보</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div>TodoForMe v1.0.0</div>
            <div>🍎 맥용 귀여운 투두 앱</div>
            <div>Made with ❤️</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsView