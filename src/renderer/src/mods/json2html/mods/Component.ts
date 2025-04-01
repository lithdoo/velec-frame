import { JthFileMod, JthFileState, JthRenderMod } from "../base"
import { JthRenderModlTemplateTree } from "./Template"
import { JthRenderModValueStore } from "./ValueStore"

export type JthComponent = {
    keyName: string
    rootId: string
}


export type JthComponentData = {
    last_mod_ts: number
    components: JthComponent[]
}

export class JthModComponent extends JthFileMod<JthComponentData> {
    static namespace: "COMPONENT" = 'COMPONENT'
    static blankData(): JthComponentData {
        return {
            last_mod_ts: new Date().getTime(),
            components: []
        }
    }
    readonly namespace: "COMPONENT" = JthModComponent.namespace

    data: JthComponentData = JthModComponent.blankData()

    constructor(file: JthFileState) {
        super(file)
        this.reload()
    }

    reload() {
        this.data = this.getData() ?? JthModComponent.blankData()
    }

    allComponents() {
        return this.data.components
    }

    addComponent(component: JthComponent) {
        if (this.data.components.find(v => v.keyName === component.keyName)) {
            throw new Error(`component named "${component.keyName}" is exist!`)
        }
        if (this.data.components.find(v => v.rootId === component.rootId)) {
            throw new Error(`component rootId "${component.rootId}" is exist!`)
        }

        this.data.components = this.data.components.concat([component])
        this.update()
    }

    delComponent(rootId: string) {
        this.data.components = this.data.components.filter(v => v.rootId !== rootId)
        this.update()
    }

    renameComponent(rootId: string, newName: string) {
        if (this.data.components.find(v => v.keyName === newName)) {
            throw new Error(`component named "${newName}" is exist!`)
        }

        const component = this.data.components.find(v => v.rootId === rootId)
        if (!component) {
            throw new Error(`component rootId "${rootId}" is not found!`)
        }

        this.data.components = this.data.components.map(v => {
            return v == component ? { ...v, keyName: newName } : v
        })

        this.update()
    }

    private update() {
        this.data.last_mod_ts = new Date().getTime()
        this.setData({
            last_mod_ts: this.data.last_mod_ts,
            components: [...this.data.components.map(v => ({ ...v }))]
        })
    }

}

export class JthRenderModComponent extends JthRenderMod<JthComponentData> {

    readonly namespace: "COMPONENT" = JthModComponent.namespace

    constructor(
        public file: JthFileState,
        public template: JthRenderModlTemplateTree,
        public store: JthRenderModValueStore
    ) {
        super(file)
    }

    list() {
        return this.getData()?.components
    }


    renderByJson(rootId: string, json: string) {
        const scope = this.store.createScopeFromjson(json)
        return this.template.renderRoot(rootId, scope)
    }

}