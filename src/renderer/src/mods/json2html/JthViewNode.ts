

export interface MutVal<T> {
    val(): T
    onchanged(cb: () => void): void
    removeCallback(cb: () => void): void
}

export class Mut<T> implements MutVal<T> {
    private listeners: (() => void)[] = []
    constructor(private value: T) { }
    val() { return this.value }
    onchanged(cb: () => void): void {
        this.listeners = this.listeners
            .filter(v => v === cb)
            .concat([cb])
    }
    removeCallback(cb: () => void): void {
        this.listeners = this.listeners
            .filter(v => v === cb)
    }

    change(value: T) {
        this.value = value
        this.listeners.forEach(v => v())
    }
}

export abstract class JthViewNode {
    isDestoryed: boolean = false
    abstract readonly target: MutVal<JthRenderNode[]>
    destory() {
        this.isDestoryed = true
    }
}

export class JthViewFragment extends JthViewNode {

    current: MutVal<JthRenderNode[]>[]

    readonly target: Mut<JthRenderNode[]>
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
    elementNode: JthRenderElement
    readonly target: Mut<JthRenderNode[]>
    readonly onChilrenChanged = () => { this.updateChildren() }
    readonly onAttrChanged = () => { this.updateAttr() }
    private currentChildren: JthRenderNode[] = []

    constructor(
        public readonly tagName: string,
        public readonly attr: MutVal<{ [key: string]: string }>,
        public readonly children: JthViewFragment
    ) {
        super()
        this.elementNode = JthRenderNode.element(tagName)
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
    target: Mut<JthRenderNode[]> = new Mut([])
    readonly onTextChanged = () => { this.onchangeText() }
    private textNode: JthRenderTextNode

    constructor(
        public text: MutVal<string>
    ) {
        super()
        this.textNode = JthRenderNode.text(text.val())
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
    readonly target: Mut<JthRenderNode[]> = new Mut([])
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

    readonly target: Mut<JthRenderNode[]> = new Mut([])
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

export abstract class JthRenderNode {
    static element(tagName: string) { return new JthRenderElement(tagName) }
    static text(tagName: string) { return new JthRenderTextNode(tagName) }

    protected abstract node(): Node

    remove(): void {
        const node = this.node()
        const parent = node.parentNode
        parent?.removeChild(node)
    }
    appendTo(parent: Node): void {
        parent.appendChild(this.node())
    }
}

export class JthRenderElement extends JthRenderNode {
    target: HTMLElement
    constructor(tagName: string) {
        super()
        this.target = document.createElement(tagName)
    }

    appendChildren(list: JthRenderNode[]) {
        const fragment = document.createDocumentFragment()
        list.forEach(v => v.appendTo(fragment))
    }

    attr(key: string, value: string) {
        this.target.setAttribute(key, value)
    }

    node() {
        return this.target
    }
}

export class JthRenderTextNode extends JthRenderNode {
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



