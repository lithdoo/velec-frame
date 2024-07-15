import { MayBeMBase, MBaseValue } from "./mut"
import { MBaseTempalteNode, Ext, MBaseTempalteParentNode, MBaseRenderScope, MBaseElementTemplateNode, MBaseTextTemplateNode, MBaseCondTemplateNode, MBaseLoopTemplateNode, MBaseTScope, MBaseScopeTemplateNode, MBaseTempalteNodeType } from "./template"


interface TemplateNodeBuilder<S extends Record<string, unknown>, T extends MBaseTempalteNode<S> = MBaseTempalteNode<S>> {
    build(): T
}


type LoopScope<S extends Record<string, unknown>, T> = Ext<S, { _index: number, _item: T }>

type TemplateBuilderChildren<Scope extends Record<string, unknown>> = (TemplateNodeBuilder<Scope> | ((t: MTemplate<Scope>) => TemplateNodeBuilder<Scope>))

interface TemplateParentNodeBuilder<
    S extends Record<string, unknown>,
    C extends Record<string, unknown>,
    T extends MBaseTempalteParentNode<S, C>> extends TemplateNodeBuilder<S, T> {
    (...children: TemplateBuilderChildren<C>[]): TemplateParentNodeBuilder<S, C, T>
}

interface MTemplate<Scope extends Record<string, unknown>> {
    div: (className: MayBeStatic<[MBaseRenderScope<Scope>], MayBeMBase<string | string[]>>) => TemplateParentNodeBuilder<Scope, Scope, MBaseElementTemplateNode<HTMLDivElement, Scope>>,
    span: (className: MayBeStatic<[MBaseRenderScope<Scope>], MayBeMBase<string | string[]>>) => TemplateParentNodeBuilder<Scope, Scope, MBaseElementTemplateNode<HTMLSpanElement, Scope>>,
    text: (content: MayBeStatic<[MBaseRenderScope<Scope>], MayBeMBase<string>>) => TemplateNodeBuilder<Scope, MBaseTextTemplateNode<Scope>>,

    cond: (cond: (scope: MBaseRenderScope<Scope>) => MayBeMBase<boolean>) => TemplateParentNodeBuilder<Scope, Scope, MBaseCondTemplateNode<Scope>>,
    loop: <T>(list: (scope: MBaseRenderScope<Scope>) => MayBeMBase<T[]>) => TemplateParentNodeBuilder<Scope, LoopScope<Scope, T>, MBaseLoopTemplateNode<T, Scope>>,
    trans: <Next extends Record<string, unknown>> (trans: (scope: MBaseTScope<Scope>) => Next) => TemplateParentNodeBuilder<Scope, Next, MBaseScopeTemplateNode<Scope, Next>>
}

type MayBeStatic<Argu extends any[], Res> = Res extends Function
    ? never
    : (((...argu: Argu) => Res) | Res)

const toGenerate = <Argu extends any[], Res>(argu: MayBeStatic<Argu, Res>): (...argu: Argu) => Res => {
    if (argu instanceof Function) {
        return argu as (...argu: Argu) => Res
    } else {
        return (() => argu) as (...argu: Argu) => Res
    }
}



const r: <T extends Record<string, unknown>>() => MTemplate<T> = null as any




const element = <
    ElementNode extends HTMLElement,
    S extends Record<string, unknown>,
    C extends Record<string, unknown>
>
    (
        createElement: () => ElementNode
    ) =>
    (
        className: MayBeStatic<[MBaseRenderScope<S>], MayBeMBase<string | string[]>>,
    ) => {

        const template: MBaseElementTemplateNode<ElementNode, S> = {
            _type: MBaseTempalteNodeType.Element,
            createElement,
            className: toGenerate(className),
            style: () => new MBaseValue({}),
            attrStyle: () => new MBaseValue({}),
            children: [] as MBaseElementTemplateNode<ElementNode, S>['children']
        }


        const append = (children: (t: MTemplate<S>) => TemplateNodeBuilder<S>[]) => {
            template.children = template.children.concat(children(r()).map(v => v.build()))
            return template
        }
        const build = () => template

        return Object.assign(append, { build }) as unknown as TemplateParentNodeBuilder<S, C, MBaseElementTemplateNode<ElementNode, S>>
    }


const cond = <S extends Record<string, unknown>>(cond: (scope: MBaseRenderScope<S>) => MayBeMBase<boolean>) => {
    const template = {
        _type: MBaseTempalteNodeType.Cond,
        cond,
        children: [] as MBaseCondTemplateNode<S>['children']
    }

    const append = (...children: TemplateBuilderChildren<S>[]) => {
        const list = children.map(v => v instanceof Function ? v(r()).build() : v.build())
        template.children = template.children.concat(list)
        return template
    }
    const build = () => template

    return Object.assign(append, { build }) as unknown as TemplateParentNodeBuilder<S, S, MBaseCondTemplateNode<S>>
}



