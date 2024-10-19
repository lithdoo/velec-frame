import { CheckNodeData, EdgeShapeKey, NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "../common"
import { initEdgeViewData, NodeData, NodeViewData, toX6Edge, toX6Node } from "@renderer/components/graph2/base/cell"
import { EdgeData } from "@renderer/components/graph2/base/cell"
import { FlowEdgeData, FlowEdgeMeta, FlowNodeData, FlowNodeMeta, isFlowNodeData } from "./cell"
import { nanoid } from "nanoid"
import type { AllNodeData, AllEdgeData } from "../states"


export class RunnerFlowState extends RunnerStateExtend<{}, { nodes: FlowNodeData[], edges: FlowEdgeData[] }> {
    readonly key = RunnerStateKey.FLOW
    nodes: FlowNodeData[] = []
    edges: FlowEdgeData[] = []

    protected checkNodeData<FlowNodeData>(node: CheckNodeData): FlowNodeData {
        node.view.outputs = [{
            keyName: 'output'
        }]
        return super.checkNodeData(node as any) as FlowNodeData
    }


    load(cache: { nodes: FlowNodeData[], edges: FlowEdgeData[] } | null) {
        const nodes = cache?.nodes ?? []
        const edges = cache?.edges ?? []
        this.nodes = nodes
        this.edges = edges
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            this.checkNodeData(node)
        })

        this.edges.forEach(edge => {
            edge._viewId = this.viewId
            edge.view = initEdgeViewData(edge.view)
            edge._x6 = toX6Edge(edge.view, {})
        })
    }
    addNode(name: string) {
        const meta: FlowNodeMeta = {
            name,
            label: '',
        }

        const id = nanoid()

        const view: NodeViewData<NodeShapeKey.GH_RUNNER_FLOW_NODE> = {
            shape: NodeShapeKey.GH_RUNNER_FLOW_NODE,
            id,
            zIndex: 1,
            x: 0,
            y: 0,
            outputs: [{ keyName: 'output' }],
            ...this.defaultNodeSize(),
        }


        const node: FlowNodeData = this.checkNodeData({
            id,
            meta,
            view,
            _viewId: this.viewId,
        })

        this.nodes.push(node)
    }

    addEdge(flowId: string, option: {
        source: string, target: string, sourcePort: string, targetPort: string
    }) {
        if (this.nodes.findIndex(v => v.id === flowId) < 0) {
            return
        }

        const meta: FlowEdgeMeta = {
            flowId, color: '#000000'
        }

        const id = nanoid()

        const view: FlowEdgeData['view'] = {
            shape: EdgeShapeKey.GH_RUNNER_FLOW_EDGE,
            id,
            zIndex: 0,
            source: option.source,
            target: option.target,
            sourcePortKey: option.sourcePort,
            targetPortKey: option.targetPort,
        }

        const edge: FlowEdgeData = {
            id, view, meta, _viewId: this.viewId, _x6: toX6Edge(view, {})
        }

        this.edges = this.edges.concat(edge)
    }

    save() {
        return { nodes: this.nodes, edges: this.edges }
    }

    getNodes(res: AllNodeData[]): AllNodeData[] {
        return res.concat(this.nodes)
    }

    getEdges(res: AllEdgeData[]): AllEdgeData[] {
        return res.concat(this.edges)
    }

    updateNode(id: string, node?: NodeData) {
        let nodes = this.nodes.filter(n => n.id !== id)
        if (node && isFlowNodeData(node)) {
            nodes = nodes.concat([{ ...node }])
        }
        this.nodes = nodes
    }
    updateEdge(id: string, _data?: EdgeData) {
        const edges = this.edges.filter(n => n.id !== id)
        this.edges = edges
    }

    setNodeSize(id: string, size: { width: number; height: number; }) {
        const node = this.nodes.find(v => v.id == id)
        if (!node) return
        node.view.height = size.height
        node.view.width = size.width
    }

    private defaultNodeSize() {
        return { width: 240, height: 48 }
    }



}
