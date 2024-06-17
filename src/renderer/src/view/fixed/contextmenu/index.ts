import { VNode, reactive } from "vue";

interface MenuButton {
    key: string,
    label: string | VNode,
    icon?: string,
    handler: MenuHandler
}

interface MenuHandler {
    onClick: () => void
    onHover: () => void
}

interface MenuDiv {
    type: 'divide'
}

type MenuItem = MenuDiv | MenuButton

class ContextMenu {
    ev: MouseEvent | null = null
    current: MenuItem[] | null = null
    open(list: MenuItem[]) {
        this.current = list
    }
    close() {
        this.current = null
    }
}

export const contextMenu = reactive(new ContextMenu())