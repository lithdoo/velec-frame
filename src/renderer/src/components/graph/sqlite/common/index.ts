export * from './state'

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
