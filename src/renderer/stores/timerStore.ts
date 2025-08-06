import { create } from 'zustand'
import { TimerState } from '@shared/types'

interface TimerStore extends TimerState {
  startTimer: (todoId: string) => void
  pauseTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  tick: () => void
  handleSystemSuspend: () => void
  handleSystemResume: () => void
}

let timerInterval: NodeJS.Timeout | null = null

export const useTimerStore = create<TimerStore>((set, get) => ({
  activeTodoId: undefined,
  startTime: undefined,
  elapsedTime: 0,

  startTimer: (todoId) => {
    // 기존 타이머가 있다면 정지
    if (timerInterval) {
      clearInterval(timerInterval)
    }

    const now = Date.now()
    set({
      activeTodoId: todoId,
      startTime: now,
      elapsedTime: 0
    })

    // 1초마다 경과 시간 업데이트
    timerInterval = setInterval(() => {
      get().tick()
    }, 1000)
  },

  pauseTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    set({
      activeTodoId: undefined,
      startTime: undefined
    })
  },

  stopTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    set({
      activeTodoId: undefined,
      startTime: undefined,
      elapsedTime: 0
    })
  },

  resetTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    set({
      activeTodoId: undefined,
      startTime: undefined,
      elapsedTime: 0
    })
  },

  tick: () => {
    const { startTime } = get()
    if (startTime) {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      set({ elapsedTime: elapsed })
    }
  },

  handleSystemSuspend: () => {
    // 시스템 절전 시 타이머 일시정지
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    // 현재 경과 시간을 한 번 더 업데이트
    get().tick()
  },

  handleSystemResume: () => {
    // 시스템 깨우기 시 타이머 재개 (활성 타이머가 있었다면)
    const { activeTodoId, startTime } = get()
    if (activeTodoId && startTime && !timerInterval) {
      // 새로운 시작 시간 설정 (절전 전 경과 시간 고려)
      const now = Date.now()
      const newStartTime = now - (get().elapsedTime * 1000)
      set({ startTime: newStartTime })
      
      // 타이머 재시작
      timerInterval = setInterval(() => {
        get().tick()
      }, 1000)
    }
  }
}))

// 앱 종료 시 타이머 정리 및 시스템 이벤트 리스너 등록
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
  })

  // 시스템 절전/깨우기 이벤트 리스너
  window.electronAPI?.onSystemSuspend?.(() => {
    useTimerStore.getState().handleSystemSuspend()
  })

  window.electronAPI?.onSystemResume?.(() => {
    useTimerStore.getState().handleSystemResume()
  })
}