import { Instance as PopperInstance } from "@popperjs/core"
import { VNode, reactive } from "vue"
import { VxIcon } from "../VxIcon"

export interface MenuButton {
    type: 'button',
    key: string,
    label: string | VNode,
    icon?: string,
    extra?: string | VNode
    action?: MenuAction
    $el?: HTMLElement
}

export interface MenuAction {
    onClick?: (option: { menu: MenuListHandler }) => void | boolean
    onHover?: () => void
}


export interface MenuDivide {
    type: 'divide'
}


export class MenuListHandler {
    static create(list: MenuItem[], opiton?: Partial<MenuListHandler>): MenuListHandler {
        return Object.assign(new MenuListHandler(), {
            list,
            ...opiton,
        })
    }
    list: MenuItem[] = []
    width?: number
    layer: MenuLayerHandler | null = null
    $close: () => void = () => { }
}

export interface MenuPositon {
    target: HTMLElement
    place: 'right-start' | 'left-start'
}

export type MenuRenderOption = {
    key: string
    pos: MenuPositon
    handler: MenuListHandler
    popper?: PopperInstance
    container?: HTMLElement
}
export class MenuLayerHandler {
    stack: MenuRenderOption[] = []
    open(pos: MenuPositon, handler: MenuListHandler) {
        const target: MenuRenderOption = reactive({ pos, handler, key: Math.random().toString() })
        this.stack = this.stack.concat([target])
        this.stack.forEach(v => v.handler.layer = this)
        this.$apply?.(target)
    }
    clear() {
        this.stack.forEach(v => v.handler.layer = null)
        this.stack = []
    }

    $apply?: (renderOption: MenuRenderOption) => void
}
export type MenuItem = MenuDivide | MenuButton


export class Menu {
    static click(onClick: () => void): MenuAction {
        return { onClick }
    }
    static button(option: {
        key: string,
        label: string | VNode,
        icon?: string,
        onClick?: () => void
    }): MenuButton {
        const { onClick, ...extra } = option
        return {
            ...extra,
            type: 'button',
            action: onClick ? Menu.click(onClick) : undefined,
        }
    }
    static divide(): MenuDivide {
        return { type: 'divide' }
    }

    static subMenu(option: {
        key: string,
        label: string | VNode,
        icon?: string,
        subMenu: () => MenuListHandler
    },) {
        const { subMenu, ...extra } = option
        return new SubMenuActionButton(extra, subMenu)
    }
}


export class SubMenuActionButton implements MenuButton {
    type: 'button' = 'button'
    key: string
    label: string | VNode
    icon?: string
    action?: MenuAction
    $el?: HTMLElement
    extra: VNode = <VxIcon name="del"></VxIcon>
    subMenu: () => MenuListHandler

    constructor(option: Partial<MenuButton>, subMenu: () => MenuListHandler) {
        this.key = option.key ?? Math.random().toString()
        this.label = option.label ?? ''
        this.icon = option.icon
        this.subMenu = subMenu
        this.action = {
            onClick: (option) => { this.open(option.menu) }
        }

    }

    open(menu: MenuListHandler) {
        if (!menu.layer) return alert(1)
        if (!this.$el) return alert(1)
        menu.layer.open({ target: this.$el, place: 'right-start' }, this.subMenu())
    }
}