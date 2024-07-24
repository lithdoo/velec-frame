import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { GraphContainer } from "@renderer/components/graph";
import { SqlErdGraphView } from "@renderer/components/graph/sqlite/index";

export class PageSqlErdEditor implements TabPage {

    static create(sqlUrl: string) {
        const page = fixReactive(new PageSqlErdEditor(sqlUrl))
        page.init()
        return page
    }
    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    view: SqlErdGraphView
    url: string

    constructor(sqlUrl: string) {
        this.url = sqlUrl
        this.view = new SqlErdGraphView()
        this.element = <GraphContainer view={this.view}></GraphContainer>
    }

    async init() {
        const raw = await window.sqliteApi.getRawData(this.url)
        this.view.load(raw)
        console.log('init',raw)
    }

}