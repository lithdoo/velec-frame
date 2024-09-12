import { NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { initNodeViewData, NodeViewData, toX6Node } from "@renderer/components/graph2/base/cell"
import { EdgeData } from "@renderer/components/graph2/base/cell"
import { isSqlNodeData, SqlNodeData, SqlNodeMeta } from "./cell"
import { nanoid } from "nanoid"
import { AllNodeData } from "../states"



export class RunnerSqlState extends RunnerStateExtend<{}, { nodes: SqlNodeData[] }> {
    readonly key = RunnerStateKey.SQL
    nodes: SqlNodeData[] = []

    load(cache: { nodes: SqlNodeData[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            node.view = initNodeViewData(node.view)
            node._x6 = toX6Node(node.view, {})
        })
    }

    addNode(fileUrl: string) {
        const meta: SqlNodeMeta = {
            fileUrl,
            sql: ``,
            type: 'run',
            label: ''
        }
        const id = nanoid()

        const view: NodeViewData<NodeShapeKey.GH_RUNNER_SQL_NODE> = {
            shape: NodeShapeKey.GH_RUNNER_SQL_NODE,
            id,
            zIndex: 1,
            x: 0,
            y: 0,
            ...this.defaultNodeSize(),
            inputs: [],
            outputs: []
        }
        const node: SqlNodeData = {
            id,
            meta,
            view,
            _viewId: this.viewId,
            _x6: toX6Node(view, {})
        }

        this.nodes.push(node)
    }

    save() {
        return { nodes: this.nodes }
    }

    getNodes(res: AllNodeData[]): AllNodeData[] {
        return res.concat(this.nodes)
    }

    updateNode(id: string, node?: AllNodeData) {
        let nodes = this.nodes.filter(n => n.id !== id)
        if (node && isSqlNodeData(node)) {
            nodes = nodes.filter(n => n.id !== node.id).concat([{ ...node }])
        }
        this.nodes = nodes
    }

    updateEdge(_id: string, _data?: EdgeData<string, any> | undefined): void {

    }

    setNodeSize(id: string, size: { width: number; height: number; }) {
        const node = this.nodes.find(v => v.id == id)
        if (!node) return
        node.view.height = size.height
        node.view.width = size.width
    }

    private defaultNodeSize() {
        return { width: 360, height: 480 }
    }
}
