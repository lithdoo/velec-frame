import { FileControl, JsonTableController } from "@renderer/mods/mutd/json";
import { TabPage } from "@renderer/parts/PageTab";
import { VNode } from "vue";
import join from 'url-join'
import { MutDBInfo } from "@renderer/mods/mutd/struc";
import PageMutDBChartVue from './PageMutDBChart.vue'
import { fixReactive } from "@renderer/fix";
import { ModalStackHandler } from "@renderer/widgets/ModalStack";
import { DBChartInfo, DBChartState, DBChartVIew } from "./chart";

export class TableInfoController extends JsonTableController<typeof MutDBInfo.Table> {
    readonly info = MutDBInfo.Table

    constructor(dir: string) {
        const file = new FileMethod(dir)
        super(file)
    }
}

export class FieldInfoController extends JsonTableController<typeof MutDBInfo.Field> {
    readonly info = MutDBInfo.Field

    constructor(dir: string) {
        const file = new FileMethod(dir)
        super(file)
    }
}

export class RefInfoController extends JsonTableController<typeof MutDBInfo.Ref> {
    readonly info = MutDBInfo.Ref

    constructor(dir: string) {
        const file = new FileMethod(dir)
        super(file)
    }
}

export class RenderInfoController extends JsonTableController<typeof DBChartInfo.Render> {
    readonly info = DBChartInfo.Render

    constructor(dir: string) {
        const file = new FileMethod(dir)
        super(file)
    }
}

export class FileMethod implements FileControl {
    constructor(
        public dir: string,
    ) { }

    async writeFile(file: string, content: string): Promise<any> {
        const path = join(this.dir, file)
        return window.explorerApi.saveContent(path, content)
    }

    async readFile(file: string): Promise<string> {
        const path = join(this.dir, file)
        return await window.explorerApi.readContent(path) ?? ''
    }

    async existFile(file: string): Promise<boolean> {
        const path = join(this.dir, file)
        return !!await window.explorerApi.fileStat(path)
    }

    async createFile(file: string, content: string): Promise<void> {
        return this.writeFile(file, content)
    }

}


export class PageMutDBChart implements TabPage {
    static async create(fileUrl: string) {
        const page = fixReactive(new PageMutDBChart(fileUrl))
        await page.init()
        return page
    }
    modal: ModalStackHandler = fixReactive(new ModalStackHandler())
    tabId: string = Math.random().toString()
    element: VNode
    title: string
    icon = 'del'
    viewElement = document.createElement('div')
    view?: DBChartVIew
    constructor(
        public dirUrl: string,
        public table = new TableInfoController(dirUrl),
        public field = new FieldInfoController(dirUrl),
        public ref = new RefInfoController(dirUrl),
        public render = new RenderInfoController(dirUrl)
    ) {
        this.title = dirUrl
        this.element = <div></div>
    }


    async init() {
        this.element = <PageMutDBChartVue page={this}></PageMutDBChartVue>

        const tables = await this.table.read()
        const fields = await this.field.read()
        const render = await this.render.read()
        const ref = await this.ref.read()

        const that = this

        const state = fixReactive(new class extends DBChartState {
            constructor() {
                super(tables, fields, ref, render)
            }

            async reload(): Promise<void> {
                this.tables = await that.table.read()
                this.fields = await that.field.read()
                this.render = await that.render.read()
            }
        })
        const view = fixReactive(new DBChartVIew(
            this.viewElement,
            state,
            this.modal,
            this.table,
            this.field,
            this.render
        ))
        this.view = view
        await view.initGraph()

        // MVFileController.modalWeakMap.set(this.controller, this.modal)
        // await this.reload()
    }


}