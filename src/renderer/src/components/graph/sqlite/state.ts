import { GraphStateCenter, StateExtend } from '../common';


export enum NodeShapeKey {
    GH_SQLERD_ENTITY_NODE = 'GH_SQLERD_ENTITY_NODE',
}
export enum EdgeShapeKey {
    GH_SQLERD_RELATIONSHIP_EDGE = 'GH_SQLERD_RELATIONSHIP_EDGE',
    GH_SQLERD_VFKey_EDGE = 'GH_SQLERD_VFKey_EDGE'
}

export enum ErdStateKey {
    Base = "GH_SQLERD_STATE_BASE",
    Label = "GH_SQLERD_STATE_Label",
    VFkey = "GH_SQLERD_STATE_VFkey",
}


export type RawTable = {
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

export type RawForeignKey = {
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

export interface NodeViewData<S extends NodeShapeKey> {
    shape: S
    id: string
    zIndex: number,
    height: number;
    width: number;
    x: number,
    y: number,
}

export interface EdgeViewData<S extends EdgeShapeKey> {
    shape: S
    id: string
    zIndex: 0,
    sourcePortIndex: number,
    sourcePortLen: number,
    targetPortIndex: number,
    targetPortLen: number,
    source: string
    target: string
}


export interface NodeData<S extends NodeShapeKey = NodeShapeKey, T = any> {
    id: string
    view: NodeViewData<S>,
    meta: T
    _viewId: string
}

export interface EdgeData<S extends EdgeShapeKey = EdgeShapeKey, T = any> {
    id: string
    view: EdgeViewData<S>,
    meta: T,
    _viewId: string
}




export abstract class ErdStateExtend<
    Upper extends { [key: string]: ErdStateExtend<any> },
    File = any
> extends StateExtend<
    ErdStateKey,
    NodeData<NodeShapeKey, any>,
    EdgeData<EdgeShapeKey, any>,
    RawData,
    Upper,
    File
> { }


export class ErdGraphStateCenter<S extends { [key: string]: ErdStateExtend<any, any> }> extends GraphStateCenter<ErdStateKey,
    NodeData<NodeShapeKey, any>,
    EdgeData<EdgeShapeKey, any>, ErdStateExtend<any,any>,S> {

    extends<T extends {
        [key: string]: ErdStateExtend<any, any>
    }>(states: T)
        : ErdGraphStateCenter<S & T> {
        return new ErdGraphStateCenter(
            { ...this.states, ...states },
            this.list.concat(Array.from(Object.values(states)))
        )
    }

    getEdges() {
        const edges = super.getEdges()
        console.log('edges', edges)
        this.resetEdgeOffset(edges)
        return edges
    }

    private resetEdgeOffset(edges: EdgeData[]) {

        const indexTable: Map<string, number> = new Map()
        const self = edges.filter(v => v.view.source === v.view.target)
        self.forEach(edge => {
            const nodeId = edge.view.source
            const lastIdx = indexTable.get(nodeId)
            const currentIdx = lastIdx ? lastIdx + 1 : 1
            indexTable.set(nodeId, currentIdx)
            edge.view.sourcePortIndex = currentIdx
            edge.view.targetPortIndex = currentIdx
        })

        const other = edges.filter(v => v.view.source !== v.view.target)

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


        edges.forEach(edge => {
            const sId = edge.view.source
            const sLastIdx = indexTable.get(sId) ?? 0
            edge.view.sourcePortLen = sLastIdx + 1

            const tId = edge.view.target
            const tLastIdx = indexTable.get(tId) ?? 0
            edge.view.targetPortLen = tLastIdx + 1
        })
    }

}




