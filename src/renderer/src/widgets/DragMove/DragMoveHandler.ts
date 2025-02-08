export class DragMoveHandler<T> {
  key: string = Math.random().toString(36).substring(7)
  current: T | null = null

  constructor(
    public dragable: (item: T) => void,
    public receiver: (item: T) => void
  ) {}

  bindDragegable(item: HTMLElement, value: T) {
    item.ondragstart = (e) => {
      e.dataTransfer?.setData(this.key, JSON.stringify(value))
      this.current = value
      this.dragable(value)
    }
  }

  bindReceiver(_item: HTMLElement) {}
}
