import { Graph, Node } from "@antv/x6"
import { type GraphStateCenter } from "./state"
import { markRaw } from "vue"
import { nanoid } from "nanoid"
import { type EdgeData, type NodeData } from "./cell"

export abstract class GraphView {
    static finder: Map<string, GraphView> = new Map()
    static find<T extends GraphView>(id: string) {
        return this.finder.get(id) as T
    }
    readonly id = nanoid()

    outer: HTMLElement = document.createElement('div')
    inner: HTMLElement = document.createElement('div')
    graph?: Graph

    protected abstract initGraph(): Graph
    abstract refresh(): void
    constructor() {
        const element = this.outer
        const container = this.inner
        element.style.display = 'flex'
        element.style.height = '100%'
        container.style.flex = '1'
        element.appendChild(container)
    }

    setNodeSize(id: string, size: { height: number, width }) {
        const node = this.graph?.getCellById(id)
        if (node instanceof Node) {
            node.setSize(size)
        }
    }

    loadContainer(outer: HTMLElement) {
        this.outer = outer
        const element = this.outer
        const container = this.inner
        element.style.display = 'flex'
        element.style.height = '100%'
        container.style.flex = '1'
        element.appendChild(container)
        this.graph = this.initGraph()
        GraphView.finder.set(this.id, this)
        this.refresh()
    }

    fitView() {
        this.graph?.zoomToFit()
    }

    dispose() {
        this.graph?.dispose()
        GraphView.finder.delete(this.id)
    }
}

export abstract class GraphStateView extends GraphView {
    nodes: NodeData[] = []
    edges: EdgeData[] = []

    abstract readonly state: GraphStateCenter<any, any>

    constructor() {
        super()
        markRaw(this)
    }


    setNodeSize(id: string, size: { height: number; width: any }): void {
        super.setNodeSize(id, size)
        this.state.setNodeSize(id, size)
    }

    refresh() {
        this.graph?.removeCells(this.graph.getCells())

        this.nodes = this.state.getNodes()
        this.edges = this.state.getEdges()

        this.graph?.addNodes(this.nodes
            .map(node => Object.assign({}, node._x6 as any, { data: node }))
        )
        this.graph?.addEdges(this.edges
            .map(edge => Object.assign({}, edge._x6, { data: edge }))
        )
    }

    dispose() {
        this.graph?.dispose()
        this.state?.dispose()
    }

}