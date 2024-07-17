import { Graph, Shape } from "@antv/x6"
import { GhNode, render, div, text } from "./old"
import { insertCss } from "insert-css"
import  {MBaseElementTemplateNode, MBaseTemplate, MTemplate , RenderScope, render as renderTemplate} from './common/index'


export enum JsonFieldTypeKey {
    String = 'String',
    Integer = 'Integer',
    Number = 'Number',
    Boolean = 'Boolean',
    Null = 'Null',
    Array = 'Array',
    Object = 'Object',
    Anyone = 'Anyone',
}

export interface JsonStruct {
    fields: { name: string, type: JsonType }[]
}

export interface JsonField {
    name: string
    type: JsonType
}

export interface JsonType {
    key: JsonFieldTypeKey
}

export interface JsonUsage {
    name: string,
    methods: {
        name: string,
        input: JsonStruct
        output: JsonType
    }[],
}

export class GhJsonModel {
    modelId: string
    name: string = 'Test'
    struct: JsonStruct = {
        fields: []
    }
    usages: JsonUsage[] = []
    constructor(modelId: string) {
        this.modelId = modelId
        this.struct.fields = [
            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
            { name: 'test3', type: { key: JsonFieldTypeKey.String } },
            { name: 'test4', type: { key: JsonFieldTypeKey.String } },
            { name: 'test5', type: { key: JsonFieldTypeKey.String } },
        ]

        this.usages = [
            {
                name: 'usage1', methods: [{
                    name: 'method1', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                }, {
                    name: 'method2', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                }, {
                    name: 'method3', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test3', type: { key: JsonFieldTypeKey.String } }
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                },]
            }
        ]
    }
}


class NodeComponent{
    static template:MBaseElementTemplateNode<HTMLDivElement, {
        model: GhJsonModel;
    }>
    static {
        const renderType = (t: MTemplate<{ type: JsonType }>) => {
            return t.text((s) => s.get('type').key)
        }
        
        const renderStruct = (t: MTemplate<{ struct: JsonStruct }>) => {
            return t.div('gh-json-model__fields')(
                t.loop((s) => s.get('struct').fields)(
                    t => t.div('gh-json-model__field-item')(
                        t.div('gh-json-model__field-name')(t.text((s) => s.get('_item').name)),
                        t.prop(s => ({ type: s.get('_item').type }))(t =>
                            renderType(t)
                        )
                    )
                )
            )
        }
        
        
        const renderUsage = (t: MTemplate<{ usage: JsonUsage }>) => {
            return t.div('gh-json-model__usage-item')(
                t.div('gh-json-model__usage-title')(t.div('')
                    (t.text(s => s.get('usage').name))
                ),
                t.div('gh-json-model__usage-methods')(
                    t.loop(s => s.get('usage').methods)(t =>
                        t.div('gh-json-model__usage-method-item')(
                            t.div('gh-json-model__usage-method-name')(t.text(s => s.get('_item').name)),
                            t.div('gh-json-model__usage-method-output')(t.prop(s => ({ type: s.get('_item').output }))(t => renderType(t))
                            )
                        ),
                    )
                )
            )
        }
        
        const renderModel = (t: MTemplate<{ model: GhJsonModel }>) => {
            return t.div('gh-json-model')(
                t.div('gh-json-model__header')(t.text(s => s.get('model').name)),
                t.div('gh-json-model__body')(
                    t.div('gh-json-model__struct')(
                        t.div('gh-json-model__sub-title')(t.text('结构字段')),
                        t.prop(s => ({ struct: s.get('model').struct }))(
                            t => renderStruct(t)
                        )
                    ),
                    t.div('gh-json-model__usages')(
                        t.div('gh-json-model__sub-title')(t.text('用途')),
                        t.loop(s => s.get('model').usages)(
                            t => t.prop(s => ({ usage: s.get('_item') }))(t => renderUsage(t))
                        )
                    )
                )
            )
        }
    
        NodeComponent.template = renderModel(new MBaseTemplate()).build()

        
    }

}

console.log(NodeComponent.template)



