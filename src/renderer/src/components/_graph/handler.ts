import { Graph } from "@antv/x6"
import { GhJsonStructNode } from "./json"



export class GraphView {
    container: HTMLElement = document.createElement('div')
    graph?: Graph

    loadContainer(container: HTMLElement) {
        this.container = container
        this.graph = this.initGraph()
    }

    protected initGraph(): Graph {
        const element = this.container
        const container = document.createElement('div')
        element.style.display = 'flex'
        element.style.height = '100%'
        container.style.flex = '1'
        element.appendChild(container)
        const graph: Graph = new Graph({
            container,
            panning: {
                enabled: true,
                eventTypes: ['leftMouseDown', 'mouseWheel'],
            },
            mousewheel: {
                enabled: true,
                modifiers: 'ctrl',
                factor: 1.1,
                maxScale: 1.5,
                minScale: 0.5,
            },
            autoResize: true,

            // highlighting: {
            //     magnetAdsorbed: {
            //         name: 'stroke',
            //         args: {
            //             attrs: {
            //                 fill: '#fff',
            //                 stroke: '#31d0c6',
            //                 strokeWidth: 4,
            //             },
            //         },
            //     },
            // },

            // connecting: {
            //     snap: true,
            //     allowBlank: false,
            //     allowLoop: false,
            //     highlight: true,
            //     connector: 'algo-connector',
            //     connectionPoint: 'anchor',
            //     anchor: 'center',
            //     validateMagnet({ magnet }) {
            //         return magnet.getAttribute('port-group') !== 'top'
            //     },
            //     createEdge() {
            //         return graph.createEdge({
            //             shape: 'dag-edge',
            //             attrs: {
            //                 line: {
            //                     strokeDasharray: '5 5',
            //                 },
            //             },
            //             zIndex: -1,
            //         })
            //     },
            // },
        })


        graph.addNode(new GhJsonStructNode())

        // graph.use(
        //     new Selection({
        //         multiple: true,
        //         rubberEdge: true,
        //         rubberNode: true,
        //         modifiers: 'shift',
        //         rubberband: true,
        //     }),
        // )

        // graph.on('edge:connected', ({ edge }) => {
        //     edge.attr({
        //         line: {
        //             strokeDasharray: '',
        //         },
        //     })
        // })

        // graph.on('node:change:data', ({ node }) => {
        //     const edges = graph.getIncomingEdges(node)
        //     const { status } = node.getData() as NodeStatus
        //     edges?.forEach((edge) => {
        //         if (status === 'running') {
        //             edge.attr('line/strokeDasharray', 5)
        //             edge.attr('line/style/animation', 'running-line 30s infinite linear')
        //         } else {
        //             edge.attr('line/strokeDasharray', '')
        //             edge.attr('line/style/animation', '')
        //         }
        //     })
        // })

        return graph
    }


}