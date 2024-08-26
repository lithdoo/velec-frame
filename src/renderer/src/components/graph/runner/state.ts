import { nanoid } from "nanoid";
import { GraphStateCenter, StateExtend } from "../common";

export enum NodeShapeKey {
    GH_RUNNER_SQL_NODE = 'GH_RUNNER_SQL_NODE',
    GH_RUNNER_JSON_NODE = 'GH_RUNNER_SQL_NODE',
}
export enum EdgeShapeKey {
    GH_RUNNER_PIPE_EDGE = 'GH_SQLERD_RELATIONSHIP_EDGE',
}
export enum RunnerStateKey {
    SQL = "GH_RUNNER_STATE_SQL",
    JSON = "GH_RUNNER_STATE_JSON",
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
export interface SqlMetaData {
    fileUrl: string
    sql: string
    type: 'query' | 'run',
    label: string
}
export interface JsonMetaData {
    data: any
    isBlank: boolean
}
export interface NodeData<S extends NodeShapeKey, Meta> {
    id: string
    view: NodeViewData<S>,
    meta: Meta,
    _viewId: string
}
export interface EdgeData<S extends EdgeShapeKey, Meta> {
    id: string
    view: EdgeViewData<S>,
    meta: Meta,
    _viewId: string
}

export type JsonNodeData = NodeData<NodeShapeKey.GH_RUNNER_JSON_NODE, JsonMetaData>
export type SqlNodeData = NodeData<NodeShapeKey.GH_RUNNER_SQL_NODE, SqlMetaData>

export type AllNodeData = JsonNodeData | SqlNodeData
export type AllEdgeData = EdgeData<EdgeShapeKey, any>


export const isSqlNodeData = (node: AllNodeData): node is SqlNodeData => {
    return (node as SqlNodeData).view.shape === NodeShapeKey.GH_RUNNER_SQL_NODE
}

export const isJsonNodeData = (node: AllNodeData): node is JsonNodeData => {
    return (node as JsonNodeData).view.shape === NodeShapeKey.GH_RUNNER_JSON_NODE
}


export abstract class RunnerStateExtend<
    Upper extends { [key: string]: RunnerStateExtend<any> },
    File = any
> extends StateExtend<
    RunnerStateKey,
    AllNodeData,
    AllEdgeData,
    null,
    Upper,
    File
> {

    abstract update(node: AllNodeData)
}


export class RunnerGraphStateCenter<S extends { [key: string]: RunnerStateExtend<any, any> }> extends GraphStateCenter<RunnerStateKey,
    AllNodeData,
    AllEdgeData, RunnerStateExtend<any, any>, S> {

    extends<T extends {
        [key: string]: RunnerStateExtend<any, any>
    }>(states: T)
        : RunnerGraphStateCenter<S & T> {
        return new RunnerGraphStateCenter(
            { ...this.states, ...states },
            this.list.concat(Array.from(Object.values(states)))
        )
    }
    getEdges() {
        const edges = super.getEdges()
        return edges
    }

    update(node: AllNodeData) {
        this.list.forEach(state => {
            state.update(node)
        })
    }

    setNodeSize(id: string, size: { height: number, width: number }) {
        this.list.forEach(v=>v.setNodeSize?.(id,size))
    }
}





export class RunnerSqlState extends RunnerStateExtend<{}, { nodes: SqlNodeData[] }> {
    readonly key = RunnerStateKey.SQL
    nodes: SqlNodeData[] = []

    constructor(viewId: string) {
        super(viewId)
    }

    load(cache: { nodes: SqlNodeData[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
        })
    }

    addNode(fileUrl: string) {
        console.log('add node', fileUrl)
        const meta: SqlMetaData = {
            fileUrl,
            sql: ``,
            type: 'run',
            label: ''
        }
        const id = nanoid()

        const node: SqlNodeData = {
            id,
            meta,
            view: {
                shape: NodeShapeKey.GH_RUNNER_SQL_NODE,
                id,
                zIndex: 1,
                x: 0,
                y: 0,
                ...this.nodeSize(meta),
            },
            _viewId: this.viewId,
        }

        this.nodes.push(node)
    }

    save() {
        return { nodes: this.nodes }
    }

    getNodes(res: AllNodeData[]): AllNodeData[] {
        return res.concat(this.nodes)
    }

    update(node: AllNodeData) {
        console.log({ node })
        if (isSqlNodeData(node)) {
            this.nodes = this.nodes.filter(n => n.id !== node.id).concat([{ ...node }])
        }
    }

    setNodeSize(id: string, size: { width: number; height: number; }) {
        const node = this.nodes.find(v => v.id == id)
        if (!node) return
        node.view.height = size.height
        node.view.width = size.width
    }

    private nodeSize(_meta: SqlMetaData) {
        return { width: 360, height: 480 }
    }
}

