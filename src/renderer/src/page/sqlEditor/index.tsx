import { appTab, TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { TextEditorHandler } from "@renderer/components/editor/handler";
import PageSqlEditorVue from "./PageSqlEditor.vue"
import { PageDataView } from "../dataView";


export interface SqlConnectOption {
    sqlite: string
}

interface PageSqlEditorOption {
    title: string,
    connection?: SqlConnectOption
    content?: string
    save?: (content: string) => Promise<void> | void
}

export class PageSqlEditor implements TabPage {

    static create(option: PageSqlEditorOption) {
        const page = fixReactive(new PageSqlEditor(option))
        return page
    }

    connection?: SqlConnectOption

    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    editorHandler: TextEditorHandler
    dataView?: PageDataView
    save: () => Promise<void> | void

    constructor(option: PageSqlEditorOption) {
        this.title = option.title
        this.connection = option.connection
        this.save = async () => {
            await option.save?.(this.editorHandler.editor?.getValue() ?? '')
        }
        this.editorHandler = new TextEditorHandler(option.content ?? '', 'sql')
        this.element = <PageSqlEditorVue page={this}></PageSqlEditorVue>
    }

    onDestroy(): void {
        this.editorHandler.destory()
    }

    async run() {
        if (!this.connection) return
        const sql = this.editorHandler.editor?.getValue()
        if (!sql) return
        const url = this.connection.sqlite
        const data = window.sqliteApi.sqlSelectAll(url, sql)

        if (!this.dataView || (PageDataView.finder.get(this.dataView.finderId) !== this.dataView)) {
            this.dataView = PageDataView.create({ title: this.title })
            appTab.addTab(this.dataView)
        }
        this.dataView.load(data)
        appTab.active(this.dataView.tabId)
    }

}