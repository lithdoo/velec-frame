import { Graph } from "@antv/x6"
import { JsonTableController, MutDBCRecordData, MutDBCRecordValue } from "@renderer/mods/mutd/json"
import { DataFieldType, DataRepeatDealType, MutDBInfo, TableRecord } from "@renderer/mods/mutd/struc"
import { nanoid } from "nanoid"
import { DBChartRender } from "./render"
import { PopMenuBuilder } from "@renderer/widgets/PopMenu"
import { contextMenu } from "@renderer/parts/GlobalContextMenu"
import { ModalStackHandler } from "@renderer/widgets/ModalStack"
import FormRecord, { FromRecordBinder } from "./FormRecord.vue"
import { fixReactive } from "@renderer/fix"
import { Msg } from "@renderer/utils"
import { ModalPanel } from "@renderer/widgets/ModalStack/ModalStack.vue"
import { markRaw } from "vue"

DBChartRender.init()

export interface X6EntityData {
    table: TableRecord<typeof MutDBInfo.Table>,
    fields: TableRecord<typeof MutDBInfo.Field>[],
    refs: TableRecord<typeof MutDBInfo.Ref>[],
    render: TableRecord<typeof DBChartInfo.Render>,
}

export class DBChartEntity implements X6EntityData {


    static maxHeight(fieldLength: number) {
        const outerBorder = 3
        const fieldHeight = 30 + 1
        const colorBanner = 6
        const titleHeight = 32

        return outerBorder + titleHeight + colorBanner + fieldHeight * fieldLength + outerBorder
    }

    static minHeight() {

        const outerBorder = 3
        const fieldHeight = 30 + 1
        const colorBanner = 6
        const titleHeight = 32

        return outerBorder + titleHeight + colorBanner + fieldHeight * 0 + outerBorder
    }


    constructor(
        public table: TableRecord<typeof MutDBInfo.Table>,
        public fields: TableRecord<typeof MutDBInfo.Field>[],
        public refs: TableRecord<typeof MutDBInfo.Ref>[],
        public render: TableRecord<typeof DBChartInfo.Render>
            = MutDBCRecordValue.pre(DBChartInfo.Render.fields, [{
                _ref_key_: nanoid(), x: 0, y: 0,
                width: 300, height: DBChartEntity.maxHeight(fields.length),
                source_table: [table._ref_key_]
            }])[0]
    ) {

        console.log(MutDBCRecordValue.pre(DBChartInfo.Render.fields, [{
            _ref_key: nanoid(), x: 0, y: 0,
            width: 300, height: DBChartEntity.maxHeight(fields.length)
        }])[0])
    }


    x6Data() {
        return {
            id: this.table._ref_key_,
            height: this.render.height === 0
                ? DBChartEntity.maxHeight(this.fields.length)
                : this.render.height,
            width: this.render.width,
            x: this.render.x,
            y: this.render.y,
            data: {
                table: this.table,
                fields: this.fields,
                refs: this.refs,
                render: this.render
            },
            shape: DBChartRender.shape
        }
    }
}

export const DBChartInfo = {
    Render: {
        table_name: 'mut_dbc_private_render_info',
        fields: [
            { field_name: 'x', type: DataFieldType.Number, is_key: false },
            { field_name: 'y', type: DataFieldType.Number, is_key: false },
            { field_name: 'height', type: DataFieldType.Number, is_key: false },
            { field_name: 'width', type: DataFieldType.Number, is_key: false },
            { field_name: 'source_table', type: DataFieldType.RefId, is_key: true },
        ],
        repeat_deal_type: DataRepeatDealType.Update,
        blank_data: []
    } as {
        table_name: 'mut_dbc_private_render_info',
        fields: [
            { field_name: 'x', type: DataFieldType.Number, is_key: false },
            { field_name: 'y', type: DataFieldType.Number, is_key: false },
            { field_name: 'height', type: DataFieldType.Number, is_key: false },
            { field_name: 'width', type: DataFieldType.Number, is_key: false },
            { field_name: 'source_table', type: DataFieldType.RefId, is_key: true },
        ],
        repeat_deal_type: DataRepeatDealType.Update,
        blank_data: []
    }
}

export abstract class DBChartState {

    constructor(
        public tables: MutDBCRecordData<TableRecord<typeof MutDBInfo.Table>>,
        public fields: MutDBCRecordData<TableRecord<typeof MutDBInfo.Field>>,
        public refs: MutDBCRecordData<TableRecord<typeof MutDBInfo.Ref>>,
        public render: MutDBCRecordData<TableRecord<typeof DBChartInfo.Render>>,
    ) {

    }

    entities() {
        const allTables = this.tables.list
        const allFields = this.fields.list.filter(v => !!v.source_table[0])
        const allRefs = this.refs.list.filter(v => !!v.source_field[0] && !!v.target_table[0])
        const allRender = this.render.list.filter(v => !!v.source_table[0])

        return allTables.map(table => {
            const fields = allFields
                .filter(v => v.source_table[0] === table._ref_key_)
                .sort((a, b) => a.index - b.index)
            const fieldSet = new Set(fields.map(v => v._ref_key_))
            const render = allRender
                .find(v => v.source_table[0] === table._ref_key_)
            const refs = allRefs.filter(v => fieldSet.has(v.source_field[0] ?? ''))
            return new DBChartEntity(table, fields, refs, render)
        })
    }


    abstract reload(): Promise<void>

}

