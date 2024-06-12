

export class ThemeIconOption {

}

export class ShortcutKey { }

export class MenuItem {
    title: string = ''
    icon: ThemeIconOption = new ThemeIconOption()
    disabled: boolean = false
    shortcut?: ShortcutKey
    children: MenuGroup = new MenuGroup()
    handler?: () => Promise<void>
}

export class MenuDivide {

}


export class MenuGroup {
    list: MenuItem | MenuDivide[] = []
}


export class TitleBarMenuOption {
    list: {
        title: string
        menu: MenuGroup
    }[] = []
}

export class MenuBarOpiton {
    list: {
        title: string
        icon: ThemeIconOption
        disabled: boolean
        tip: {
            title: string,
            content: string
        }
        meun?: MenuGroup
        handler?: () => Promise<void>
    }[] = []
}