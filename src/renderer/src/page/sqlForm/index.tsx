import { appTab, TabPage } from "@renderer/state/tab";
import { default as PageSqlAddTableVue } from "./PageSqlAddTable.vue";
import { nanoid } from "nanoid";
import { SqliteConnect, SqliteDataType, TableInfo } from "@renderer/tools/sqilite";
import { CommonFormBuilder, CommonFormHandler } from "@renderer/components/form";
import { fixReactive } from "@renderer/fix";



export class PageSqlAddTable implements TabPage {

    static create(connection: SqliteConnect) {
        const tab = fixReactive(new PageSqlAddTable(connection))
        tab.init()
        return tab
    }

    readonly tabId: string = nanoid()
    readonly icon = 'del'
    readonly title: string
    readonly connection: SqliteConnect

    element = document.createElement('div')
    name: string = ''
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
                // .switch('unique', { title: '是否唯一' })
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