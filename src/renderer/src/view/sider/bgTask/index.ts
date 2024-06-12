import { AppSiderPanel, appSider } from "@renderer/state/sider"
import BgTaskSider from "./BgTaskSider.vue"
import { App, createApp } from "vue"


export class SiderBgTask implements AppSiderPanel {

    static install(){
        appSider.addPanel(new SiderBgTask())
    }

    panelId = 'FRAME_BG_TASK_PANEL'
    icon = 'home'
    label = '后台任务'
    element = document.createElement('div')
    vueApp: App<Element>
    constructor() {
        this.vueApp = createApp(BgTaskSider)
        this.vueApp.mount(this.element)
    }
}


