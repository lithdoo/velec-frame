import { EdgeData, initNodeViewData, NodeData, toX6Node } from "./cell"
import { GraphView, GraphStateView } from "./view"

export type CheckNodeData<T extends NodeData<string, any> = NodeData<string, any>> = Partial<T> & {
    view: T['view'],
    id: T['id'],
    _viewId: T['_viewId'],
    meta: T['meta']
}

export abstract class StateExtend<
    StateNodeData extends NodeData = NodeData,
    StateEdgeData extends EdgeData = EdgeData,
    ExtraData = any,
    Upper extends {
        [key: string]: StateExtend
    } = any,
    File = any,
    View extends GraphStateView = any,
> {

    static checkNodeData<T extends NodeData<string, any>>(node: CheckNodeData<T>) {
        Object.assign(node.view, initNodeViewData(node.view))
        node._x6 = toX6Node(node.view, node._x6 ?? {})
        return node as T
    }

    abstract readonly key: string
    readonly viewId: string = null as any
    readonly states: Upper = null as any

    protected nodes: StateNodeData[] = []
    protected edges: StateEdgeData[] = []

    abstract save(): File
    abstract load(cache: File | null, extra: ExtraData)
    
    abstract isCurrentNode(node:NodeData): boolean
    abstract isCurrentEdge(node:EdgeData): boolean

    updateNode(id: string, node?: NodeData){
        let nodes = this.nodes.filter(v => v.id !== id)
        if (node && this.isCurrentNode(node)) {
            nodes = nodes.concat([node as StateNodeData])
        }
        this.nodes = nodes
    }

    updateEdge(id: string, edge?: EdgeData){
        let edges = this.edges.filter(v => v.id !== id)
        if (edge && this.isCurrentEdge(edge)) {
            edges = edges.concat([edge as StateEdgeData])
        }
        this.edges = edges
    }

    stateInit(viewId: string, states: Upper) {
        (this.states as any) = states;
        (this.viewId as any) = viewId;
    }

    getNodes(res: StateNodeData[]): StateNodeData[] {
        return res.concat(this.nodes)
    }

    getEdges(res: StateEdgeData[]): StateEdgeData[] {
        return res.concat(this.edges)
    }

    protected getView() {
        const view = GraphView.finder.get(this.viewId)
        if (!view) throw new Error('view not found')
        return view as View
    }

    setNodeSize(id: string, size: { width: number, height: number }) {
        this.getNodes([]).forEach(node => {
            if (node.id === id) {
                node.view.height = size.height
                node.view.width = size.width 
                node._x6 = toX6Node(node.view, node._x6 ?? {})
            }
        })
    }

    protected checkNodeData<T extends NodeData<string, any>>(node: CheckNodeData<T>) {
        Object.assign(node.view, initNodeViewData(node.view))
        node._x6 = toX6Node(node.view, node._x6 ?? {})
        return node as T
    }


    dispose() { }
}


export class GraphStateCenter<
    Extends extends StateExtend = StateExtend,
    S extends {
        [key: string]: Extends
    } = any> {
    readonly states: S
    readonly list: Extends[]
    readonly viewId: string
    constructor(viewId: string, states: S, list: Extends[]) {
        this.states = states
        this.list = list
        this.viewId = viewId
    }
    extends<T extends {
        [key: string]: Extends
    }>(states: T)
        : GraphStateCenter<Extends, S & T> {
        return new GraphStateCenter(
            this.viewId,
            { ...this.states, ...states },
            this.list.concat(Array.from(Object.values(states)))
        )
    }

    init() {
        Array.from(Object.values(this.states)).forEach(v => v.stateInit(this.viewId, this.states))
        return this
    }

    getNodes() {
        return this.list.reduce<NodeData[]>((res, state) => state.getNodes(res), [])
    }

    getEdges() {
        const edges = this.list.reduce<EdgeData[]>((res, state) => state.getEdges(res), [])
        return edges
    }

    setNodeSize(id: string, size: { height: number, width: number }) {
        this.list.forEach(v => v.setNodeSize?.(id, size))
    }

    updateNode(id: string, edge?: NodeData){
        this.list.forEach(v => v.updateNode(id, edge))
    }
    updateEdge(id: string, edge?: EdgeData){
        this.list.forEach(v => v.updateEdge(id, edge))
    }

    dispose() {
        this.list.forEach(v => v.dispose())
    }
}