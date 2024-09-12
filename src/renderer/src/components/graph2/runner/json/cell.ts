import { NodeData } from "@renderer/components/graph2/base/cell";
import { NodeShapeKey } from "../common";

export interface JsonNodeMeta {
    data: any
    label: string
    isBlank: boolean
}
export type JsonNodeData = NodeData<NodeShapeKey.GH_RUNNER_JSON_NODE, JsonNodeMeta>

export const isJsonNodeData = (node: NodeData<any, any>): node is JsonNodeData => {
    return (node as JsonNodeData).view.shape === NodeShapeKey.GH_RUNNER_JSON_NODE
}
