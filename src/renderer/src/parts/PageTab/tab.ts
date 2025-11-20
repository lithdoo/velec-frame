import { VNode, reactive } from 'vue'

export interface TabPage {
  tabId: string
  icon: string
  title: string
  element: HTMLElement | VNode
  onActive?(): void
  onDeactive?(): void
  onDestroy?(): void
}




export const tabControl = reactive(
  new (class TabControl {
    list: TabPage[] = []
    currentId: string | null = null

    currentPage() {
      if (!this.currentId) return null
      return this.list.find((tab) => tab.tabId === this.currentId) ?? null
    }

    async addTab(tab: TabPage, focus: boolean = true) {
      await this.removeTab(tab.tabId)
      this.list = this.list.filter((v) => v.tabId !== tab.tabId).concat([tab])
      if (focus || !this.currentId) this.active(tab.tabId)
    }

    async removeTab(id: string) {
      const oldIdx = this.list.findIndex((v) => v.tabId === id)
      await this.list[oldIdx]?.onDestroy?.()
      this.list = this.list.filter((v) => v.tabId !== id)
      if (this.currentId === id) {
        const curIdx = oldIdx - 1 < 0 ? 0 : oldIdx - 1
        const next = this.list[curIdx]
        this.active(next?.tabId ?? null)
      }
    }

    active(id: string | null) {
      const next = this.list.find((panel) => panel.tabId === id) ?? null
      const old = this.list.find((panel) => panel.tabId === this.currentId)
      if (old) {
        old.onDeactive?.()
      }
      this.currentId = next?.tabId ?? null
      next?.onActive?.()
    }
  })()
)
