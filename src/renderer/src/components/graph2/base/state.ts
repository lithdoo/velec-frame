import { GraphView, GraphStateView } from "./view"

export abstract class StateExtend<
    StateKey,
    NodeData,
    EdgeData,
    ExtraData,
    Upper extends {
        [key: string]: StateExtend<
            StateKey,
            NodeData,
            EdgeData,
            ExtraData>
    } = any,
    File = any,
    View extends GraphStateView<any, any> = any,
> {

    abstract readonly key: StateKey
    readonly viewId: string = null as any
    readonly states: Upper = null as any

    abstract updateNode(id: string, data?: NodeData): void
    abstract updateEdge(id: string, data?: EdgeData): void

    stateInit(viewId: string, states: Upper) {
        (this.states as any) = states;
        (this.viewId as any) = viewId;
    }

    getNodes(res: NodeData[]): NodeData[] {
        return res
    }

    getEdges(res: EdgeData[]): EdgeData[] {
        return res
    }

    getView() {
        const view = GraphView.finder.get(this.viewId)
        if (!view) throw new Error('view not found')
        return view as View
    }

    abstract setNodeSize?(id: string, size: { width: number, height: number })

    abstract save(): File

    abstract load(cache: File | null, extra: ExtraData)

    dispose() { }
}


export class GraphStateCenter<
    StateKey,
    NodeData,
    EdgeData,
    Extends extends StateExtend<
        StateKey,
        NodeData,
        EdgeData,
        any, any>,
    S extends {
        [key: string]: Extends
    }> {
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
        : GraphStateCenter<StateKey, NodeData, EdgeData, Extends, S & T> {
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

    dispose() {
        this.list.forEach(v => v.dispose())
    }
}