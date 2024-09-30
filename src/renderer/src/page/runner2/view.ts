import { Graph } from "@antv/x6";
import { EdgeData, GraphStateCenter, GraphStateView, NodeData, NodeViewData, StateExtend, toX6Node } from "@renderer/mods/graph";
import { FlowNodeData, FlowNodeMeta, isFlowNodeData, RunnerFlowState } from "./flow";
import { RunnerTaskStep } from "@common/runnerExt";
import { NodeShapeKey, RunnerStateExtend } from "./common";
import { contextMenu, ContextMenuEvent } from "@renderer/view/fixed/contextmenu";
import { Menu, PopMenuListHandler } from "@renderer/components/base/PopMenu";
import { nanoid } from "nanoid";
import { JsonNodeData, JsonNodeMeta, RunnerJsonState } from "./json";
import { RunnerSqlState, SqlNodeData, SqlNodeMeta } from "./sql";
import { CommonFormBuilder, OptionField } from "@renderer/components/form";
import { appTab } from "@renderer/state/tab";
import { PageDataForm } from "../dataForm";


export class RunnerGraphStateCenter extends GraphStateCenter<RunnerStateExtend, any> {

    static create(viewId: string) {
        return new RunnerGraphStateCenter(viewId, {}, [])
            .extends({ sql: new RunnerSqlState() })
            .extends({ json: new RunnerJsonState() })
            .extends({ flow: new RunnerFlowState() })
            // .extends({ scope: new RunnerScopeState() })
            .init()
    }


    generateRunnerStep(node: NodeData, inputs: { edge: EdgeData, node: NodeData }[]): RunnerTaskStep<unknown> | null {
        let result: RunnerTaskStep<unknown> | null = null
        for (const state of this.list) {
            result = state.generateRunnerStep(node, inputs)
            if (result) { break }
        }
        return result
    }

}

export class RunnerGraphView extends GraphStateView {
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

    onEdgeContextMenu({ id, event }: { id: string, event: ContextMenuEvent, }) {
        const remove = Menu.button({
            icon: 'del', key: 'removeField', label: '删除边', action: () => {
                this.state.updateEdge(id)
                this.refresh()
            }
        })
        contextMenu.open(PopMenuListHandler.create([remove]), event)

    }

    save() {
        return this.state.list.reduce((res, state) => {
            res[state.key] = state.save()
            return res
        }, {})
    }
    load(cache: any = null) {
        // console.log('cache', cache)
        // this.state.list.forEach(state => {
        //     state.load(cache?.[state.key] ?? null, null)
        // })
        // console.log('nodes', this.state.getNodes())
        this.refresh()
    }


    async addBlankNode(type: NodeShapeKey) {

        if (!this.graph) return

        let node: null | NodeData = null
        const id = nanoid()
        const zoom = 1 / this.graph.zoom()
        const bbox = this.inner.getBoundingClientRect()
        const center = { x: bbox.width * zoom / 2, y: bbox.height * zoom / 2 }
        const { x, y } = this.graph.graphToLocal(center.x, center.y)
        let height = 48
        let width = 240

        if (type === NodeShapeKey.GH_RUNNER_FLOW_NODE) {


            const meta: FlowNodeMeta = {
                keyName: id,
                label: '空白节点',
                color: '#66ccff'
            }

            const view: NodeViewData<NodeShapeKey.GH_RUNNER_FLOW_NODE> = {
                shape: NodeShapeKey.GH_RUNNER_FLOW_NODE,
                id,
                zIndex: 1,
                outputs: [{ keyName: 'output' }],
                ... { x: x - width / 2, y: y - height / 2 },
                ... { width, height },
            }

            node = StateExtend.checkNodeData<FlowNodeData>({
                id,
                meta,
                view,
                _viewId: this.state.viewId,
            })
        }

        if (type === NodeShapeKey.GH_RUNNER_JSON_NODE) {

            const meta: JsonNodeMeta = {
                data: null,
                receiveId: nanoid(),
                label: '空白节点',
                isBlank: true,
            }



            const view: NodeViewData<NodeShapeKey.GH_RUNNER_JSON_NODE> = {
                shape: NodeShapeKey.GH_RUNNER_JSON_NODE,
                id,
                zIndex: 1,
                inputs: [{ keyName: 'input' }],
                outputs: [{ keyName: 'output' }],
                ... { x: x - width / 2, y: y - height / 2 },
                ... { width, height },
            }

            node = StateExtend.checkNodeData<JsonNodeData>({
                id,
                meta,
                view,
                _viewId: this.state.viewId,
            })
        }

        if (type === NodeShapeKey.GH_RUNNER_SQL_NODE) {
            const fileUrl = await window.explorerApi.selectFile({ extensions: ['db'] })
            if (!fileUrl) return

            const meta: SqlNodeMeta = {
                fileUrl,
                type: "query",
                sql: "",
                label: ""
            }

            const view: NodeViewData<NodeShapeKey.GH_RUNNER_SQL_NODE> = {
                shape: NodeShapeKey.GH_RUNNER_SQL_NODE,
                id,
                zIndex: 1,
                inputs: [{ keyName: 'input' }],
                outputs: [{ keyName: 'output' }],
                ... { x: x - width / 2, y: y - height / 2 },
                ... { width, height },
            }

            node = StateExtend.checkNodeData<SqlNodeData>({
                id,
                meta,
                view,
                _viewId: this.state.viewId,
            })
        }

        if (node && this.graph) {
            this.state.updateNode(node.id, node)
            this.refresh()
        }
    }


    async addFlowEdge() {
        const form = CommonFormBuilder.create()
            .selector<'flowId', string>('flowId', {
                title: '流程节点',
                value: this.nodes.find(v => isFlowNodeData(v))?.id ?? '',
                options: (this.nodes as FlowNodeData[]).filter(v => {
                    return isFlowNodeData(v)
                }).map((node: FlowNodeData) => ({
                    key: node.id,
                    title: node.meta.keyName + (node.meta.label ? `(${node.meta.label})` : '')
                }))
            })
            .selector<'source', string>('source', {
                title: '起始节点',
                value: '',
                options: this.nodes
                    .filter(v => v.meta.label)
                    .map(node => ({
                        title: node.meta.label,
                        key: node.id
                    }))
            })
            .selector<'sourcePort', string>('sourcePort', {
                title: '起始节点入口',
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
                const { flowId, source, target, sourcePort, targetPort } = value

                if (!flowId) return
                if (source === target) return

                // this.state.states.flow.addEdge(flowId, {
                //     source, target, sourcePort, targetPort
                // })

                this.refresh()
            }
        }))
    }

}

