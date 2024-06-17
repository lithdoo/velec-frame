import { VNode } from "vue"

export interface MenuButton {
    type: 'button',
    key: string,
    label: string | VNode,
    icon?: string,
    handler?: MenuHandler
}

export interface MenuHandler {
    onClick?: () => void
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
}


export class Menu {
    static click(onClick: () => void): MenuHandler {
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
            handler: onClick ? Menu.click(onClick) : undefined,
        }
    }
    static div(): MenuDivide {
        return { type: 'divide' }
    }
}

export type MenuItem = MenuDivide | MenuButton