import { isBaseNodeData } from "./base"
import { ErdStateKey, NodeData, NodeShapeKey, RawData, ErdStateExtend } from "./state"


interface VFKey {
    id: string,
    fromTableName: string,
    toTableName: string,
    fields: {
        from: string,
        to: string,
    }[]
}

/**
 * Sqlite 拓展数据，为其增加以下功能：
 * 1. 虚拟外键（不产生实际约束，但是可以根据此过滤脏数据）
 * 2. 注释（表，字段，虚拟外键）
 */
export class LabelState extends ErdStateExtend<{}, { labels: Record<string, string> }> {
    private labels: Record<string, string> = {}
    readonly key = ErdStateKey.Label

    save() {
        const { labels } = this
        return { labels }
    }

    load(cache: { labels: Record<string, string> } | null, _: RawData,) {
        if (cache) {
            this.labels = cache.labels
        }
    }


    getNodes(res: NodeData[]): NodeData<NodeShapeKey, any>[] {
        res.forEach(v => {
            if (!isBaseNodeData(v)) return
            v.meta.label = this.get(v.meta.name)
            v.meta.fieldList.forEach(field => {
                const key = `${v.meta.name}.${field.name}`
                field.label = this.get(key)
            })
        })
        return res
    }



    update(labels: Record<string, string>) {
        this.labels = {
            ...this.labels,
            ...labels
        }
    }

    get(name: string) {
        return this.labels[name] ?? ''
    }
}


export class VFkeyState extends ErdStateExtend<{}, { vfkeys: VFKey[] }> {
    readonly key = ErdStateKey.VFkey
    vfkeys: VFKey[] = []

    save() {
        const { vfkeys } = this
        return { vfkeys }
    }

    load(cache: { vfkeys: VFKey[] } | null, _: RawData,) {
        if (cache) {
            this.vfkeys = cache.vfkeys
        }
    }



}