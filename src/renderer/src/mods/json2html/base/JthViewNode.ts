

export interface MutVal<T> {
    val(): T
    onchanged(cb: () => void): void
    removeCallback(cb: () => void): void
}



export abstract class MutBase<T> implements MutVal<T> {
    protected abstract value: T
    protected listeners: (() => void)[] = []

    onchanged(cb: () => void): void {
        this.listeners = this.listeners
            .filter(v => v === cb)
            .concat([cb])
    }

    removeCallback(cb: () => void): void {
        this.listeners = this.listeners
            .filter(v => v === cb)
    }

    val() {
        return this.value
    }
}


export class Mut<T> extends MutBase<T> {
    constructor(protected value: T) {
        super()
    }

    change(value: T) {
        this.value = value
        this.listeners.forEach(v => v())
    }
}


// ['1','2','3'] -> ['2','3']
type Tail<Tuple extends any[]> = ((...args: Tuple) => void) extends ((a: any, ...args: infer T) => void) ? T : never
// ['1','2','3'] -> '1'
type Head<Tuple extends any[]> = Tuple extends [infer Result, ...any[]] ? Result : never
// (['2','3'],'1') -> ['1','2','3']
// type Unshift<Tuple extends any[], Element> = ((a: Element, ...args: Tuple) => void) extends ((...args: infer T) => void) ? T : never

type ArrayMut<S extends any[], Upper extends any[] = []> = Head<S> extends never ? Upper : ArrayMut<Tail<S>, [...Upper, MutVal<Head<S>>]>


type PickMut<S extends MutVal<unknown>> = S extends MutVal<infer S> ? S : never

type PickMutArray<S extends MutVal<unknown>[]> = { [Key in keyof S]: PickMut<S[Key]> }


export class MutComputed<S extends any[], T> extends MutBase<T> {

    protected value: T

    static create<S extends MutVal<unknown>[], T>(watchers: S, fn: (...argus: PickMutArray<S>) => T) {
        return new MutComputed<PickMutArray<S>, T>(watchers as any, fn)
    }

    constructor(
        public watchers: ArrayMut<S>,
        public fn: (...argus: S) => T
    ) {
        super()
        this.value = this.getUpdateVal()
        this.bind()
    }

    private getUpdateVal() {
        const argus = (this.watchers as MutVal<unknown>[]).map(v => v.val())
        const val = this.fn(...argus as any)
        return val
    }

    private updateFn = () => {
        this.value = this.getUpdateVal()
    }

    private bind() {
        (this.watchers as MutVal<unknown>[]).forEach(v => v.onchanged(this.updateFn))
    }

    private unbind() {
        (this.watchers as MutVal<unknown>[]).forEach(v => v.removeCallback(this.updateFn))
    }

    destory() {
        this.unbind()
    }

}

export class MutTable<T extends Object> extends MutBase<T> {

    private mutListener: Map<Mut<unknown>, () => void> = new Map()
    protected value: T

    constructor(private target: { [Key in keyof T]: MutVal<T[Key]> }) {
        super()
        this.value = {} as T
        Object.entries(target).forEach(([key, mut]) => {
            this.value[key] = mut.val()
            const listener = () => { this.update(key) }
            mut.onchanged(listener)
            this.mutListener.set(mut, listener)
        })
    }

    private update(key: string) {
        const val = this.target[key]?.val()
        this.value[key] = val
        this.listeners.forEach(v => v())
    }
}

export abstract class JthViewNode {
    isDestoryed: boolean = false
    abstract readonly target: MutVal<JthWrapedNode[]>
    destory() {
        this.isDestoryed = true
    }
}


export class JthRenderRoot {
    shadow: ShadowRoot
    viewNode?: JthViewNode

    private updateFn = () => { this.update() }
    constructor(
        public cntr = document.createElement('div')
    ) {
        this.shadow = this.cntr.attachShadow({ mode: 'open' })
    }

    private caches: JthWrapedNode[] = []

    inject(viewNode: JthViewNode) {
        if (this.viewNode) {
            this.viewNode.target.removeCallback(this.updateFn)
        }
        this.viewNode = viewNode
        this.viewNode.target.onchanged(this.updateFn)
        this.update()
    }

    update() {
        const blank = document.createElement('div')
        this.caches.forEach(node => node.appendTo(blank))
        this.caches = []
        this.viewNode?.target.val().forEach(node => {
            node.appendTo(this.shadow)
            this.caches.push(node)
        })
    }
}

export class JthViewFragment extends JthViewNode {

    current: MutVal<JthWrapedNode[]>[]

    readonly target: Mut<JthWrapedNode[]>
    readonly onListChanged: () => void
    readonly onCurrentChanged: () => void

    constructor(
        public list: Mut<JthViewNode[]>
    ) {
        super()
        this.current = this.list.val().map(v => v.target)
        this.target = new Mut(this.current.flatMap(v => v.val()))

        this.onCurrentChanged = () => this.updateTarget()
        this.current.forEach(v => v.onchanged(this.onCurrentChanged))
        this.list.onchanged(this.onListChanged = () => { this.updateCurrent() })
    }

    private updateCurrent() {
        this.current.forEach(v => v.removeCallback(this.onCurrentChanged))
        this.current = this.list.val().map(v => v.target)
        this.current.forEach(v => v.onchanged(this.onCurrentChanged))
        this.updateTarget()

    }

    private updateTarget() {
        this.target.change(this.current.flatMap(v => v.val()))
    }

    destory(): void {
        super.destory()
        this.current.forEach(v => v.removeCallback(this.onCurrentChanged))
        this.list.removeCallback(this.onListChanged)
        this.list.val().forEach(v => v.destory())
    }
}

export class JthViewElement extends JthViewNode {



