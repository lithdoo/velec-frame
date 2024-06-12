import { AppSiderPanel, appSider } from "@renderer/state/sider"
import ExplorerSider from "./ExplorerSider.vue"
import { App, createApp } from "vue"


export class SiderFileExplorer implements AppSiderPanel {

    static install(){
        appSider.addPanel(new SiderFileExplorer())
    }

    panelId = 'FRAME_FILE_PANEL'
    icon = 'del'
    label = '资源管理器'
    element = document.createElement('div')
    vueApp: App<Element>
    constructor() {
        this.vueApp = createApp(ExplorerSider)
        this.vueApp.mount(this.element)
    }
}


