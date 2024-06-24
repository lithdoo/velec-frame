
export interface FlatTreeItem {
    id: string, pid?: string, isLeaf?: boolean, loaded?: boolean
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

    loadingId: string | null = null
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
        const result = this.onItemSelect?.(item)

        if (result === false) return

        if (this.autoSelect === 'single') {
            this.selectedKeys = [item.id]
        } else if (this.autoSelect === 'multi') {
            this.selectedKeys = this.selectedKeys.concat([item.id])
        }
    }
    $emitHover(item: T) {
        this.onItemHover?.(item)
    }
    $emitLeave(item: T) {
        this.onItemLeave?.(item)
    }
    $emitContextMenu(item: T) {
        this.onItemContextMenu?.(item)
    }
    onItemSelect: (item: T) => boolean | void = () => { }
    onItemLeave: (item: T) => boolean | void = () => { }
    onItemHover: (item: T) => boolean | void = () => { }
    onItemContextMenu: (item: T) => boolean | void = () => { }


    async open(id) {
        if (this.loadingId) return
        const node = this.data.find(v => v.id == id)
        if (!node || node.isLeaf) return

        if (node.loaded === false) {
            this.loadingId = node.id
            try {
                node.loaded = await this.onload?.(node)
                if(node.loaded){
                    this.openKeys = this.openKeys.filter(v => v !== id).concat([id])
                }
            } finally {
                this.loadingId = null
            }

        } else {
            this.openKeys = this.openKeys.filter(v => v !== id).concat([id])
        }
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

    onload?: (id: T) => Promise<boolean>
}