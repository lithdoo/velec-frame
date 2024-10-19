import { insertCss } from "insert-css";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate, render, RenderScope } from "../../base/template";
import { NodeShapeKey } from "../common";
import { RunnerGraphView } from "../view";
import { Shape } from "@antv/x6";
import { initArch } from "../../addon/resizeNode";
import { ScopeNodeData } from "./cell";

interface GhRunnerScopeNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: ScopeNodeData
    state: GhRunnerScopeNodeState;
}

export class GhRunnerScopeComponent {
    static {
        insertCss(/*css*/`
        .gh-runner-scope{
            border: 2px solid #4d4E53;
            border-radius: 4px;
            background: #2F3035;
            height: 100%;

            display: flex;
            flex-direction: column;
            cursor: default;
            position: relative;
        }

        .gh-runner-scope__resize{
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

        .gh-runner-scope__header{
            display:flex;
            align-items: center;    
            justify-content: center;
            height: 24px;
            line-height: 18px;
            background: #ED4C67;
            font-size: 12px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 600;
            flex: 0 0 auto;
            border-radius: 2px 2px 0 0 ;
        }


        
        .gh-runner-scope__body{
            flex: 1 1 0;
            height: 0;
            overflow: auto;
            position: relative;
        }

        .gh-runner-scope__field{
            height: 24px;
            display: flex;
            flex-direction: row;
            overflow:hidden;
            align-items: center;    
            justify-content: center;
        }
        .gh-runner-scope__field-name{
            flex: 1 1 0;
            width: 0;
            overflow:hidden;
            padding: 0 4px;
        }
        .gh-runner-scope__field-button{
            flex: 0 0 auto;
            font-size: 12px;
            cursor: pointer;
            padding: 0 4px;
        }
        `)
    }

    static template: MBaseElementTemplateNode<HTMLDivElement, Props>
    static {
        const renderHeader = (t: MTemplate<Props>) => {
            return t.div('gh-runner-scope__header')(
                t.div('gh-runner-scope__name')(
                    t.text(s => {
                        const label = s.get('data').meta.label || '<未命名数据>'
                        return label
                    })
                )
            )
        }

        const renderViewField = (t: MTemplate<{
            name: string
        }>) => {
            return t.div('gh-runner-scope__field')(
                t.div('gh-runner-scope__field-name')(t => t.text(s => {
                    return s.get('name') ?? '<blank>'
                })),
                // t.div('gh-runner-scope__field-button')(t => t.text('编辑'))
            )
        }

        const renderBody = (t: MTemplate<Props>) => {
            return t.div('gh-runner-scope__body')(
                t.loop(s => s.get('data').meta.fields)(
                    s => s.prop(s => ({
                        name: s.get('_item')
                    }))(t => renderViewField(t))
                )
            )
        }

        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-runner-scope')(
                renderHeader(t),
                renderBody(t),
                t.div('gh-runner-scope__resize')
            )
        }

        GhRunnerScopeComponent.template = renderNode(new MBaseTemplate()).build()
    }

    template = GhRunnerScopeComponent.template
    data: ScopeNodeData
    state: GhRunnerScopeNodeState
    element: HTMLElement

    constructor(data: ScopeNodeData) {
        this.data = data
        this.state = {
            isSelected: new MBaseValue(false),
        }
        const scope = RenderScope.create({ state: this.state, data: this.data })
        const renderNode = render<Props>(this.template, scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
        this.element.oncontextmenu = (ev) => {
            console.log(ev)
            this.oncontextmenu?.(ev)
        }

        const resize = this.element.querySelector('.gh-runner-scope__resize')

        const code = this.element.querySelector('.gh-runner-scope__body')
        if (code instanceof HTMLElement) {
            code.onwheel = (e) => {
                if (code.scrollHeight > code.clientHeight) {
                    e.stopPropagation()
                }
            }
        }

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
                    const { width } = size
                    console.log({ width })
                    Object.assign(data.view, { width })
                    const view = this.getView?.()
                    if (!view) throw new Error('view is not found!')
                    view.setNodeSize(this.data.id, { height: data.view.height, width })
                }
            )
        }
    }



    oncontextmenu?: (ev: MouseEvent) => void
    refresh?: () => void
    getView?: () => RunnerGraphView
}


export class GhRunnerScopeNode {
    static html(data: ScopeNodeData) {
        const node = GhRunnerScopeNode.finder.get(data) ?? new GhRunnerScopeNode(data)
        return node.component.element
    }
    static finder: WeakMap<ScopeNodeData, GhRunnerScopeNode> = new WeakMap()
    static {
        Shape.HTML.register({
            shape: NodeShapeKey.GH_RUNNER_SCOPE_NODE,
            html(cell) {
                const data = cell.getData() as ScopeNodeData
                const node = GhRunnerScopeNode.finder.get(data) ?? new GhRunnerScopeNode(data)
                return node.component.element
            },
        })
    }
    readonly component: GhRunnerScopeComponent
    readonly nodeData: ScopeNodeData
    constructor(node: ScopeNodeData) {
        GhRunnerScopeNode.finder.set(node, this)
        this.nodeData = node
        this.component = new GhRunnerScopeComponent(this.nodeData)
        this.component.oncontextmenu = (event) => {
            const view = this.findView()
            view.onNodeContextMenu?.({ event, data: this.nodeData })
        }
        // this.component.refresh = () => {
        //     const view = this.findView()
        //     view.refreshNode(this.nodeData)
        // }
        this.component.getView = () => this.findView()
    }

    findView() {
        const view = RunnerGraphView.finder.get(this.nodeData._viewId)
        if (!view) throw new Error('view is not found!')
        return view
    }


}