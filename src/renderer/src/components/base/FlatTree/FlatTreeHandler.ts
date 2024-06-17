
export interface FlatTreeItem {
    id: string, pid?: string, isLeaf?: boolean
}

export class FlatTreeHandler<T extends FlatTreeItem> {
    data: T[] = []
    isLeaf: (item: T) => boolean = (item) => !!item.isLeaf
    autoSelect: 'single' | 'multi' | null = 'single'

    virtual: {
        itemSize: number
        xScroll: boolean
    } = {
            itemSize: 28,
            xScroll: false,
        }

    vScroll = true

    openKeys: string[] = []
    selectedKeys: string[] = []

    loadTreeData(
        tree: any[],
        getId: (data: T) => string,
        getIsLeaf: (data: any) => boolean = (data) => !data.children,
        getChildren: (data: any) => any[] = data => data.children
    ) {
        if (!tree) return
        const newData: T[] = []
        const step = (item, pid?: string) => {
            if (!item) return
            const id = getId(item)
            const isLeaf = getIsLeaf(item)
            const children = getChildren(item)
            newData.push({ id, pid, ...item, isLeaf })

            if (!isLeaf) {
                (children || []).forEach(element => {
                    step(element, id)
                });
            }
        }
        tree.forEach(item => step(item))
        this.data = newData
    }

    $emitSelect(item: T) {
        const result = this.onSelectItem?.(item)

        if (result === false) return

        if (this.autoSelect === 'single') {
            this.selectedKeys = [item.id]
        } else if (this.autoSelect === 'multi') {
            this.selectedKeys = this.selectedKeys.concat([item.id])
        }
    }

    $emitHover(item: T) {
        this.onHoverItem?.(item)
    }
    $emitLeave(item: T) {
        this.onLeaveItem?.(item)
    }

    onSelectItem: (item: T) => boolean | void = () => { }
    onLeaveItem: (item: T) => boolean | void = () => { }
    onHoverItem: (item: T) => boolean | void = () => { }


    open(id) {
        this.openKeys = this.openKeys.filter(v => v !== id).concat([id])
    }

    close(id) {
        this.openKeys = this.openKeys.filter(v => v !== id)
    }

    toggle(id) {
        if (this.openKeys.findIndex((v) => v === id) >= 0) {
            this.close(id)
        } else {
            this.open(id)
        }
    }
}