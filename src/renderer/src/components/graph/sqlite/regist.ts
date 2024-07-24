
import { EdgeViewData, NodeMetaData, NodeViewData } from "./state"
import { GhSqlErdNodeComponent } from './component'
import { Shape, Edge, Graph, Node, Point, EdgeView } from "@antv/x6"


// 路由参数


type BBox = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
}


function erRouter(_vertices: Point.PointLike[], _args: unknown, view: EdgeView): Point.PointLike[] {

    type ConnectPostion = {
        direction: keyof PointConnect
        pos: [number, number],
        connect: [number, number],
    }
    type PointConnect = {
        top: ConnectPostion,
        bottom: ConnectPostion,
        left: ConnectPostion,
        right: ConnectPostion,
    }
    const connect = (bbox: BBox, offset: number, cLen: number): PointConnect => {


        const top: ConnectPostion = {
            direction: 'top',
            pos: [
                bbox.minX + (bbox.maxX - bbox.minX) * offset,
                bbox.minY
            ],
            connect: [
                bbox.minX + (bbox.maxX - bbox.minX) * offset,
                bbox.minY - cLen
            ]
        }

        const bottom: ConnectPostion = {
            direction: 'bottom',
            pos: [
                bbox.minX + (bbox.maxX - bbox.minX) * offset,
                bbox.maxY
            ],
            connect: [
                bbox.minX + (bbox.maxX - bbox.minX) * offset,
                bbox.maxY + cLen
            ]
        }

        const left: ConnectPostion = {
            direction: 'left',
            pos: [
                bbox.minX,
                bbox.minY + (bbox.maxY - bbox.minY) * offset,
            ],
            connect: [
                bbox.minX - cLen,
                bbox.minY + (bbox.maxY - bbox.minY) * offset,
            ]
        }
        const right: ConnectPostion = {
            direction: 'right',
            pos: [
                bbox.maxX,
                bbox.minY + (bbox.maxY - bbox.minY) * offset,
            ],
            connect: [
                bbox.maxX + cLen,
                bbox.minY + (bbox.maxY - bbox.minY) * offset,
            ]
        }

        return { top, bottom, left, right }

    }

    const select = (source: PointConnect, target: PointConnect) => {
        const p: (keyof PointConnect)[] = ['left', 'right', 'bottom', 'top']

        const all = p.flatMap(sourcePositon => p.map(targetPositon => {
            const s = source[sourcePositon]
            const t = target[targetPositon]

            const [x0, y0] = s.connect
            const [x1, y1] = t.connect

            const d = (x0 - x1) ** 2 + (y0 - y1) ** 2

            return { s, t, d }
        }))

        const minDistance = Math.min(...all.map(v => v.d))

        const min = all.find(v => v.d === minDistance)

        if (!min) return []

        else return [
            min.s.pos,
            min.s.connect,
            min.t.connect,
            min.t.pos
        ]
    }

    const edge: { view: EdgeViewData } = view.cell.getData()

    const sourceBBox = {
        minX: view.sourceBBox.left,
        maxX: view.sourceBBox.left + view.sourceBBox.width,
        minY: view.sourceBBox.top,
        maxY: view.sourceBBox.top + view.sourceBBox.height,
    }


    const targetBBox = {
        minX: view.targetBBox.left,
        maxX: view.targetBBox.left + view.targetBBox.width,
        minY: view.targetBBox.top,
        maxY: view.targetBBox.top + view.targetBBox.height,
    }


    const sourceOffSet = edge.view.sourcePortIndex/edge.view.sourcePortLen
    const targetOffset = edge.view.targetPortIndex/edge.view.targetPortLen

    const clen = 40


    const sourceConnection = connect(sourceBBox, sourceOffSet, clen)
    const targetConnection = connect(targetBBox, targetOffset, clen)

    const route = select(sourceConnection, targetConnection)

    console.log({ edge, targetBBox, sourceBBox })

    console.log(route)


    return route.map(([x, y]) => ({ x, y }))
}


Graph.registerRouter('sql-er-router', erRouter)

export class GhSqlErdNode {
    static html(data: { id: string, meta: NodeMetaData, view: NodeViewData }) {
        const node = GhSqlErdNode.finder.get(data) ?? new GhSqlErdNode(data)
        return node.component.element
    }
    static finder: WeakMap<{ id: string, meta: NodeMetaData, view: NodeViewData }, GhSqlErdNode> = new WeakMap()
    static {

        Shape.HTML.register({
            shape: 'GH_SQLERD_ENTITY_NODE',
            html(cell) {
                const data = cell.getData() as { id: string, meta: NodeMetaData, view: NodeViewData }
                const node = GhSqlErdNode.finder.get(data) ?? new GhSqlErdNode(data)
                const element = node.component.element
                const rect = element.getBoundingClientRect()
                console.log({ cell, rect, this: this })
                return node.component.element
            },
        })
    }


    id: string
    view: NodeViewData
    meta: NodeMetaData
    component: GhSqlErdNodeComponent

    constructor(node: {
        id: string
        view: NodeViewData,
        meta: NodeMetaData
    }) {
        this.id = node.id
        this.meta = node.meta
        this.view = node.view
        this.component = new GhSqlErdNodeComponent(this.meta)
        GhSqlErdNode.finder.set(node, this)
    }
}



export class GhSqlErdEdge {
    static {

        class ErdEdge extends Edge {
            getSourcePoint() {
                const point = super.getSourcePoint()
                console.log({
                    point,
                    target: this.getTarget(),
                    source: this.getSource()
                })
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
                    // targetMarker: {
                    //     tagName: 'path',
                    //     d: 'M 10 -5 0 0 10 5 z',
                    // },
                },
            },
        })
        Graph.registerEdge('GH_SQLERD_RELATIONSHIP_EDGE', ErdEdge)
    }
}