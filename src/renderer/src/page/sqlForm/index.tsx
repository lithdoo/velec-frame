import { appTab, TabPage } from "@renderer/state/tab";
import { default as PageSqlAddTableVue } from "./PageSqlAddTable.vue";
import { default as PageSqlEditLabelVue } from "./PageSqlEditLabel.vue";
import { default as PageSqlViewDataVue } from "./PageSqlViewData.vue";
import { nanoid } from "nanoid";
import { SqliteConnect } from "@renderer/tools/sqilite";
import { CommonFormBuilder, CommonFormHandler } from "@renderer/components/form";
import { fixReactive } from "@renderer/fix";
import { SqliteDataType, TableInfo } from "@common/sql";
import { DataGridHandler, field, GridFetchOption, GridFetchPager, GridRenderData, GridRequset, GridStatus } from "@renderer/components/base/DataGrid";



export class PageSqlAddTable implements TabPage {

    static create(connection: SqliteConnect) {
        const tab = fixReactive(new this(connection))
        tab.init()
        return tab
    }

    readonly tabId: string = nanoid()
    readonly icon = 'del'
    readonly title: string
    readonly connection: SqliteConnect

    element = document.createElement('div')
    main: CommonFormHandler<{ name: string, label: string }>
    fields: CommonFormHandler<{
        keyName: string,
        type: string,
        label: string,
        primaryKey: boolean,
        // unique: boolean,
        notNull: boolean,
    }>[] = []

    constructor(connection: SqliteConnect) {
        this.connection = connection
        this.title = `新建表 [${this.connection.label}]`

        this.fields = fixReactive([])
        this.main = fixReactive(CommonFormBuilder.create()
            .input('name', { title: '表名', required: true })
            .input('label', { title: '注释' })
            .build()
        )
    }
    init() {
        this.element = <PageSqlAddTableVue page={this}></PageSqlAddTableVue>
    }
    addField() {
        this.fields = this.fields.concat([
            CommonFormBuilder.create()
                .input('keyName', { title: '字段名', required: true })
                .selector('type', {
                    title: '类型', required: true,
                    options: Object.values(SqliteDataType).map(val => ({ key: val, title: val }))
                })
                .input('label', { title: '注释' })
                .switch('primaryKey', { title: '是否主键' })
                .switch('notNull', { title: '是否非空' })
                .build()
        ])
    }


    async submit() {
        console.log('submit')
        const mainData = await this.main.submit()
        const fields = await Promise.all(this.fields.map(v => v.submit()))
        const table: TableInfo<SqliteDataType> = {
            ...mainData,
            fieldList: fields.map(field => ({
                name: field.keyName,
                label: field.label,
                type: field.type as SqliteDataType,// 类型,
                primaryKey: field.primaryKey,    // 是否主键
                unique: false,
                notNull: field.notNull,
            }))
        }

        this.connection.createTable(table)
    }

    close() {
        appTab.removeTab(this.tabId)
    }

}

export class PageSqlEditLabel implements TabPage {

    static create(
        connection: SqliteConnect,
        table: TableInfo<SqliteDataType>,
        lables: Record<string, string>,
        onsubmit: (labels: Record<string, string>) => void
    ) {
        const tab = fixReactive(new this(connection, table, lables, onsubmit))
        tab.init()
        return tab
    }

    readonly tabId: string = nanoid()
    readonly icon = 'del'
    readonly title: string
    readonly connection: SqliteConnect
    readonly table: TableInfo<SqliteDataType>

    element = document.createElement('div')
    form: CommonFormHandler<Record<string, string>>
    onsubmit: (labels: Record<string, string>) => void



    constructor(
        connection: SqliteConnect,
        table: TableInfo<SqliteDataType>,
        lables: Record<string, string>,
        onsubmit: (labels: Record<string, string>) => void
    ) {
        this.onsubmit = onsubmit
        this.table = table
        this.connection = connection
        this.title = `修改表注释 [${this.connection.label}]`
        this.form = fixReactive(
            this.table.fieldList.reduce((form, field) => {
                return form.input(`${table.name}.${field.name}`, {
                    title: `${table.name}.${field.name}`,
                    value: lables[`${table.name}.${field.name}`] ?? ''
                })
            }, CommonFormBuilder.create().input(table.name, { title: table.name, value: lables[table.name] ?? '' })
            ).build()
        )
    }
    init() {
        this.element = <PageSqlEditLabelVue page={this}></PageSqlEditLabelVue>
    }
    async submit() {
        console.log('submit')
        const mainData = await this.form.submit()
        this.onsubmit(mainData)
    }
    close() {
        appTab.removeTab(this.tabId)
    }

}

export class PageSqlViewData implements TabPage {

    static create(
        connection: SqliteConnect,
        table: TableInfo<SqliteDataType>,
    ) {
        const tab = fixReactive(new this(connection, table))
        tab.init()

        return tab
    }


    readonly tabId: string = nanoid()
    readonly icon = 'del'
    readonly title: string
    readonly connection: SqliteConnect
    readonly tableName: string

    element = document.createElement('div')

    isLoading = true
    data: any[] = []
    tableInfo: TableInfo<SqliteDataType>
    gridHandler = fixReactive(new DataViewHandler())

    init() {
        this.refresh()
        this.element = <PageSqlViewDataVue page={this}></PageSqlViewDataVue>
    }

    constructor(connection: SqliteConnect, table: TableInfo<SqliteDataType>) {
        this.title = `浏览表数据 [${table.name}]`
        this.connection = connection
        this.tableInfo = table
        this.tableName = this.tableInfo.name
        this.gridHandler.updateFields(table)
    }

    async refresh() {
        const table = await this.connection.tableInfo(this.tableName)
        const data = await this.connection.searchTable(this.tableInfo.name)
        this.isLoading = false

        if (!table) {
            throw new Error()
        } else {
            this.tableInfo = table
            this.gridHandler.request.data = data
            this.gridHandler.grid.current = 1
            this.gridHandler.updateFields(table)
            this.gridHandler.refresh()
        }

        // const data = window.sqliteApi.getTableData(this.tableName)
        // Promise.all([table,data]).then(([table,data])=>{
        //     this.table = table
        //     this.data = data
        // })
    }
}



class DataViewHandler extends DataGridHandler<any, DataViewRequset> {
    constructor() {
        super(new DataViewRequset())
    }
    updateFields(table: TableInfo<SqliteDataType>) {
        this.fields = table.fieldList.map(fieldInfo => field({
            name: `${fieldInfo.name} (${fieldInfo.type})`,
            fieldKey: fieldInfo.name
        }))
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
