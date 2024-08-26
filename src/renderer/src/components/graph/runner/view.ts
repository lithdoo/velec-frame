import { Graph } from "@antv/x6"
import { AllNodeData, isSqlNodeData, RunnerGraphStateCenter, RunnerSqlState } from "./state"
import { GraphView } from "../view"
import { nanoid } from "nanoid"
import { contextMenu } from "@renderer/view/fixed/contextmenu"
import { Menu, PopMenuListHandler } from "@renderer/components/base/PopMenu"
import { appTab } from "@renderer/state/tab"
import { PageSqlEditor } from "@renderer/page/sqlEditor"
import { CommonFormBuilder } from "@renderer/components/form"
import { PageDataForm } from "@renderer/page/dataForm"

const state = (viewId: string) => {
    return new RunnerGraphStateCenter({}, [])
        .extends({ sql: new RunnerSqlState(viewId) })
        .init()
}

export class RunnerGraphView extends GraphView {
    static finder: Map<string, RunnerGraphView> = new Map()
    readonly viewId: string = nanoid()
    private readonly state = state(this.viewId)
    constructor() {
        super()
        RunnerGraphView.finder.set(this.viewId, this)
    }
    protected initGraph(): Graph {
        const container = this.inner
        const graph: Graph = new Graph({
            container,
            // connecting: {
            //     router: 'sql-er-router'
            // },
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

        this.graph = graph

        return graph
    }
    dispose() {
        RunnerGraphView.finder.delete(this.viewId)
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

    save() {
        return this.state.list.reduce((res, state) => {
            res[state.key] = state.save()
            return res
        }, {})
    }

    load(cache: any = null) {
        this.state.list.forEach(state => {
            state.load(cache?.[state.key] ?? null, null)
        })
        this.refresh()
    }

    refreshNode(node: AllNodeData) {
        this.state.update(node)
        this.refresh()
    }

    onNodeConnectMenu({
        event, data
    }: {
        event: MouseEvent,
        data: AllNodeData
    }) {

        if (isSqlNodeData(data)) {
            contextMenu.open(PopMenuListHandler.create([
                Menu.button({
                    icon: 'del', key: 'editAttr', label: '修改属性', action: () => {
                        const form = CommonFormBuilder.create()
                            .input('label', {
                                title: '注释', value: data.meta.label
                            })
                            .selector<'type', 'query' | 'run'>('type', {
                                title: '类型',
                                value: data.meta.type,
                                options: [
                                    { key: 'query', title: 'query' },
                                    { key: 'run', title: 'run' },
                                ]
                            })
                            .fileUrl('fileUrl', {
                                title: '数据库',
                                value: data.meta.fileUrl,
                                extensions: ['db']
                            })
                            .build()

                        appTab.addTab(PageDataForm.create({
                            form,
                            title: `Runner<${data.meta.fileUrl}>`,
                            onsubmit: (value) => {
                                const { label, type } = value
                                data.meta.label = label
                                data.meta.type = type
                                this.refreshNode(data)
                            }
                        }))
                    }
                }),
                Menu.button({
                    icon: 'del', key: 'editSQL', label: '修改 SQL', action: () => {
                        appTab.addTab(PageSqlEditor.create({
                            title: `Runner<${data.meta.fileUrl}>`,
                            content: data.meta.sql,
                            save: (sql) => {
                                data.meta.sql = sql
                                this.refreshNode(data)
                            }
                        }))
                    }
                }),
            ]), event)
        }
    }

    addSqlNode(fileUrl: string) {
        this.state.states.sql.addNode(fileUrl)
        this.refresh()
    }


    setNodeSize(id: string, size: { height: number; width: any }): void {
        super.setNodeSize(id,size)
        this.state.setNodeSize(id,size)
    }
}