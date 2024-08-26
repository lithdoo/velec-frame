
import type { BaseNodeData } from "../base"
import { GhSqlErdNodeComponent } from '../component'
import { Shape, Edge, Graph } from "@antv/x6"
import { SqlErdGraphView } from "../view"

export class GhSqlErdNode {
    static html(data: BaseNodeData) {
        const node = GhSqlErdNode.finder.get(data) ?? new GhSqlErdNode(data)
        return node.component.element
    }
    static finder: WeakMap<BaseNodeData, GhSqlErdNode> = new WeakMap()
    static {
        Shape.HTML.register({
            shape: 'GH_SQLERD_ENTITY_NODE',
            html(cell) {
                const data = cell.getData() as BaseNodeData
                const node = GhSqlErdNode.finder.get(data) ?? new GhSqlErdNode(data)
                return node.component.element
            },
        })
    }
    readonly component: GhSqlErdNodeComponent
    readonly nodeData: BaseNodeData
    constructor(node: BaseNodeData) {
        GhSqlErdNode.finder.set(node, this)
        this.nodeData = node
        this.component = new GhSqlErdNodeComponent(this.nodeData)
        this.component.oncontextmenu = (event) => {
            const view = this.findView()
            view.onNodeConnectMenu?.({ event, data: this.nodeData })
        }
    }


    findView() {
        const view = SqlErdGraphView.finder.get(this.nodeData._viewId)
        if (!view) throw new Error('view is not found!')
        return view
    }


}

export class GhSqlErdEdge {
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