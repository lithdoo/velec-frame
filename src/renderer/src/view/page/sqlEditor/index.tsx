import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { TextEditorHandler } from "@renderer/components/editor/handler";
import PageSqlEditorVue from "./PageSqlEditor.vue"


export interface SqlConnectOption {
    sqlite: string
}

interface PageSqlEditorOption {
    title: string,
    connection?: SqlConnectOption
    content?: string
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

    constructor(option: PageSqlEditorOption) {
        this.title = option.title
        this.connection = option.connection
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

        const res =  await window.sqliteApi.sqlSelectAll(url, sql)

        console.log(res)
    }

}