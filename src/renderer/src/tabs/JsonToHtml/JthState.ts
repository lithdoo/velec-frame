import { FileControl } from "@renderer/mods/fileUtils"
import { nanoid } from "nanoid"

export enum JthTemplateType {
    Apply = "Apply",
    Element = "Element",
    Text = "Text",
    Cond = 'Cond',
    Loop = 'Loop',
    Prop = 'Prop',
    Root = 'Root',
}

export type JthTemplateBase<
    T extends JthTemplateType
> = {
    id: string,
    type: T,
    isGroup: boolean,
}

export type JthTemplateGroup<T extends JthTemplateType> = JthTemplateBase<T> & {
    type: T,
    isGroup: true,
}

export type ValueField = {
    name: string, value: ValueGenerator
}


export type ValueGenerator = {
    type: 'static', json: string
} | {
    type: 'dynamic:script', script: string
} | {
    type: 'dynamic:getter', getter: string[]
}

export type JthTemplateElement = JthTemplateGroup<JthTemplateType.Element> & {
    tagName: string,
    attrs: ValueField[]
}


export type JthTemplateRoot = JthTemplateGroup<JthTemplateType.Root> & {
    pid: undefined
}


export type JthTemplateText = JthTemplateBase<JthTemplateType.Text> & {
    text: ValueGenerator,
    isGroup: false,
}

export type JthTemplateCond = JthTemplateGroup<JthTemplateType.Cond> & {
    test: ValueGenerator,
}

export type JthTemplateApply = JthTemplateBase<JthTemplateType.Apply> & {
    component: ValueGenerator,
    isGroup: false,
    data: ValueField[]
}

export type JthTemplateLoop = JthTemplateGroup<JthTemplateType.Loop> & {
    loopValue: ValueGenerator,
    valueField: string,
    indexField: string,
}

export type JthTemplateProp = JthTemplateGroup<JthTemplateType.Prop> & {
    data: ValueField[]
}

export type JthTemplate = JthTemplateProp
    | JthTemplateLoop
    | JthTemplateApply
    | JthTemplateCond
    | JthTemplateText
    | JthTemplateElement
    | JthTemplateRoot

export type JthComponent = { keyName: string, rootId: string }

export type JthFile = {
    store: { keyName: string, value: any }[],
    template: {
        data: { [key: string]: JthTemplate },
        children: { [key: string]: string[] }
    }
    components: JthComponent[]
    render: { template: string, data: { [key: string]: ValueGenerator } }[]
}

export class JthState {
    static blank() {
        const blankFile: JthFile = { store: [], components: [], template: { data: {}, children: {} }, render: [] }
        return new JthState(blankFile)
    }

    constructor(
        public file: JthFile
    ) { }

    
    reload(file: JthFile) {
        this.file = file
    }
}


export class JthStateModel {
    component: JthComponentHandler
    constructor(
        public state: JthState,
    ) {
        this.component = new JthComponentHandler(this.state)
    }
}



export class JthComponentHandler {
    static staticValue(json: string): ValueGenerator {
        return { type: 'static', json }
    }

    static isGroup(template: JthTemplateBase<any> | JthTemplateGroup<any>): template is JthTemplateGroup<any> {
        return !!(template as JthTemplateGroup<any>).isGroup
    }

    static createBlankNode(type: JthTemplateType) {
        let node: JthTemplate | null = null
        if (type === JthTemplateType.Root) {
            node = {
                id: nanoid(),
                type,
                isGroup: true,
                pid: undefined
            }
        } else if (type === JthTemplateType.Text) {
            node = {
                id: nanoid(),
                type,
                isGroup: false,
                text: JthComponentHandler.staticValue('""')
            }
        } else if (type === JthTemplateType.Element) {
            node = {
                id: nanoid(),
                type,
                isGroup: true,
                tagName: 'div',
                attrs: []
            }
        } else if (type === JthTemplateType.Apply) {
            node = {
                id: nanoid(),
                type,
                isGroup: false,
                data: [],
                component: JthComponentHandler.staticValue("null"),
            }
        } else if (type === JthTemplateType.Loop) {
            node = {
                id: nanoid(),
                type,
                isGroup: true,
                loopValue: JthComponentHandler.staticValue("[]"),
                valueField: 'value',
                indexField: 'index'
            }

        } else if (type === JthTemplateType.Prop) {
            node = {
                id: nanoid(),
                type,
                isGroup: true,
                data: []
            }

        } else if (type === JthTemplateType.Cond) {
            node = {
                id: nanoid(),
                type,
                isGroup: true,
                test: JthComponentHandler.staticValue("true")
            }
        }

        if (!node) {
            throw new Error('Unknown template type')
        }

        else return node
    }

    constructor(public state: JthState) { }

