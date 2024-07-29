import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { TextEditorHandler } from "@renderer/components/editor/handler";
import TextEditor from "@renderer/components/editor/TextEditor.vue"


export interface SqlConnectOption {
    sqlite: string
}

interface PageSqlEditorOption {
    title: string,
    connection?: SqlConnectOption
    content?: string
}

export class PageSqlEditor implements TabPage {

    static create(option:PageSqlEditorOption) {
        const page = fixReactive(new PageSqlEditor(option))
        return page
    }

    connection?: SqlConnectOption

    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    handler: TextEditorHandler

    constructor(option:PageSqlEditorOption) {
        this.title = option.title
        this.connection = option.connection
        this.handler = new TextEditorHandler(option.content??'', 'sql')
        this.element = <TextEditor handler={this.handler}></TextEditor>
    }

    onDestroy(): void {
        this.handler.destory()
    }

}