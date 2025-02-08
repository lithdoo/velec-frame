// import App from '../App.vue'
import { VNode, reactive } from 'vue'

export interface AppSiderPanel {
  panelId: string
  icon: string
  label: string
  element: HTMLElement | VNode
  onActive?(): void
  onDeactive?(): void
  onDestroy?(): void
}

export const siderControl = reactive(
  new (class {
    list: AppSiderPanel[] = []
    currentId: string | null = null

    currentPanel() {
      if (!this.currentId) return null
      return this.list.find((panel) => panel.panelId === this.currentId) ?? null
    }

    addPanel(panel: AppSiderPanel) {
      this.removePanel(panel.panelId)
      this.list = this.list.filter((v) => v.panelId !== panel.panelId).concat([panel])
      if (!this.currentId) this.active(panel.panelId)
    }

    removePanel(id: string) {
      const old = this.list.find((v) => v.panelId === id)
      old?.onDestroy?.()
      this.list = this.list.filter((v) => v.panelId !== id)
      if (this.currentId === id) {
        this.active(this.list[0]?.panelId ?? null)
      }
    }

    active(id: string | null) {
      const next = this.list.find((panel) => panel.panelId === id) ?? null
      const old = this.list.find((panel) => panel.panelId === this.currentId)
      if (old) {
        old.onDeactive?.()
      }
      this.currentId = next?.panelId ?? null
      next?.onActive?.()
    }
  })()
)
