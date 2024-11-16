import { insertCss } from "insert-css";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate, render, RenderScope } from "../common";
import type { BaseNodeData } from "./base";


interface GhJsonStructNodeState {
    isSelected: MBaseValue<boolean>
    highlightFields: MBaseValue<Set<string>>
}

type Props = {
    // meta: NodeMetaData;
    // view: NodeViewData;
    data: BaseNodeData
    state: GhJsonStructNodeState;
}

export class GhSqlErdNodeComponent {
    static {
        insertCss(/*css*/`
        .gh-sql-erd{
            border: 2px solid #4d4E53;
            border-radius: 4px;
            background: #2F3035;
        }
        .gh-sql-erd__header{
            display:flex;
            align-items: center;    
            justify-content: center;
            height: 24px;
            line-height: 24px;
            background: #2B334B;
            font-size: 12px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 600;

        }
        .gh-sql-erd__body{

        }
        .gh-sql-erd__field{
            font-size: 12px;
            color: rgba(255,255,255,0.85);
            line-height: 22px;
            padding:0 4px;
            display: flex;
            flex-direction: row;
        }
        .gh-sql-erd__field-name{
            flex: 1 1 0;
            width: 0 ;
            overflow: hidden;            
        }
        .gh-sql-erd__field-type{
            color: rgba(255,255,255,0.45);
        }
        `)
    }

    static template: MBaseElementTemplateNode<HTMLDivElement, Props>
    static {

        const renderHeader = (t: MTemplate<Props>) => {
            return t.div('gh-sql-erd__header')(t.text(s => {
                const name = s.get('data').meta.name
                const label = s.get('data').meta.label ?? ''
                return name + (label ? ` ( ${label} )` : '')
            }))
        }

        const renderBody = (t: MTemplate<Props>) => {
            return t.div('gh-sql-erd__body')(
                t.loop(s => s.get('data').meta.fieldList)(t =>
                    t.prop(s => ({
                        field: s.get('_item'),
                        data: s.get('data')
                    }))(t => renderField(t))
                )
            )
        }

        const renderField = (t: MTemplate<{
            field: {
                name: string;
                originalKey: string;
                label: string;
                type: string;                // 类型
                foreignKey: boolean        // 是否外键
                primaryKey: boolean        // 是否主键
                notNull: boolean
                unique: boolean
            },
            data: BaseNodeData
        }>) => {
            return t.div('gh-sql-erd__field')(
                t.div('gh-sql-erd__field-name')(t.text(s => {
                    const name = s.get('field').name
                    const label = s.get('field').label ?? ''
                    return name + (label ? ` ( ${label} )` : '')
                })),
                t.div('gh-sql-erd__field-type')(t.text(s => `${s.get('field').type}${s.get('field').unique ? ' UNIQUE' : ''}${s.get('field').notNull ? ' NOT NULL' : ''}`))
            )
        }

        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-sql-erd')(
                renderHeader(t),
                renderBody(t),
            )
        }
        GhSqlErdNodeComponent.template = renderNode(new MBaseTemplate()).build()
    }

    template = GhSqlErdNodeComponent.template
    data: BaseNodeData
    state: GhJsonStructNodeState
    element: HTMLElement

    constructor(data: BaseNodeData) {
        this.data = data
        this.state = {
            isSelected: new MBaseValue(false),
            highlightFields: new MBaseValue(new Set())
        }
        const scope = RenderScope.create({ state: this.state, data: this.data })
        const renderNode = render<Props>(this.template, scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
        this.element.oncontextmenu = (ev) => { this.oncontextmenu?.(ev) }
    }

    oncontextmenu?: (ev: MouseEvent) => void
}