export class GhJsonStructNode extends GhNode<GhJsonModel> {
    static elements: WeakMap<GhJsonModel, HTMLElement> = new WeakMap()
    static type = 'GhJsonModelNode'
    static {
        insertCss(/*css*/`
            .gh-json-model{
                --gh-json-model--theme-text-color: #fff;
                --gh-json-model--theme-color: #66ccff;
                --gh-json-model--desc-color: #666;
                --gh-json-model--border-radius: 4px;
                --gh-json-model--border-width: 2px;
                --gh-json-model--border: var(--gh-json-model--border-width) solid var(--gh-json-model--theme-color);
                --gh-json-model--width: 280px;

                --gh-json-model-field-item--hover-bg: rgba(255,255,255,0.1);
                
                border-radius: var(--gh-json-model--border-radius);
                border: var(--gh-json-model--border);
                width: var(--gh-json-model--width);
            }
            .gh-json-model__header{
                background: var(--gh-json-model--theme-color);
                color: var(--gh-json-model--theme-text-color);
                font-weight: 600;
                text-align: center;
                height: 28px;
                --gh-json-model-header-border-radius: calc(var(--gh-json-model--border-radius) - var(--gh-json-model--border-width));
                border-radius: var(--gh-json-model-header-border-radius) var( --gh-json-model-header-border-radius) 0 0;
                line-height: 28px;
            }

            .gh-json-model__sub-title{
                background: var(--gh-json-model--desc-color);
                color: var(--gh-json-model--theme-text-color);
                border-radius: var(--gh-json-model--border-width);
                margin: 4px;
                padding: 0 4px;
            }
            .gh-json-model__fields{
                margin: 4px 0;
            }
            .gh-json-model__field-item{
                display: flex;
                flex-direction: row;
                height: 24px;
            }
            
            .gh-json-model__field-item:hover{
                background:var(--gh-json-model-field-item--hover-bg);
            }
            .gh-json-model__field-name{
                padding: 0 8px;
                flex: 1 1 0;
                width: 0px;
                overflow: hidden;
            }
            .gh-json-model__field-type{
                padding: 0 8px;
                flex: 0 0 auto;
            }

            .gh-json-model__usage-title{
                border-bottom: 1px solid var(--gh-json-model--desc-color);
                margin: 0 8px;
                margin-top: 4px;
                font-size: 12px;
                font-weight: 600;
            }

            .gh-json-model__usage-method-item{
                display: flex;
                flex-direction: row;
                height: 24px;
            }
            
            .gh-json-model__usage-method-item:hover{
                background:var(--gh-json-model-field-item--hover-bg);
            }
            .gh-json-model__usage-method-name{
                padding: 0 8px;
                flex: 1 1 0;
                width: 0px;
                overflow: hidden;
            }
            .gh-json-model__usage-method-output{
                padding: 0 8px;
                flex: 0 0 auto;
            }
            `)

        const renderType = (type: JsonType) => {
            return text(type.key)
        }

        const renderStruct = (struct: JsonStruct) => {
            return render(div('gh-json-model__fields'), [
                ...struct.fields.map(field =>
                    render(div('gh-json-model__field-item'), [
                        render(div('gh-json-model__field-name'), [text(field.name)]),
                        render(div('gh-json-model__field-type'), [renderType(field.type)]),
                    ]))
            ])
        }

        const renderUsage = (usage: JsonUsage) => {
            return render(div('gh-json-model__usage-item'), [
                render(div('gh-json-model__usage-title'), [
                    render(div(), [text(usage.name)])
                ]),
                render(div('gh-json-model__usage-methods'), [
                    ...usage.methods.map(method => {
                        return render(div('gh-json-model__usage-method-item'), [
                            render(div('gh-json-model__usage-method-name'), [text(method.name)]),
                            render(div('gh-json-model__usage-method-output'), [renderType(method.output)])
                        ])
                    })
                ]),
            ])
        }


        Shape.HTML.register({
            shape: GhJsonStructNode.type,
            html(cell) {
                const data = cell.getData() as GhJsonModel
                const scope = RenderScope.create({model:data})
                const renderNode = renderTemplate<{
                    model: GhJsonModel;
                }>(NodeComponent.template,scope)

                const ele = renderNode.nodes.getValue()[0] as HTMLElement

                console.log(renderNode,ele)
                
                // const ele = GhJsonStructNode.elements.get(data) ?? render(div('gh-json-model'), [
                //     render(div('gh-json-model__header'), [text(data.name)]),
                //     render(div('gh-json-model__body'), [
                //         render(div('gh-json-model__struct'), [
                //             render(div('gh-json-model__sub-title'), [text('结构字段')]),
                //             renderStruct(data.struct),
                //         ]),
                //         render(div('gh-json-model__usages'), [
                //             render(div('gh-json-model__sub-title'), [text('用途')]),
                //             ...data.usages.map(usage => renderUsage(usage))
                //         ])
                //     ])
                // ])
                GhJsonStructNode.elements.set(data, ele)
                ele.ondblclick = () => {
                    console.log('dblclick')
                    ele.attributeStyleMap.set('--gh-json-model--theme-color', 'red')
                }
                return ele
            },
        })
    }


    shape = GhJsonStructNode.type
    data = new GhJsonModel(this.id)
}


export class GhJsonView {
    container: HTMLElement = document.createElement('div')

    loadContainer(container: HTMLElement) {
        this.container = container
        this.iniGraph()
    }

    protected iniGraph(): Graph {
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


