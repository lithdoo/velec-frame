import { MenuLayerHandler, MenuListHandler } from "@renderer/components/base/Menu";
import { reactive } from "vue";

class ContextMenu {
    ev: MouseEvent | null = null
    layer = new MenuLayerHandler()
    open(list: MenuListHandler) {
        this.$emitOpen?.(list)
    }
    $emitOpen?: (list: MenuListHandler) =>void

    close(){
        this.layer.clear()
    }
}

export const contextMenu = reactive(new ContextMenu())