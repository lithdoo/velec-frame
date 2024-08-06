import { appTab, TabPage } from "@renderer/state/tab";
import { VNode } from "vue";
import { fixReactive } from "@renderer/fix";
import { default as PageSqlErdVue } from "./PageSqlErd.vue";
import { SqlErdGraphView } from "@renderer/components/graph/sqlite/index";
import { nanoid } from "nanoid";
import { contextMenu } from "@renderer/view/fixed/contextmenu";
import { Menu, PopMenuListHandler } from "@renderer/components/base/PopMenu";
import { PageDataView } from "../dataView";
import { SqliteDriver } from "@renderer/tools/sqilite";

type Connection = {
    driver: 'sqlite',
    url: string
}


export class PageSqlErd implements TabPage {

    static sqlite(url: string) {
        const page = fixReactive(new PageSqlErd({
            driver: 'sqlite', url
        }))
        page.init()
        return page
    }
    readonly tabId: string = nanoid()
    readonly element: VNode
    readonly icon = 'del'
    readonly title = ''
    readonly view: SqlErdGraphView
    readonly driver: SqliteDriver

    readonly connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
        this.view = new SqlErdGraphView()
        this.element = <PageSqlErdVue page={this}></PageSqlErdVue>
        this.driver = new SqliteDriver(this.connection.url)
        this.initView()
    }

    private cacheFilePath() {
        return `${this.connection.url}.erd`
    }

    async init() {
        const raw = await this.driver.erdData()
        const cache = await window.explorerApi.readJson(this.cacheFilePath())
        this.view.load(raw, cache ?? null)
    }

    async reload(){
        const raw = await this.driver.erdData()
        console.log({raw})
        this.view.load(raw)
    }

    async saveCache() {
        const filePath = this.cacheFilePath()
        const content = this.view.save()
        await window.explorerApi.saveJson(filePath, content)
    }

    private initView() {
        this.view.onNodeConnectMenu = ({
            event, data
        }) => {
            contextMenu.open(PopMenuListHandler.create([
                Menu.button({
                    icon: 'del', key: 'viewData', label: '浏览数据', action: () => {
                        // const sql = `select * from ${data.meta.name}`
                        // const url = this.connection.url
                        // const sqlData = window.sqliteApi.sqlSelectAll(url, sql) 
                        const sqlData = this.driver.searchTable(data.meta.name)
                        const dataView = PageDataView.create({ title: `${data.meta.name}[${this.title}]` })
                        dataView.load(sqlData)
                        appTab.addTab(dataView)
                        appTab.active(dataView.tabId)
                    }
                }),
                Menu.button({
                    icon: 'del', key: 'insertTable', label: '添加数据', action: () => {

                    }
                }),
                Menu.button({
                    icon: 'del', key: 'deleteTable', label: '删除表', action: async() => {
                        await this.driver.deleteTable(data.meta.name)
                        await this.reload()
                    }
                })
            ]), event)

        }

    }

}