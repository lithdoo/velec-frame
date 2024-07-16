import { MayBeMBase, MBaseElementRenderNode, MBaseValue } from "./mut"


export interface MBaseTScope<T extends {}> {
    get<K extends keyof T>(name: K): T[K]
    map<S extends {}>(fn: (t: T) => S): MBaseTScope<S>
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

export interface MBaseTempalteNode<Scope extends Record<string, unknown>> {
    _type: MBaseTempalteNodeType
}

export interface MBaseTempalteParentNode<Scope extends Record<string, unknown>, ChildScope extends Record<string, unknown> = Scope> extends MBaseTempalteNode<Scope> {
    children: MBaseTempalteNode<ChildScope>[]
}


export interface MBaseRenderScope<T extends {}> {
    get<K extends keyof T>(name: K): T[K]
    map<S extends {}>(fn: (t: T) => S): MBaseTScope<S>
}

export interface MBaseElementTemplateNode<T extends HTMLElement, Scope extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope> {
    _type: MBaseTempalteNodeType.Element
    createElement: () => T
    className: (scope: MBaseRenderScope<Scope>) => MayBeMBase<string | string[]>
    style: (scope: MBaseRenderScope<Scope>) => MBaseValue<Partial<CSSStyleDeclaration>>
    attrStyle: (scope: MBaseRenderScope<Scope>) => MBaseValue<{ [key: string]: string | CSSStyleValue }>
}

export function isMBaseElementTempalteNode<T extends HTMLElement, Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseElementTemplateNode<T, Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Element
}

export interface MBaseTextTemplateNode<Scope extends Record<string, unknown>> extends MBaseTempalteNode<Scope> {
    _type: MBaseTempalteNodeType.Text
    text: (scope: MBaseRenderScope<Scope>) => MayBeMBase<string>
}

export function isMBaseTextTempalteNode<Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseTextTemplateNode<Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Text
}


export interface MBaseCondTemplateNode<Scope extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope> {
    _type: MBaseTempalteNodeType.Cond
    cond: (scope: MBaseRenderScope<Scope>) => MayBeMBase<boolean>
    children: MBaseTempalteNode<Scope>[]
}

export function isMBaseCondTempalteNode<Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseCondTemplateNode<Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Cond
}

export interface MBaseLoopTemplateNode<T, Scope extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope, Ext<Scope, { _index: number, _item: T }>> {
    _type: MBaseTempalteNodeType.Loop
    list: (scope: MBaseRenderScope<Scope>) => MayBeMBase<T[]>
}

export interface MBasePropTemplateNode<Scope extends Record<string, unknown>, Next extends Record<string, unknown>> extends MBaseTempalteParentNode<Scope, Next> {
    _type: MBaseTempalteNodeType.Prop
    trans: (scope: MBaseTScope<Scope>) => Next
}

export function isMBaseLoopTempalteNode<T, Scope extends Record<string, unknown>>(ele: Record<string, any>): ele is MBaseLoopTemplateNode<T, Scope> {
    return ele['_type'] === MBaseTempalteNodeType.Loop
}


export function render<Scope extends Record<string, unknown>>(template: MBaseTempalteNode<Scope>, scope: MBaseRenderScope<Scope>) {
    if (isMBaseTextTempalteNode<Scope>(template)) {

    } else if (isMBaseElementTempalteNode<HTMLElement, Scope>(template)) {

    } else if (isMBaseCondTempalteNode<Scope>(template)) {

    } else if (isMBaseLoopTempalteNode<unknown, Scope>(template)) {

    }
}

