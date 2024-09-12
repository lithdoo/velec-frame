import { nanoid } from "nanoid";



export interface InputPort {

}

export interface OutputPort {

}


export interface NodeViewData<S extends string> {
    shape: S
    id: string
    zIndex: number,
    height: number;
    width: number;
    x: number,
    y: number,
    inputs: InputPort[]
    outputs: OutputPort[]
}


export interface X6NodeData {
    shape: string
    id: string
    zIndex: number,
    height: number;
    width: number;
    x: number,
    y: number,
}

export interface X6EdgeData {
    shape: string
    id: string
    zIndex: 0,
    source: string
    target: string
}


export interface EdgeViewData<S extends string> {
    shape: S
    id: string
    zIndex: 0,
    source: string
    target: string
    sourcePortKey: string,
    targetPortKey: string,
}

export interface NodeData<S extends string = string, Meta = any> {
    id: string
    view: NodeViewData<S>,
    meta: Meta,
    _viewId: string,
    _x6: X6NodeData
}

export interface EdgeData<S extends string = string, Meta = any> {
    id: string
    view: EdgeViewData<S>,
    meta: Meta,
    _viewId: string,
    _x6: X6EdgeData
}


export const initNodeViewData = (data: Partial<NodeViewData<string>>): NodeViewData<any> => {
    if (!data.shape) throw new Error('shape is required')

    return {
        shape: data.shape,
        id: data.id ?? nanoid(),
        zIndex: data.zIndex ?? 1,
        height: data.height ?? 200,
        width: data.width ?? 160,
        x: data.x ?? 0,
        y: data.y ?? 0,
        inputs: data.inputs ?? [],
        outputs: data.outputs ?? []
    }
}

export const initEdgeViewData = (data: Partial<EdgeViewData<string>>): EdgeViewData<any> => {
    if (!data.shape) throw new Error('shape is required')
    if (!data.source) throw new Error('source is required')
    if (!data.target) throw new Error('target is required')
    return {
        shape: data.shape,
        id: data.id ?? nanoid(),
        source: data.source,
        target: data.target,
        zIndex: data.zIndex ?? 0,
        sourcePortKey: data.sourcePortKey ?? '',
        targetPortKey: data.targetPortKey ?? '',
    }
}


export const toX6Node = (view: NodeViewData<string>, old: Partial<X6NodeData>) => {
    const {
        shape,
        id,
        zIndex,
        height,
        width,
        x,
        y,
    } = view

    console.log({x,y})

    return Object.assign(old, {
        shape,
        id,
        zIndex,
        height,
        width,
        x,
        y,
    })
}


export const toX6Edge = (view: EdgeViewData<string>, old: Partial<X6EdgeData>) => {
    const {
        shape,
        id,
        zIndex,
        source,
        target,
    } = view

    return Object.assign(old, {
        shape,
        id,
        zIndex,
        source,
        target,
    })
}

