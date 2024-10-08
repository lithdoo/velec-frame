import { VNode, reactive } from "vue"

export interface TabPage {
    tabId: string
    icon: string
    title: string
    element: HTMLElement | VNode
    onActive?(): void
    onDeactive?(): void
    onDestroy?(): void
}

class AppTab {
    list: TabPage[] = []
    currentId: string | null = null

    currentPage() {
        if (!this.currentId) return null
        return this.list.find(tab => tab.tabId === this.currentId) ?? null
    }

    addTab(tab: TabPage, focus: boolean = true) {
        this.removeTab(tab.tabId)
        this.list = this.list.filter(v => v.tabId !== tab.tabId).concat([tab])
        if (focus || !this.currentId) this.active(tab.tabId)
    }

    async removeTab(id: string) {
        const old = this.list.find(v => v.tabId === id)
        old?.onDestroy?.()
        this.list = this.list.filter(v => v.tabId !== id)
        if (this.currentId === id) {
            this.active(this.list[0]?.tabId ?? null)
        }
    }

    active(id: string | null) {
        const next = this.list.find(panel => panel.tabId === id) ?? null
        const old = this.list.find(panel => panel.tabId === this.currentId)
        if (old) { old.onDeactive?.() }
        this.currentId = next?.tabId ?? null
        next?.onActive?.()
    }
}

export const appTab = reactive(new AppTab())