export class DBChartVIew {
    constructor(
        public viewElement: HTMLDivElement,
        public state: DBChartState,
        public modal: ModalStackHandler,
        public table: JsonTableController<typeof MutDBInfo.Table>,
        public field: JsonTableController<typeof MutDBInfo.Field>,
        public render: JsonTableController<typeof DBChartInfo.Render>,
    ) { }



    public graph?: Graph

    initGraph(): Graph {
        const container = this.viewElement
        const graph: Graph = markRaw(
            new Graph({
                container,
                // connecting: {
                //     router: 'sql-er-router'
                // },
                grid: {
                    visible: true,
                    type: 'dot',
                    size: 20,
                    args: {
                        color: '#aaaaaa', // 网点颜色
                        thickness: 1 // 网点大小
                    }
                },
                panning: {
                    enabled: true,
                    eventTypes: ['leftMouseDown']
                },
                mousewheel: {
                    enabled: true,
                    zoomAtMousePosition: true,
                    modifiers: null,
                    factor: 1.1,
                    maxScale: 2,
                    minScale: 0.02
                },
                autoResize: true
            })
        )

        this.graph = graph


        graph.on('node:change:position', (event) => {
            // if (!current) { return }
            console.log({ event })
            const { node, current } = event
            if (!current) { return }
            const { render } = node.getData() as X6EntityData
            this.updateRender({
                ...render, x: current.x, y: current.y
            })
            //   this.state.updateNodePos(node.data.id, current.x, current.y)
        })

        graph.on('node:contextmenu', (event) => {
            // console.log({ event })

            const { node, e } = event
            const nodeData = node.getData() as X6EntityData
            const { table, modal, field } = this
            const view = this

            const menu = PopMenuBuilder.create()
                .button('edit', '编辑表信息', () => {

                    const binder = fixReactive(new class extends FromRecordBinder {
                        refKey = nodeData.table._ref_key_
                        required: string[] = ['repeat_deal_type', 'table_name']
                        currentEdit = { ...nodeData.table }
                        constructor() {
                            super(table.info)
                        }
                        textEnum: { [key: string]: string[]; } = {
                            'repeat_deal_type': [...Object.values(DataRepeatDealType)]
                        }
                        close() {
                            modal.remove(panel.key)
                        }
                        async submit(data) {
                            super.submit(data)
                            await table.update([data])
                            Msg.success('更新成功！')
                            view.reload()
                        }
                    })

                    const panel: ModalPanel = {
                        key: nanoid(),
                        content: <FormRecord {...binder} />
                    }
                    modal.push(panel)
                })
                .button('field', "添加字段", () => {

                    const binder = fixReactive(new class extends FromRecordBinder {
                        currentEdit = {
                            source_table: [nodeData.table._ref_key_]
                        }
                        required: string[] = ['field_name', 'type', 'source_table ', 'is_key']
                        constructor() {
                            super(field.info)
                        }
                        textEnum: { [key: string]: string[]; } = {
                            'type': [...Object.values(DataFieldType)]
                        }
                        close() {
                            modal.remove(panel.key)
                        }
                        async submit(data) {
                            super.submit(data)
                            await field.update([data])
                            Msg.success('更新成功！')
                            view.reload()
                        }
                    })

                    const panel: ModalPanel = {
                        key: nanoid(),
                        content: <FormRecord {...binder} />
                    }
                    modal.push(panel)


                })
                .button('field', "删除字段", async () => {


                    const list = (await field.read()).list.filter(v => {
                        return v.source_table[0] === nodeData.table._ref_key_
                    })

                    const binder = fixReactive(new class extends FromRecordBinder {
                        currentEdit = {}
                        required: string[] = ['field_name']
                        constructor() {
                            super({
                                table_name: 'remove',
                                repeat_deal_type: DataRepeatDealType.Update,
                                fields: [{
                                    field_name: 'field_name',
                                    is_key: true,
                                    type: DataFieldType.String
                                }]
                            })
                        }
                        textEnum: { [key: string]: string[]; } = {
                            'field_name': list.map(v => v.field_name)
                        }
                        close() {
                            modal.remove(panel.key)
                        }
                        async submit(data) {
                            const { field_name } = data
                            const record = list.find(v => v.field_name === field_name)
                            if (record) {
                                await field.delete([record._ref_key_])
                            }
                            view.reload()
                            // super.submit(data)
                            // await field.update([data])
                            // Msg.success('更新成功！')
                            // view.reload()


                        }
                    })

                    const panel: ModalPanel = {
                        key: nanoid(),
                        content: <FormRecord {...binder} />
                    }
                    modal.push(panel)


                })
                .build()
            contextMenu.open(menu, e)
        })
        container.style.height = '100%'
        container.style.width = '100%'

        this.initNodes()
        return graph
    }


    async initNodes() {
        const entities = this.state.entities()
        this.graph?.clearCells()
        this.graph?.addNodes(entities.map(e => e.x6Data()))
    }

    async reload() {
        await this.state.reload()
        this.initNodes()
    }

    private renderCache: Map<string, X6EntityData['render']> = new Map()
    private renderTimeout: any
    private updateRender(data: X6EntityData['render']) {
        if (typeof data.source_table[0] !== 'string') {
            return
        }
        this.renderCache.set(data.source_table[0], data)
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout)
        }
        this.renderTimeout = setTimeout(() => {
            this.renderTimeout = null
            const todo = [...this.renderCache.values()]
            this.renderCache = new Map()
            this.render.update(todo)
        }, 200)
    }
}


