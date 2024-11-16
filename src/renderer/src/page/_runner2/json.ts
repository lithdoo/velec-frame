import { EdgeData, GhComponent, NodeData } from "@renderer/mods/graph";
import { NodeShapeKey, RunnerStateExtend, RunnerStateKey } from "./common";
import { MBaseElementTemplateNode, MBaseTemplate, MBaseValue, MTemplate } from "@renderer/mods/template";
import { insertCss } from "insert-css";
import { initArch } from "@renderer/mods/graph/addon/resizeNode";
import { nanoid } from "nanoid";
import { Menu, PopMenuListHandler } from "@renderer/components/base/PopMenu";
import { CommonFormBuilder } from "@renderer/components/form";
import { appTab } from "@renderer/state/tab";
import { PageDataForm } from "../dataForm";
import { PageJsonEditor } from "../jsonEditor";
import { contextMenu } from "@renderer/view/fixed/contextmenu";

export interface JsonNodeMeta {
    data: any
    receiveId: string
    label: string
    isBlank: boolean
}
export type JsonNodeData = NodeData<NodeShapeKey.GH_RUNNER_JSON_NODE, JsonNodeMeta>

export const isJsonNodeData = (node: NodeData<any, any>): node is JsonNodeData => {
    return (node as JsonNodeData).view.shape === NodeShapeKey.GH_RUNNER_JSON_NODE
}


export class RunnerJsonState extends RunnerStateExtend<
    JsonNodeData,
    EdgeData,
    {},
    { nodes: JsonNodeData[] }
> {
    readonly key = RunnerStateKey.JSON
    readonly onDataLoaded: string

    constructor(){
        super()
        this.onDataLoaded = window.jsonDataApi.onDataLoaded((_, receiveId) => {
            this.updateData(receiveId)
        })
    }

    private async updateData(receiveId: string) {
        const nodes = this.nodes.filter(v => v.meta.receiveId === receiveId)
        if (nodes.length > 0) {
            const data = await window.jsonDataApi.getData(receiveId)
            if (data !== undefined) {
                nodes.forEach(v => {
                    v.meta.data = data
                    v.meta.isBlank = false
                })
            } else {
                nodes.forEach(v => {
                    v.meta.data = undefined
                    v.meta.isBlank = true
                })
            }
            const view = this.getView()
            nodes.forEach(v => {
                view.refreshNode(v)
            })
        }

        console.log(this.getView(), nodes, this.nodes)
    }

    dispose(): void {
        super.dispose()
        console.log('dispose')
        window.jsonDataApi.offDataLoaded(this.onDataLoaded)
    }

    clearNode(node: JsonNodeData) {
        node.meta.isBlank = true
        node.meta.data = undefined
    }

    isCurrentNode(node: NodeData): boolean {
        return isJsonNodeData(node)
    }

    isCurrentEdge(_edge: EdgeData): boolean {
        return false
    }

    load(cache: { nodes: JsonNodeData[]} | null) {
        const nodes = cache?.nodes ?? []
        this.nodes = nodes
        this.nodes.forEach(node => {
            node.meta.receiveId = nanoid()
            node._viewId = this.viewId
            this.checkNodeData(node)
        })
    }

    save() {
        return { nodes: this.nodes}
    }

}

interface GhRunnerJsonNodeState {
    isSelected: MBaseValue<boolean>
}

type Props = {
    data: JsonNodeData
    state: GhRunnerJsonNodeState;
}