const loop = <T, S extends Record<string, unknown>>(list: (scope: MBaseRenderScope<S>) => MayBeMBase<T[]>) => {
    const template = {
        _type: MBaseTempalteNodeType.Loop,
        list,
        children: [] as MBaseLoopTemplateNode<T, S>['children']
    }

    const append = (...children: TemplateBuilderChildren<LoopScope<S, T>>[]) => {
        const list = children.map(v => v instanceof Function ? v(r()).build() : v.build())
        template.children = template.children.concat(list)
        return template
    }
    const build = () => template

    return Object.assign(append, { build }) as unknown as TemplateParentNodeBuilder<S, Ext<S, { _index: number, _item: T }>, MBaseLoopTemplateNode<T, S>>
}

const text = <S extends Record<string, unknown> = Record<string, any>>(content: MayBeStatic<[MBaseRenderScope<S>], MayBeMBase<string>>) => {

    const template: MBaseTextTemplateNode<S> = {
        _type: MBaseTempalteNodeType.Text,
        text: toGenerate(content)
    }

    return { build: () => template }
}



export const div = element(() => document.createElement('div'))
export const span = element(() => document.createElement('span'))
export { loop, cond }








export enum JsonFieldTypeKey {
    String = 'String',
    Integer = 'Integer',
    Number = 'Number',
    Boolean = 'Boolean',
    Null = 'Null',
    Array = 'Array',
    Object = 'Object',
    Anyone = 'Anyone',
}

export interface JsonStruct {
    fields: { name: string, type: JsonType }[]
}

export interface JsonField {
    name: string
    type: JsonType
}

export interface JsonType {
    key: JsonFieldTypeKey
}

export interface JsonUsage {
    name: string,
    methods: {
        name: string,
        input: JsonStruct
        output: JsonType
    }[],
}
export class GhJsonModel {
    modelId: string
    name: string = 'Test'
    struct: JsonStruct = {
        fields: []
    }
    usages: JsonUsage[] = []
    constructor(modelId: string) {
        this.modelId = modelId
        this.struct.fields = [
            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
            { name: 'test3', type: { key: JsonFieldTypeKey.String } },
            { name: 'test4', type: { key: JsonFieldTypeKey.String } },
            { name: 'test5', type: { key: JsonFieldTypeKey.String } },
        ]

        this.usages = [
            {
                name: 'usage1', methods: [{
                    name: 'method1', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                }, {
                    name: 'method2', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                }, {
                    name: 'method3', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test3', type: { key: JsonFieldTypeKey.String } }
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                },]
            }
        ]
    }
}

const renderType = (t: MTemplate<{ type: JsonType }>) => {
    return t.text((s) => s.get('type').key)
}

const renderStruct = (t: MTemplate<{ struct: JsonStruct }>) => {
    return t.div('gh-json-model__fields')(
        t.loop((s) => s.get('struct').fields)(
            t => t.div('gh-json-model__field-item')(
                t.div('gh-json-model__field-name')(t.text((s) => s.get('_item').name)),
                t.trans(s => ({ type: s.get('_item').type }))(t =>
                    renderType(t)
                )
            )
        )
    )
}


const renderUsage = (t: MTemplate<{ useage: JsonUsage }>) => {
    return t.div('gh-json-model__usage-item')(
        t.div('gh-json-model__usage-title')(t.div('')
            (t.text(s => s.get('useage').name))
        ),
        t.div('gh-json-model__usage-methods')(
            t.loop(s => s.get('useage').methods)(t =>
                t.div('gh-json-model__usage-method-item')(
                    t.div('gh-json-model__usage-method-name')(t.text(s => s.get('_item').name)),
                    t.div('gh-json-model__usage-method-output')(t.trans(s => ({ type: s.get('_item').output }))(t => renderType(t))
                    )
                ),
            )
        )
    )
}

const renderModel = (t: MTemplate<{ model: GhJsonModel }>) => {
    return t.div('gh-json-model')(
        t.div('gh-json-model__header')(t.text(s=>s.get('model').name)),
        t.div('gh-json-model__body')(
            t.div('gh-json-model__struct')(
                t.div('gh-json-model__sub-title')(t.text('结构字段'))
            ),
            t.div('gh-json-model__usages')(
                t.div('gh-json-model__sub-title')(t.text('结构字段')),
                t.loop(s=>s.get('model').usages)(
                    t=>t.trans(s=>({useage:s.get('_item')}))(t=>renderUsage(t))
                )
            )
        )
    )
}

