import { NodeData } from "@renderer/components/_graph2/base/cell";
import { NodeShapeKey } from "../common";

export interface ScopeNodeMeta {
    label: string,
    fields: string[]
}

export type ScopeNodeData = NodeData<NodeShapeKey.GH_RUNNER_SCOPE_NODE, ScopeNodeMeta>

export const isScopeNodeData = (node: NodeData<any, any>): node is ScopeNodeData => {
    return (node as ScopeNodeData).view.shape === NodeShapeKey.GH_RUNNER_SCOPE_NODE
}