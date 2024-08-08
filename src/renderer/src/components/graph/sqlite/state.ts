
type RawTable = {
    name: string;
    originalKey: string;
    label: string;
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

type RawForeignKey = {
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


export type RawData = {
    tables: RawTable[],
    fkeys: RawForeignKey[],
}

export interface NodeData {
    id: string
    view: NodeViewData,
    meta: NodeMetaData
    _viewId: string
}

export interface EdgeData {
    id: string
    view: EdgeViewData,
    meta: EdgeMetaData
    _viewId: string
}


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

export interface NodeViewData {
    shape: 'GH_SQLERD_ENTITY_NODE'
    id: string
    zIndex: number,
    height: number;
    width: number;
    x: number,
    y: number,
}

export interface EdgeViewData {
    shape: 'GH_SQLERD_RELATIONSHIP_EDGE'
    id: string
    zIndex: 0,
    sourcePortIndex: number,
    sourcePortLen: number,
    targetPortIndex: number,
    targetPortLen: number,
    source: string
    target: string
}


export interface GroupData {
    groupId: string,
    name: string,
    nodeIds: string[]
}

export type SplitResult = {
    blockWidth: number,
    blockHeight: number,
    totalBlocks: number,
    rows: number,
    cols: number,
}


export class SqlErdState {
    nodes: NodeData[] = []
    edges: EdgeData[] = []

    readonly viewId: string
    constructor(viewId: string) {
        this.viewId = viewId
    }

    // 从后台数据中增量更新节点
    load(raw: RawData, cache: {
        nodes: NodeData[]
        edges: EdgeData[]
    } | null = null) {
        
        const temp = cache || {
            nodes: this.nodes,
            edges: this.edges,
        }

        const nodeCache: Map<string, NodeData> = new Map

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

        const currentNodeMap = new Map<string, NodeData>()
        const currentEdgeMap = new Map<string, EdgeData>()

        this.nodes.forEach(node => {
            currentNodeMap.set(node.id, node)
        })

        this.edges.forEach(edge => {
            currentEdgeMap.set(edge.id, edge)
        })

        const nodes: NodeData[] = []
        const edges: EdgeData[] = []

        raw.tables.forEach((table, idx) => {
            const id = table.originalKey
            // const current = currentNodeMap.get(id)
            const cache = nodeCache.get(id)

            // if (!current) {
            const view: NodeViewData = {
                id,
                y: cache?.view.y ?? 0,
                x: cache?.view.x ?? idx * 500,
                shape: "GH_SQLERD_ENTITY_NODE",
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
            // }

        })


        raw.fkeys.forEach((fk) => {
            const id = fk.originalKey
            // const current = currentEdgeMap.get(id)
            // if (!current) {
            const view: EdgeViewData = {
                id,
                zIndex: 0,
                sourcePortIndex: 1,
                sourcePortLen: 2,
                targetPortIndex: 1,
                targetPortLen: 2,
                shape: 'GH_SQLERD_RELATIONSHIP_EDGE',
                source: fk.fromTableKey,
                target: fk.toTableKey
            }
            const meta: EdgeMetaData = {
                ...fk
            }
            edges.push({ id, view, meta, _viewId: this.viewId })
            // }
        })

        this.edges = edges
        this.nodes = nodes

        this.resetEdgeOffset()
    }

    save() {
        const { nodes, edges } = this
        return { nodes, edges }
    }

    resetEdgeOffset() {
        const indexTable: Map<string, number> = new Map()
        const self = this.edges.filter(v => v.view.source === v.view.target)
        self.forEach(edge => {
            const nodeId = edge.view.source
            const lastIdx = indexTable.get(nodeId)
            const currentIdx = lastIdx ? lastIdx + 1 : 1
            indexTable.set(nodeId, currentIdx)
            edge.view.sourcePortIndex = currentIdx
            edge.view.targetPortIndex = currentIdx
        })

        const other = this.edges.filter(v => v.view.source !== v.view.target)

        other.forEach(edge => {
            const sId = edge.view.source
            const sLastIdx = indexTable.get(sId)
            const sCurrentIdx = sLastIdx ? sLastIdx + 1 : 1
            indexTable.set(sId, sCurrentIdx)
            edge.view.sourcePortIndex = sCurrentIdx

            const tId = edge.view.target
            const tLastIdx = indexTable.get(tId)
            const tCurrentIdx = tLastIdx ? tLastIdx + 1 : 1
            indexTable.set(tId, tCurrentIdx)
            edge.view.targetPortIndex = tCurrentIdx
        })


        this.edges.forEach(edge => {
            const sId = edge.view.source
            const sLastIdx = indexTable.get(sId) ?? 0
            edge.view.sourcePortLen = sLastIdx + 1

            const tId = edge.view.target
            const tLastIdx = indexTable.get(tId) ?? 0
            edge.view.targetPortLen = tLastIdx + 1
        })
    }
}