



export type JthStateJsonStore = {
    keyName: string,
    Json: {
        text: string,
        value?: any
    }
}[]


export type JthStateTemplateStore = {
    keyName: string,
    testJsonKeyName?: string,
    template: string
}[]


export enum JthTemplateType {
    Element = "Element",
    Text = "Text",
    Cond = 'Cond',
    Loop = 'Loop',
    Prop = 'Prop',
}

export type JthTemplateBase = {
    type: JthTemplateType,
    scope: string[]
    children?: JthTemplateBase[]
}

export type ValueGenerator<T> = {
    type: 'static', value: T
} | { type: 'dynamic', value: string }

export type JthTemplateElement = JthTemplateBase & {
    type: JthTemplateType.Element,
    tagName: string,
    className: ValueGenerator<string>,
    props?: {
        [key: string]: ValueGenerator<any>
    }
}

export type JthTemplateText = JthTemplateBase & {
    type: JthTemplateType.Text,
    text: ValueGenerator<string>
}

export type JthTemplateCond = JthTemplateBase & {
}


export class JthState { }