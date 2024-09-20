import { insertCss } from "insert-css";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate, render, RenderScope } from "../../base/template";
import { EdgeShapeKey, NodeShapeKey } from "../common";
import { Edge, Graph, Shape } from "@antv/x6";
import { initArch } from "../../addon/resizeNode";
import { FlowNodeData } from "./cell";
import { RunnerGraphView } from "../view";
import { GraphView } from "../../base/view";


interface GhRunnerFlowNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: FlowNodeData
    state: GhRunnerFlowNodeState;
}

export class GhRunnerFlowComponent {
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
            background: #ff4c30;
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
                        const name = s.get('data').meta.name || '<未命名流程>'
                        const label = s.get('data').meta.label ?? ''
                        return name + (label ? ` ( ${label} )` : '')
                    })
                )
            )
        }

        // const renderBody = (t: MTemplate<Props>) => {
        //     return t.div('gh-runner-flow__body')(

        //         t.cond(s => !!s.get('data').meta.sql)(
        //             t.pre('gh-runner-flow__code')(
        //                 t.text(s => s.get('data').meta.sql)
        //             )
        //         ),
        //         t.cond(s => !s.get('data').meta.sql)(
        //             t.div('gh-runner-flow__blank')(
        //                 t.text('No SQL')
        //             )
        //         )

        //     )
        // }


        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-runner-flow')(
                renderHeader(t),
                // renderBody(t),
                t.div('gh-runner-flow__resize')
            )
        }
        GhRunnerFlowComponent.template = renderNode(new MBaseTemplate()).build()
    }

    template = GhRunnerFlowComponent.template
    data: FlowNodeData
    state: GhRunnerFlowNodeState
    element: HTMLElement

    constructor(data: FlowNodeData) {
        this.data = data
        this.state = {
            isSelected: new MBaseValue(false),
        }
        const scope = RenderScope.create({ state: this.state, data: this.data })
        const renderNode = render<Props>(this.template, scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
        this.element.oncontextmenu = (ev) => { this.oncontextmenu?.(ev) }

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



    oncontextmenu?: (ev: MouseEvent) => void
    refresh?: () => void
    getView?: () => RunnerGraphView
}


export class GhRunnerFlowNode {
    static html(data: FlowNodeData) {
        const node = GhRunnerFlowNode.finder.get(data) ?? new GhRunnerFlowNode(data)
        return node.component.element
    }
    static finder: WeakMap<FlowNodeData, GhRunnerFlowNode> = new WeakMap()
    static {
        Shape.HTML.register({
            shape: NodeShapeKey.GH_RUNNER_FLOW_NODE,
            html(cell) {
                const data = cell.getData() as FlowNodeData
                const node = GhRunnerFlowNode.finder.get(data) ?? new GhRunnerFlowNode(data)
                return node.component.element
            },
        })
    }
    readonly component: GhRunnerFlowComponent
    readonly nodeData: FlowNodeData
    constructor(node: FlowNodeData) {
        GhRunnerFlowNode.finder.set(node, this)
        this.nodeData = node
        this.component = new GhRunnerFlowComponent(this.nodeData)
        this.component.oncontextmenu = (event) => {
            const view = this.findView()
            view.onNodeContextMenu?.({ event, data: this.nodeData })
        }
        this.component.refresh = () => {
            const view = this.findView()
            view.refreshNode(this.nodeData)
        }
        this.component.getView = () => this.findView()
    }

    findView() {
        const view = GraphView.find<RunnerGraphView>(this.nodeData._viewId)
        if (!view) throw new Error('view is not found!')
        return view
    }


}




export class GhSqlErdEdge {
    static {

        class ErdEdge extends Edge {
            // getSourcePoint() {
            //     const point = super.getSourcePoint()
            //     return point
            // }
        }

        ErdEdge.config({
            connector: { name: 'rounded' },
            router: { name: 'metro' },
            attrs: {
                wrap: {
                    connection: true,
                    strokeWidth: 10,
                    strokeLinejoin: 'round',
                },
                line: {
                    connection: true,
                    stroke: '#999',
                    strokeWidth: 2,
                    strokeLinejoin: 'round',
                    sourceMarker: {
                        name: 'ellipse',
                        rx: 5,
                        ry: 5,
                    },
                    targetMarker: {
                        name: 'block',
                        width: 10,
                        height: 10,
                    },

                },
            },
        })
        Graph.registerEdge(EdgeShapeKey.GH_RUNNER_FLOW_EDGE, ErdEdge)
    }
}