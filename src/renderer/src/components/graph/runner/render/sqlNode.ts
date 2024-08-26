import { insertCss } from "insert-css";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate, render, RenderScope } from "../../common";
import { NodeShapeKey, type SqlNodeData } from "../state";
import { RunnerGraphView } from "../view";
import { Node, Shape } from "@antv/x6";
import { initArch } from "../../addon/resizeNode";



interface GhRunnerSqlNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: SqlNodeData
    state: GhRunnerSqlNodeState;
}

export class GhRunnerSqlComponent {
    static {
        insertCss(/*css*/`
        .gh-runner-sql{
            border: 2px solid #4d4E53;
            border-radius: 4px;
            background: #2F3035;
            height: 100%;

            display: flex;
            flex-direction: column;
            cursor: default;
            position: relative;
        }

        .gh-runner-sql__resize{
            position: absolute;
            z-index: 1;
            right: 0;
            bottom: 0;
            height: 6px;
            width: 6px;
            background: #ccc;
            cursor: nwse-resize;
        }
        .gh-runner-sql__header{
            display:flex;
            align-items: center;    
            justify-content: center;
            height: 24px;
            line-height: 18px;
            background: #2B334B;
            font-size: 12px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 600;
            flex: 0 0 auto;
        }

        .gh-runner-sql__name{
            flex: 1 1 0;
            width: 0;
        }
        
        .gh-runner-sql__type{
            flex: 0 0 auto;
            background:rgba(255,255,255,0.1);
            padding: 0 8px;
            border-radius: 4px;
        }

        .gh-runner-sql__body{
            flex: 1 1 0;
            height: 0;
            overflow: auto;
            position: relative;
        }
        .gh-runner-sql__code{
            padding: 4px;
            line-height: 1.5;
        }
        .gh-runner-sql__blank{
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
            return t.div('gh-runner-sql__header')(
                t.div('gh-runner-sql__name')(
                    t.text(s => {
                        const name = s.get('data').meta.fileUrl.split('/').pop() ?? ''
                        const label = s.get('data').meta.label ?? ''
                        return name + (label ? ` ( ${label} )` : '')
                    })
                ),
                t.div('gh-runner-sql__type')(
                    t.text(s => s.get('data').meta.type)
                )
            )
        }

        const renderBody = (t: MTemplate<Props>) => {
            return t.div('gh-runner-sql__body')(

                t.cond(s => !!s.get('data').meta.sql)(
                    t.pre('gh-runner-sql__code')(
                        t.text(s => s.get('data').meta.sql)
                    )
                ),
                t.cond(s => !s.get('data').meta.sql)(
                    t.div('gh-runner-sql__blank')(
                        t.text('No SQL')
                    )
                )

            )
        }


        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-runner-sql')(
                renderHeader(t),
                renderBody(t),
                t.div('gh-runner-sql__resize')
            )
        }
        GhRunnerSqlComponent.template = renderNode(new MBaseTemplate()).build()
    }

    template = GhRunnerSqlComponent.template
    data: SqlNodeData
    state: GhRunnerSqlNodeState
    element: HTMLElement

    constructor(data: SqlNodeData) {
        this.data = data
        this.state = {
            isSelected: new MBaseValue(false),
        }
        const scope = RenderScope.create({ state: this.state, data: this.data })
        const renderNode = render<Props>(this.template, scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
        this.element.oncontextmenu = (ev) => { this.oncontextmenu?.(ev) }

        const resize = this.element.querySelector('.gh-runner-sql__resize')

        if (resize instanceof HTMLElement) {

            const size = () => {
                const view = this.getView?.()
                if (!view) throw new Error('view is not found!')
                if (!view.graph) throw new Error('view.graph is not found!')
                const zoom = 1 / view.graph.zoom()
                console.log({ zoom })
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


export class GhRunnerSqlNode {
    static html(data: SqlNodeData) {
        const node = GhRunnerSqlNode.finder.get(data) ?? new GhRunnerSqlNode(data)
        return node.component.element
    }
    static finder: WeakMap<SqlNodeData, GhRunnerSqlNode> = new WeakMap()
    static {
        Shape.HTML.register({
            shape: NodeShapeKey.GH_RUNNER_SQL_NODE,
            html(cell) {
                const data = cell.getData() as SqlNodeData
                const node = GhRunnerSqlNode.finder.get(data) ?? new GhRunnerSqlNode(data)
                return node.component.element
            },
        })
    }
    readonly component: GhRunnerSqlComponent
    readonly nodeData: SqlNodeData
    constructor(node: SqlNodeData) {
        GhRunnerSqlNode.finder.set(node, this)
        this.nodeData = node
        this.component = new GhRunnerSqlComponent(this.nodeData)
        this.component.oncontextmenu = (event) => {
            const view = this.findView()
            view.onNodeConnectMenu?.({ event, data: this.nodeData })
        }
        this.component.refresh = () => {
            const view = this.findView()
            view.refreshNode(this.nodeData)
        }
        this.component.getView = () => this.findView()
    }

    findView() {
        const view = RunnerGraphView.finder.get(this.nodeData._viewId)
        if (!view) throw new Error('view is not found!')
        return view
    }


}