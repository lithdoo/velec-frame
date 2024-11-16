import { insertCss } from "insert-css";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate, render, RenderScope } from "../../base/template";
import { NodeShapeKey } from "../common";
import { RunnerGraphView } from "../view";
import { Shape } from "@antv/x6";
import { initArch } from "../../addon/resizeNode";
import { JsonNodeData } from "./cell";

interface GhRunnerJsonNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: JsonNodeData
    state: GhRunnerJsonNodeState;
}

export class GhRunnerJsonComponent {
    static {
        insertCss(/*css*/`
        .gh-runner-json{
            border: 2px solid #4d4E53;
            border-radius: 4px;
            background: #2F3035;
            height: 100%;

            display: flex;
            flex-direction: column;
            cursor: default;
            position: relative;
        }

        .gh-runner-json__resize{
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

        .gh-runner-json__header{
            display:flex;
            align-items: center;    
            justify-content: center;
            height: 24px;
            line-height: 18px;
            background: #a6915c;
            font-size: 12px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 600;
            flex: 0 0 auto;
            border-radius: 2px 2px 0 0 ;
        }

        .gh-runner-json__name{
            flex: 1 1 0;
            width: 0;
        }
        
        .gh-runner-json__body{
            flex: 1 1 0;
            height: 0;
            overflow: auto;
            position: relative;
        }
        .gh-runner-json__code{
            padding: 4px;
            line-height: 1.5;
        }
        .gh-runner-json__blank{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.4);
            font-size: 12px;
        }
        `)
    }

    static template: MBaseElementTemplateNode<HTMLDivElement, Props>
    static {
        const renderHeader = (t: MTemplate<Props>) => {
            return t.div('gh-runner-json__header')(
                t.div('gh-runner-json__name')(
                    t.text(s => {
                        const label = s.get('data').meta.label || '<未命名数据>'
                        return label
                    })
                )
            )
        }

        const renderBody = (t: MTemplate<Props>) => {
            return t.div('gh-runner-json__body')(

                t.cond(s => !s.get('data').meta.isBlank)(
                    t.pre('gh-runner-json__code')(
                        t.text(s => s.get('data').meta.data === null
                            ? 'null'
                            : JSON.stringify(s.get('data').meta.data, null, 2)
                        )
                    )
                ),
                t.cond(s => !!s.get('data').meta.isBlank)(
                    t.div('gh-runner-json__blank')(
                        t.text('No Data')
                    )
                )

            )
        }


        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-runner-json')(
                renderHeader(t),
                renderBody(t),
                t.div('gh-runner-json__resize')
            )
        }
        GhRunnerJsonComponent.template = renderNode(new MBaseTemplate()).build()
    }

    template = GhRunnerJsonComponent.template
    data: JsonNodeData
    state: GhRunnerJsonNodeState
    element: HTMLElement

    constructor(data: JsonNodeData) {
        this.data = data
        this.state = {
            isSelected: new MBaseValue(false),
        }
        const scope = RenderScope.create({ state: this.state, data: this.data })
        const renderNode = render<Props>(this.template, scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
        this.element.oncontextmenu = (ev) => { this.oncontextmenu?.(ev) }

        const resize = this.element.querySelector('.gh-runner-json__resize')

        const code = this.element.querySelector('.gh-runner-json__body')
        if(code instanceof HTMLElement){
            code.onwheel = (e)=>{
                if(code.scrollHeight > code.clientHeight){
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


export class GhRunnerJsonNode {
    static html(data: JsonNodeData) {
        const node = GhRunnerJsonNode.finder.get(data) ?? new GhRunnerJsonNode(data)
        return node.component.element
    }
    static finder: WeakMap<JsonNodeData, GhRunnerJsonNode> = new WeakMap()
    static {
        Shape.HTML.register({
            shape: NodeShapeKey.GH_RUNNER_JSON_NODE,
            html(cell) {
                const data = cell.getData() as JsonNodeData
                const node = GhRunnerJsonNode.finder.get(data) ?? new GhRunnerJsonNode(data)
                return node.component.element
            },
        })
    }
    readonly component: GhRunnerJsonComponent
    readonly nodeData: JsonNodeData
    constructor(node: JsonNodeData) {
        GhRunnerJsonNode.finder.set(node, this)
        this.nodeData = node
        this.component = new GhRunnerJsonComponent(this.nodeData)
        this.component.oncontextmenu = (event) => {
            const view = this.findView()
            ;(view as any).onNodeContextMenu?.({ event, data: this.nodeData })
        }
        this.component.refresh = () => {
            const view = this.findView()
            ;(view as any).refreshNode(this.nodeData)
        }
        ;(this.component as any).getView = () => this.findView()
    }

    findView() {
        const view = RunnerGraphView.finder.get(this.nodeData._viewId)
        if (!view) throw new Error('view is not found!')
        return view
    }


}