export interface MutValueHandler {
    isMutValue(value: unknown): boolean
    getRawValue<T>(value: unknown): T
    onValueChange(value: unknown, onchange: () => void, callOnInit?: boolean): () => void
}



export type MutDomHTMLElementOption<Input extends {
    className: any
    style: any
    attrStyle: any,
} = {
    className: never
    style: never
    attrStyle: never
}> = {
    className?: Input['className'] | string | string[],
    style?: Input['style'] | Partial<CSSStyleDeclaration>
    attrStyle?: Input['attrStyle'] | { [key: string]: string | CSSStyleValue }
    done?: (HTMLElement) => void
}


export class MutDomRender<Input extends {
    text: any,
    className: any
    style: any
    attrStyle: any,
    children: any
} = {
    text: never,
    className: never
    style: never
    attrStyle: never,
    children: never
}> {
    protected handler: MutValueHandler
    protected nodeDisposeListeners: WeakMap<Node, (() => void)[]> = new WeakMap()

    protected addNodeDisposeListeners(node: Node, call: () => void) {
        this.nodeDisposeListeners.set(
            node,
            (this.nodeDisposeListeners.get(node) ?? [])
                .filter(c => c !== call)
                .concat([call])
        )
    }
    disposeNode(node: Node) {
        (this.nodeDisposeListeners.get(node) ?? []).forEach(f => f())
    }
    constructor(hanler: MutValueHandler) {
        this.handler = hanler
    }
    textNode(content: Input['text'] | string): Text {
        const node = document.createTextNode('')
        if (this.handler.isMutValue(content)) {
            const rawContent = this.handler.getRawValue<string>(content)
            this.addNodeDisposeListeners(node, this.handler.onValueChange(content, () => {
                node.textContent = rawContent
            }, true))
        } else {
            node.textContent = content
        }
        return node
    }
    htmlElement<T extends HTMLElement>(
        node: T,
        option: MutDomHTMLElementOption<Input>
    ) {

        const { className: cls, style, attrStyle, done } = option
        if (this.handler.isMutValue(cls)) {
            const rawContent = this.handler.getRawValue<string | string[]>(cls)
            this.addNodeDisposeListeners(node, this.handler.onValueChange(rawContent, () => {
                node.className = (typeof rawContent === 'string' ? [rawContent] : rawContent).filter(v => !!v).join(' ')
            }, true))
        } else {
            node.className = (typeof cls === 'string' ? [cls] : cls as string[]).filter(v => !!v).join(' ')
        }

        if (this.handler.isMutValue(style)) {
            const rawContent = this.handler.getRawValue<Partial<CSSStyleDeclaration>>(style)
            this.addNodeDisposeListeners(node, this.handler.onValueChange(style, () => {
                Object.entries(rawContent).forEach(([key, value]) => {
                    node.style[key] = value
                })
            }, true))
        } else if (style) {
            Object.entries(style).forEach(([key, value]) => {
                node.style[key] = value
            })
        }

        if (this.handler.isMutValue(attrStyle)) {
            const rawContent = this.handler.getRawValue<any>(attrStyle)
            this.addNodeDisposeListeners(node, this.handler.onValueChange(attrStyle, () => {
                Object.entries(rawContent).forEach(([key, value]) => {
                    node.attributeStyleMap?.set(key, value as any)
                })
            }, true))

        } else if (attrStyle) {
            Object.entries(attrStyle).forEach(([key, value]) => {
                node.attributeStyleMap?.set(key, value as any)
            })
        }
        done?.(node)
        return node
    }
    setChildren(ele: HTMLElement, children: Input['children'] | (Node[]) = []) {
        if (this.handler.isMutValue(children)) {
            const rawContent = this.handler.getRawValue<(Node)[]>(children)
            this.addNodeDisposeListeners(ele, this.handler.onValueChange(rawContent, () => {
                ele.innerHTML = ''
                rawContent.forEach(child => ele.appendChild(child))
            }, true))
        } else {
            ele.innerHTML = '';
            (children as Node[]).forEach(child => ele.appendChild(child))
        }
        return ele
    }
}
