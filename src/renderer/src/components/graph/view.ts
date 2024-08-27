import { Graph, Node } from "@antv/x6"

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
        if(node instanceof Node){
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

    fitView(){
        this.graph?.zoomToFit()
    }
}