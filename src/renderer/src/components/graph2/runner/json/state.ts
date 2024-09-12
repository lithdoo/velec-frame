import { NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { initNodeViewData, NodeViewData, toX6Node } from "@renderer/components/graph2/base/cell"
import { NodeData } from "@renderer/components/graph2/base/cell"
import { isJsonNodeData, JsonNodeData, JsonNodeMeta} from "./cell"
import { nanoid } from "nanoid"
import type { AllNodeData } from "../states"


export class RunnerJsonState extends RunnerStateExtend<{}, { nodes: JsonNodeData [] }> {
    readonly key = RunnerStateKey.JSON
    nodes: JsonNodeData[] = []
    readonly onDataLoaded: string

    constructor() {
        super()
        this.onDataLoaded = window.jsonDataApi.onDataLoaded((_, receiveId) => {
            this.updateData(receiveId)
        })
    }

    load(cache: { nodes: JsonNodeData[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes.filter(node => isJsonNodeData(node)) as JsonNodeData[]
        // this.scopeNodes = nodes.filter(node => isScopeNodeData(node)) as ScopeNodeData[]
            ;
        ([] as NodeData<string>[]).concat(this.nodes).forEach(node => {
            node._viewId = this.viewId
            node.view = initNodeViewData(node.view)
            node._x6 = toX6Node(node.view, node._x6 ?? {})
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
            ...this.defaultNodeSize(),
            inputs: [],
            outputs: []
        }
        const node: JsonNodeData = {
            id,
            meta,
            view,
            _viewId: this.viewId,
            _x6: toX6Node(view, {}),
        }

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

    updateEdge(): void {}

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
}