export class GhRunnerJsonComponent extends GhComponent<JsonNodeData, Props> {
    static {
        insertCss(/*css*/`
        .gh-runner-json{
            border: 2px solid #4d4E53;
            border-radius: 4px;
            background: #2F3035;
            height: 100%;

            display: flex;
            flex-direction: column;
            cursor: default;
            position: relative;
        }

        .gh-runner-json__resize{
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

        .gh-runner-json__header{
            display:flex;
            align-items: center;    
            justify-content: center;
            height: 24px;
            line-height: 18px;
            background: #a6915c;
            font-size: 12px;
            padding: 0 4px;
            color: rgba(255,255,255,0.85);
            font-weight: 600;
            flex: 0 0 auto;
            border-radius: 2px 2px 0 0 ;
        }

        .gh-runner-json__name{
            flex: 1 1 0;
            width: 0;
        }
        
        .gh-runner-json__body{
            flex: 1 1 0;
            height: 0;
            overflow: auto;
            position: relative;
        }
        .gh-runner-json__code{
            padding: 4px;
            line-height: 1.5;
        }
        .gh-runner-json__blank{
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
            return t.div('gh-runner-json__header')(
                t.div('gh-runner-json__name')(
                    t.text(s => {
                        const label = s.get('data').meta.label || '<未命名数据>'
                        return label
                    })
                )
            )
        }

        const renderBody = (t: MTemplate<Props>) => {
            return t.div('gh-runner-json__body')(

                t.cond(s => !s.get('data').meta.isBlank)(
                    t.pre('gh-runner-json__code')(
                        t.text(s => s.get('data').meta.data === null
                            ? 'null'
                            : JSON.stringify(s.get('data').meta.data, null, 2)
                        )
                    )
                ),
                t.cond(s => !!s.get('data').meta.isBlank)(
                    t.div('gh-runner-json__blank')(
                        t.text('No Data')
                    )
                )

            )
        }


        const renderNode = (t: MTemplate<Props>) => {
            return t.div('gh-runner-json')(
                renderHeader(t),
                renderBody(t),
                t.div('gh-runner-json__resize')
            )
        }
        GhRunnerJsonComponent.template = renderNode(new MBaseTemplate()).build()
    }
    static {
        GhComponent.register<JsonNodeData>(
            NodeShapeKey.GH_RUNNER_JSON_NODE,
            (data) => new GhRunnerJsonComponent(data)
        )
    }

    state: GhRunnerJsonNodeState = { isSelected: new MBaseValue(false) }
    constructor(data: JsonNodeData) {
        super(data)
        const resize = this.element.querySelector('.gh-runner-json__resize')
        const code = this.element.querySelector('.gh-runner-json__body')
        if (code instanceof HTMLElement) {
            code.onwheel = (e) => {
                if (code.scrollHeight > code.clientHeight) {
                    e.stopPropagation()
                }
            }
        }

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

    init(data: JsonNodeData): Props {
        const state = { isSelected: new MBaseValue(false) }
        return { state, data }
    }
    template(): MBaseElementTemplateNode<HTMLDivElement, Props> {
        return GhRunnerJsonComponent.template
    }

    oncontextmenu(e:MouseEvent){
        const data = this.data
        
        const label = Menu.button({
            icon: 'del', key: 'editAttr', label: '修改注释', action: () => {
                const form = CommonFormBuilder.create()
                    .input('label', {
                        title: '注释', value: data.meta.label
                    })
                    .build()

                appTab.addTab(PageDataForm.create({
                    form,
                    title: `Runner<${data.meta.label || '未命名数据'}>`,
                    onsubmit: (value) => {
                        const { label } = value
                        data.meta.label = label
                        // this.getView?.().refreshNode(data)
                    }
                }))
            }
        })

        const edit = Menu.button({
            icon: 'del', key: 'editSQL', label: '修改数据', action: () => {
                appTab.addTab(PageJsonEditor.create({
                    title: `Runner<${data.meta.label}>`,
                    value: data.meta.data,
                    save: async (value: any) => {
                        await window.jsonDataApi.setData(data.meta.receiveId, value)
                    }
                }))
            }
        })

        // const clear = Menu.button({
        //     icon: 'del', key: 'clearData', label: '清除数据', action: () => {
        //         this.state.states.json.clearNode(data)
        //         this.refreshNode(data)
        //     }
        // })

        contextMenu.open(PopMenuListHandler.create([
            label, edit //, clear, removeNode
        ]), e)
    }
}