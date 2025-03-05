import { JthComponent, ValueGenerator } from "./JthState"
import { JthTemplate, ValueGeneratorRef, ValueField, JthTemplateType } from "./JthTemplate"
import { Mut, JthViewNode, JthViewText, JthViewElement, JthViewCondition, JthViewLoop, JthViewFragment, MutTable, MutVal } from "./JthViewNode"


export abstract class JthRenderState {
    protected abstract target: Object
    get(func: (val: Object) => void) {
        return func(this.target)
    }
}

export abstract class JthRenderScope {
    abstract state: JthRenderState
    abstract table: Map<string, ValueGenerator>

    abstract children(): JthRenderScope
    abstract add(trans: { key: string, value: any }[]): JthRenderScope

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