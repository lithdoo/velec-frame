import { TabPage } from "@renderer/state/tab";
import { App, createApp } from "vue";
import PageBgTaskVue from './PageBgTask.vue'

export class PageBgTask implements TabPage {
    tabId: string = Math.random().toString()
    element: HTMLElement = document.createElement('div')
    icon = 'del'
    title = ''
    vueApp: App<Element>

    constructor(path: string) {
        this.title = path
        this.vueApp = createApp(PageBgTaskVue, { page: this })
        this.vueApp.mount(this.element)
    }

}