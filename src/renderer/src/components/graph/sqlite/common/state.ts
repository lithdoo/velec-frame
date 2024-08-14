import type { EdgeData, EdgeShapeKey, ErdStateKey, NodeData, NodeShapeKey, RawData } from ".";




export abstract class StateExtend<
    Upper extends { [key: string]: StateExtend<any> },
    File = any
> {

    abstract readonly key: ErdStateKey
    readonly viewId: string = null as any
    readonly states: Upper = null as any

    constructor(viewId: string) {
        this.viewId = viewId
    }

    init(states: Upper) {
        (this.states as any) = states;
    }


    getNodes(res: NodeData[]): NodeData<NodeShapeKey, any>[] {
        return res
    }

    getEdges(res: EdgeData[]): EdgeData<EdgeShapeKey, any>[] {
        return res
    }

    abstract save(): File

    abstract load(raw: RawData, cache: File | null)

}


export class GraphStateCenter<S extends { [key: string]: StateExtend<any, any> }> {

    readonly states: S
    readonly list: StateExtend<any, any>[]
    constructor(states: S, list: StateExtend<any, any>[]) {
        this.states = states
        this.list = list
    }

    extends<T extends { [key: string]: StateExtend<any> }>(states: T)
        : GraphStateCenter<S & T> {
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
        return this.list.reduce<EdgeData[]>((res, state) => state.getEdges(res), [])
    }

}




