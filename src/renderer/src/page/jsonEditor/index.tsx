import { appTab, TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { TextEditorHandler } from "@renderer/components/editor/handler";
import PageJsonEditorVue from "./PageJsonEditor.vue"
import { PageDataView } from "../dataView";



interface PageJsonEditorOption {
    title: string,
    value?: any
    save?: (value: any) => Promise<void> | void
}


// export const PageJsonEditor = {
    
// } as any

export class PageJsonEditor implements TabPage {

    static create(option: PageJsonEditorOption) {
        const page = fixReactive(new PageJsonEditor(option))
        return page
    }
    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    editorHandler: TextEditorHandler
    dataView?: PageDataView
    save: () => Promise<void> | void
    defalutValue: any

    constructor(option: PageJsonEditorOption) {
        this.title = option.title
        this.save = async () => {
            const content = this.editorHandler.editor?.getValue() ?? ''

            try {
                const value = JSON.parse(content)
                await option.save?.(value)
            } catch (e: any) {
                alert(e?.message ?? 'JSON 格式错误')
            }

        }
        this.defalutValue = option.value
        let content = ''
        try {
            content = JSON.stringify(option.value, null, 2)
        } catch (e) {
            console.error(e)
        }

        this.editorHandler = new TextEditorHandler(content ?? '', 'json')
        this.element = <PageJsonEditorVue page={this}></PageJsonEditorVue>
    }

    onDestroy(): void {
        this.editorHandler.destory()
    }


}