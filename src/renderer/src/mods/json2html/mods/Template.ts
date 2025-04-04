import { Snapshot } from "@renderer/utils"
import { JthTemplate, JthTemplateType, ValueGeneratorRef, JthFileMod, JthFileState, ValueGenerator, Mut, JthViewCondition, JthViewElement, JthViewLoop, JthViewNode, JthViewText, JthViewFragment, ValueField, MutVal, MutTable } from "../base"
import { JthRenderMod } from "../base/JthRender"
import { JthRenderModValueStore } from "./ValueStore"

export type JthTemplateTreeNodeData = {
    last_mod_ts: number
    template_node: templateNodeTable
    template_tree: TemplateNodeTree
}

export type templateNodeTable = {
    [key: string]: JthTemplate
}


export type TemplateNodeTree = {
    [key: string]: string[]
}


export class JthRenderScopeState {
    constructor(
        private readonly target: Record<string, any>,
        readonly upper?: JthRenderScopeState
    ) { }

    getTarget() {
        const upper = this.upper?.getTarget() ?? {}
        const target = this.target
        return { ...upper, ...target }
    }

    get(func: (val: Object) => void) {
        return func(this.getTarget())
    }
}


export class JthRenderScope {

    constructor(
        private state: JthRenderScopeState,
        private table: Map<string, ValueGenerator>
    ) { }

    children() {
        return new JthRenderScope(this.state, this.table)
    }

    gen(data: ValueField[]) {
        const target = data.map(({ name, value }) => {
            const raw = this.val(value).val()
            return { name, raw }
        }).reduce<Record<string, any>>((res, cur) => {
            return { ...res, [cur.name]: cur.raw }
        }, {})

        console.warn(target)
        return new JthRenderScope(
            new JthRenderScopeState(target), this.table
        )
    }

    add(trans: { key: string, value: any }[]) {
        return new JthRenderScope(
            new JthRenderScopeState(
                trans.reduce((res, cur) => ({ ...res, [cur.key]: cur.value }), {}),
                this.state
            ),
            this.table
        )
    }

    val(ref: ValueGeneratorRef) {
        const vg = this.table.get(ref._VALUE_GENERATOR_REFERENCE_)
        if (!vg) { throw new Error('unknown ref key') }
        if (vg.type === 'static') {
            return this.getStaticVal(vg.json)
        }
        if (vg.type === 'dynamic:getter') {
            return this.getGetterVal(vg.getter)
        }
        if (vg.type === 'dynamic:script') {
            return this.getScriptVal(vg.script)
        }

        throw new Error('unknown vg type')
    }

    private getStaticVal(json: string) {
        console.log({ json })
        return new Mut(JSON.parse(json))
    }

    private getGetterVal(list: string[]) {
        return new Mut(this.state.get((data) => {
            return list.reduce((res, cur) => res[cur], data)
        }))
    }

    private getScriptVal(script: string) {
        console.warn(this, this.state)
        return new Mut(this.state.get((data) => {
            const argus = Object.entries(data)
            return new Function(...argus.map(([v]) => v), script).apply(null, argus.map(([_, v]) => v))
        }))
    }

}


export class JthModTemplateTree extends JthFileMod<JthTemplateTreeNodeData> {
    static namespace: 'TEMPLATE_TREE_NODE' = 'TEMPLATE_TREE_NODE'
    static blankData(): JthTemplateTreeNodeData {
        return {
            last_mod_ts: new Date().getTime(),
            template_node: {},
            template_tree: {},
        }
    }

    readonly namespace: 'TEMPLATE_TREE_NODE' = JthModTemplateTree.namespace

    private readonly snapNodes: Map<string, Snapshot<JthTemplate>> = new Map()
    private readonly snapTree: Snapshot<TemplateNodeTree> = new Snapshot({})


    constructor(file: JthFileState) {
        super(file)
        this.reload()
    }



    reload() {
        const data = this.getData() ?? JthModTemplateTree.blankData()
        const { template_node, template_tree } = data

        this.snapNodes.clear()

        Array.from(Object.values(template_node)).forEach((node) => {
            this.snapNodes.set(node.id, new Snapshot(node))
        })

        this.snapTree.init(template_tree)
    }


    insertNode(node: JthTemplate) {
        if (this.snapNodes.has(node.id)) {
            throw new Error(`Node ${node.id} is exist!!!`)
        }
        this.snapNodes.set(node.id, new Snapshot(node))
        this.update()
    }

    updateNode<T extends JthTemplate>(id: string, updateFn: (node: T) => void) {
        const snapshot = this.snapNodes.get(id)
        if (!snapshot) {
            throw new Error(`Node ${id} not found!!!`)
        }
        snapshot.update(updateFn as any)
        this.update()
    }

    updateTree(updateFn: (tree: TemplateNodeTree) => void) {
        this.snapTree.update(updateFn)
        this.update()
    }


    hasNode(id: string) {
        return this.snapNodes.has(id)
    }


    tree() {
        return this.snapTree.current()
    }

