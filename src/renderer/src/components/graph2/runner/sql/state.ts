import { CheckNodeData, NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { initNodeViewData, NodeViewData, toX6Node } from "@renderer/components/graph2/base/cell"
import { EdgeData } from "@renderer/components/graph2/base/cell"
import { isSqlNodeData, SqlNodeData, SqlNodeMeta } from "./cell"
import { nanoid } from "nanoid"
import { AllEdgeData, AllNodeData } from "../states"
import { RunnerTaskStep, SqliteRunnerStep } from "@common/runnerExt"



export class RunnerSqlState extends RunnerStateExtend<{}, { nodes: SqlNodeData[] }> {
    readonly key = RunnerStateKey.SQL
    nodes: SqlNodeData[] = []


    protected checkNodeData<SqlNodeData>(node: CheckNodeData): SqlNodeData {
        node.view.outputs = [{
            keyName: 'output'
        }]
        node.view.inputs = [{
            keyName: 'input'
        }]
        return super.checkNodeData(node as any) as SqlNodeData
    }

    load(cache: { nodes: SqlNodeData[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            this.checkNodeData(node)
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
            ...this.defaultNodeSize()
        }
        const node: SqlNodeData = this.checkNodeData({
            id,
            meta,
            view,
            _viewId: this.viewId,
        })

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

    generateRunnerStep(node: AllNodeData, inputs: { edge: AllEdgeData; node: AllNodeData }[]): RunnerTaskStep<unknown> | null {
        if(!isSqlNodeData(node)){
            return null
        }

        const step :SqliteRunnerStep= {
            inputs : [inputs[0]?.node.id].filter(v=>!!v) as string[],
            output: node.id,
            worker: 'sqlite-runner',
            option: {
                type: node.meta.type,
                sql: node.meta.sql,
                fileUrl: node.meta.fileUrl
            }
        }

        return step
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
