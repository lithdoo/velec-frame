import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { default as PageRunnerVue } from "./PageRunner.vue";
import { nanoid } from "nanoid";
import { RunnerGraphView } from "./view";
import { RunnerClientStatus } from "@common/runner";

export class PageRunner implements TabPage {

    static async create(url: string) {
        const clientId = await window.runnerApi.createClient()
        const page = fixReactive(new PageRunner(url, clientId))
        page.init()
        return page
    }
    readonly tabId: string = nanoid()
    element: VNode | HTMLElement = document.createElement('div')
    readonly icon = 'del'
    readonly title: string
    readonly view: RunnerGraphView
    readonly fileUrl: string = ''
    readonly clientId: string
    clientStatus: RunnerClientStatus = RunnerClientStatus.Procesing
    isDestoryed = false


    constructor(fileUrl: string, clientId: string) {
        this.view = new RunnerGraphView(clientId)
        this.clientId = clientId
        this.fileUrl = fileUrl
        this.title = fileUrl.split('/').pop() || 'runner'
        this.initView()
        return fixReactive(this)
    }


    async init() {
        this.element = <PageRunnerVue page={this}></PageRunnerVue>
        const cache = await window.explorerApi.readJson(this.fileUrl)
        await this.updateClientStatus()
        this.autoUpdateClientStatus()
        this.view.load(cache ?? null);
    }

    async save() {
        const filePath = this.fileUrl
        const content = this.view.save()
        await window.explorerApi.saveJson(filePath, content)
    }

    private initView() {
    }

    private async updateClientStatus() {
        this.clientStatus = await window.runnerApi.clientStatus(this.clientId)
    }

    private async autoUpdateClientStatus() {
        while (!this.isDestoryed) {
            await this.updateClientStatus()
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    onDestroy(): void {
        this.isDestoryed = true
        this.view.dispose()
    }


}