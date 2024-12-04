import { TabPage } from "@renderer/parts/PageTab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { DBChartModel } from "./DBChartModel";
import { parseFileName } from "@renderer/activities/FileExplorer/FileOperation";
import PageDBChartVue from './PageDBChart.vue'

export class PageDBChart implements TabPage {

    static create(dbUrl: string) {
        const page = fixReactive(new PageDBChart(dbUrl))
        page.reload()
        return page
    }


    tabId: string = Math.random().toString()
    title: string = "DBChart"
    icon: string = "home"
    element: VNode
    constructor(
        public dbUrl: string,
    ) {
        this.title = parseFileName(dbUrl)
        this.element = <div>loading …… </div>
    }

    isLoaded: boolean = false
    model: DBChartModel | null = null

    async reload() {
        this.isLoaded = false
        if (this.model) {
            this.model.despose()
        }
        this.model = null
        this.element = <div>loading …… </div>
        const model = await DBChartModel.create(this.dbUrl)
        const element = <PageDBChartVue model={model}></PageDBChartVue>
        this.model = model
        this.element = element
        this.isLoaded = true
    }

}
