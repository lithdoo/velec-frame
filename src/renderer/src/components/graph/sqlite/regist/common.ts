// 路由参数

import { EdgeView, Graph, Point } from "@antv/x6"
import type { EdgeViewData } from "../common"

function erRouter(_vertices: Point.PointLike[], _args: unknown, view: EdgeView): Point.PointLike[] {

    const edge: { view: EdgeViewData<any> } = view.cell.getData()

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


    const sourceOffSet = edge.view.sourcePortIndex / edge.view.sourcePortLen
    const targetOffset = edge.view.targetPortIndex / edge.view.targetPortLen

    const clen = 20

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

    type IBBox = {
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
    }

    if (edge.view.source === edge.view.target) {
        const sourcePoint: ConnectPostion = {
            direction: 'bottom',
            pos: [
                sourceBBox.maxX - (sourceBBox.maxX - sourceBBox.minX) * sourceOffSet,
                sourceBBox.maxY
            ],
            connect: [
                sourceBBox.maxX - (sourceBBox.maxX - sourceBBox.minX) * sourceOffSet,
                sourceBBox.maxY + clen * edge.view.sourcePortIndex
            ]
        }

        const targetPoint: ConnectPostion = {
            direction: 'right',
            pos: [
                targetBBox.maxX,
                targetBBox.maxY - (targetBBox.maxY - targetBBox.minY) * sourceOffSet,
            ],
            connect: [
                targetBBox.maxX + clen * edge.view.sourcePortIndex,
                targetBBox.maxY - (targetBBox.maxY - targetBBox.minY) * sourceOffSet,
            ]
        }
        return [sourcePoint.pos, sourcePoint.connect, [targetPoint.connect[0], sourcePoint.connect[1]], targetPoint.connect, targetPoint.pos].map(([x, y]) => ({ x, y }))
    } else {
        const connect = (bbox: IBBox, offset: number, cLen: number): PointConnect => {
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
                    bbox.maxX - (bbox.maxX - bbox.minX) * offset,
                    bbox.maxY
                ],
                connect: [
                    bbox.maxX - (bbox.maxX - bbox.minX) * offset,
                    bbox.maxY + cLen
                ]
            }

            const left: ConnectPostion = {
                direction: 'left',
                pos: [
                    bbox.minX,
                    bbox.maxY - (bbox.maxY - bbox.minY) * offset,
                ],
                connect: [
                    bbox.minX - cLen,
                    bbox.maxY - (bbox.maxY - bbox.minY) * offset,
                ]
            }
            const right: ConnectPostion = {
                direction: 'right',
                pos: [
                    bbox.maxX,
                    bbox.maxY - (bbox.maxY - bbox.minY) * offset,
                ],
                connect: [
                    bbox.maxX + cLen,
                    bbox.maxY - (bbox.maxY - bbox.minY) * offset,
                ]
            }

            return { top, bottom, left, right }
        }

        const choose = (source: PointConnect, target: PointConnect) => {
            const p: (keyof PointConnect)[] = ['left', 'right', 'bottom', 'top']

            const filter = p.flatMap(sourcePositon => p.map(targetPositon => {
                const sc = source[sourcePositon]
                const tc = target[targetPositon]
                return { sc, tc }
            })).filter(c => {
                if (c.sc.direction === 'left' && (c.sc.connect[0] < c.tc.connect[0])) return false
                if (c.sc.direction === 'right' && (c.sc.connect[0] > c.tc.connect[0])) return false
                if (c.sc.direction === 'top' && (c.sc.connect[1] < c.tc.connect[1])) return false
                if (c.sc.direction === 'bottom' && (c.sc.connect[1] > c.tc.connect[1])) return false

                if (c.tc.direction === 'left' && (c.sc.connect[0] > c.tc.connect[0])) return false
                if (c.tc.direction === 'right' && (c.sc.connect[0] < c.tc.connect[0])) return false
                if (c.tc.direction === 'top' && (c.sc.connect[1] > c.tc.connect[1])) return false
                if (c.tc.direction === 'bottom' && (c.sc.connect[1] < c.tc.connect[1])) return false

                return true
            }).map(({ tc, sc }) => {
                const s = sc
                const t = tc
                const [x0, y0] = s.connect
                const [x1, y1] = t.connect

                const d = (x0 - x1) ** 2 + (y0 - y1) ** 2
                return { s, t, d }
            })

            const all = filter.length
                ? filter
                : p.flatMap(sourcePositon => p.map(targetPositon => {
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

            const middle: [number, number][] = []

            const startPoint = {
                x: min.s.connect[0],
                y: min.s.connect[1]
            }

            const endPoint = {
                x: min.t.connect[0],
                y: min.t.connect[1]
            }

            if (min.s.direction === 'top' || min.s.direction === 'bottom') {
                if (min.t.direction === 'left' || min.t.direction === 'right') {
                    middle.push([startPoint.x, endPoint.y])
                } else {
                    middle.push([startPoint.x, endPoint.y / 3 + (2 / 3) * startPoint.y])
                    middle.push([endPoint.x, endPoint.y / 3 + (2 / 3) * startPoint.y])
                }
            } else {
                if (min.t.direction === 'left' || min.t.direction === 'right') {
                    middle.push([endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y])
                    middle.push([endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y])
                } else {
                    middle.push([endPoint.x, startPoint.y])
                }
            }

            return [
                min.s.pos,
                min.s.connect,
                ...middle,
                min.t.connect,
                min.t.pos
            ]
        }

        const sourceConnection = connect(sourceBBox, sourceOffSet, clen)
        const targetConnection = connect(targetBBox, targetOffset, clen)

        const route = choose(sourceConnection, targetConnection)

        return route.map(([x, y]) => ({ x, y }))
    }
}

Graph.registerRouter('sql-er-router', erRouter)
