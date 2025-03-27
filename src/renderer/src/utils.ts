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


export class Snapshot<T> {
    old: T[] = []
    idx: number = -1

    constructor(public lastest: T) { }

    current() {
        const old = this.old[this.idx]
        return old ?? this.lastest
    }

    update(updateFn: (current: T) => T | void) {
        const old = this.old[this.idx]
        if (!old) {
            this.old = [JSON.parse(JSON.stringify(this.lastest))].concat(this.old)
            const res = updateFn(this.lastest)
            this.lastest = res ?? this.lastest
        } else {
            this.old = this.old.filter((_, i) => i <= this.idx)
            this.idx = -1
            this.lastest = old
            const res = updateFn(this.lastest)
            this.lastest = res ?? this.lastest
        }
    }

    init(val:T){
      this.old = []
      this.idx = -1
      this.lastest = val
    }
}