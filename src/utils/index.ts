import type { Place } from '@/models'
import dayjs from 'dayjs'

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number = 5000,
) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const sanitizeUrl = (url: string) =>
  new URL(url).hostname.replace('www.', '')

export const getCurrencySymbol = (currencyCode: string) => {
  switch (currencyCode) {
    case 'EUR':
      return '€'
    case 'USD':
      return 'U$'
    case 'BRL':
      return 'R$'
    default:
      return currencyCode
  }
}

export const utcDate = (date: Date) => dayjs(date).utc()
export const isSameDay = (date1?: Date, date2?: Date) =>
  date1 && date2 && utcDate(date1).isSame(utcDate(date2), 'day')

export const getDisplayDistance = (distance: number) => {
  if (distance < 1000) {
    return `${Math.round(distance)} m`
  }
  return `${(distance / 1000).toFixed(1)} km`
}
export const getDisplayDuration = (distance: number) => {
  const hours = Math.floor(distance / 3600)
  const minutes = Math.floor((distance % 3600) / 60)

  if (distance < 60) {
    return `${Math.round(distance)} seg`
  }
  if (!hours) {
    return `${minutes} min`
  }
  return `${hours}hr ${minutes} min`
}
export const getMapsDirectionLink = (
  origin: Place,
  destination: Place,
  travelmode: 'transit' | 'walking' = 'transit',
) =>
  `https://www.google.com/maps/dir/?api=1&origin_place_id=${origin.id}&origin=${origin.name}&destination=${destination.name}&destination_place_id=${destination.id}&travelmode=${travelmode}`
