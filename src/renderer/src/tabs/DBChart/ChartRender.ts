import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate, render, RenderScope } from "@renderer/mods/template";
import { ChartViewState, EntityData } from "./ChartState";
import { insertCss } from "insert-css";
import { Edge, Graph, Shape } from "@antv/x6";
import { Menu, PopMenuListHandler } from "@renderer/widgets/PopMenu";
import { contextMenu } from "@renderer/parts/GlobalContextMenu";
import { PageSqlViewData } from "./PageDBRecordsHandler";
import { tabControl } from "@renderer/parts/PageTab";
import { DBRecordsService } from "./DBService";

interface GhJsonStructNodeState {
    isSelected: MBaseValue<boolean>
    highlightFields: MBaseValue<Set<string>>
}

type Props = {
    data: EntityData
    state: GhJsonStructNodeState;
}

export class ChartEntityNode {

    static maxHeight(fieldLength: number) {
        const outerBorder  = 6
        const fieldHeight = 30
        const colorBanner = 6
        const titleHeight = 32

        return outerBorder + titleHeight + colorBanner + fieldHeight * fieldLength + outerBorder
    }

    static {
        insertCss(/*css*/`
        .gh-sql-erd{
            border: 3px solid rgb(51 65 85);
            border-radius: 6px;
            background: #2F3035;
        }
        .gh-sql-erd__color{
            background: #66ccff;
            height:6px;
            border-radius: 3px 3px 0 0;
        }
        .gh-sql-erd__header{
            display:flex;
            align-items: center;    
            justify-content: start;
            height: 32px;
            line-height: 32px;
            background: rgb(15 23 42);
            font-size: 14px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 800;
        }

        .gh-sql-erd__header-icon{
            margin: 0 8px 0 4px;
            display: flex;
            align-items: center;
        }
        .gh-sql-erd__header-icon svg{
            height:16px;
            width:16px;
            color:#fff;
            fill: currentColor;
        }

        .gh-sql-erd__body{
            background: rgb(2,6,32);
            border-radius: 0 0 3px 3px;
            overflow: auto;
        }
        .gh-sql-erd__field{
            font-size: 14px;
            color: rgba(255,255,255,0.85);
            padding:0 12px;
            display: flex;
            flex-direction: row;
            border-top: 1px solid rgb(30,41,59);
            height: 30px;
            display: flex;
            align-items: center;
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

        const renderIcon = (t: MTemplate<Props>) => {
            return t.Div('gh-sql-erd__header-icon', {
                created: (_, ele) => ele.innerHTML = `
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#vx-base-table"></use>
                </svg>
                ` })
        }

        const renderHeader = (t: MTemplate<Props>) => {
            return t.Div('gh-sql-erd__header')(
                renderIcon(t),
                t.Text(s => {
                    const name = s.get('data').render.table_name
                    const label = s.get('data').table.label ?? ''
                    return name + (label ? ` ( ${label} )` : '')
                })
            )
        }

        const renderBody = (t: MTemplate<Props>) => {
            return t.Div('gh-sql-erd__body')(
                t.loop(s => s.get('data').table.fieldList)(t =>
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
                label: string;
                type: any;                // 类型
                // foreignKey: boolean        // 是否外键
                primaryKey: boolean        // 是否主键
                notNull: boolean
                unique: boolean
            },
            data: EntityData
        }>) => {
            return t.Div('gh-sql-erd__field')(
                t.Div('gh-sql-erd__field-name')(t.Text(s => {
                    const name = s.get('field').name
                    const label = s.get('field').label ?? ''
                    return name + (label ? ` ( ${label} )` : '')
                })),
                t.Div('gh-sql-erd__field-type')(t.Text(s => `${s.get('field').type}${s.get('field').unique ? ' UNIQUE' : ''}${s.get('field').notNull ? ' NOT NULL' : ''}`))
            )
        }

        const renderNode = (t: MTemplate<Props>) => {
            return t.Div('gh-sql-erd')(
                t.Div('gh-sql-erd__color')(),
                renderHeader(t),
                renderBody(t),
            )
        }
        ChartEntityNode.template = renderNode(new MBaseTemplate()).build()
    }
    static finder: WeakMap<EntityData, ChartEntityNode> = new WeakMap()
    static {
        Shape.HTML.register({
            shape: 'GH_SQLERD_ENTITY_NODE',
            effect: [],
            html(cell) {
                const data = cell.getData() as EntityData
                const node = ChartEntityNode.finder.get(data) ?? new ChartEntityNode(data)
                return node.element
            },
        })
    }

    template = ChartEntityNode.template
    data: EntityData
    state: GhJsonStructNodeState
    element: HTMLElement

    constructor(data: EntityData) {
        ChartEntityNode.finder.set(data, this)
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

    private getRecordService() {
        const state = ChartViewState.get(this.data.viewId)
        const url = state.service?.dbUrl
        return url ? new DBRecordsService(url) : null
    }

    oncontextmenu(ev: MouseEvent) {
        const service = this.getRecordService()
        if (!service) return

        contextMenu.open(PopMenuListHandler.create([
            Menu.button({
                icon: 'del', key: 'viewData', label: '浏览数据', action: () => {
                    const dataView = PageSqlViewData.create(service, this.data.table)
                    tabControl.addTab(dataView)
                    tabControl.active(dataView.tabId)
                }
            }),
            Menu.button({
                icon: 'del', key: 'insertTable', label: '添加数据', action: () => {
                    const dataView = PageSqlViewData.create(service, this.data.table)
                    tabControl.addTab(dataView)
                    tabControl.active(dataView.tabId)
                    dataView.insertMode()
                }
            }),
            // Menu.button({
            //     icon: 'del', key: 'editLabel', label: '修改注释', action: () => {
            //         const connection = this.connection

            //         const tab = PageSqlEditLabel.create(
            //             connection,
            //             node2table(data),
            //             this.view.getNodeLabels(node2table(data)),
            //             (labels) => {
            //                 this.view.updateLabels(labels)
            //                 this.view.refresh()
            //             }
            //         )
            //         appTab.addTab(tab)
            //         appTab.active(tab.tabId)
            //     }
            // }),
            // Menu.button({
            //     icon: 'del', key: 'deleteTable', label: '删除表', action: async () => {
            //         await service.deleteTable(data.meta.name)
            //         await this.reload()
            //     }
            // })
        ]), ev)


    }
}

export class ChartRelationEdge {
    static {
        class ErdEdge extends Edge {
            getSourcePoint() {
                const point = super.getSourcePoint()
                return point
            }
        }
        ErdEdge.config({
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
                },
            },
        })
        Graph.registerEdge('GH_SQLERD_RELATIONSHIP_EDGE', ErdEdge)
    }
}