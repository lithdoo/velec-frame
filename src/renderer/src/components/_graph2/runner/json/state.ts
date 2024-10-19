import { CheckNodeData, NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { NodeViewData, toX6Node } from "@renderer/components/graph2/base/cell"
import { isJsonNodeData, JsonNodeData, JsonNodeMeta } from "./cell"
import { nanoid } from "nanoid"
import type { AllEdgeData, AllNodeData } from "../states"
import { JsonDataRunnerStep, RunnerTaskStep } from "@common/runnerExt"

export class RunnerJsonState extends RunnerStateExtend<{}, { nodes: JsonNodeData[] }> {
    readonly key = RunnerStateKey.JSON
    nodes: JsonNodeData[] = []
    readonly onDataLoaded: string


    protected checkNodeData<JsonNodeData>(node: CheckNodeData): JsonNodeData {
        node.view.outputs = [{
            keyName: 'output'
        }]
        node.view.inputs = [{
            keyName: 'input'
        }]
        return super.checkNodeData(node as any) as JsonNodeData
    }


    constructor() {
        super()
        this.onDataLoaded = window.jsonDataApi.onDataLoaded((_, receiveId) => {
            this.updateData(receiveId)
        })
    }

    load(cache: { nodes: JsonNodeData[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            if(!node.meta.isBlank) {
                window.jsonDataApi.setData(node.id,node.meta.data)
            }
            this.checkNodeData(node)
        })
    }

    addJsonNode(label: string) {
        const id = nanoid()
        const meta: JsonNodeMeta = {
            label,
            data: null,
            isBlank: true,
        }
        const view: NodeViewData<NodeShapeKey.GH_RUNNER_JSON_NODE> = {
            shape: NodeShapeKey.GH_RUNNER_JSON_NODE,
            id,
            zIndex: 1,
            x: 0,
            y: 0,
            ...this.defaultNodeSize()
        }

        const node: JsonNodeData = this.checkNodeData({
            id,
            meta,
            view,
            _viewId: this.viewId,
        })

        this.nodes.push(node)
    }

    save() {
        return { nodes: ([] as JsonNodeData[]).concat(this.nodes) }
    }

    getNodes(res: AllNodeData[]): AllNodeData[] {
        return res.concat(this.nodes)
    }

    updateNode(id: string, node?: AllNodeData) {
        let nodes = this.nodes.filter(v => v.id !== id)
        if (node && isJsonNodeData(node)) {
            nodes = nodes.concat([node])
        }
        this.nodes = nodes
    }

    updateEdge(): void { }

    setNodeSize(id: string, size: { width: number; height: number; }) {
        const node = this.nodes.find(v => v.id == id)
        if (!node) return
        node.view.height = size.height
        node.view.width = size.width
    }

    private defaultNodeSize() {
        return { width: 360, height: 120 }
    }

    dispose(): void {
        super.dispose()
        console.log('dispose')
        window.jsonDataApi.offDataLoaded(this.onDataLoaded)
    }

    private async updateData(receiveId: string) {
        const nodes = this.nodes.filter(v => v.id === receiveId)
        if (nodes.length > 0) {
            const data = await window.jsonDataApi.getData(receiveId)
            if (data !== undefined) {
                nodes.forEach(v => {
                    v.meta.data = data
                    v.meta.isBlank = false
                })
            } else {
                nodes.forEach(v => {
                    v.meta.data = undefined
                    v.meta.isBlank = true
                })
            }
            const view = this.getView()
            nodes.forEach(v => {
                view.refreshNode(v)
            })
        }

        console.log(this.getView(), nodes, this.nodes)
    }

    clearNode(node: JsonNodeData) {
        node.meta.isBlank = true
        node.meta.data = undefined
    }

    generateRunnerStep(node: AllNodeData, inputs: { edge: AllEdgeData; node: AllNodeData }[]): JsonDataRunnerStep | null {
        if (isJsonNodeData(node)) {
            return {
                inputs: inputs.map(v => v.node.id),
                output: node.id,
                worker: 'json-data-runner',
                option: {
                    receiveId: node.id
                }
            }
        } else {
            return null
        }
    }
}