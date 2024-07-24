import { Graph } from "@antv/x6"

export abstract class GraphView {
    container: HTMLElement = document.createElement('div')
    graph?: Graph

    protected abstract iniGraph(): Graph

    loadContainer(container: HTMLElement) {
        this.container = container
        this.graph = this.iniGraph()
    }
}