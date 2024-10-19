import { Graph, Node } from "@antv/x6"
import { GraphStateCenter } from "./common"
import { markRaw } from "vue"


export interface WithViewData {
    view: any
}


export abstract class GraphView {
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
        this.refresh()
    }

    fitView() {
        this.graph?.zoomToFit()
    }
}


export abstract class GraphStateView<
    NodeType extends WithViewData,
    EdgeType extends WithViewData
> extends GraphView {
    nodes: NodeType[] = []
    edges: EdgeType[] = []

    abstract readonly state: GraphStateCenter<
        any,
        NodeType,
        EdgeType, any, any
    >

    constructor(){
        super()
        markRaw(this)
    }

    refresh() {
        this.graph?.removeCells(this.graph.getCells())

        this.nodes = this.state.getNodes()
        this.edges = this.state.getEdges()

        this.graph?.addNodes(this.nodes
            .map(node => Object.assign({}, node.view, { data: node }))
        )
        this.graph?.addEdges(this.edges
            .map(edge => Object.assign({}, edge.view, { data: edge }))
        )
    }

    dispose(){
        this.graph?.dispose()
        this.state?.dispose()
    }

}