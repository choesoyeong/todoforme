import { create } from 'zustand'
import { Theme, getTheme } from '../themes'

interface ThemeStore {
  themeId: string
  theme: Theme
  setTheme: (id: string) => void
  loadTheme: () => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themeId: 'light',
  theme: getTheme('light'),

  setTheme: (id) => {
    const theme = getTheme(id)
    set({ themeId: id, theme })
    if (window.electronAPI?.storage) {
      window.electronAPI.storage.setSetting('theme', id)
    } else {
      localStorage.setItem('theme', id)
    }
  },

  loadTheme: async () => {
    try {
      let id = 'light'
      if (window.electronAPI?.storage) {
        const settings = await window.electronAPI.storage.getSettings()
        id = settings?.theme || 'light'
      } else {
        id = localStorage.getItem('theme') || 'light'
      }
      // 이전 테마 ID를 light/dark로 매핑
      if (id === 'midnight') id = 'dark'
      if (id !== 'light' && id !== 'dark') id = 'light'
      const theme = getTheme(id)
      set({ themeId: id, theme })
    } catch {
      // 기본 테마 유지
    }
  }
}))

if (typeof window !== 'undefined') {
  useThemeStore.getState().loadTheme()
}
