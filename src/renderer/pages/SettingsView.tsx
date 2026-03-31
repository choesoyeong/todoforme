import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SunMedium, Moon, HardDriveDownload, HardDriveUpload, Trash2, Info, PanelTop } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

function SettingsView() {
  const [storePath, setStorePath] = useState<string>('')
  const [trayEnabled, setTrayEnabled] = useState(true)
  const { themeId, setTheme, theme } = useThemeStore()
  const c = theme.colors

  React.useEffect(() => {
    const init = async () => {
      if (window.electronAPI?.storage) setStorePath(await window.electronAPI.storage.getStorePath())
      if (window.electronAPI?.tray) setTrayEnabled(await window.electronAPI.tray.getEnabled())
    }
    init()
  }, [])

  const handleTrayToggle = async () => {
    const next = !trayEnabled
    setTrayEnabled(next)
    if (window.electronAPI?.tray) await window.electronAPI.tray.setEnabled(next)
  }

  const handleExport = async () => {
    try {
      if (window.electronAPI?.storage) {
        const data = await window.electronAPI.storage.exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url
        a.download = `todoforme-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click(); URL.revokeObjectURL(url)
      }
    } catch { alert('내보내기 실패') }
  }

  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && window.electronAPI?.storage) {
        try {
          const data = JSON.parse(await file.text())
          await window.electronAPI.storage.importData(data)
          alert('가져오기 완료!'); window.location.reload()
        } catch { alert('가져오기 실패') }
      }
    }
    input.click()
  }

  const handleClearAll = async () => {
    if (confirm('모든 데이터를 삭제하시겠습니까?')) {
      try {
        if (window.electronAPI?.storage) { await window.electronAPI.storage.clearAll(); alert('삭제 완료'); window.location.reload() }
      } catch { alert('삭제 실패') }
    }
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: c.textPrimary, letterSpacing: '-0.02em' }}>설정</h2>
      </div>

      <div className="max-w-lg space-y-6">
        {/* 테마 */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>테마</div>
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: themeId === 'light' ? c.accentLight : c.cardHover, border: `1.5px solid ${themeId === 'light' ? c.accent : c.border}`, color: themeId === 'light' ? c.accent : c.textSecondary }}
            ><SunMedium size={16} /> 라이트</button>
            <button onClick={() => setTheme('dark')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: themeId === 'dark' ? c.accentLight : c.cardHover, border: `1.5px solid ${themeId === 'dark' ? c.accent : c.border}`, color: themeId === 'dark' ? c.accent : c.textSecondary }}
            ><Moon size={16} /> 다크</button>
          </div>
        </div>

        {/* 메뉴바 아이콘 */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>메뉴바</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PanelTop size={16} style={{ color: c.textSecondary }} />
              <span className="text-sm" style={{ color: c.textSecondary }}>메뉴바 아이콘</span>
            </div>
            <button onClick={handleTrayToggle}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ background: trayEnabled ? c.accent : (theme.dark ? '#3f3f46' : '#d1d5db') }}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: trayEnabled ? 22 : 2 }} />
            </button>
          </div>
          <p className="text-[11px] mt-2" style={{ color: c.textMuted }}>
            메뉴바에서 오늘 할 일을 빠르게 확인하고 추가할 수 있습니다
          </p>
        </div>

        {/* 데이터 */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>데이터</div>
          <div className="space-y-1">
            <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left" style={{ color: c.textSecondary }}>
              <HardDriveDownload size={14} /> 데이터 내보내기
            </button>
            <button onClick={handleImport} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left" style={{ color: c.textSecondary }}>
              <HardDriveUpload size={14} /> 데이터 가져오기
            </button>
            <button onClick={handleClearAll} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-500 transition-colors text-left">
              <Trash2 size={14} /> 모든 데이터 삭제
            </button>
          </div>
          {storePath && (
            <div className="text-[10px] mt-2 px-3 py-2 rounded" style={{ color: c.textMuted, background: c.cardHover }}>
              저장 위치: {storePath}
            </div>
          )}
        </div>

        {/* 앱 정보 */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: c.textMuted, letterSpacing: '0.05em' }}>앱 정보</div>
          <div className="space-y-1 text-xs" style={{ color: c.textSecondary }}>
            <div>TodoForMe v1.0.0</div>
            <div>Made with ❤️</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
