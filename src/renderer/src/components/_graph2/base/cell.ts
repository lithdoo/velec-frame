import { Graph, KeyValue, Markup } from "@antv/x6";
import { nanoid } from "nanoid";

export const COMMON_INPUT_POSITION = 'COMMON_INPUT_POSITION'
export const COMMON_OUTPUT_POSITION = 'COMMON_OUTPUT_POSITION'

Graph.registerPortLayout(COMMON_INPUT_POSITION, (portsPositionArgs: KeyValue<any>[], box) => {
    return portsPositionArgs.map(_ => {
        return {
            position: {
                x: box.width / 2,
                y: 0,
            },
            angle: 0,
        }
    })
})

Graph.registerPortLayout(COMMON_OUTPUT_POSITION, (portsPositionArgs: KeyValue<any>[], box) => {
    return portsPositionArgs.map(_ => {
        return {
            position: {
                x: box.width / 2,
                y: box.height,
            },
            angle: 0,
        }
    })
})


export interface InputPort {
    keyName: string
}

export interface OutputPort {
    keyName: string
}

export interface NodeViewData<S extends string> {
    shape: S
    id: string
    zIndex: number,
    height: number;
    width: number;
    x: number,
    y: number,
    inputs?: InputPort[],
    inputLayout?: string,
    outputs?: OutputPort[],
    outputLayout?: string,
}


interface PortGroupMetadata {
    /**
     * 连接桩 DOM 结构定义。
     */
    markup?: Markup

    /**
     * 属性和样式。
     */
    attrs?: any

    /**
     * 连接桩的 DOM 层级，值越大层级越高。
     */
    zIndex?: number | 'auto'

    /**
     * 群组中连接桩的布局。
     */
    position?:
    | [number, number] // 绝对定位
    | string // 连接桩布局方法的名称
    | {
        // 连接桩布局方法的名称和参数
        name: string
        args?: object
    }

    /**
     * 连接桩标签。
     */
    label?: {
        markup?: Markup
        position?: {
            // 连接桩标签布局
            name: string // 布局名称
            args?: object // 布局参数
        }
    }
}

interface PortMetadata {
    /**
     *  连接桩唯一 ID，默认自动生成。
     */
    id?: string

    /**
     * 分组名称，指定分组后将继承分组中的连接桩选项。
     */
    group?: string

    /**
     * 为群组中指定的连接桩布局算法提供参数。
     * 我们不能为单个连接桩指定布局算法，但可以为群组中指定的布局算法提供不同的参数。
     */
    args?: object

    /**
     * 连接桩的 DOM 元素和结构定义。指定该选项后将覆盖 `group` 指代的群组提供的默认选项。
     */
    markup?: Markup

    /**
     * 元素的属性样式。指定该选项后将覆盖 `group` 指代的群组提供的默认选项。
     */
    attrs?: any

    /**
     * 连接桩的 DOM 层级，值越大层级越高。指定该选项后将覆盖 `group` 指代的群组提供的默认选项。
     */
    zIndex?: number | 'auto'

    /**
     * 连接桩标签。指定该选项后将覆盖 `group` 指代的群组提供的默认选项。
     */
    label?: {
        markup?: Markup
        position?: {
            // 连接桩标签布局
            name: string // 布局名称
            args?: object // 布局参数
        }
    }
}

export interface X6NodeData {
    shape: string
    id: string
    zIndex: number,
    height: number;
    width: number;
    x: number,
    y: number,
    ports?: {
        groups: { [groupName: string]: PortGroupMetadata }
        items: PortMetadata[]
    }
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

export const toX6NodePort = (view: NodeViewData<string>): Partial<X6NodeData> => {
    const groups: { [groupName: string]: PortGroupMetadata } = {}
    const items: PortMetadata[] = []

    if (view.inputs && view.inputs.length > 0) {
        groups.inputs = {
            position: view.inputLayout ?? COMMON_INPUT_POSITION,
        }
        view.inputs.forEach((input) => {
            items.push({
                id: input.keyName,
                group: 'inputs',
                markup: {
                    tagName: 'circle',
                    selector: 'circle',
                    attrs: {
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                    },
                }
            })
        })
    }

    if (view.outputs && view.outputs.length > 0) {
        groups.outputs = {
            position: view.outputLayout ?? COMMON_OUTPUT_POSITION,
        }
        view.outputs.forEach((input) => {
            items.push({
                id: input.keyName,
                group: 'outputs',
                markup: {
                    tagName: 'circle',
                    selector: 'circle',
                    attrs: {
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                    },
                }
            })
        })
    }

    return {
        ports: { groups, items }
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

    const newData: X6NodeData = {
        shape,
        id,
        zIndex,
        height,
        width,
        x,
        y,
        ...toX6NodePort(view)
    }

    return Object.assign(old, newData)
}

export const toX6Edge = (view: EdgeViewData<string>, old: Partial<X6EdgeData>) => {
    const {
        shape,
        id,
        zIndex,
        source,
        target,
        sourcePortKey,
        targetPortKey,
    } = view

    return Object.assign(old, {
        shape,
        id,
        zIndex,
        source:{
            cell: source,
            port: sourcePortKey,
        },
        target:{
            cell: target,
            port: targetPortKey,
        },
    })
}




