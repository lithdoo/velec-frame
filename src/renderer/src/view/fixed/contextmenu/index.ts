import { PopMenuListHandler } from "@renderer/components/base/PopMenu";
import { fixReactive } from "@renderer/fix";
class ContextMenu {
    ev: MouseEvent | null = null

    open(list: PopMenuListHandler) {
        this.$emitOpen?.(list)
    }
    $emitOpen?: (list: any) => void

    close() {

    }
}

export const contextMenu = fixReactive(new ContextMenu())
