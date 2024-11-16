import { NodeData } from "@renderer/components/_graph2/base/cell";
import { NodeShapeKey } from "../common";

export interface SqlNodeMeta {
    fileUrl: string
    sql: string
    type: 'query' | 'run',
    label: string
}
export type SqlNodeData = NodeData<NodeShapeKey.GH_RUNNER_SQL_NODE, SqlNodeMeta>

export const isSqlNodeData = (node: NodeData<any, any>): node is SqlNodeData => {
    return (node as SqlNodeData).view.shape === NodeShapeKey.GH_RUNNER_SQL_NODE
}
