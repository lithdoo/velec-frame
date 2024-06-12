// import App from '../App.vue'
import { reactive } from 'vue'

export interface AppSiderPanel {
    panelId: string
    icon: string
    label: string
    element: HTMLElement
    onActive?(): void
    onDeactive?(): void
    onDestroy?(): void
}


class AppSider {
    list: AppSiderPanel[] = []
    currentPanelId: string | null = null


    currentPanel() {
        if (!this.currentPanelId) return null
        return this.list.find(panel => panel.panelId === this.currentPanelId) ?? null
    }

    addPanel(panel: AppSiderPanel) {
        this.removePanel(panel.panelId)
        this.list = this.list.filter(v => v.panelId !== panel.panelId).concat([panel])
        if (!this.currentPanelId) this.active(panel.panelId)
    }

    removePanel(id: string) {
        const old = this.list.find(v => v.panelId === id)
        old?.onDestroy?.()
        this.list = this.list.filter(v => v.panelId !== id)
        if (this.currentPanelId === id) {
            this.active(this.list[0]?.panelId ?? null)
        }
    }

    active(id: string | null) {
        const next = this.list.find(panel => panel.panelId === id) ?? null
        const old = this.list.find(panel => panel.panelId === this.currentPanelId)
        if (old) { old.onDeactive?.() }
        this.currentPanelId = next?.panelId ?? null
        next?.onActive?.()
    }
}


export const appSider = reactive(new AppSider())


appSider.addPanel(new class SiderFilePanel implements AppSiderPanel {
    panelId = 'FRAME_FILE_PANEL'
    icon = 'del'
    label = '资源管理器'
    element = document.createElement('div')

    constructor() {

    }
})