import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { GraphContainer, GraphView } from "@renderer/components/_graph";

export class PageGraphEditor implements TabPage {

    static create() {
        const page = fixReactive(new PageGraphEditor())
        return page
    }
    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    view: GraphView


    constructor() {
        this.view = new GraphView()
        this.element = <GraphContainer view={this.view}></GraphContainer>
    }

}