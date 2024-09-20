import { EdgeData, NodeData } from "./cell"
import { GraphView, GraphStateView } from "./view"

export abstract class StateExtend<
    StateKey,
    StateNodeData extends NodeData,
    StateEdgeData extends EdgeData,
    ExtraData,
    Upper extends {
        [key: string]: StateExtend<
            StateKey,
            StateNodeData,
            StateEdgeData,
            ExtraData>
    } = any,
    File = any,
    View extends GraphStateView<any, any> = any,
> {

    abstract readonly key: StateKey
    readonly viewId: string = null as any
    readonly states: Upper = null as any

    abstract updateNode(id: string, data?: StateNodeData): void
    abstract updateEdge(id: string, data?: StateEdgeData): void

    stateInit(viewId: string, states: Upper) {
        (this.states as any) = states;
        (this.viewId as any) = viewId;
    }

    getNodes(res: StateNodeData[]): StateNodeData[] {
        return res
    }

    getEdges(res: StateEdgeData[]): StateEdgeData[] {
        return res
    }

    getView() {
        const view = GraphView.finder.get(this.viewId)
        if (!view) throw new Error('view not found')
        return view as View
    }

    setNodeSize(id: string, size: { width: number, height: number }){
        console.log(id, size)
        this.getNodes([]).forEach(node => {
            if (node.id === id) {
                node.view.height = size.height
                node.view.width = size.width
            }
        })
    }

    abstract save(): File

    abstract load(cache: File | null, extra: ExtraData)

    dispose() { }
}


export class GraphStateCenter<
    StateKey,
    GNodeData extends NodeData<string,any>,
    GEdgeData extends EdgeData<string,any>,
    Extends extends StateExtend<
        StateKey,
        GNodeData,
        GEdgeData,
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
        : GraphStateCenter<StateKey, GNodeData, GEdgeData, Extends, S & T> {
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
        return this.list.reduce<GNodeData[]>((res, state) => state.getNodes(res), [])
    }

    getEdges() {
        const edges = this.list.reduce<GEdgeData[]>((res, state) => state.getEdges(res), [])
        return edges
    }

    dispose() {
        this.list.forEach(v => v.dispose())
    }
}