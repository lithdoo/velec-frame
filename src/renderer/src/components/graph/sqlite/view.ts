import { Graph } from "@antv/x6"
import { EdgeData, NodeData, RawData, SqlErdState } from "./state"
import { GraphView } from "../view"
import './regist'
import { nanoid } from "nanoid"


export class SqlErdGraphView extends GraphView {
    static finder: Map<string, SqlErdGraphView> = new Map()

    readonly viewId: string = nanoid()
    constructor() {
        super()
        SqlErdGraphView.finder.set(this.viewId, this)
    }

    dispose() {
        SqlErdGraphView.finder.delete(this.viewId)
    }

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
                zoomAtMousePosition: true,
                modifiers: null,
                factor: 1.1,
                maxScale: 2,
                minScale: 0.02,
            },
            autoResize: true,
        })

        graph.on('node:change:position', ({ node, current }) => {
            const n = this.state.nodes.find(v => v.id === node.id)
            if (!current || !n) { return }
            n.view.x = current.x
            n.view.y = current.y
        })

        return graph
    }

    private readonly state: SqlErdState = new SqlErdState(this.viewId)

    load(raw: RawData, cache: { nodes: NodeData[], edges: EdgeData[] } | null = null) {
        this.state.load(raw, cache)
        this.refresh()
    }

    refresh() {
        console.log(this.state)
        this.graph?.removeCells(this.graph.getCells())

        this.graph?.addNodes(this.state.nodes
            .map(node => Object.assign({}, node.view, { data: node }))
        )
        this.graph?.addEdges(this.state.edges
            .map(edge => Object.assign({}, edge.view, { data: edge }))
        )
    }

    onNodeConnectMenu?: (_option: {
        event: MouseEvent,
        data: NodeData
    }) => void

    save() {
        return this.state.save()
    }
}