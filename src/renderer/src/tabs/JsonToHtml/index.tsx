import { TabPage } from "@renderer/parts/PageTab"
import PageJthTemplateVue from "./PageJthTemplate.vue"
import { JthFile, JthState, JthStateController } from "./common"
import { VNode } from "vue"
import { fixReactive } from "@renderer/fix"
import { FileControl } from "@renderer/mods/fileUtils"


export class PageJthTemplate implements TabPage {

    static create(fileUrl: string) {
        const page = fixReactive(new PageJthTemplate(fileUrl))
        page.init()
        return page
    }

    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    state = JthState.blank()
    controller: JthStateController
    title: string
    file: FileControl

    constructor(
        public fileUrl: string,

    ) {
        this.title = fileUrl
        this.file = new FileControl(fileUrl)
        this.state = fixReactive(JthState.blank())
        this.controller = fixReactive(new JthStateController(this.state))
        this.element = <div></div>
    }


    async init() {
        this.element = <PageJthTemplateVue page={this}></PageJthTemplateVue>
        await this.reload()
    }


    async save() {
        const fileContent = JSON.stringify(this.state.fileContent())
        await this.file.saveContent(fileContent)
    }

    async reload() {
        const fileContent = await this.file.loadFileContent()
        if (fileContent.success) {
            const file: JthFile = fixReactive(JSON.parse(this.file.content))
            console.log('fileContent',this.file.content,file)
            this.state.reload(file)
        }
    }
}