    elementNode: JthWarpedElement
    readonly target: Mut<JthWrapedNode[]>
    readonly onChilrenChanged = () => { this.updateChildren() }
    readonly onAttrChanged = () => { this.updateAttr() }
    private currentChildren: JthWrapedNode[] = []

    constructor(
        public readonly tagName: string,
        public readonly attr: MutVal<{ [key: string]: string }>,
        public readonly children: JthViewFragment
    ) {
        super()
        this.elementNode = JthWrapedNode.element(tagName)
        this.target = new Mut([this.elementNode])
        this.children.target.onchanged(this.onChilrenChanged)
        this.attr.onchanged(this.onAttrChanged)
        this.updateChildren()
        this.updateAttr()
    }


    private updateAttr() {
        const attr = this.attr.val()
        Object.entries(attr).map(([key, value]) => {
            this.elementNode.attr(key, value)
        })
    }

    private updateChildren() {
        this.currentChildren.forEach(v => v.remove())
        this.currentChildren = this.children.target.val()
        this.elementNode.appendChildren(this.currentChildren)
    }

    destory(): void {
        super.destory()
        this.children.target.removeCallback(this.onChilrenChanged)
        this.attr.removeCallback(this.onAttrChanged)
        this.children.destory()
    }


}

export class JthViewText extends JthViewNode {
    target: Mut<JthWrapedNode[]> = new Mut([])
    readonly onTextChanged = () => { this.onchangeText() }
    private textNode: JthWarpedText

    constructor(
        public text: MutVal<string>
    ) {
        super()
        this.textNode = JthWrapedNode.text(text.val())
        this.target = new Mut([this.textNode])
        this.text.onchanged(this.onTextChanged)
    }

    private onchangeText() {
        this.textNode.changeText(this.text.val())
    }

    destory() {
        super.destory()
        this.text.removeCallback(this.onTextChanged)
    }
}

export class JthViewLoop extends JthViewNode {
    readonly target: Mut<JthWrapedNode[]> = new Mut([])
    current: JthViewFragment[] = []

    readonly onCurrentChanged = () => { this.updateTarget() }
    readonly onListChanged = () => { this.updateCurrent() }
    constructor(
        public readonly list: MutVal<unknown[]>,
        public readonly render: (val: unknown, idx: number) => JthViewFragment
    ) {
        super()
        this.list.onchanged(this.updateCurrent)
        this.updateCurrent()
    }

    private updateCurrent() {
        this.current.forEach(v => {
            v.target.removeCallback(this.onCurrentChanged)
            v.destory()
        })
        const list = this.list.val()
        this.current = list.map((v, i) => this.render(v, i))
        this.current.forEach(v => {
            v.target.onchanged(this.onCurrentChanged)
        })
        this.updateTarget()
    }

    private updateTarget() {
        this.target.change(this.current.flatMap(v => v.target.val()))
    }

    destory(): void {
        super.destory()
        this.current.forEach(v => {
            v.target.removeCallback(this.onCurrentChanged)
            v.destory()
        })
        this.list.removeCallback(this.onListChanged)
    }
}

export class JthViewCondition extends JthViewNode {

    readonly target: Mut<JthWrapedNode[]> = new Mut([])
    current?: JthViewFragment

    readonly onCurrenChanged: () => void
    readonly onTestChanged: () => void

    constructor(
        public readonly test: MutVal<boolean>,
        public readonly render: () => JthViewFragment
    ) {
        super()
        this.test.onchanged(this.onTestChanged = () => {
            this.updateCurrent()
        })
        this.onCurrenChanged = () => {
            this.updateTarget()
        }
        this.updateCurrent()
    }

    private updateCurrent() {
        const res = this.test.val()
        if ((res && this.current)) return
        if (!(res || this.current)) return

        if (!res) {
            if (!this.current) return
            this.current.target.removeCallback(this.onCurrenChanged)
            this.current?.destory()
            this.current = undefined
            this.updateTarget()
        } else if (this.current) {
        } else {
            if (this.current) return
            this.current = this.render()
            this.current.target.onchanged(this.onCurrenChanged)
            this.updateTarget()
        }

    }

    private updateTarget() {
        this.target.val().forEach(v => v.remove())
        if (!this.current) {
            this.target.change([])
        } else {
            const list = this.current.target.val()
            this.target.change(list)
        }
    }

    destory(): void {
        super.destory()
        this.test.removeCallback(this.onTestChanged)
        this.current?.target.removeCallback(this.onCurrenChanged)
        this.current?.destory()
        this.current = undefined
    }

}

export abstract class JthWrapedNode {
    static wrap(element: HTMLElement) {
        const node = new JthWarpedElement('div')
        node.target = element
        return node
    }

    static element(tagName: string) { return new JthWarpedElement(tagName) }
    static text(tagName: string) { return new JthWarpedText(tagName) }

    abstract node(): Node

    remove(): void {
        const node = this.node()
        const parent = node.parentNode
        parent?.removeChild(node)
    }
    appendTo(parent: Node): void {
        parent.appendChild(this.node())
    }
}

export class JthWarpedElement extends JthWrapedNode {
    target: HTMLElement
    constructor(tagName: string) {
        super()
        this.target = document.createElement(tagName)
    }

    appendChildren(list: JthWrapedNode[]) {
        const fragment = document.createDocumentFragment()
        list.forEach(v => v.appendTo(fragment))
        this.target.appendChild(fragment)
    }

    attr(key: string, value: string) {
        this.target.setAttribute(key, value)
    }

    node() {
        return this.target
    }
}

export class JthWarpedText extends JthWrapedNode {
    target: Text
    constructor(text: string) {
        super()
        this.target = document.createTextNode(text)
    }

    changeText(text: string) {
        this.target.textContent = text
    }

    node() {
        return this.target
    }
}



