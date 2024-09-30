import { Shape } from "@antv/x6";
import { MBaseElementTemplateNode, render, RenderScope } from "../template";
import { NodeData } from "./cell";
import { GraphView } from "./view";

export abstract class GhComponent<
    Node extends NodeData,
    Props extends Record<string, unknown>
> {

    static clsTable = new Map<string, (data: any) => GhComponent<any, any>>()
    static finder: WeakMap<NodeData, GhComponent<any, any>> = new WeakMap()
    static register<T extends NodeData>(
        shape: string,
        cls: (data: T) => GhComponent<NodeData, any>) {
        GhComponent.clsTable.set(shape, cls)

        Shape.HTML.register({
            shape,
            html(cell) {
                const data = cell.getData() as T
                const cls = GhComponent.clsTable.get(shape)
                if (!cls) throw new Error(`No class found for shape ${shape}`)
                const node = GhComponent.finder.get(data) ?? cls(data)
                return node.element
            },
        })
    }


    data: Node
    element: HTMLElement
    props: Props

    constructor(data: Node) {
        this.data = data
        this.props = this.init(data)
        const scope = RenderScope.create(this.props)
        const renderNode = render<Props>(this.template(), scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
        this.element.oncontextmenu = (ev) => { this.oncontextmenu?.(ev) }
        this.getView = ()=>{
            const viewId = this.data._viewId
            const graphView = GraphView.find(viewId)
            if(!graphView) throw new Error(`No view found for ${viewId}`)
            return graphView 
        }
    }

    abstract init(data: Node): Props
    abstract template(): MBaseElementTemplateNode<HTMLDivElement, Props>

    oncontextmenu?(ev: MouseEvent):void
    refresh?: () => void
    getView?: () => GraphView
}