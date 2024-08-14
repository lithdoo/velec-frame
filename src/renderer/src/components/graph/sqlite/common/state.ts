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
        const edges = this.list.reduce<EdgeData[]>((res, state) => state.getEdges(res), [])
        this.resetEdgeOffset(edges)
        return edges
    }


    private resetEdgeOffset(edges:EdgeData[]) {

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




