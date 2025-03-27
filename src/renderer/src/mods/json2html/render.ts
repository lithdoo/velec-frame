import { JthModValueStore, JthModTemplateTree, JthModComponent, JthModTestCase, JthModBEMStyle, TemplateNodeTree, templateNodeTable } from "./mods"
import { JthFileState, ValueGenerator, ValueGeneratorRef } from "./base/JthFile"
import { JthTemplate, ValueField, JthTemplateType } from "./base/JthTemplate"
import { Mut, JthViewNode, JthViewText, JthViewElement, JthViewCondition, JthViewLoop, JthViewFragment, MutTable, MutVal } from "./base/JthViewNode"

export type JthFile = {
    vg_store: {
        [key: string]: ValueGenerator
        ['null']: ValueGenerator
        ['blank_string']: ValueGenerator
        ['empty_array']: ValueGenerator
        ['empty_object']: ValueGenerator
        ['true']: ValueGenerator
        ['false']: ValueGenerator
    }

    template_node: {
        [key: string]: JthTemplate
    }

    template_tree: {
        [key: string]: string[]
    }

    components: { rootId: string }[]
}



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
        console.warn(this,this.state)
        return new Mut(this.state.get((data) => {
            const argus = Object.entries(data)
            return new Function(...argus.map(([v]) => v), script).apply(null, argus.map(([_, v]) => v))
        }))
    }

}



export class JthRenderRoot {

    shadow?: ShadowRoot
    cntr?: HTMLElement
    target: JthViewFragment

    constructor(
        public readonly scope: JthRenderScope,
        public readonly rootId: string,
        public readonly tree: TemplateNodeTree,
        public readonly nodes: templateNodeTable
    ) {
        // this.shadow = this.cntr.attachShadow({ mode: 'open' })
        this.target = this.renderRoot()
        this.updateFn = ()=>this.update()
    }

    private updateFn :()=>void

    bind(cntr: HTMLElement) {
        if(this.shadow){
            this.shadow.innerHTML = ''
        }
        this.cntr = cntr
        this.shadow = this.cntr.attachShadow({ mode: 'open' })
        this.update()
        this.target.current.forEach(v => v.onchanged(this.updateFn))
    }

    despose(){
        if(this.shadow){
            this.shadow.innerHTML = ''
        }
        
        this.target.current.forEach(v => v.removeCallback(this.updateFn))
    }

    private update() {
        if (!this.shadow) return
        this.shadow.innerHTML = ''
        this.target.current.forEach(mut => {
            mut.val().forEach(val => {
                if (!this.shadow) return
                val.appendTo(this.shadow)
            })
        })
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

    renderRoot() {
        const scope = this.scope
        const rootId = this.rootId
        const node = this.nodes[rootId]
        if (!node)
            throw new Error('error root id!')
        if (node.type !== JthTemplateType.Root)
            throw new Error('error root id!')

        return this.renderChildren(rootId, scope)
    }

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
        const childIds = this.tree[id] ?? []
        const children = childIds.map(id => this.render(id, scope.children()))
        const fragment = new JthViewFragment(new Mut(children))
        return fragment
    }

}

export class JthFileRenderer {
    constructor(
        protected fileState: JthFileState,
        protected store: JthModValueStore = new JthModValueStore(fileState),
        protected template: JthModTemplateTree = new JthModTemplateTree(fileState),
        protected component: JthModComponent = new JthModComponent(fileState),
        protected test: JthModTestCase = new JthModTestCase(fileState, component),
        protected bem: JthModBEMStyle = new JthModBEMStyle(fileState)
    ) { }


    renderJson(componentId: string, json: string) {
        const scope = new JthRenderScope(new JthRenderState(JSON.parse(json) ?? {}), this.store.storeData())
        const component = this.component.allComponents().find(v => v.rootId === componentId)
        if (!component) throw new Error(`componentId: ${componentId} is not exist`)
        return new JthRenderRoot(
            scope,
            component.rootId,
            this.template.tree(),
            this.template.table()
        )
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
        public component: { rootId: string }
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

