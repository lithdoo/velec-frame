import { EvalRef } from "../mutv-eval"
import { MVTemplateGroup, MVTemplateLeaf, MVTemplateNode } from "./base"


export enum MVTemplateComponentType {
    Root = 'MVTemplateRoot',
    Apply = 'MVTemplateApply',
    Scope = 'MVTemplateScope'
}


export type MVTemplateRoot = MVTemplateGroup & {
    type: MVTemplateComponentType.Root
    props: string[]
}


export const isMVTemplateRoot = (node: MVTemplateNode): node is MVTemplateRoot => {
    return node.type === 'MVTemplateRoot'
}

export type MVTemplateApply = MVTemplateLeaf & {
    type: MVTemplateComponentType.Apply
    rootId: string
}

export const isMVTemplateApply = (node: MVTemplateNode): node is MVTemplateApply => {
    return node.type === 'MVTemplateApply'
}

export type MVTemplateScope = MVTemplateGroup & {
    type: "MVTemplateScope",
    bind: EvalRef,
}

export const isMVTemplateScope = (node: MVTemplateNode): node is MVTemplateScope => {
    return node.type === 'MVTemplateScope'
}
