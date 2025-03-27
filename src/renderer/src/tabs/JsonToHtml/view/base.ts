export * from '@renderer/mods/json2html/base'
export * from '@renderer/mods/json2html/mods'
// export { JthStateController, JthState } from '@renderer/mods/json2html/mods/JthState'


import { JthFileState, JthRenderRoot, JthTemplate, JthTemplateBase, JthTemplateGroup, JthTemplateRoot, JthTemplateType, ValueGenerator, ValueGeneratorRef } from '@renderer/mods/json2html/base'
import { JthModBEMStyle, JthModComponent, JthModTemplateTree, JthModTestCase, JthModValueStore, JthRenderModBEMStyle, JthRenderModComponent, JthRenderModlTemplateTree, JthRenderModTestCase, JthRenderModValueStore, TemplateNodeTree } from '@renderer/mods/json2html/mods';
import { nanoid } from 'nanoid';




export class JthStateController {
    static isGroup(
        template: JthTemplateBase<any> | JthTemplateGroup<any>
    ): template is JthTemplateGroup<any> {
        return !!(template as JthTemplateGroup<any>).isGroup
    }


    constructor(
        public fileState: JthFileState,
        public store: JthModValueStore = new JthModValueStore(fileState),
        public template: JthModTemplateTree = new JthModTemplateTree(fileState),
        public component: JthModComponent = new JthModComponent(fileState),
        public test: JthModTestCase = new JthModTestCase(fileState, component),
        public bem: JthModBEMStyle = new JthModBEMStyle(fileState)
    ) { }

    getFileState() {
        return this.fileState.clone()
    }

    reload(content: string) {
        this.fileState.reload(content);

        [
            this.store,
            this.template,
            this.component,
            this.test,
            this.bem,
        ].forEach(v => v.reload())
    }

    newComponent(keyName: string) {
        const root: JthTemplateRoot = {
            id: nanoid(),
            type: JthTemplateType.Root,
            isGroup: true,
            props: []
        }

        this.component.addComponent({
            keyName, rootId: root.id
        })

        this.template.insertNode(root)
    }


    removeComponent(keyName: string) {
        const component = this.component.allComponents().find((v) => v.keyName === keyName)
        if (!component) return
        this.component.delComponent(component.rootId)

        // this.state.components = this.state.components.filter((v) => v.keyName !== keyName)
        this.removeTNode(component.rootId)
    }

    insertTNode(
        template: JthTemplate,
        pos: { parent?: string; before?: string; after?: string } = {}
    ) {
        if (this.template.hasNode(template.id)) {
            throw new Error('Node already exists')
        }
        const parent = pos.parent ? this.template.node(pos.parent) : undefined
        const before = pos.before ? this.template.node(pos.before) : undefined
        const after = pos.after ? this.template.node(pos.after) : undefined

        if (before) {
            let hasInsert = false
            this.template.updateTree((tree) => {
                const all = [...Object.entries(tree)]
                all.forEach(([id, children]) => {
                    if (hasInsert) return
                    if (children.findIndex((v) => v === before.id) < 0) return
                    const newChildren = children.flatMap((id) =>
                        id === before.id ? [template.id, id] : [id]
                    )
                    tree[id] = newChildren
                    hasInsert = true
                })
            })
            if (hasInsert) {
                this.template.insertNode(template)
            }
        } else if (after) {
            let hasInsert = false
            this.template.updateTree((tree) => {
                const all = [...Object.entries(tree)]
                all.forEach(([id, children]) => {
                    if (hasInsert) return
                    if (children.findIndex((v) => v === after.id) < 0) return
                    const newChildren = children.flatMap((id) => (id === after.id ? [id, template.id] : [id]))
                    tree[id] = newChildren
                    hasInsert = true
                })
            })
            if (hasInsert) {
                this.template.insertNode(template)
            }
        } else if (parent) {
            let hasInsert = false
            this.template.updateTree((tree) => {
                const old = tree[parent.id] ?? []
                const newChildren = [...old, template.id]
                tree[parent.id] = newChildren
                hasInsert = true
            })
            if (hasInsert) {
                this.template.insertNode(template)
            }
        }
    }

