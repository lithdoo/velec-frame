import { NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { initNodeViewData, NodeViewData, toX6Node } from "@renderer/components/graph2/base/cell"
import { isScopeNodeData, ScopeNodeData, ScopeNodeMeta } from "./cell"
import { nanoid } from "nanoid"
import type { AllNodeData } from "../states"


export class RunnerScopeState extends RunnerStateExtend<{}, { nodes: (ScopeNodeData)[] }> {
    readonly key = RunnerStateKey.JSON
    nodes: ScopeNodeData[] = []

    load(cache: { nodes: (ScopeNodeData)[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            node.view = initNodeViewData(node.view)
            node._x6 = toX6Node(node.view, node._x6 ?? {})
        })
    }


    addScopeNode(label: string) {
        const id = nanoid()
        const meta: ScopeNodeMeta = {
            label,
            fields: []
        }
        const view: NodeViewData<NodeShapeKey.GH_RUNNER_SCOPE_NODE> = {
            shape: NodeShapeKey.GH_RUNNER_SCOPE_NODE,
            id,
            zIndex: 1,
            x: 0,
            y: 0,
            ...this.defaultNodeSize(),
            inputs: [],
            outputs: []
        }
        const node: ScopeNodeData = {
            id,
            meta,
            view,
            _viewId: this.viewId,
            _x6: toX6Node(view, {}),
        }

        this.addNodeField(node)
        this.nodes.push(node)
    }

    save() {
        return { nodes: [...this.nodes] }
    }

    getNodes(res: AllNodeData[]): AllNodeData[] {
        return res.concat(this.nodes)
    }

    updateNode(id: string, node?: AllNodeData) {
        let nodes = this.nodes.filter(v => v.id !== id)
        if (node && isScopeNodeData(node)) {
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

    private updateNodeHeight(node: ScopeNodeData) {
        node.view.height = 28 + node.meta.fields.length * 24
        node._x6 = toX6Node(node.view, node._x6)
    }

    dispose(): void {
        super.dispose()
    }


    addNodeField(node: ScopeNodeData) {
        let name = 'field'
        let idx = 0

        while (node.meta.fields.findIndex(v => v === name) >= 0) {
            idx = idx + 1
            name = 'field ' + idx
        }
        node.meta.fields = node.meta.fields.concat([name])
        this.updateNodeHeight(node)

        return node
    }

    removeNodeField(node: ScopeNodeData, field: string) {
        node.meta.fields = node.meta.fields.filter(v => v !== field)
        this.updateNodeHeight(node)
        return node
    }

    updateNodeField(node: ScopeNodeData, old: string, newField: string) {
        console.log({ node, old, newField })
        const oldIdx = node.meta.fields.findIndex(v => v === old)
        const newIdx = node.meta.fields.findIndex(v => v === newField)
        if (oldIdx < 0) return node
        if (newIdx >= 0) throw new Error()

        node.meta.fields = node.meta.fields.map(v => v === old ? newField : v)
        this.updateNodeHeight(node)
        return node
    }
}