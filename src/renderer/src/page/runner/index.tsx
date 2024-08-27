import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { default as PageRunnerVue } from "./PageRunner.vue";
import { nanoid } from "nanoid";
import { RunnerGraphView } from "@renderer/components/graph/runner";

export class PageRunner implements TabPage {

    static create(url: string) {
        const page = fixReactive(new PageRunner(url))
        page.init()
        return page
    }
    readonly tabId: string = nanoid()
    readonly element: VNode
    readonly icon = 'del'
    readonly title: string
    readonly view: RunnerGraphView
    readonly fileUrl: string = ''


    constructor(fileUrl: string) {
        this.view = new RunnerGraphView()
        this.element = <PageRunnerVue page={this}></PageRunnerVue>
        this.fileUrl = fileUrl
        this.title = fileUrl.split('/').pop() || 'runner'
        this.initView()
    }


    async init() {
        const cache = await window.explorerApi.readJson(this.fileUrl)
        this.view.load( cache ?? null);
    }


    async save() {
        const filePath = this.fileUrl
        const content = this.view.save()
        console.log({content})
        await window.explorerApi.saveJson(filePath, content)
    }

    private initView() {
    }

}