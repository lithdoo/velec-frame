import { EdgeData, NodeData, NodeViewData, StateExtend } from "@renderer/mods/graph";
import { RunnerStateExtend } from "./base";


export const FLowStateKey: 'FLowStateKey' = 'FLowStateKey'
export const FlowNodeShapeKey: 'FlowNodeShapeKey' = 'FlowNodeShapeKey'
export const FlowEdgeShapeKey: 'FlowEdgeShapeKey' = 'FlowEdgeShapeKey'

export interface FlowNodeMeta {
    keyName: string
    label: string
    color: string
}
export type FlowNodeData = NodeData<typeof FlowNodeShapeKey, FlowNodeMeta>

export interface FlowEdgeMeta {
    flowId: string, color: string
}

export const isFlowNodeData = (node: NodeData<any, any>): node is FlowNodeData => {
    return (node as FlowNodeData).view.shape === FlowNodeShapeKey
}


export const isFlowEdgeData = (node: EdgeData<any, any>): node is FlowEdgeData => {
    return (node as FlowEdgeData).view.shape === FlowEdgeShapeKey
}

export type FlowEdgeData = EdgeData<typeof FlowEdgeShapeKey, FlowEdgeMeta>


export class RunnerFlowState extends RunnerStateExtend<
    FlowNodeData,
    FlowEdgeData,
    {},
    null
> {
    static colorCacheKey = 'FlowColorCache'
    readonly key = FLowStateKey
    save() { return null }
    load() { }
    isCurrentEdge(edge: EdgeData): boolean {
        return isFlowEdgeData(edge)
    }
    isCurrentNode(node: NodeData): boolean {
        return isFlowNodeData(node)
    }
    readFromScript() {
        const script = this.getScript()
        const code = script.getCode()
        this.nodes = code.requests.map(({ id }) => {
            const viewData = script.getViewData(id) ?? {
                x: 0,
                y: 0,
                height: 240,
                width: 48,
                zIndex: 1,
            }

            const label = script.getLabel('id') ?? ''
            const color = script.getCache(RunnerFlowState.colorCacheKey, id) as string ?? '#66ccff'

            const meta: FlowNodeMeta = {
                keyName: id,
                label, color
            }

            const view: NodeViewData<typeof FlowNodeShapeKey> = {
                shape: FlowNodeShapeKey,
                id,
                ...viewData,
                outputs: [{ keyName: 'output' }],
            }

            const node = StateExtend.checkNodeData<FlowNodeData>({
                id,
                meta,
                view,
                _viewId: this.viewId,
            })
            return node
        })


    }
}