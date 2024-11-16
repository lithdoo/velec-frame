import { Graph } from "@antv/x6"
import { GraphStateView } from "../base/view"
import { contextMenu, ContextMenuEvent } from "@renderer/view/fixed/contextmenu"
import { Menu, PopMenuListHandler } from "@renderer/components/base/PopMenu"
import { appTab } from "@renderer/state/tab"
import { PageSqlEditor } from "@renderer/page/sqlEditor"
import { PageJsonEditor } from "@renderer/page/jsonEditor"
import { CommonFormBuilder, OptionField } from "@renderer/components/form"
import { PageDataForm } from "@renderer/page/dataForm"
import { RunnerTaskConfig, RunnerTaskStep } from "@common/runnerExt"
import { AllEdgeData, AllNodeData, RunnerGraphStateCenter } from "./states"
import { isSqlNodeData } from "./sql/cell"
import { isJsonNodeData } from "./json/cell"
import { FlowNodeData, isFlowEdgeData, isFlowNodeData } from "./flow/cell"
import { toX6Node } from "../base/cell"
import { isScopeNodeData } from "./scope/cell"




export class RunnerGraphView extends GraphStateView<AllNodeData, AllEdgeData> {
    readonly state = RunnerGraphStateCenter.create(this.id)
    readonly clientId: string
    constructor(clientId: string) {
        super()
        this.clientId = clientId
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

        graph.on('edge:contextmenu', ({ edge, e }) => {

            this.onEdgeContextMenu({ id: edge.id, event: e },)
        })
        this.graph = graph

        return graph
    }
    dispose() {
        super.dispose()
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
        event: ContextMenuEvent,
        data: AllNodeData
    }) {

        const removeNode = Menu.button({
            icon: 'del', key: 'removeNode', label: '删除节点', action: () => {
                this.state.list.forEach(state => state.updateNode(data.id))

                this.state.getEdges()
                    .filter(edge => edge.view.source === data.id || edge.view.target === data.id)
                    .map(edge => edge.id)
                    .forEach(edgeId => this.state.list.forEach(state => state.updateEdge(edgeId)))

                this.refresh()
            }
        })

        if (isScopeNodeData(data)) {

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

            contextMenu.open(PopMenuListHandler.create(
                data.meta.fields.length
                    ? [add, edit, remove, removeNode]
                    : [add, removeNode]), event)
        }
        if (isSqlNodeData(data)) {

            const attr = Menu.button({
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
                            const { label, type, fileUrl } = value
                            data.meta.label = label
                            data.meta.type = type
                            data.meta.fileUrl = fileUrl
                            this.refreshNode(data)
                        }
                    }))
                }
            })

            const sql = Menu.button({
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
            })
            contextMenu.open(PopMenuListHandler.create([attr, sql, removeNode]), event)
        }

        if (isJsonNodeData(data)) {

            const label = Menu.button({
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
            })

            const edit = Menu.button({
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
            })

            const clear = Menu.button({
                icon: 'del', key: 'clearData', label: '清除数据', action: () => {
                    this.state.states.json.clearNode(data)
                    this.refreshNode(data)
                }
            })
            contextMenu.open(PopMenuListHandler.create([
                label, edit, clear, removeNode
            ]), event)
        }

        if (isFlowNodeData(data)) {

            const attr = Menu.button({
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
            })

            const exec = Menu.button({
                icon: 'del', key: 'runFlow', label: '执行', action: () => {
                    this.runFlow(data.id)
                }
            })

            const removeNode = Menu.button({
                icon: 'del', key: 'removeNode', label: '删除节点', action: () => {
                    this.state.list.forEach(state => state.updateNode(data.id))
                    this.state.getEdges()
                        .filter(edge => edge.view.source === data.id
                            || edge.view.target === data.id
                            || (isFlowEdgeData(edge) && edge.meta.flowId === data.id))
                        .map(edge => edge.id)
                        .forEach(edgeId => this.state.list.forEach(state => state.updateEdge(edgeId)))

                    this.refresh()

                }
            })
            contextMenu.open(PopMenuListHandler.create([
                attr, exec, removeNode
            ]), event)
        }

    }
    onEdgeContextMenu({ id, event }: { id: string, event: ContextMenuEvent, }) {
        const remove = Menu.button({
            icon: 'del', key: 'removeField', label: '删除边', action: () => {
                this.removeEdge(id)
                this.refresh()
            }
        })
        contextMenu.open(PopMenuListHandler.create([remove]), event)

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
            .selector<'sourcePort', string>('sourcePort', {
                title: '流程节点入口',
                value: '',
                options: []
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
            .selector<'targetPort', string>('targetPort', {
                title: '目标节点入口',
                value: '',
                options: []
            })
            .build()

        form.onValueChange = (value, list) => {
            const target = value.target
            const source = value.source
            console.log('target', target)
            console.log('source', source)
            const targetPort = list.fields.find(v => v.keyName === 'targetPort')
            if (targetPort) {
                (targetPort as OptionField<any, any>).options = this.nodes.find(v => v.id === value.target)?.view.inputs?.map(v => {
                    return {
                        title: v.keyName,
                        key: v.keyName
                    }
                }) || []
            }

            const sourcePort = list.fields.find(v => v.keyName === 'sourcePort')
            if (sourcePort) {
                (sourcePort as OptionField<any, any>).options = this.nodes.find(v => v.id === value.source)?.view.outputs?.map(v => {
                    return {
                        title: v.keyName,
                        key: v.keyName
                    }
                }) || []
            }
        }

        appTab.addTab(PageDataForm.create({
            form,
            title: `Runner Flow`,
            onsubmit: (value) => {
                // const { label, type } = value
                // data.meta.label = label
                // data.meta.type = type
                // this.refreshNode(data)

                const { flowId, source, target, sourcePort, targetPort } = value

                if (!flowId) return
                if (source === target) return

                this.state.states.flow.addEdge(flowId, {
                    source, target, sourcePort, targetPort
                })

                this.refresh()
            }
        }))
    }

    removeNode(nodeId: string) {
        this.state.list.forEach(v => v.updateNode(nodeId))
    }

    removeEdge(edgeId: string) {
        this.state.list.forEach(v => v.updateEdge(edgeId))
    }

    runFlow(flowId: string) {
        const flowNode = this.nodes
            .filter(v => isFlowNodeData(v))
            .find(v => v.id === flowId)

        if (!flowNode) return
        const todo: AllNodeData[] = [flowNode]
        const outputs: string[] = []
        const done: Set<string> = new Set()
        const inputsTable = new Map<AllNodeData, { node: AllNodeData, edge: AllEdgeData }[]>()
        let step = 0

        while (true) {
            if (step > 50) throw new Error('step > 50')
            step++

            const node = todo.shift()
            if (!node) break
            if (done.has(node.id)) continue

            done.add(node.id)
            outputs.push(node.id)

            const edges = this.edges
                .filter(v => v.meta.flowId === flowId)
                .filter(v => v.view.source === node.id)

            edges.forEach(edge => {
                const target = this.nodes.find(v => v.id === edge.view.target)
                if (!target) return
                inputsTable.set(
                    target,
                    (inputsTable.get(target) || [])
                        .filter(({ node }) => node.id !== target.id)
                        .concat([{ node, edge }])
                )
                todo.push(target)
            })
        }

        const steps = Array.from(inputsTable.entries()).map(([node, inputs]) => {
            console.log({ node, inputs })
            return this.state.generateRunnerStep(node, [...inputs])
        }).filter(v => !!v) as RunnerTaskStep<unknown>[]

        const config: RunnerTaskConfig = {
            outputs, steps, flows: []
        }

        console.log({ config })
        window.runnerApi.runFlow(this.clientId, config)

    }

    setNodeSize(id: string, size: { height: number; width: any }): void {
        super.setNodeSize(id, size)
        this.state.setNodeSize(id, size)
    }
}