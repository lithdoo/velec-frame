import { TabPage } from "@renderer/state/tab";
import { App, createApp } from "vue";
import PageFileInfoVue from './PageFileInfo.vue'

export class PageFileInfo implements TabPage {
    tabId: string = Math.random().toString()
    element: HTMLElement = document.createElement('div')
    icon = 'del'
    title = ''
    vueApp: App<Element>
    file: { name: string, url: string }

    constructor(file: { name: string, url: string }) {
        this.file = file
        this.title = this.file.name
        this.element.style.height = '100%'
        this.vueApp = createApp(PageFileInfoVue, { page: this })
        this.vueApp.mount(this.element)
    }

}