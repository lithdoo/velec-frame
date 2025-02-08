const debounceWaitTimeout = new Map<string, any>()

export const debounce = (id: string, call: () => void) => {
  const timeout = debounceWaitTimeout.get(id)
  if (timeout) {
    clearTimeout(timeout)
  }
  debounceWaitTimeout.set(
    id,
    setTimeout(() => {
      call()
      debounceWaitTimeout.delete(id)
    }, 300)
  )
}
