import { EdgeData, GhComponent, GraphView, NodeData } from "@renderer/mods/graph";
import { NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "./common";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate } from "@renderer/mods/template";
import { insertCss } from "insert-css";
import { initArch } from "@renderer/mods/graph/addon/resizeNode";

export interface SqlNodeMeta {
    fileUrl: string
    sql: string
    type: 'query' | 'run',
    label: string
}
export type SqlNodeData = NodeData<NodeShapeKey.GH_RUNNER_SQL_NODE, SqlNodeMeta>

export const isSqlNodeData = (node: NodeData<any, any>): node is SqlNodeData => {
    return (node as SqlNodeData).view.shape === NodeShapeKey.GH_RUNNER_SQL_NODE
}

export class RunnerSqlState extends RunnerStateExtend<
    SqlNodeData,
    EdgeData,
    {},
    { nodes: SqlNodeData[] }
> {
    readonly key = RunnerStateKey.SQL


    isCurrentNode(node: NodeData): boolean {
        return isSqlNodeData(node)
    }

    isCurrentEdge(_edge: EdgeData): boolean {
        return false
    }

    load(cache: { nodes: SqlNodeData[] } | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node._viewId = this.viewId
            this.checkNodeData(node)
        })
    }

    save() {
        return { nodes: this.nodes }
    }

}

interface GhRunnerSqlNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: SqlNodeData
    state: GhRunnerSqlNodeState;
}

export class GhRunnerSqlComponent extends GhComponent<SqlNodeData, Props> {
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
            border-radius: 50%;
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
            border-radius: 2px 2px 0 0 ;
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
        this.template = renderNode(new MBaseTemplate()).build()
    }
    static {
        GhComponent.register<SqlNodeData>(
            NodeShapeKey.GH_RUNNER_SQL_NODE,
            (data) => new GhRunnerSqlComponent(data)
        )
    }

    state: GhRunnerSqlNodeState = { isSelected: new MBaseValue(false) }
    constructor(data: SqlNodeData) {
        super(data)
        const resize = this.element.querySelector('.gh-runner-sql__resize')
        // const code = this.element.querySelector('.gh-runner-json__body')
        // if (code instanceof HTMLElement) {
        //     code.onwheel = (e) => {
        //         if (code.scrollHeight > code.clientHeight) {
        //             e.stopPropagation()
        //         }
        //     }
        // }

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

    init(data: SqlNodeData): Props {
        const state = { isSelected: new MBaseValue(false) }
        return { state, data }
    }
    template(): MBaseElementTemplateNode<HTMLDivElement, Props> {
        return GhRunnerSqlComponent.template
    }
}