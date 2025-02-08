import { TabPage } from '@renderer/parts/PageTab'
import {
  ActionFieldBuilder,
  DataGridHandler,
  field,
  GridFetchOption,
  GridFetchPager,
  GridField,
  GridRenderData,
  GridRequset,
  GridStatus,
  isDataField
} from '@renderer/widgets/DataGrid'
import { DBRecordsService, SqliteTableInfo } from './DBService'
import { nanoid } from 'nanoid'
import { fixReactive } from '@renderer/fix'
import PageSqlViewDataVue from './PageDBRecords.vue'

export class PageSqlViewData implements TabPage {
  static create(service: DBRecordsService, table: SqliteTableInfo) {
    const tab = fixReactive(new this(service, table))
    tab.init()

    return tab
  }
  readonly tabId: string = nanoid()
  readonly icon = 'del'
  readonly title: string
  readonly tableName: string

  element = document.createElement('div')

  isInsertMode: boolean = false
  isLoading = true
  data: any[] = []
  tableInfo: SqliteTableInfo
  viewHandler = new DataViewHandler(this)
  insertHandler = new DataInsertHandler(this)

  init() {
    this.refresh()
    this.element = <PageSqlViewDataVue page={this}></PageSqlViewDataVue>
  }
  insertMode() {
    this.isInsertMode = true
    this.insertHandler.clear()
    this.insertHandler.addRow()
  }
  viewMode() {
    this.isInsertMode = false
  }

  async submitInsert() {
    const data = this.insertHandler.request.data
    if (!data.length) return this.viewMode()

    const table = this.tableInfo
    const service = this.service

    await service.insertToTable(table, data)
    this.viewMode()
  }

  constructor(
    readonly service: DBRecordsService,
    readonly table: SqliteTableInfo
  ) {
    this.title = `浏览表数据 [${table.name}]`
    this.service = service
    this.tableInfo = table
    this.tableName = this.tableInfo.name
    this.viewHandler.updateFields(table)
  }

  async refresh(resetPage: boolean = true) {
    const table = await this.service.tableInfo(this.tableName)
    const data = await this.service.searchTable(this.tableInfo.name)
    this.isLoading = false

    if (!table) {
      throw new Error()
    } else {
      this.tableInfo = table
      this.viewHandler.request.data = data
      if (resetPage) {
        this.viewHandler.grid.current = 1
      }
      this.viewHandler.updateFields(table)
      this.viewHandler.refresh()
      this.insertHandler.updateFields(table)
    }
  }
}

class DataViewHandler extends DataGridHandler<any, DataViewRequset> {
  editData: Map<any, any> = new Map()
  page: PageSqlViewData
  constructor(page: PageSqlViewData) {
    super(new DataViewRequset())
    this.page = page
  }
  updateFields(table: SqliteTableInfo) {
    this.fields = table.fieldList
      .map<GridField<Record<string, string>>>((fieldInfo) =>
        field({
          name: `${fieldInfo.name} (${fieldInfo.type})`,
          fieldKey: fieldInfo.name
        })
      )
      .concat([
        new ActionFieldBuilder<Record<string, string>>()
          .actions((record) => {
            if (this.editData.has(record)) {
              return [
                {
                  title: '提交',
                  key: 'submit',
                  action: async () => {
                    await this.page.service.updateToTable(
                      this.page.tableInfo,
                      record,
                      this.editData.get(record)
                    )
                    this.editData.delete(record)
                    this.page.refresh()
                  }
                },
                {
                  title: '取消',
                  key: 'cancel',
                  action: () => {
                    this.editData.delete(record)
                  }
                }
              ]
            } else {
              return [
                {
                  title: '修改',
                  key: 'update',
                  action: () => {
                    this.editData.clear()
                    this.editData.set(record, { ...record })
                  }
                },
                {
                  title: '删除',
                  key: 'delete',
                  confirm: '确定要删除吗？',
                  action: async () => {
                    await this.page.service.removeFromTable(this.page.tableInfo, record)
                    this.editData.delete(record)
                    this.editData.clear()
                    this.page.refresh()
                  }
                }
              ]
            }
          })
          .build()
      ])
  }
}

class DataInsertHandler extends DataGridHandler<any, DataViewRequset> {
  page: PageSqlViewData
  constructor(page: PageSqlViewData) {
    super(new DataViewRequset())
    this.page = page
  }
  clear() {
    this.request.data = []
    this.refresh()
  }

  addRow() {
    const obj: Record<string, string> = {}
    this.fields.forEach((field) => {
      if (isDataField(field)) {
        obj[field.fieldKey] = ''
      }
    })
    this.request.data = [obj].concat(this.request.data)
    this.grid.pageSize = this.request.data.length
    this.grid.current = 1
    this.refresh()
  }

  updateFields(table: SqliteTableInfo) {
    this.fields = table.fieldList
      .map<GridField<Record<string, string>>>((fieldInfo) =>
        field({
          name: `${fieldInfo.name} (${fieldInfo.type})`,
          fieldKey: fieldInfo.name
        })
      )
      .concat([
        new ActionFieldBuilder<Record<string, string>>()
          .actions((record) => {
            return [
              {
                title: '删除',
                key: 'cancel',
                action: () => {
                  this.request.data = this.request.data.filter((val) => val !== record)
                  this.refresh()
                }
              }
            ]
          })
          .build()
      ])
  }
}

class DataViewRequset extends GridRequset<any> {
  data: any[] = []
  fetchData(pager: GridFetchPager, _option: GridFetchOption): Promise<GridRenderData<any>> {
    const { current, pageSize } = pager

    const total = this.data.length
    const status = GridStatus.loaded
    const list = this.data.filter((_, i) => i >= pageSize * (current - 1) && i < pageSize * current)
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
