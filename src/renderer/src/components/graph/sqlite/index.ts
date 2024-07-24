import { Graph } from "@antv/x6"
import { RawData, SqlErdState } from "./state"
import { GraphView } from "../view"
import './regist'

export * from './state'



export class SqlErdGraphView extends GraphView {
    private state: SqlErdState = new SqlErdState()
    protected iniGraph(): Graph {
        const element = this.container
        const container = document.createElement('div')
        element.style.display = 'flex'
        element.style.height = '100%'
        container.style.flex = '1'
        element.appendChild(container)
        const graph: Graph = new Graph({
            container,
            connecting: {
                router: 'sql-er-router'
            },
            panning: {
                enabled: true,
                eventTypes: ['leftMouseDown'],
            },
            mousewheel: {
                enabled: true,
                zoomAtMousePosition:true,
                modifiers: null,
                factor: 1.1,
                maxScale: 2,
                minScale: 0.02,
            },
            autoResize: true,
        })
        return graph
    }

    load(raw: RawData) {
        this.state.load(raw)
        this.graph?.addNodes(this.state.nodes
            .map(node => Object.assign({}, node.view, { data: node }))
        )
        this.graph?.addEdges(this.state.edges.map(edge => Object.assign({}, edge.view, { data: edge })))

        console.log(this.graph)
            ; (window as any).g = this.graph
    }

}