    newComponent(keyName: string) {
        const root: JthTemplateRoot = {
            id: nanoid(),
            type: JthTemplateType.Root,
            isGroup: true,
            pid: undefined
        }

        this.state.file.components.push({ keyName, rootId: root.id })
        this.state.file.template.data[root.id] = root
        this.state.file.template.children[root.id] = []
    }

    removeComponent(keyName: string) {
        const component = this.state.file.components.find(v => v.keyName === keyName)
        if (!component) return
        this.state.file.components = this.state.file.components.filter(v => v.keyName !== keyName)
        this.removeTemplateNode(component.rootId)
    }

    insertTemplateNode(
        template: JthTemplate,
        pos: { parent?: string, before?: string, after?: string } = {}
    ) {
        const parent = pos.parent ? this.templateData(pos.parent) : undefined
        const before = pos.before ? this.templateData(pos.before) : undefined
        const after = pos.after ? this.templateData(pos.after) : undefined
        if (before) {
            let hasInsert = false
            this.allChildren().forEach(([id, children]) => {
                if (hasInsert) return
                if (children.findIndex(v => v === before.id) < 0) return
                const newChildren = children.flatMap(id => id === before.id ? [template.id, id] : [id])
                this.templateChildren(id, newChildren)
                hasInsert = true
            })
            if (hasInsert) {
                this.templateData(template.id, template)
            }
        } else if (after) {
            let hasInsert = false
            this.allChildren().forEach(([id, children]) => {
                if (hasInsert) return
                if (children.findIndex(v => v === after.id) < 0) return
                const newChildren = children.flatMap(id => id === after.id ? [id, template.id] : [id])
                this.templateChildren(id, newChildren)
                hasInsert = true
            })
            if (hasInsert) {
                this.templateData(template.id, template)
            }
        } else if (parent) {
            let hasInsert = false
            this.allChildren().forEach(([id, children]) => {
                if (hasInsert) return
                if (id !== parent.id) return
                this.templateChildren(id, [...children, template.id])
                hasInsert = true
            })
            if (hasInsert) {
                this.templateData(template.id, template)
            }
        }
    }

    removeTemplateNode(templateId: string) {
        if (this.templateData(templateId)) {
            this.templateData(templateId, null)
        }
        if (this.templateChildren(templateId)) {
            this.templateChildren(templateId, null)
        }

        Array.from(Object.entries(this.state.file.template.children))
            .forEach(([id, children]) => {
                if (children.findIndex(v => v === templateId) < 0) return
                this.state.file.template.children[id] = children.filter(v => v !== templateId)
            })
    }

    replaceTemplateNode(oldId: string, newone: JthTemplate) {
        const oldData = this.templateData(oldId)
        if (!oldData.isGroup || !newone.isGroup) {
            this.insertTemplateNode(newone, { after: oldId })
            this.removeTemplateNode(oldId)
        } else {
            this.insertTemplateNode(newone, { after: oldId })
            const children = this.templateChildren(oldId)
            this.templateChildren(newone.id, children)
            this.templateChildren(oldId, [])
            this.removeTemplateNode(oldId)
        }

    }


    templateData(id: string, setData?: null | JthTemplate) {
        if (typeof setData !== 'undefined' && !setData) {
            delete this.state.file.template.data[id]
        } else if (typeof setData !== 'undefined') {
            this.state.file.template.data[id] = setData
            if (setData.isGroup && !this.state.file.template.children[id]) {
                this.templateChildren(id, [])
            }
        }
        return this.state.file.template.data[id]
    }


    templateChildren(id: string, setData?: string[] | null) {
        if (typeof setData !== 'undefined' && !setData) {
            delete this.state.file.template.children[id]
        } else if (typeof setData !== 'undefined') {
            this.state.file.template.children[id] = setData
        }
        return this.state.file.template.children[id]
    }


    allChildren() {
        return Array.from(Object.entries(this.state.file.template.children))
    }

    findParentId(templateId: string) {
        const todo = this.allChildren()

        while (todo.length) {
            const current = todo.shift()
            if (!current) continue
            const [pid, children] = current
            if (children.findIndex(id => id === templateId) < 0) continue
            return pid
        }

        return null
    }

    allComponents() {
        return this.state.file.components
    }

    getTemplateTreeByParentId(rootId: string) {
        const tree: {
            id: string, pid: string, templateData: JthTemplate
        }[] = []

        const todo = this.templateChildren(rootId).map(id => ({ id, pid: rootId }))

        while (todo.length) {
            const current = todo.shift()
            if (!current) continue
            const { id, pid } = current
            const templateData = this.templateData(id)
            if (!templateData) continue

            tree.push({ id, pid, templateData })
            const children = this.templateChildren(id)
                ?.map(cid => ({ id: cid, pid: id }))
                ?? []
            if (children.length) todo.push(...children)
        }
        return tree
    }
}