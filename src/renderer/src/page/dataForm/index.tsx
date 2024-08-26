import { CommonFormHandler } from "@renderer/components/form"
import { fixReactive } from "@renderer/fix"
import { appTab, TabPage } from "@renderer/state/tab"
import { nanoid } from "nanoid"
import PageDataFormVue from './PageDataForm.vue'


export interface PageDataFormOpiton<T extends Record<string, unknown>> {
    title: string
    form: CommonFormHandler<T>
    onsubmit: (labels: T) => void
}

export class PageDataForm<T extends Record<string, unknown>> implements TabPage {

    static create<T extends Record<string, unknown>>(option: PageDataFormOpiton<T>) {
        const tab = fixReactive(new this(option))
        tab.init()
        return tab
    }

    readonly tabId: string = nanoid()
    readonly icon = 'del'
    readonly title: string

    element = document.createElement('div')
    form: CommonFormHandler<T>
    onsubmit: (labels: T) => void

    constructor(option: PageDataFormOpiton<T>) {
        this.onsubmit = option.onsubmit
        this.title = option.title
        this.form = fixReactive(option.form)
    }
    init() {
        this.element = <PageDataFormVue page={this}> </PageDataFormVue>
    }
    async submit() {
        const mainData = await this.form.submit()
        this.onsubmit(mainData)
    }
    close() {
        appTab.removeTab(this.tabId)
    }

}
