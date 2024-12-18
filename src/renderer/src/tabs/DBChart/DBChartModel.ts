import { fixReactive } from "@renderer/fix";
import { ChartViewState } from "./ChartState";
import { DBChartService, DBRecordsService } from "./DBService";
import "./ChartRender"
import { ChartGraphView } from "./ChartView";
import { ChartControl } from "./ChartControl";
import { PageSqlViewData } from "./PageDBRecordsHandler";
import { tabControl } from "@renderer/parts/PageTab";
import { modalControl } from "./common";
import { ConfirmModalHandler } from "@renderer/widgets/ConfirmModal";
import { PageCommonEditor } from "../TextEditor";
import { ToolBarBuilder } from "@renderer/widgets/ToolBar";

export class DBChartModel {
    static async create(dbUrl: string) {
        const control = fixReactive(new ChartControl());
        const service = fixReactive(new DBChartService(dbUrl));
        const state = fixReactive(new ChartViewState(service, control));
        const model = new DBChartModel(service, state, control);
        return fixReactive(model)
    }
    constructor(
        public readonly service: DBChartService,
        public readonly state: ChartViewState,
        public readonly control = new ChartControl(),
        public readonly view = new ChartGraphView(state),
    ) {
        this.initControl()
    }

    async reload() {
        await this.state.reload(this.service)
        await this.view.refresh()
    }

    async clearCache() {
        await this.state.clearAll()
        await this.view.refresh()
    }

    despose() {
        this.state.dispose()
        this.view.dispose()
    }

    private get confirm() {
        return modalControl.get(fixReactive(this))
    }

    private initControl() {
        this.control.on('table:delete', (tableName: string) => {
            this.confirm.open({
                title: "请问要删除表吗？",
                message: '删除表后，将无法恢复，请谨慎操作',
                buttons: [ConfirmModalHandler.btnClose(), {
                    text: "确认删除",
                    type: "danger",
                    action: async ({ close }) => {
                        this.service.deleteTable(tableName)
                        await this.reload()
                        close()
                    }
                }]
            })
        })

        this.control.on('table:add', async (tableName?: string) => {
            let table_name = tableName || 'NEW_BLANK_TABLE'
            let ext = 0

            while (this.state.nodes.has(table_name)) {
                table_name = `NEW_BLANK_TABLE_${++ext}`
            }
            await this.service.createBlankTable(table_name)
            await this.reload()
            await this.control.emit('table:focus', table_name)
        })
        this.control.on('table:showDataGrid', (tableName, type) => {
            const nodeData = Array.from(this.state.nodes.values()).find(v => v.table.name === tableName)
            if (!nodeData) return

            const service = new DBRecordsService(this.service.dbUrl)
            const dataView = PageSqlViewData.create(service, nodeData.table)
            tabControl.addTab(dataView)
            tabControl.active(dataView.tabId)
            if (type === 'insert') {
                dataView.insertMode()
            }
        })

        this.control.on('db:showExecuteEditor', () => {
            const editPage = PageCommonEditor.create(
                `执行 SQL [${this.service.dbUrl}]`,
                '',
                ToolBarBuilder.create()
                    .button('close', '关闭', () => tabControl.removeTab(editPage.tabId))
                    .button('execute', '执行', async () => {
                        const sql = editPage.handler.editor?.getValue().toString()
                        if (sql) {
                            try {
                                await window.sqliteApi.sqlRunList(
                                    this.service.dbUrl,
                                    sql.split(';').filter(v => !!v).map(v => v + ';')
                                )
                                alert('执行成功')
                            } catch (e: any) {
                                alert(e.message)
                            }

                        }
                    })
                    .button('query', '查询并保存到文件', async () => {
                        const sql = editPage.handler.editor?.getValue().toString()
                        if (sql) {
                            try {
                                await window.sqliteApi.sqlSelectAlltoFile(
                                    this.service.dbUrl,
                                    sql
                                )

                                alert('执行成功')
                            } catch (e: any) {
                                alert(e.message)
                            }

                        }
                    })
                    .build()
            )
            tabControl.addTab(editPage)
        })


        this.control.on('chart:clearCache', () => {
            this.confirm.open({
                title: "确定要清除缓存吗？",
                message: "这将清除所有缓存数据，包括图表数据、配置等。请谨慎操作。",
                buttons: [ConfirmModalHandler.btnClose(), {
                    text: "确认清除缓存",
                    type: "primary",
                    action: async ({ close }) => {  // 清除缓存
                        await this.clearCache()
                        close()
                    }
                }]
            })
        })

        this.control.on('chart:reload', () => {
            this.reload()
        })

        this.control.on('db:sortTables', async list => {
            await this.service.sortTable(list)
            await this.reload()
        })

        this.control.on('table:rename', async (oldName, newName) => {
            await this.service.renameTable(oldName, newName)
            await this.reload()
        })

        this.control.on('field:rename', async (table, oldName, newName) => {
            await this.service.renameField(table, oldName, newName)
            await this.reload()
        })

        this.control.on('field:add', async (table, name, type) => {
            await this.service.addField(table, name, type)
            await this.reload()
        })

        this.control.on('field:delete', async (table, field) => {
            this.confirm.open({
                title: `确定要删除字段 ${table.name}.${field} 吗？`,
                message: "删除字段将会删除该字段下的所有数据且不可恢复，请谨慎操作",
                buttons: [ConfirmModalHandler.btnClose(), {
                    text: "确认删除",
                    type: "danger",
                    action: async ({ close }) => {  // 清除缓存
                        await this.service.deleteField(table, field)
                        await this.reload()
                        close()
                    }
                }]
            })

        })
    }



}