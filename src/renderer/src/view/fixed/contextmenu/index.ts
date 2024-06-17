import { MenuItem, MenuListHandler } from "@renderer/components/base/MenuList";
import { reactive } from "vue";

class ContextMenu {
    ev: MouseEvent | null = null
    current: MenuListHandler | null = null
    open(list: MenuListHandler) {
        this.current = list
    }
    close() {
        this.current = null
    }
}

export const contextMenu = reactive(new ContextMenu())