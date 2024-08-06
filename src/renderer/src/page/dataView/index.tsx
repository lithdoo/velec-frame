import { TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { DataGridHandler, field, GridFetchOption, GridFetchPager, GridRenderData, GridRequset, GridStatus } from "@renderer/components/base/DataGrid/handler";
import { nanoid } from 'nanoid'
import PageDataViewVue from './PageDataView.vue'

interface PageSqlEditorOption {
    title: string,
}

export class PageDataView implements TabPage {
    static finder: Map<string, PageDataView> = new Map()

    static create(option: PageSqlEditorOption) {
        const page = fixReactive(new PageDataView(option))
        if (PageDataView.finder.has(page.finderId)) throw new Error()
        PageDataView.finder.set(page.finderId, page)
        return page
    }
    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    data?: Promise<any[]>

    finderId = nanoid()
    dataHandler = fixReactive(new DataViewHandler())

    constructor(option: PageSqlEditorOption) {
        this.title = option.title
        this.element = <PageDataViewVue page={this}></PageDataViewVue>
    }


    load(promise: Promise<any[]>) {
        this.data = promise
        this.data.then(data => {
            if (this.data === promise) {
                this.dataHandler.request.data = data
                this.dataHandler.grid.current = 1
                this.dataHandler.refresh()
                this.dataHandler.updateFields()
            }
        })
    }

    onDestroy(): void {
        PageDataView.finder.delete(this.finderId)
    }

}

class DataViewHandler extends DataGridHandler<any, DataViewRequset> {
    constructor() {
        super(new DataViewRequset())
    }
    updateFields() {
        if (this.request.data.length === 0) {
            this.fields = []
        } else {
            const item = this.request.data[0]

            this.fields = Array.from(Object.keys(item)).map(key => {
                return field({
                    name: key,
                    fieldKey: key
                })
            })
        }

    }
}

class DataViewRequset extends GridRequset<any> {
    data: any[] = []

    fetchData(pager: GridFetchPager, _option: GridFetchOption): Promise<GridRenderData<any>> {
        const { current, pageSize } = pager

        const total = this.data.length
        const status = GridStatus.loaded
        const list = this.data.filter((_, i) => (i >= pageSize * (current - 1)) && (i < pageSize * current))
        const pages = Math.ceil(this.data.length / pageSize) || 1

        return Promise.resolve({
            current,
            pageSize,
            total,
            status,
            list,
            pages
        })
    }
}