    table() {
        return [...this.snapNodes.entries()].reduce((res, [id, snap]) => {
            return {
                ...res,
                [id]: snap.current()
            }
        }, {} as JthTemplateTreeNodeData['template_node'])
    }

    node(id: string) {
        const node = this.snapNodes.get(id)
        if (!node) {
            throw new Error(`Node ${id} not found!!!`)
        }
        return node.current()
    }

    children(id: string) {
        return this.snapTree.current()[id] ?? []
    }

    allChildren() {
        return Array.from(Object.entries(this.snapTree.current()))

    }

    private update() {
        this.setData({
            last_mod_ts: new Date().getTime(),
            template_node: this.table(),
            template_tree: this.tree(),
        })
    }

    getAllValueRef(): ValueGeneratorRef[] {
        const data = this.getData()

        return [...Object.values(
            data?.template_node ?? {}
        )].flatMap(node => {
            if (node.type === JthTemplateType.Apply) {
                return []
            } else if (node.type === JthTemplateType.Cond) {
                return [node.test]
            }
            if (node.type === JthTemplateType.Element) {
                return [...node.attrs.map((v) => v.value)]
            }
            if (node.type === JthTemplateType.Loop) {
                return [node.loopValue]
            }
            if (node.type === JthTemplateType.Prop) {
                return [...node.data.map((v) => v.value)]
            }
            if (node.type === JthTemplateType.Root) {
                return []
            }
            if (node.type === JthTemplateType.Text) {
                return [node.text]
            }
            return []
        })
    }


}


export class JthRenderModlTemplateTree extends JthRenderMod<JthTemplateTreeNodeData> {



    readonly namespace: 'TEMPLATE_TREE_NODE' = JthModTemplateTree.namespace

    constructor(
        public file: JthFileState,
        public store: JthRenderModValueStore
    ) {
        super(file)
    }

    private get nodes() {
        return this.getData()?.template_node ?? {}
    }

    private get tree() {
        return this.getData()?.template_tree ?? {}
    }

    private getValue(ref: ValueGeneratorRef, scope: JthRenderScope) {
        return scope.val(ref)
    }

    private getObjValue(data: ValueField[], scope: JthRenderScope): MutVal<{ [key: string]: any }> {
        const val = data.reduce((res, cur) => {
            return { ...res, [cur.name]: scope.val(cur.value) }
        }, {} as { [key: string]: MutVal<any> })
        return new MutTable(val)
    }

    renderRoot(rootId: string, scope: JthRenderScope) {
        const node = this.nodes[rootId]
        if (!node)
            throw new Error('error root id!')
        if (node.type !== JthTemplateType.Root)
            throw new Error('error root id!')

        return this.renderChildren(rootId, scope)
    }


    transElementAttr: Map<string,
        (
            source: MutVal<{ [key: string]: any; }>,
            val: (ref: ValueGeneratorRef) => MutVal<any>
        ) => MutVal<{ [key: string]: any; }>
    > = new Map()




    private render(id: string, scope: JthRenderScope): JthViewNode {
        const node = this.nodes[id]
        if (!node)
            throw new Error('error node id!')

        if (node.type === JthTemplateType.Text) {
            const text = this.getValue(node.text, scope)
            const vnode = new JthViewText(text)
            return vnode
        }

        if (node.type === JthTemplateType.Element) {
            const tagName = node.tagName
            const attrs = this.getObjValue(node.attrs, scope)
            const trans = this.transElementAttr.get(id)
            const tranAttr = trans ? trans(attrs, (ref) => this.getValue(ref, scope)) : attrs
            const children = this.renderChildren(id, scope)
            const vnode = new JthViewElement(tagName, tranAttr, children)
            return vnode
        }

        if (node.type === JthTemplateType.Cond) {
            const test = this.getValue(node.test, scope)
            const render = () => this.renderChildren(id, scope)
            const vnode = new JthViewCondition(test, render)
            return vnode
        }

        if (node.type === JthTemplateType.Loop) {
            const list = this.getValue(node.loopValue, scope)
            const render = (val: unknown, idx: number) => this.renderChildren(
                id, scope.add([
                    { key: node.indexField, value: idx },
                    { key: node.valueField, value: val }
                ])
            )
            const vnode = new JthViewLoop(list, render)
            return vnode
        }

        if (node.type === JthTemplateType.Prop) {
            const list = node.data
            const next = scope.gen(list)
            return this.renderChildren(node.id, next)
        }

        if (node.type === JthTemplateType.Apply) {
            const target = node.target
            return this.renderChildren(target, scope)
        }

        console.error(node)
        throw new Error('unknown node type')
    }

    private renderChildren(id: string, scope: JthRenderScope): JthViewFragment {
        const childIds = this.tree[id] ?? []
        const children = childIds.map(id => this.render(id, scope.children()))
        const fragment = new JthViewFragment(new Mut(children))
        return fragment
    }


    [JthRenderMod.preRender]() {
        this.transElementAttr = new Map()
    }
}