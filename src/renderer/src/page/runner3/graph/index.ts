// import { StateExtend } from "@renderer/mods/graph";

import { GraphStateCenter, GraphStateView } from "@renderer/mods/graph"
import { RunnerStateExtend } from "./base"
import { Graph } from "@antv/x6"





// export abstract class RunnerStateExtend<
//     StateNodeData extends NodeData = NodeData,
//     StateEdgeData extends EdgeData = EdgeData,
//     Upper extends { [key: string]: RunnerStateExtend<any> } = {},
//     File = any
// > extends StateExtend<
//     StateNodeData,
//     StateEdgeData,
//     null,
//     Upper,
//     File
// > {
//     // generateRunnerStep(_node: NodeData, _inputs: { edge: EdgeData, node: NodeData }[])
//     //     : RunnerTaskStep<unknown> | null {
//     //     return null
//     // }
// }


export class RunnerGraphStateCenter extends GraphStateCenter<RunnerStateExtend>{

    static create(viewId: string) {
        return new RunnerGraphStateCenter(viewId, {}, [])
            // .extends({ sql: new RunnerSqlState() })
            // .extends({ json: new RunnerJsonState() })
            // .extends({ flow: new RunnerFlowState() })
            // .extends({ scope: new RunnerScopeState() })
            .init()
    }
}


export class RunnerGraphView extends GraphStateView {
    readonly state = RunnerGraphStateCenter.create(this.id)
    readonly clientId: string
    constructor(clientId: string) {
        super()
        this.clientId = clientId
    }
    protected initGraph(): Graph {

        const container = this.inner
        const graph: Graph = new Graph({
            container,
            panning: {
                enabled: true,
                eventTypes: ['leftMouseDown'],
            },
            mousewheel: {
                enabled: true,
                zoomAtMousePosition: true,
                modifiers: null,
                factor: 1.1,
                maxScale: 2,
                minScale: 0.02,
            },
            autoResize: true,
        })
        // graph.on('node:change:position', ({ node, current }) => {
        //     const n = this.state.getNodes().find(v => v.id === node.id)
        //     if (!current || !n) { return }
        //     n.view.x = current.x
        //     n.view.y = current.y
        //     n._x6 = toX6Node(n.view, n._x6)
        // })

        // graph.on('edge:contextmenu', ({ edge, e }) => {
        //     this.onEdgeContextMenu({ id: edge.id, event: e },)
        // })
        this.graph = graph

        return graph
    }

    // onEdgeContextMenu({ id, event }: { id: string, event: ContextMenuEvent, }) {
    //     const remove = Menu.button({
    //         icon: 'del', key: 'removeField', label: '删除边', action: () => {
    //             this.state.updateEdge(id)
    //             this.refresh()
    //         }
    //     })
    //     contextMenu.open(PopMenuListHandler.create([remove]), event)

    // }

    save() {
        return this.state.list.reduce((res, state) => {
            res[state.key] = state.save()
            return res
        }, {})
    }
    load(cache: any = null) {
        // console.log('cache', cache)
        // this.state.list.forEach(state => {
        //     state.load(cache?.[state.key] ?? null, null)
        // })
        // console.log('nodes', this.state.getNodes())
        this.refresh()
    }
}

