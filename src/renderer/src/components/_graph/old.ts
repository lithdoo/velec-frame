export abstract class GhNode<T> {
    readonly id: string
    x: number = 0
    y: number = 0
    abstract data: T
    abstract readonly shape: string
    ports: {
        id: string,
        group: string
    }[] = []

    constructor(id?: string) {
        this.id = id ?? Math.random().toString()
    }

    static create(_state: { type: string }) {

    }
}


export abstract class GhEdge {
    abstract edgeType: string
    static create(_state: { type: string }) {}
}



export const div = (cls: string | string[] = '', option: { style?: Partial<CSSStyleDeclaration> } = {}) => {
    const ele = document.createElement('div')
    ele.className = (typeof cls === 'string' ? [cls] : cls).filter(v => !!v).join(' ')
    Object.assign(ele.style, option.style ?? {})
    return ele
}

export const text = (content: string) => document.createTextNode(content)

export const render = (ele: HTMLElement, children: (HTMLElement | Text)[] = []) => {
    children.forEach(child => ele.appendChild(child))
    return ele
}
