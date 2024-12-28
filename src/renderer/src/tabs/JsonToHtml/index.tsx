import { TabPage } from "@renderer/parts/PageTab"
import PageJthTemplateVue from "./PageJthTemplate.vue"
import { JthState, JthStateModel } from "./JthState"
import { VNode } from "vue"
import { fixReactive } from "@renderer/fix"


export class PageJthTemplate implements TabPage {

    static create(title: string) {
        const page = fixReactive(new PageJthTemplate(title))
        return page
    }

    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    state = JthState.blank()
    model: JthStateModel

    constructor(
        public title: string,
    ) {
        this.state = fixReactive(JthState.blank())
        this.model = fixReactive(new JthStateModel(this.state))
        this.element = <PageJthTemplateVue model={this.model}></PageJthTemplateVue>
    }
}

