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
