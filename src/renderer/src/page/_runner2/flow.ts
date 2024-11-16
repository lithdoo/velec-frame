import { CheckNodeData, EdgeData, GhComponent, initEdgeViewData, NodeData, toX6Edge } from "@renderer/mods/graph"
import { EdgeShapeKey, NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "./common"
import { nanoid } from "nanoid"
import { insertCss } from "insert-css"
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate } from "@renderer/mods/template"
import { initArch } from "@renderer/mods/graph/addon/resizeNode"

export interface FlowNodeMeta {
    keyName: string
    label: string
    color: string
}

export type FlowNodeData = NodeData<NodeShapeKey.GH_RUNNER_FLOW_NODE, FlowNodeMeta>

export const isFlowNodeData = (node: NodeData<any, any>): node is FlowNodeData => {
    return (node as FlowNodeData).view.shape === NodeShapeKey.GH_RUNNER_FLOW_NODE
}

export interface FlowEdgeMeta {
    flowId: string, color: string
}

export const isFlowEdgeData = (node: EdgeData<any, any>): node is FlowEdgeData => {
    return (node as FlowEdgeData).view.shape === EdgeShapeKey.GH_RUNNER_FLOW_EDGE
}

export type FlowEdgeData = EdgeData<EdgeShapeKey.GH_RUNNER_FLOW_EDGE, FlowEdgeMeta>


export class RunnerFlowState extends RunnerStateExtend<
    FlowNodeData,
    FlowEdgeData,
    {},
    { nodes: FlowNodeData[], edges: FlowEdgeData[] }
> {
    readonly key = RunnerStateKey.FLOW

    protected checkNodeData<FlowNodeData>(node: CheckNodeData): FlowNodeData {
        node.view.outputs = [{
            keyName: 'output'
        }]
        return super.checkNodeData(node as any) as FlowNodeData
    }

    isCurrentEdge(edge: EdgeData): boolean {
        return isFlowEdgeData(edge)
    }

    isCurrentNode(node: NodeData): boolean {
        return isFlowNodeData(node)
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

    // private defaultNodeSize() {
    //     return { width: 240, height: 48 }
    // }

}



interface GhRunnerFlowNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: FlowNodeData
    state: GhRunnerFlowNodeState;
}


export class GhRunnerFlowComponent extends GhComponent<FlowNodeData, Props> {

    static {
        GhComponent.register<FlowNodeData>(
            NodeShapeKey.GH_RUNNER_FLOW_NODE,
            (data)=> new GhRunnerFlowComponent(data)
        )
    }
    static {
        insertCss(/*css*/`
        .gh-runner-flow{
            border: 2px solid #4d4E53;
            border-radius: 4px;
            background: #2F3035;
            height: 100%;

            display: flex;
            flex-direction: column;
            cursor: default;
            position: relative;
        }

        .gh-runner-flow__resize{
            position: absolute;
            z-index: 1;
            right: 0;
            bottom: 0;
            height: 6px;
            width: 6px;
            background: #ccc;
            cursor: nwse-resize;
            border-radius: 50%;
        }
        .gh-runner-flow__header{
            display:flex;
            align-items: center;    
            justify-content: center;
            height: 24px;
            line-height: 18px;
            font-size: 12px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 600;
            flex: 1 1 0;
            border-radius: 2px 2px 0 0 ;
        }

        .gh-runner-flow__name{
            flex: 1 1 0;
            width: 0;
            display: flex;
            align-items: center;    
            justify-content: center;
        }
        
        `)
    }
    static template: MBaseElementTemplateNode<HTMLDivElement, Props>
    static {
        const renderHeader = (t: MTemplate<Props>) => {
            return t.div('gh-runner-flow__header')(
                t.div('gh-runner-flow__name')(
                    t.text(s => {
                        const name = s.get('data').meta.keyName || '<未命名流程>'
                        const label = s.get('data').meta.label ?? ''
                        return name + (label ? ` ( ${label} )` : '')
                    })
                )
            )
        }
        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-runner-flow', {
                created: (s,element)=>{
                    element.style.setProperty('background', `${s.get('data').meta.color}`)
                }
            })(
                renderHeader(t),
                t.div('gh-runner-flow__resize')
            )
        }
        GhRunnerFlowComponent.template = renderNode(new MBaseTemplate()).build()
    }

    constructor(data:FlowNodeData){
        super(data)
        const resize = this.element.querySelector('.gh-runner-flow__resize')

        if (resize instanceof HTMLElement) {

            const size = () => {
                const view = this.getView?.()
                if (!view) throw new Error('view is not found!')
                if (!view.graph) throw new Error('view.graph is not found!')
                const zoom = 1 / view.graph.zoom()
                const { height, width } = this.data.view
                return {
                    height, width, zoom
                }
            }

            initArch(
                resize,
                size,
                (size) => {
                    Object.assign(data.view, size)
                    const view = this.getView?.()
                    if (!view) throw new Error('view is not found!')
                    view.setNodeSize(this.data.id, size)
                }
            )
            
        }

    }
    template(): MBaseElementTemplateNode<HTMLDivElement, Props> {
        return GhRunnerFlowComponent.template
    }
    init(data:FlowNodeData){
        const state = { isSelected: new MBaseValue(false) }
        return { state, data }
    }
    
}