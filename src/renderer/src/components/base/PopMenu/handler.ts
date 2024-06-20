import { VNode } from "vue"
import type { Placement, Instance as PopperInstance } from "@popperjs/core"
// type HTMLElement = any

export interface MenuButton {
    type: 'button',
    key: string,
    label: string | VNode,
    icon?: string,
    extra?: string | VNode
    disabled: boolean
    action?: () => void
    $el?: HTMLElement
}

export interface SubMenu {
    type: 'submenu',
    key: string,
    label: string | VNode,
    icon?: string,
    menu?: PopMenuListHandler
    $el?: HTMLElement
}



export interface MenuDivide {
    type: 'divide'
}

export type MenuItem = MenuButton | MenuDivide | SubMenu

export class PopMenuListHandler {
    static create(list: MenuItem[], opiton?: Partial<PopMenuListHandler>): PopMenuListHandler {
        return Object.assign(new PopMenuListHandler(), {
            list,
            ...opiton,
        })
    }


    id: string = Math.random().toString()
    list: MenuItem[] = []
    width?: number
    $close: () => void = () => { }
}

export type MenuRenderOption = {
    target: HTMLElement
    placement: Placement
    popper?: PopperInstance
    container?: HTMLElement
}

export class PopMenuLayerHandler {
    stack: {
        menu: PopMenuListHandler,
        option: MenuRenderOption
    }[] = []
    open(option: MenuRenderOption, menu: PopMenuListHandler) {
        this.stack = [{ menu, option }]
    }
    clear() {
        this.stack = []
    }
    submenu(pid: string, option: MenuRenderOption, menu: PopMenuListHandler) {
        const pIndex = this.stack.findIndex(v => v.menu.id === pid)
        if (pIndex < 0) return
        this.stack = this.stack.filter((_, idx) => idx <= pIndex).concat({
            menu, option
        })
    }
    remove({ current, after }: { current?: string, after?: string }) {
        console.log('remove', { current, after })
        if (current) {
            const index = this.stack.findIndex(v => v.menu.id === current)
            if (index >= 0) {
                this.stack = this.stack.filter((_, idx) => idx < index)
                return
            }
        }
        if (after) {
            const index = this.stack.findIndex(v => v.menu.id === after)
            if (index >= 0) {
                this.stack = this.stack.filter((_, idx) => idx <= index)
                return
            }
        }
    }
    $stopHide?: () => void
}

export class Menu {
    static button(option: {
        key: string,
        label: string | VNode,
        icon?: string,
        disabled?: boolean,
        action?: () => void
    }): MenuButton {
        return {
            disabled: false,
            type: 'button',
            ...option
        }
    }


    static submenu(option: {
        key: string,
        label: string | VNode,
        icon?: string,
        disabled?: boolean,
        menu?: PopMenuListHandler
    }): SubMenu {
        return {
            type: 'submenu',
            ...option
        }
    }
    static divide(): MenuDivide {
        return { type: 'divide' }
    }

}

export const testMenu = PopMenuListHandler.create([
    Menu.button({ icon: 'del', key: '3', label: '撤销', action: () => { alert('打开文件') } }),
    Menu.submenu({
        icon: 'del', key: '12', label: '重做', menu: PopMenuListHandler.create([
            Menu.button({ icon: 'del', key: '3', label: '撤销', action: () => { alert('打开文件') } }),
            Menu.submenu({ icon: 'del', key: '12', label: '重做' }),

            Menu.divide(),
            Menu.button({ key: '1', label: '打开文件', action: () => { alert('打开文件') } }),
            Menu.button({ key: '2', label: '打开文件夹', action: () => { alert('打开文件') } }),
            Menu.divide(),
            Menu.button({ icon: 'del', key: '5', label: '粘贴', action: () => { alert('打开文件') } }),
            Menu.button({ icon: 'del', key: '6', label: '复制', action: () => { alert('打开文件') } }),

        ])
    }),

    Menu.divide(),
    Menu.button({ key: '1', label: '打开文件', action: () => { alert('打开文件') } }),
    Menu.button({ key: '2', label: '打开文件夹', action: () => { alert('打开文件') } }),
    Menu.divide(),
    Menu.button({ icon: 'del', key: '5', label: '粘贴', action: () => { alert('打开文件') } }),
    Menu.button({ icon: 'del', key: '6', label: '复制', action: () => { alert('打开文件') } }),

    Menu.submenu({
        icon: 'del', key: '122', label: '重做', menu: PopMenuListHandler.create([
            Menu.button({ icon: 'del', key: '3', label: '撤销', action: () => { alert('打开文件') } }),
            Menu.submenu({ icon: 'del', key: '12', label: '重做' }),

            Menu.divide(),
            Menu.button({ key: '1', label: '打开文件', action: () => { alert('打开文件') } }),
            Menu.button({ key: '2', label: '打开文件夹', action: () => { alert('打开文件') } }),
            Menu.divide(),
            Menu.button({ icon: 'del', key: '5', label: '粘贴', action: () => { alert('打开文件') } }),
            Menu.button({ icon: 'del', key: '6', label: '复制', action: () => { alert('打开文件') } }),

        ])
    }),
])