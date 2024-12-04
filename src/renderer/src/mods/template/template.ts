import { MayBeMBase, MBaseCondRenderNode, mbaseDomRedner, MBaseElementRenderNode, MBaseGroupFragment, MBaseLoopRenderNode, MBaseParentRenderNode, MBaseRenderFragment, MBaseTextRenderNode, MBaseWacher } from "./mut"


export interface MBaseTScope<T extends {}> {
    get<K extends keyof T>(name: K): T[K]
    // map<S extends {}>(fn: (t: T) => S): MBaseTScope<S>
}

export type Ext<Current extends {}, Next extends {}> = {
    [Key in keyof (Next & Current)]: Next extends { [K in Key]: any } ? Next[Key] : Current extends { [K in Key]: any } ? Current[Key] : never
}



export enum MBaseTempalteNodeType {
    Element = 'Element',
    Text = 'Text',
    Cond = 'Cond',
    Loop = 'Loop',
    Prop = 'Prop'
}

export interface MBaseTempalteNode<_Scope extends Record<string, unknown>> {
    _type: MBaseTempalteNodeType
}

export interface MBaseTempalteParentNode<Scope extends Record<string, unknown>, ChildScope extends Record<string, unknown> = Scope> extends MBaseTempalteNode<Scope> {
    children: MBaseTempalteNode<ChildScope>[]
}


export interface MBaseElementTemplateNode<T extends HTMLElement, Scope extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope> {
    _type: MBaseTempalteNodeType.Element
    createElement: (scope: MBaseTScope<Scope>) => T
    className: (scope: MBaseTScope<Scope>) => MayBeMBase<string | string[]>
    style: (scope: MBaseTScope<Scope>) => MayBeMBase<Partial<CSSStyleDeclaration>>
    attrStyle: (scope: MBaseTScope<Scope>) => MayBeMBase<{ [key: string]: string | CSSStyleValue }>
}

export function isMBaseElementTempalteNode<T extends HTMLElement, Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseElementTemplateNode<T, Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Element
}

export interface MBaseTextTemplateNode<Scope extends Record<string, unknown>> extends MBaseTempalteNode<Scope> {
    _type: MBaseTempalteNodeType.Text
    text: (scope: MBaseTScope<Scope>) => MayBeMBase<string>
}

export function isMBaseTextTempalteNode<Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseTextTemplateNode<Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Text
}


export interface MBaseCondTemplateNode<Scope extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope> {
    _type: MBaseTempalteNodeType.Cond
    cond: (scope: MBaseTScope<Scope>) => MayBeMBase<boolean>
    children: MBaseTempalteNode<Scope>[]
}

export function isMBaseCondTempalteNode<Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseCondTemplateNode<Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Cond
}

export interface MBaseLoopTemplateNode<T, Scope extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope, Ext<Scope, { _index: number, _item: T }>> {
    _type: MBaseTempalteNodeType.Loop
    list: (scope: MBaseTScope<Scope>) => MayBeMBase<T[]>
}


export function isMBaseLoopTempalteNode<T, Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseLoopTemplateNode<T, Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Loop
}

export interface MBasePropTemplateNode<Scope extends Record<string, unknown>, Next extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope, Next> {
    _type: MBaseTempalteNodeType.Prop
    trans: (scope: MBaseTScope<Scope>) => Next
}

export function isMBasePropsTempalteNode<Scope extends Record<string, unknown>, Next extends Record<string, unknown>>(ele: Record<string, any>): ele is MBasePropTemplateNode<Scope, Next> {
    return ele['_type'] === MBaseTempalteNodeType.Prop
}


export class RenderScope<T extends Record<string, unknown>> implements MBaseTScope<T> {

    static create<T extends Record<string, unknown>>(t: T) {
        return new RenderScope(null, t)
    }

    table: Map<keyof T, unknown> = new Map()
    upper: MBaseTScope<Record<string, unknown>> | null

    constructor(upper: MBaseTScope<Record<string, unknown>> | null, t: T) {
        this.upper = upper
        Object.entries(t).map(([key, value]) => {
            this.table.set(key, value)
        })
    }

    get<K extends keyof T>(name: K) {
        if (this.table.has(name)) {
            return this.table.get(name) as T[K]
        } else {
            const val: unknown = this.upper ? this.upper.get(name as string) : undefined
            return val as T[K]
        }
    }
}

export function render<Scope extends Record<string, unknown>>(template: MBaseTempalteNode<Scope>, scope: MBaseTScope<Scope>): MBaseRenderFragment {

    if (isMBaseTextTempalteNode<Scope>(template)) {
        const text = template.text(scope)
        const content = MBaseWacher.fromVal(text)
        const renderNode = new MBaseTextRenderNode(mbaseDomRedner, { content })
        return renderNode
    } else if (isMBaseElementTempalteNode<HTMLElement, Scope>(template)) {
        const attrStyle = MBaseWacher.fromVal(template.attrStyle(scope))
        const style = MBaseWacher.fromVal(template.style(scope))
        const node = template.createElement(scope)
        const className = MBaseWacher.fromVal<string | string[]>(template.className(scope))
        const renderNode = new MBaseElementRenderNode(mbaseDomRedner, {
            node,
            attrStyle,
            className,
            style,
        })
        if (!template.children.length) {
            return renderNode
        } else {
            return new MBaseParentRenderNode(mbaseDomRedner, {
                target: renderNode,
                children: renderChildren(template.children, scope)
            })
        }

    } else if (isMBaseCondTempalteNode<Scope>(template)) {
        const cond = MBaseWacher.fromVal(template.cond(scope))
        const renderNode = new MBaseCondRenderNode(cond, () => renderChildren(template.children, scope))
        return renderNode
    } else if (isMBaseLoopTempalteNode<unknown, Scope>(template)) {
        const list = MBaseWacher.fromVal(template.list(scope))
        // todo
        const renderNode = new MBaseLoopRenderNode(list, (_item, _index) => {
            const childScope = new RenderScope(scope, {
                _index, _item
            }) as RenderScope<any>
            return new MBaseGroupFragment(template.children.map(template => render(template, childScope)))
        }, (_item: unknown, _idx: number) => Math.random().toString())

        return renderNode
    } else if (isMBasePropsTempalteNode<Scope, Record<string, unknown>>(template)) {
        const childScope = new RenderScope(null, template.trans(scope))
        const renderNode = renderChildren(template.children, childScope)
        return renderNode
    }

    throw new Error('Unknown TempalteNode !!!')
}



export function renderChildren<Scope extends Record<string, unknown>>(templates: MBaseTempalteNode<Scope>[], scope: MBaseTScope<Scope>): MBaseGroupFragment {
    return new MBaseGroupFragment(templates.map(template => render(template, scope)))
}
