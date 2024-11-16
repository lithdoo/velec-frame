import { GsExtend, GsScript } from "@renderer/mods/gscript";

// 存储所有的注释信息
class GsLabel implements GsExtend {
    readonly store: Map<string, string> = new Map()
    keyName = "@gs/label"
    save() {
        const data: { [key: string]: string } = {}
        Array.from(Object.entries(this.store))
            .forEach(([key, val]) => {
                data[key] = val
            })
        return data
    }
    load(data: { [key: string]: string }) {
        this.store.clear()
        Array.from(Object.entries(data))
            .forEach(([key, val]) => {
                this.store.set(key, val)
            })
    }
    emitUpdate?: () => void;
}

// 用于节点渲染（位置，大小，zIndex）
export type GsViewData = {
    x: number,
    y: number,
    height: number,
    width: number,
    zIndex: number,
}


class GsView implements GsExtend {
    readonly store: Map<string, GsViewData> = new Map()
    keyName = "@gs/view"
    save() {
        const data: { [key: string]: GsViewData } = {}
        Array.from(Object.entries(this.store))
            .forEach(([key, val]) => {
                data[key] = val
            })
        return data
    }
    load(data: { [key: string]: GsViewData }) {
        this.store.clear()
        Array.from(Object.entries(data))
            .forEach(([key, val]) => {
                this.store.set(key, val)
            })
    }
    emitUpdate?: () => void;
}


class GsCache implements GsExtend {
    readonly store: Map<string, { [key: string]: unknown }> = new Map()
    keyName = "@gs/view"
    save() {
        const data: { [key: string]: { [key: string]: any } } = {}
        Object.entries(this.store)
            .forEach(([key, val]) => {
                data[key] = val
            })
        return data
    }
    load(data: { [key: string]: GsViewData }) {
        this.store.clear()
        Array.from(Object.entries(data))
            .forEach(([key, val]) => {
                this.store.set(key, val)
            })
    }

    get(namespace: string, key: string) {
        const table = this.store.get(namespace)
        return table?.[key]
    }

    set(namespace: string, key: string, value: unknown) {
        const table = this.store.get(namespace) ?? {}
        table[key] = value
        this.store.set(namespace, table)
    }
    emitUpdate?: () => void;
}


export class RunnerScript {

    static finder: Map<string, RunnerScript> = new Map()

    script: GsScript
    view: GsView
    label: GsLabel
    cache: GsCache

    constructor() {
        this.view = new GsView()
        this.label = new GsLabel()
        this.cache = new GsCache()
        this.script = new GsScript([
            this.label, this.view, this.cache
        ])
    }

    getCode() {
        return this.script.state.getCode()
    }

    getViewData(id: string) {
        return this.view.store.get(id)
    }

    getLabel(id: string) {
        return this.label.store.get(id)
    }

    getCache(namespace: string, key: string) {
        return this.cache.get(namespace, key)
    }

    setCache(namespace: string, key: string, value: unknown) {
        return this.cache.set(namespace, key, value)
    }
}