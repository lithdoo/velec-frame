import { Graph, KeyValue } from "@antv/x6";
export const COMMON_INPUT_POSITION = 'COMMON_INPUT_POSITION'
export const COMMON_OUTPUT_POSITION = 'COMMON_OUTPUT_POSITION'

Graph.registerPortLayout(COMMON_INPUT_POSITION, (portsPositionArgs: KeyValue<any>[], box) => {
    return portsPositionArgs.map(_ => {
        return {
            position: {
                x: box.width / 2,
                y: 0,
            },
            angle: 0,
        }
    })
})

Graph.registerPortLayout(COMMON_OUTPUT_POSITION, (portsPositionArgs: KeyValue<any>[], box) => {
    return portsPositionArgs.map(_ => {
        return {
            position: {
                x: box.width / 2,
                y: box.height,
            },
            angle: 0,
        }
    })
})