    removeTNode(templateId: string) {
        this.template.updateTree((tree) => {
            const all = [...Object.entries(tree)]
            all.forEach(([id, children]) => {
                if (children.findIndex((v) => v === templateId) < 0) return
                const newChildren = children.filter((v) => v !== templateId)
                tree[id] = newChildren
            })
            delete tree[templateId]
        })
    }

    updateTNode<T extends JthTemplate = JthTemplate>(newone: T) {
        this.template.updateNode(newone.id, () => {
            return newone
        })
    }


    getVG(ref: ValueGeneratorRef) {
        return this.store.get(ref)
    }

    newVG(vg: ValueGenerator): ValueGeneratorRef {
        return this.store.add(vg)
    }


    getTNodeChildren(id: string) {
        const node = this.template.node(id)
        if (!JthStateController.isGroup(node)) return []
        else return this.template.children(id)
    }


    getTNode(id: string) {
        return this.template.node(id)
    }

    findParentId(templateId: string) {
        const todo = [...Object.entries(this.template.tree())]

        while (todo.length) {
            const current = todo.shift()
            if (!current) continue
            const [pid, children] = current
            if (children.findIndex((id) => id === templateId) < 0) continue
            return pid
        }

        return null
    }

    allComponents() {
        return this.component.allComponents()
    }

    getTemplateTreeByParentId(rootId: string) {
        const tree: {
            id: string
            pid: string
            templateData: JthTemplate
        }[] = []

        const table = this.template.tree()

        const todo = (table[rootId] ?? []).map((id) => ({ id, pid: rootId }))

        while (todo.length) {
            const current = todo.shift()
            if (!current) continue
            const { id, pid } = current
            const templateData = this.template.node(id)

            if (!templateData) continue
            tree.push({ id, pid, templateData })

            if (!JthStateController.isGroup(templateData)) continue
            const children = this.template.children(id)?.map((cid) => ({ id: cid, pid: id })) ?? []
            if (children.length) todo.push(...children)
        }
        return tree
    }


    getTestList(rootId: string) {
        return this.test.getAllTestList().filter(v => v.rootId === rootId)
    }

    addTestCase(rootId: string) {
        const caseId = nanoid()
        const jsonData = "{}"

        this.test.addTestCase({
            rootId, caseId, jsonData
        })
    }

    delTestCase(caseId: string) {
        this.test.delTestCase(caseId)
    }

    getTestJsonData(caseId: string) {
        return this.test.getTestJsonData(caseId)
    }
    setTestJsonData(caseId: string, json: string) {
        return this.test.updateCaseData(caseId, json)
    }



    file() {
        return this.fileState.content()
    }

}


export class JthRenderController {

    constructor(
        public fileState: JthFileState,
        public store = new JthRenderModValueStore(fileState),
        public template = new JthRenderModlTemplateTree(fileState, this.store),
        public component = new JthRenderModComponent(fileState, this.template, this.store),
        public test = new JthRenderModTestCase(fileState),
        public bem = new JthRenderModBEMStyle(fileState, this.template, this.store)
    ) { }

    getTestList(rootId: string) {
        return this.test.getTestList(rootId)
    }

    createTestRender(caseId: string) {

    }

}


export class TestRenderRoot {

    root: JthRenderRoot
    constructor(
        public controller: JthRenderController,
        public rootId: string,
        public caseId: string,
    ) {
        this.root = new JthRenderRoot()
    }

    private json() {
        return this.controller.test.getCaseJson(this.caseId) ?? '{}'
    }

    update() {
        const json = this.json()
        const vnode = this.controller.component.renderByJson(this.rootId, json)
        this.root.inject(vnode)
    }

    element(){return this.root.cntr}
}