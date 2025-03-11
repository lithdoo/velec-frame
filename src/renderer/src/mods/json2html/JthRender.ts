import { JthComponent, JthFile, ValueGenerator } from "./JthState"
import { JthTemplate, ValueGeneratorRef, ValueField, JthTemplateType } from "./JthTemplate"
import { Mut, JthViewNode, JthViewText, JthViewElement, JthViewCondition, JthViewLoop, JthViewFragment, MutTable, MutVal } from "./JthViewNode"


export class JthRenderState {
    constructor(
        private readonly target: Record<string, any>,
        readonly upper?: JthRenderState
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
        private state: JthRenderState,
        private table: Map<string, ValueGenerator>
    ) { }

    children() {
        return new JthRenderScope(this.state, this.table)
    }
    add(trans: { key: string, value: any }[]) {
        return new JthRenderScope(
            new JthRenderState(
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
        return new Mut(this.state.get((data) => {
            const argus = Object.entries(data)
            return new Function(...argus.map(([v]) => v), script).apply(null, argus.map(([_, v]) => v))
        }))
    }

}


export class JthRender {

    static fromJsonState(file: JthFile, componentId: string, value: string) {


        const state = JSON.parse(value)
        const component = file.components.find(v => v.rootId === componentId)
        if (!component) {
            throw new Error('unknown component id')
        }

        if (!state || state instanceof Array || (typeof state !== 'object')) {
            throw new Error('state need a object')
        }

        const template_node: {
            [key: string]: JthTemplate
        } = {}

        const template_tree: {
            [key: string]: string[]
        } = {}

        const walk = (id: string) => {
            const template = file.template_node[id]
            const children = file.template_tree[id] ?? []
            if (!template) {
                throw new Error('unknown template id')
            }
            template_node[id] = template
            template_tree[id] = children

            children.forEach(v => walk(v))
        }

        walk(componentId)

        const render = new JthRender(
            template_node, template_tree, component
        )

        const table = new Map(Object.entries(file.vg_store))

        const scope = new JthRenderScope(new JthRenderState(state), table)

        return render.renderRoot(scope)

    }

    constructor(
        public readonly template_node: {
            [key: string]: JthTemplate
        },
        public readonly template_tree: {
            [key: string]: string[]
        },
        public component: JthComponent
    ) { }

    private getValue(ref: ValueGeneratorRef, scope: JthRenderScope) {
        return scope.val(ref)
    }

    private getObjValue(data: ValueField[], scope: JthRenderScope): MutVal<{ [key: string]: any }> {
        const val = data.reduce((res, cur) => {
            return { ...res, [cur.name]: scope.val(cur.value) }
        }, {} as { [key: string]: MutVal<any> })
        return new MutTable(val)
    }

    renderRoot(scope: JthRenderScope) {
        const { rootId } = this.component
        const node = this.template_node[rootId]
        if (!node)
            throw new Error('error root id!')
        if (node.type !== JthTemplateType.Root)
            throw new Error('error root id!')

        return this.renderChildren(rootId, scope)
    }

    private render(id: string, scope: JthRenderScope): JthViewNode {
        const node = this.template_node[id]
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
            const children = this.renderChildren(id, scope)
            const vnode = new JthViewElement(tagName, attrs, children)
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
            // todo
        }

        if (node.type === JthTemplateType.Apply) {
            // todo
        }

        throw new Error('unknown node type')
    }

    private renderChildren(id: string, scope: JthRenderScope): JthViewFragment {
        const childIds = this.template_tree[id] ?? []
        const children = childIds.map(id => this.render(id, scope.children()))
        const fragment = new JthViewFragment(new Mut(children))
        return fragment
    }
}

