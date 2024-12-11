import { Graph, Node } from "@antv/x6"
import type { ChartViewState, EntityData } from "./ChartState"

abstract class GraphView {
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


export class ChartGraphView extends GraphView {
    static finder: WeakMap<ChartViewState, ChartGraphView> = new WeakMap()
    static entity2View(entity: EntityData) {
        const x = entity.render.pos_left
        const y = entity.render.pos_top
        const width = entity.render.size_width
        const height = entity.render.size_height
        return { x, y, width, height, shape: 'GH_SQLERD_ENTITY_NODE' }
    }
    constructor(
        public readonly state: ChartViewState
    ) {
        super()
    }
    protected initGraph(): Graph {
        const container = this.inner
        const graph: Graph = new Graph({
            container,
            // connecting: {
            //     router: 'sql-er-router'
            // },
            grid: {
                visible: true,
                type: 'dot',
                size: 20,
                args: {
                  color: '#aaaaaa', // 网点颜色
                  thickness: 1, // 网点大小
                },
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
            if (!current) { return }
            this.state.updateNodePos(node.data.id, current.x, current.y)
        })

        return graph
    }

    dispose() {
        this.graph?.dispose()
        this.state.dispose()
    }

    // load(raw: RawData, cache: any = null) {
    //     this.state.list.forEach(state => {
    //         state.load(cache?.[state.key] ?? null, raw)
    //     })
    //     this.refresh()
    // }

    // save() {
    //     return this.state.list.reduce((res, state) => {
    //         res[state.key] = state.save()
    //         return res
    //     }, {})
    // }

    refresh() {
        this.graph?.removeCells(this.graph.getCells())
        this.graph?.addNodes(this.state.getAllEntities()
            .map(node => Object.assign({}, ChartGraphView.entity2View(node), { data: node }))
        )
        // this.graph?.addEdges(this.state.getEdges()
        //     .map(edge => Object.assign({}, edge.view, { data: edge }))
        // )
    }


    // updateLabels(labels: Record<string, string>) {
    //     this.state.states.label.update(labels)
    // }

    // getNodeLabels(table: TableInfo<SqliteDataType>) {
    //     const res: Record<string, string> = {}
    //     res[table.name] = this.state.states.label.get(table.name)
    //     table.fieldList.forEach(field => {
    //         const key = `${table.name}.${field.name}`
    //         res[key] = this.state.states.label.get(key)
    //     })
    //     return res
    // }

    // onNodeContextMenu?: (_option: {
    //     event: MouseEvent,
    //     data: NodeData
    // }) => void

}
