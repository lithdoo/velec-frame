import { VNode } from "vue";
import { Menu, MenuButton, MenuDivide } from "../PopMenu";

export interface ToolButton extends MenuButton { }

function isToolButton(obj: any): obj is ToolButton {
    return obj.type === 'button'
}

export interface ToolDivide extends MenuDivide { }

export class ToolBarHandler {
    list: (ToolButton | ToolDivide)[] = []

    constructor(list: (ToolButton | ToolDivide)[] = []) {
        this.list = list
    }

    emit(key: string) {
        const button = this.list
            .filter(v => isToolButton(v))
            .find(v => (v as ToolButton).key === key)
        if (button && isToolButton(button)) {
            button.action?.()
        }
    }
}

export class ToolBarBuilder {
    static create() { return new ToolBarBuilder() }

    list: (ToolButton | ToolDivide)[] = []


    constructor(
        list: (ToolButton | ToolDivide)[] = []
    ) {
        this.list = list
    }


    divide() {
        const item = Menu.divide()
        return new ToolBarBuilder(this.list.concat([item]))
    }

    button(key: string, label: string | VNode, action?: () => void, option: {
        icon?: string,
        disabled?: boolean,
    } = {}) {
        const item = Menu.button({
            key, label, action, ...option
        })
        return new ToolBarBuilder(this.list.concat([item]))
    }


    build() {
        return new ToolBarHandler(this.list)
    }
}