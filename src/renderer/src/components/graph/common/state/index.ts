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
            ExtraData,
            any>
    },
    File = any
> {

    abstract readonly key: StateKey
    readonly viewId: string = null as any
    readonly states: Upper = null as any

    constructor(viewId: string) {
        this.viewId = viewId
    }

    init(states: Upper) {
        (this.states as any) = states;
    }


    getNodes(res: NodeData[]): NodeData[] {
        return res
    }

    getEdges(res: EdgeData[]): EdgeData[] {
        return res
    }

    abstract setNodeSize?(id:string, size:{width:number,height:number})

    abstract save(): File

    abstract load(cache: File | null, extra: ExtraData)
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
    readonly list:Extends[]
    constructor(states: S, list:Extends[]) {
        this.states = states
        this.list = list
    }
    extends<T extends {
        [key: string]: Extends
    }>(states: T)
        : GraphStateCenter<StateKey, NodeData, EdgeData, Extends, S & T> {
        return new GraphStateCenter(
            { ...this.states, ...states },
            this.list.concat(Array.from(Object.values(states)))
        )
    }

    init() {
        Array.from(Object.values(this.states)).forEach(v => v.init(this.states))
        return this
    }

    getNodes() {
        return this.list.reduce<NodeData[]>((res, state) => state.getNodes(res), [])
    }

    getEdges() {
        const edges = this.list.reduce<EdgeData[]>((res, state) => state.getEdges(res), [])
        return edges
    }
}