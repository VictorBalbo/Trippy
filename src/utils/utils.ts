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
