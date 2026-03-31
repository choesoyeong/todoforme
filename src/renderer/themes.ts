export interface Theme {
  id: string
  name: string
  emoji: string
  dark: boolean
  colors: {
    bg: string
    sidebarBg: string
    sidebarBorder: string
    sidebarHover: string
    sidebarActiveBg: string
    sidebarActiveText: string
    border: string
    borderLight: string
    cardBg: string
    cardHover: string
    accent: string
    accentLight: string
    accentText: string
    green: string
    greenDim: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    inputBg: string
    // quick add
    quickAddBg: string
    quickAddBorder: string
    quickAddFocusBorder: string
    quickAddFocusShadow: string
    // buttons
    btnBg: string
    btnBorder: string
    btnHoverBg: string
    // category select
    catSelectBg: string
    catSelectBorder: string
    // completed todo
    completedText: string
    completedLine: string
    // dropdown
    dropdownBg: string
    // section
    sectionLabelColor: string
    // scrollbar
    scrollThumb: string
    scrollThumbHover: string
  }
}

export const themes: Theme[] = [
  {
    id: 'light',
    name: '라이트',
    emoji: '☀️',
    dark: false,
    colors: {
      bg: '#fafafa',
      sidebarBg: '#ffffff',
      sidebarBorder: '#e5e7eb',
      sidebarHover: '#f3f4f6',
      sidebarActiveBg: '#eef2ff',
      sidebarActiveText: '#4338ca',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      cardBg: '#ffffff',
      cardHover: '#f9fafb',
      accent: '#6366f1',
      accentLight: '#eef2ff',
      accentText: '#4338ca',
      green: '#22c55e',
      greenDim: '#dcfce7',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      inputBg: 'transparent',
      quickAddBg: '#ffffff',
      quickAddBorder: '#e5e7eb',
      quickAddFocusBorder: '#6366f1',
      quickAddFocusShadow: 'rgba(99,102,241,0.08)',
      btnBg: '#ffffff',
      btnBorder: '#e5e7eb',
      btnHoverBg: '#f9fafb',
      catSelectBg: '#ffffff',
      catSelectBorder: '#e5e7eb',
      completedText: '#9ca3af',
      completedLine: '#d1d5db',
      dropdownBg: 'rgba(255,255,255,0.95)',
      sectionLabelColor: '#9ca3af',
      scrollThumb: '#d1d5db',
      scrollThumbHover: '#9ca3af',
    }
  },
  {
    id: 'dark',
    name: '다크',
    emoji: '🌙',
    dark: true,
    colors: {
      bg: '#0a0a0b',
      sidebarBg: '#111113',
      sidebarBorder: '#2a2a2d',
      sidebarHover: '#1c1c1f',
      sidebarActiveBg: 'rgba(99,102,241,0.15)',
      sidebarActiveText: '#a5b4fc',
      border: '#2a2a2d',
      borderLight: '#1c1c1f',
      cardBg: '#141416',
      cardHover: '#1c1c1f',
      accent: '#818cf8',
      accentLight: 'rgba(99,102,241,0.15)',
      accentText: '#a5b4fc',
      green: '#22c55e',
      greenDim: 'rgba(34,197,94,0.15)',
      textPrimary: '#e4e4e7',
      textSecondary: '#a1a1aa',
      textMuted: '#52525b',
      inputBg: 'transparent',
      quickAddBg: '#141416',
      quickAddBorder: '#2a2a2d',
      quickAddFocusBorder: '#818cf8',
      quickAddFocusShadow: 'rgba(129,140,248,0.1)',
      btnBg: '#1c1c1f',
      btnBorder: '#2a2a2d',
      btnHoverBg: '#27272a',
      catSelectBg: '#1c1c1f',
      catSelectBorder: '#2a2a2d',
      completedText: '#52525b',
      completedLine: '#3f3f46',
      dropdownBg: 'rgba(20,20,22,0.95)',
      sectionLabelColor: '#52525b',
      scrollThumb: '#3f3f46',
      scrollThumbHover: '#52525b',
    }
  },
]

export const getTheme = (id: string): Theme => {
  return themes.find(t => t.id === id) || themes[0]
}
