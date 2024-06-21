import { AppSiderPanel, appSider } from "@renderer/state/sider"
import ExplorerSider from "./ExplorerSider.vue"


export class SiderFileExplorer implements AppSiderPanel {

    static install() {
        appSider.addPanel(new SiderFileExplorer())
    }

    panelId = 'FRAME_FILE_PANEL'
    icon = 'del'
    label = '资源管理器'
    element = <ExplorerSider />
    constructor() {
    }
}


