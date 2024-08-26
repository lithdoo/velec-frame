import { Graph } from "@antv/x6"
import { GraphView } from "../view"
import './regist'
import { nanoid } from "nanoid"
import { ErdGraphStateCenter, NodeData, RawData } from "./state"
import { BaseState } from "./base"
import { LabelState, VFkeyState } from "./extra"
import { SqliteDataType, TableInfo } from "@common/sql"

const state = (viewId: string) => {
    return new ErdGraphStateCenter({}, [])
        .extends({ base: new BaseState(viewId) })
        .extends({ label: new LabelState(viewId) })
        .extends({ vfkey: new VFkeyState(viewId) })
        .init()
}

export class SqlErdGraphView extends GraphView {
    static finder: Map<string, SqlErdGraphView> = new Map()

    readonly viewId: string = nanoid()
    private readonly state = state(this.viewId)
    constructor() {
        super()
        SqlErdGraphView.finder.set(this.viewId, this)
    }
    protected initGraph(): Graph {
        const container = this.inner
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

    dispose() {
        SqlErdGraphView.finder.delete(this.viewId)
    }

    load(raw: RawData, cache: any = null) {
        this.state.list.forEach(state => {
            state.load(cache?.[state.key] ?? null, raw)
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
    }

    getNodeLabels(table: TableInfo<SqliteDataType>) {
        const res: Record<string, string> = {}
        res[table.name] = this.state.states.label.get(table.name)
        table.fieldList.forEach(field => {
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