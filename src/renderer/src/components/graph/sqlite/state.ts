
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
    nodes: {
        id: string
        view: NodeViewData,
        meta: NodeMetaData
    }[] = []
    edges: {
        id: string,
        view: EdgeViewData,
        meta: EdgeMetaData
    }[] = []

    // 从后台数据中增量更新节点
    load(raw: RawData) {
        const defNodeHeight = (table: RawTable) => {
            const titleHeight = 24
            const fieldHeight = 22
            const borderWidth = 2

            const total = titleHeight
                + table.fieldList.length * fieldHeight
                + borderWidth * 2

            return Math.min(total, 600)
        }

        const currentNodeMap = new Map<string, {
            id: string
            view: NodeViewData,
            meta: NodeMetaData
        }>()

        const currentEdgeMap = new Map<string, {
            id: string
            view: EdgeViewData,
            meta: EdgeMetaData
        }>()

        this.nodes.forEach(node => {
            currentNodeMap.set(node.id, node)
        })

        this.edges.forEach(edge => {
            currentEdgeMap.set(edge.id, edge)
        })

        const nodes: {
            id: string
            view: NodeViewData,
            meta: NodeMetaData
        }[] = []

        const edges: {
            id: string
            view: EdgeViewData,
            meta: EdgeMetaData
        }[] = []

        raw.tables.forEach((table, idx) => {
            const id = table.originalKey
            const current = currentNodeMap.get(id)
            if (!current) {
                const view: NodeViewData = {
                    id, y: 0, x: idx * 500, shape: "GH_SQLERD_ENTITY_NODE",
                    zIndex: 1,
                    width: 300,
                    height: defNodeHeight(table)
                }
                const meta: NodeMetaData = {
                    name: table.name,
                    originalKey: table.originalKey,
                    label: table.label,
                    fieldList: table.fieldList,
                    groupId: null
                }
                nodes.push({ id, view, meta })
            }

        })


        raw.fkeys.forEach((fk) => {
            const id = fk.originalKey
            const current = currentEdgeMap.get(id)
            if (!current) {
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
                edges.push({ id, view, meta })
            }
        })

        this.edges = edges
        this.nodes = nodes

        this.resetEdgeOffset()
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