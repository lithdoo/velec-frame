import { EdgeData, EdgeShapeKey, EdgeViewData, ErdStateKey, NodeData, NodeShapeKey, NodeViewData, RawData, RawTable, StateExtend } from "../common";

export type BaseNodeData = NodeData<NodeShapeKey.GH_SQLERD_ENTITY_NODE, NodeMetaData>

export type BaseEdgeData = EdgeData<EdgeShapeKey.GH_SQLERD_RELATIONSHIP_EDGE, EdgeMetaData>

export interface NodeMetaData {
    name: string;
    originalKey: string;
    label: string;
    groupId: string | null
    fieldList: {
        name: string;
        originalKey: string;
        label: string;
        type: string;                // 类型
        foreignKey: boolean        // 是否外键
        primaryKey: boolean        // 是否主键
        unique: boolean;
        notNull: boolean;
    }[],
}

export interface EdgeMetaData {
    originalKey: string;
    fromTableKey: string,
    toTableKey: string,
    fromTableName: string,
    toTableName: string,

    targetNodeRelation: null,
    sourceNodeRelation: null,

    fields: {
        from: string,
        to: string,
        seq: number
    }[]
}

export type SplitResult = {
    blockWidth: number,
    blockHeight: number,
    totalBlocks: number,
    rows: number,
    cols: number,
}

export const isBaseNodeData = (node:NodeData):node is BaseNodeData=>{
    return node.view.shape === NodeShapeKey.GH_SQLERD_ENTITY_NODE
}

export class BaseState extends StateExtend<{}, {
    nodes: BaseNodeData[],
    edges: BaseEdgeData[],
}> {

    readonly key = ErdStateKey.Base
    nodes: BaseNodeData[] = []
    edges: BaseEdgeData[] = []
    // 从后台数据中增量更新节点
    load(raw: RawData, cache: {
        nodes: BaseNodeData[]
        edges: BaseEdgeData[]
    } | null = null) {

        const temp = cache || {
            nodes: this.nodes,
            edges: this.edges,
        }

        const nodeCache: Map<string, BaseNodeData> = new Map

        if (temp?.nodes) {
            temp.nodes.forEach(node => nodeCache.set(node.id, node))
        }

        const defNodeHeight = (table: RawTable) => {
            const titleHeight = 24
            const fieldHeight = 22
            const borderWidth = 2

            const total = titleHeight
                + table.fieldList.length * fieldHeight
                + borderWidth * 2

            return Math.min(total, 600)
        }

        const currentNodeMap = new Map<string, BaseNodeData>()
        const currentEdgeMap = new Map<string, BaseEdgeData>()

        this.nodes.forEach(node => {
            currentNodeMap.set(node.id, node)
        })

        this.edges.forEach(edge => {
            currentEdgeMap.set(edge.id, edge)
        })

        const nodes: BaseNodeData[] = []
        const edges: BaseEdgeData[] = []

        raw.tables.forEach((table, idx) => {
            const id = table.originalKey
            const cache = nodeCache.get(id)

            const view: NodeViewData<NodeShapeKey.GH_SQLERD_ENTITY_NODE> = {
                id,
                y: cache?.view.y ?? 0,
                x: cache?.view.x ?? idx * 500,
                shape: NodeShapeKey.GH_SQLERD_ENTITY_NODE,
                zIndex: 1,
                width: cache?.view.width ?? 300,
                height: cache?.view.height ?? defNodeHeight(table)
            }
            const meta: NodeMetaData = {
                name: table.name,
                originalKey: table.originalKey,
                label: table.label,
                fieldList: table.fieldList,
                groupId: null
            }
            nodes.push({ id, view, meta, _viewId: this.viewId })

        })


        raw.fkeys.forEach((fk) => {
            const id = fk.originalKey
            const view: EdgeViewData<EdgeShapeKey.GH_SQLERD_RELATIONSHIP_EDGE> = {
                id,
                zIndex: 0,
                sourcePortIndex: 1,
                sourcePortLen: 2,
                targetPortIndex: 1,
                targetPortLen: 2,
                shape: EdgeShapeKey.GH_SQLERD_RELATIONSHIP_EDGE,
                source: fk.fromTableKey,
                target: fk.toTableKey
            }
            const meta: EdgeMetaData = {
                ...fk
            }
            edges.push({ id, view, meta, _viewId: this.viewId })
        })

        this.edges = edges
        this.nodes = nodes

    }


    save() {
        const { nodes, edges } = this
        console.log({ nodes, edges })
        return { nodes, edges }
    }

    getNodes(): NodeData<NodeShapeKey, any>[] {
        return this.nodes
    }

    getEdges(): EdgeData<EdgeShapeKey, any>[] {
        return this.edges
    }

}