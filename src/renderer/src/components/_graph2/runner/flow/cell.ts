import { EdgeData, NodeData } from "@renderer/components/graph2/base/cell";
import { EdgeShapeKey, NodeShapeKey } from "../common";

export interface FlowNodeMeta {
    name: string
    label: string
}

export type FlowNodeData = NodeData<NodeShapeKey.GH_RUNNER_FLOW_NODE, FlowNodeMeta>

export const isFlowNodeData = (node: NodeData<any, any>): node is FlowNodeData => {
    return (node as FlowNodeData).view.shape === NodeShapeKey.GH_RUNNER_FLOW_NODE
}

export interface FlowEdgeMeta {
    flowId: string, color: string
}

export const isFlowEdgeData = (node: EdgeData<any, any>): node is FlowEdgeData => {
    return (node as FlowEdgeData).view.shape === EdgeShapeKey.GH_RUNNER_FLOW_EDGE
}

export type FlowEdgeData = EdgeData<EdgeShapeKey.GH_RUNNER_FLOW_EDGE, FlowEdgeMeta>
