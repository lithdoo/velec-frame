import { appTab, TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { RunnnerModel } from "./runner";
import PageTaskRunnerVue from "./PageTaskRunner.vue";


export class PageTaskRunner implements TabPage {

    static async add(fileUrl: string) {
        const runner = await RunnnerModel.read(fileUrl)
        const page = fixReactive(new PageTaskRunner(runner))
        appTab.addTab(page)
    }


    tabId: string = Math.random().toString()
    title: string
    icon = 'del'
    element: VNode

    constructor(
        public runner: RunnnerModel
    ) {
        this.title = runner.fileUrl
        this.element = <PageTaskRunnerVue page={this}></PageTaskRunnerVue>
    }

}