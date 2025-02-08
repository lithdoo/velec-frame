import { PopMenuListHandler } from '@renderer/widgets/PopMenu'
import { fixReactive } from '@renderer/fix'

export interface ContextMenuEvent {
  clientY: number
  clientX: number
}

class ContextMenu {
  ev: ContextMenuEvent | null = null

  open(list: PopMenuListHandler, ev?: ContextMenuEvent) {
    this.ev = ev ?? null
    this.$emitOpen?.(list)
  }
  $emitOpen?: (list: any) => void

  close() {}
}

export const contextMenu = fixReactive(new ContextMenu())
