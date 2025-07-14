import { format, parseISO, isToday, isYesterday, isTomorrow } from 'date-fns'
import { ko } from 'date-fns/locale/ko'

export const formatDateKorean = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return '오늘'
  }
  
  if (isYesterday(dateObj)) {
    return '어제'
  }
  
  if (isTomorrow(dateObj)) {
    return '내일'
  }
  
  return format(dateObj, 'M월 d일 EEEE', { locale: ko })
}

export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}시간 ${mins}분`
  }
  
  return `${mins}분`
}

export const formatTimeShort = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  
  return `${mins}m`
}