import { create } from 'zustand'
import { TimerState } from '@shared/types'

interface TimerStore extends TimerState {
  startTimer: (todoId: string) => void
  pauseTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  tick: () => void
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
  }
}))

// 앱 종료 시 타이머 정리
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
  })
}