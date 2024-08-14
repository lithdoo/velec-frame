import { Graph } from "@antv/x6"
import { GraphView } from "../view"
import './regist'
import { nanoid } from "nanoid"
import { GraphStateCenter, NodeData, RawData } from "./common"
import { BaseState } from "./base/state"
import { LabelState, VFkeyState } from "./extra/state"
import { SqliteDataType, TableInfo } from "@common/sql"

export const state = (viewId: string) => {
    return new GraphStateCenter({}, [])
        .extends({ base: new BaseState(viewId) })
        .extends({ label: new LabelState(viewId) })
        .extends({ vfkey: new VFkeyState(viewId) })
        .init()
}

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
            const n = this.state.getNodes().find(v => v.id === node.id)
            if (!current || !n) { return }
            n.view.x = current.x
            n.view.y = current.y
        })

        return graph
    }

    private readonly state = state(this.viewId)

    load(raw: RawData, cache: any = null) {
        this.state.list.forEach(state => {
            state.load(raw, cache?.[state.key] ?? null)
        })
        this.refresh()
    }

    save() {
        return this.state.list.reduce((res, state) => {
            res[state.key] = state.save()
            return res
        }, {})
    }

    refresh() {
        console.log(this.state)
        this.graph?.removeCells(this.graph.getCells())

        this.graph?.addNodes(this.state.getNodes()
            .map(node => Object.assign({}, node.view, { data: node }))
        )
        this.graph?.addEdges(this.state.getEdges()
            .map(edge => Object.assign({}, edge.view, { data: edge }))
        )
    }

    updateLabels(labels: Record<string, string>) {
        this.state.states.label.update(labels)
        // const node = this.state.getNodes().find(v => v.id === nodeId)
        // if (node) {
        //     node.view.labels = labels
        // }
    }

    getNodeLabels(table: TableInfo<SqliteDataType>) {
        const res: Record<string, string> = {}
        res[table.name] = this.state.states.label.get(table.name)
        table.fieldList.forEach(field=>{
            const key = `${table.name}.${field.name}`
            res[key] = this.state.states.label.get(key)
        })
        return res
    }

    onNodeConnectMenu?: (_option: {
        event: MouseEvent,
        data: NodeData
    }) => void



}