import { Graph } from "@antv/x6"
import { GraphStateView } from "../base/view"
import { nanoid } from "nanoid"
import { contextMenu } from "@renderer/view/fixed/contextmenu"
import { Menu, PopMenuListHandler } from "@renderer/components/base/PopMenu"
import { appTab } from "@renderer/state/tab"
import { PageSqlEditor } from "@renderer/page/sqlEditor"
import { PageJsonEditor } from "@renderer/page/jsonEditor"
import { CommonFormBuilder } from "@renderer/components/form"
import { PageDataForm } from "@renderer/page/dataForm"
import { RunnerTaskConfig, RunnerTaskStep, SqliteRunnerStep } from "@common/runner"
import { AllEdgeData, AllNodeData, RunnerGraphStateCenter } from "./states"
import { isSqlNodeData } from "./sql/cell"
import { isJsonNodeData } from "./json/cell"
import { FlowNodeData, isFlowNodeData } from "./flow/cell"
import { toX6Node } from "../base/cell"
import { isScopeNodeData } from "./scope/cell"




export class RunnerGraphView extends GraphStateView<AllNodeData, AllEdgeData> {
    static finder: Map<string, RunnerGraphView> = new Map()
    readonly viewId: string = nanoid()
    readonly state = RunnerGraphStateCenter.create(this.viewId)
    readonly clientId: string
    constructor(clientId: string) {
        super()
        this.clientId = clientId
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
            n._x6 = toX6Node(n.view, n._x6)
        })
        this.graph = graph

        return graph
    }
    dispose() {
        super.dispose()
        RunnerGraphView.finder.delete(this.viewId)
    }

    save() {
        return this.state.list.reduce((res, state) => {
            res[state.key] = state.save()
            return res
        }, {})
    }

    load(cache: any = null) {
        console.log('cache', cache)
        this.state.list.forEach(state => {
            state.load(cache?.[state.key] ?? null, null)
        })
        console.log('nodes', this.state.getNodes())
        this.refresh()
    }

    refreshNode(node: AllNodeData) {
        this.state.updateNode(node.id, node)
        this.refresh()
    }

    onNodeContextMenu({
        event, data
    }: {
        event: MouseEvent,
        data: AllNodeData
    }) {
        if (isScopeNodeData(data)) {
            console.log('data1', data.meta.fields)

            const remove = Menu.submenu({
                icon: 'del', key: 'removeField', label: '删除字段', menu: PopMenuListHandler.create(
                    data.meta.fields.map(field => Menu.button({
                        icon: 'del',
                        key: field,
                        label: field,
                        action: () => {
                            this.state.states.scope.removeNodeField(data, field)
                            this.refreshNode(data)
                        }
                    }))
                )
            })

            const edit = Menu.submenu({
                icon: 'del', key: 'removeField', label: '编辑字段', menu: PopMenuListHandler.create(
                    data.meta.fields.map(field => Menu.button({
                        icon: 'del',
                        key: field,
                        label: field,
                        action: () => {
                            const form = CommonFormBuilder.create()
                                .input('field', {
                                    title: '字段名', value: field
                                })
                                .build()

                            console.log('data2', data.meta.fields)

                            appTab.addTab(PageDataForm.create({
                                form,
                                title: `Runner<${data.meta.label}>`,
                                onsubmit: (value) => {
                                    const { field: newField } = value
                                    this.state.states.scope.updateNodeField(data, field, newField)

                                    console.log('data3', data.meta.fields)
                                    this.refreshNode(data)
                                }
                            }))
                            this.refreshNode(data)
                        }
                    }))
                )
            })

            const add = Menu.button({
                icon: 'del', key: 'addField', label: '添加字段', action: () => {
                    this.state.states.scope.addNodeField(data)
                    this.refreshNode(data)
                }
            })

            contextMenu.open(PopMenuListHandler.create(data.meta.fields.length ? [add, edit, remove] : [add]), event)
        }
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

        if (isJsonNodeData(data)) {
            contextMenu.open(PopMenuListHandler.create([
                Menu.button({
                    icon: 'del', key: 'editAttr', label: '修改注释', action: () => {
                        const form = CommonFormBuilder.create()
                            .input('label', {
                                title: '注释', value: data.meta.label
                            })
                            .build()

                        appTab.addTab(PageDataForm.create({
                            form,
                            title: `Runner<${data.meta.label || '未命名数据'}>`,
                            onsubmit: (value) => {
                                const { label } = value
                                data.meta.label = label
                                this.refreshNode(data)
                            }
                        }))
                    }
                }),
                Menu.button({
                    icon: 'del', key: 'editSQL', label: '修改数据', action: () => {
                        appTab.addTab(PageJsonEditor.create({
                            title: `Runner<${data.meta.label}>`,
                            value: data.meta.data,
                            save: async (value: any) => {
                                console.log('save', value)
                                await window.jsonDataApi.setData(data.id, value)
                            }
                        }))
                    }
                }),
                Menu.button({
                    icon: 'del', key: 'clearData', label: '清除数据', action: () => {
                        this.state.states.json.clearNode(data)
                        this.refreshNode(data)
                    }
                })
            ]), event)
        }

        if (isFlowNodeData(data)) {
            contextMenu.open(PopMenuListHandler.create([
                Menu.button({
                    icon: 'del', key: 'editAttr', label: '修改属性', action: () => {
                        const form = CommonFormBuilder.create()
                            .input('name', {
                                title: '名字', value: data.meta.name
                            })
                            .input('label', {
                                title: '注释', value: data.meta.label
                            })
                            .build()

                        appTab.addTab(PageDataForm.create({
                            form,
                            title: `Runner<${data.meta.label || '未命名数据'}>`,
                            onsubmit: (value) => {
                                const { label, name } = value
                                data.meta.name = name
                                data.meta.label = label
                                this.refreshNode(data)
                            }
                        }))
                    }
                }),
                Menu.button({
                    icon: 'del', key: 'runFlow', label: '执行', action: () => {
                        this.runFlow(data.id)
                    }
                }),
            ]), event)
        }


    }

    addSqlNode(fileUrl: string) {
        this.state.states.sql.addNode(fileUrl)
        this.refresh()
    }

    addJsonNode(label: string = '') {
        this.state.states.json.addJsonNode(label)
        this.refresh()
    }

    addScopeNode(label: string = '') {
        this.state.states.scope.addScopeNode(label)
        this.refresh()
    }

    addFlowNode(name: string = '') {
        this.state.states.flow.addNode(name)
        this.refresh()
    }

    addFlowEdge() {
        const form = CommonFormBuilder.create()
            .selector<'flowId', string>('flowId', {
                title: '流程节点',
                value: this.nodes.find(v => isFlowNodeData(v))?.id ?? '',
                options: (this.nodes as FlowNodeData[]).filter(v => {
                    return isFlowNodeData(v)
                }).map((node: FlowNodeData) => ({
                    key: node.id,
                    title: node.meta.name + (node.meta.label ? `(${node.meta.label})` : '')
                }))
            })
            .selector<'source', string>('source', {
                title: '流程节点',
                value: '',
                options: this.nodes
                    .filter(v => v.meta.label)
                    .map(node => ({
                        title: node.meta.label,
                        key: node.id
                    }))
            })
            .selector<'target', string>('target', {
                title: '目标节点',
                value: '',
                options: this.nodes
                    .filter(v => !isFlowNodeData(v))
                    .filter(v => v.meta.label)
                    .map(node => ({
                        title: node.meta.label,
                        key: node.id
                    }))
            })
            .build()

        appTab.addTab(PageDataForm.create({
            form,
            title: `Runner Flow`,
            onsubmit: (value) => {
                // const { label, type } = value
                // data.meta.label = label
                // data.meta.type = type
                // this.refreshNode(data)

                const { flowId, source, target } = value

                if (!flowId) return
                if (source === target) return

                this.state.states.flow.addEdge(flowId, {
                    source, target
                })

                this.refresh()
            }
        }))
    }

    runFlow(flowId: string) {
        const flowNode = this.nodes
            .filter(v => isFlowNodeData(v))
            .find(v => v.id === flowId)

        if (!flowNode) return
        const nodes: AllNodeData[] = []
        let node: AllNodeData = flowNode
        let step = 0

        while (true) {
            if (step > 50) return
            const edge = this.edges.find(v => v.view.source === node.id)
            if (!edge) { break }
            const target = this.nodes.find(v => v.id === edge.view.target)
            if (!target) { break }
            nodes.push(target)
            node = target
        }

        const config = nodes.reduce<RunnerTaskConfig>((config, node) => {
            if (isSqlNodeData(node)) {
                const step: SqliteRunnerStep = {
                    worker: 'sqlite-runner',
                    option: {
                        fileUrl: node.meta.fileUrl,
                        sql: node.meta.sql,
                        type: node.meta.type
                    }
                }

                config.steps = config.steps.concat([step])
            } else if (isJsonNodeData(node)) {
                const step: RunnerTaskStep<any> = {
                    worker: 'json-data-runner',
                    option: {
                        receiveId: node.id,
                    }
                }
                config.steps = config.steps.concat([step])
            } else {
                throw new Error('unknown step node!!!')
            }

            return config
        }, { steps: [] })


        window.runnerApi.runFlow(this.clientId, config)

    }

    setNodeSize(id: string, size: { height: number; width: any }): void {
        super.setNodeSize(id, size)
        this.state.setNodeSize(id, size)
    }
}