import { CheckNodeData, NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { NodeViewData, toX6Node } from "@renderer/components/graph2/base/cell"
import { isScopeNodeData, ScopeNodeData, ScopeNodeMeta } from "./cell"
import { nanoid } from "nanoid"
import type { AllEdgeData, AllNodeData } from "../states"
import { Graph, KeyValue } from "@antv/x6"
import { RunnerTaskStep, ScopeDataRunnerStep } from "@common/runnerExt"

const SCOPE_INPUT_POSITION = 'SCOPE_INPUT_POSITION'

Graph.registerPortLayout(SCOPE_INPUT_POSITION, (portsPositionArgs: KeyValue<any>[]) => {
    return portsPositionArgs.map((_, idx) => {
        return {
            position: {
                x: 0,
                y: 12 + 26 + idx * 24,
            },
            angle: 0,
        }
    })
})

export class RunnerScopeState extends RunnerStateExtend<{}, { nodes: (ScopeNodeData)[] }> {
    readonly key = RunnerStateKey.SCOPE
    nodes: ScopeNodeData[] = []

    load(cache: { nodes: (ScopeNodeData)[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            this.checkNodeData(node)
        })
    }

    protected checkNodeData<ScopeNodeData>(node: CheckNodeData): ScopeNodeData {
        node.view.outputs = [{
            keyName: 'output'
        }]

        const meta = node.meta as ScopeNodeMeta

        node.view.inputLayout = SCOPE_INPUT_POSITION

        node.view.inputs = meta.fields.map(field => {
            return {
                keyName: field
            }
        })
        return super.checkNodeData(node as any) as ScopeNodeData
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
            ...this.defaultNodeSize()
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
        this.checkNodeData(node)
    }

    dispose(): void {
        super.dispose()
    }

    generateRunnerStep(node: AllNodeData, inputs: { edge: AllEdgeData; node: AllNodeData }[]): RunnerTaskStep<unknown> | null {
        if (!isScopeNodeData(node)) {
            return null
        }
        const inputTable: Map<string, string> = new Map()
        inputs.forEach(({ edge }) => {
            inputTable.set(edge.view.targetPortKey, edge.view.target)
        })
        const step: ScopeDataRunnerStep = {
            inputs: node.meta.fields.map(name => inputTable.get(name) ?? null),
            output: node.id,
            worker: 'scope-data-runner',
            option: {
                fields: node.meta.fields
            }
        }
        return step
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