import { debounce } from "@renderer/utils";
import { CommentStoreRecord, HiddenTable, RenderStoreRecord, RelationStoreRecord, SqliteTableInfo, DBChartService } from "./DBService";
import { nanoid } from 'nanoid'
import { ChartEntityNode } from "./ChartRender";
import { ChartControl } from "./ChartControl";

class ChartState {
    tables: SqliteTableInfo[] = [];
    [HiddenTable.Comment]: CommentStoreRecord[] = [];
    [HiddenTable.Render]: RenderStoreRecord[] = [];
    [HiddenTable.Relation]: RelationStoreRecord[] = [];


    constructor(public service: DBChartService) {
        this.service = service;
    }

    async reload(service: DBChartService) {
        await service.init();
        this.service = service;
        this.tables = await service.getAllTableInfo();
        this[HiddenTable.Comment] = await service.getCommentStore();
        this[HiddenTable.Relation] = await service.getRelatioStore();

        const initRender = async (time: number) => {

            if (time > 10) {
                throw new Error('init render error');
            }
            this[HiddenTable.Render] = await service.getRenderStore();

            const renderTableName = new Set(this[HiddenTable.Render].map(r => r.table_name));
            const unInitTables = this.tables.filter(t => !renderTableName.has(t.name));

            if (unInitTables.length) {
                const maxListIdx = this[HiddenTable.Render].reduce((res, cur) => res > cur.list_idx ? res : cur.list_idx, 0)

                const unInitRender: RenderStoreRecord[] = unInitTables.map(({ name, fieldList }, idx) => ({
                    table_name: name,
                    pos_left: 0,
                    pos_top: 0,
                    size_width: 300,
                    size_height: Math.min(ChartEntityNode.maxHeight(fieldList.length), 600),
                    color: `#66ccff`,
                    list_idx: maxListIdx + idx + 1,
                }))

                await service.updateRenderRecords(unInitRender)
                await initRender(time + 1)
            }
        }

        await initRender(0)
    }
}

export interface EntityData {
    id: string,
    viewId: string,
    render: RenderStoreRecord
    table: SqliteTableInfo
}

export class ChartViewState extends ChartState {
    static all: Map<string, ChartViewState> = new Map()
    static get(viewId: string) {
        const state = ChartViewState.all.get(viewId)
        if (state) return state
        else throw new Error("ChartViewState not found")
    }


    viewId: string = nanoid()
    nodeIds: string[] = []
    nodes: Map<string, EntityData> = new Map()


    constructor(service: DBChartService, public control: ChartControl) {
        super(service)
        ChartViewState.all.set(this.viewId, this)
    }

    getEntity(id: string) {
        return this.nodes.get(id)
    }

    async reload(service: DBChartService) {
        await super.reload(service)
        this.nodeIds = this.tables.map(({ name }) => name)
        const tableMap = new Map(this.tables.map((table) => [table.name, table]))
        const renderMap = new Map(this[HiddenTable.Render].map((record) => [record.table_name, record]))
        this.nodes = this.nodeIds.reduce((res, id) => {
            const table = tableMap.get(id)
            const render = renderMap.get(id)
            const viewId = this.viewId
            if (table && render) {
                res.set(id, { id, viewId, table, render: render })
            }
            return res
        }, new Map<string, EntityData>())
    }

    updateNodePos(id: string, x: number, y: number) {
        const node = this.getEntity(id)
        if (node) {
            node.render.pos_left = x
            node.render.pos_top = y
            debounce(`ChartViewState/updateNodePos:${id}`, () => {
                this.service?.updateEntityPos(id, x, y)
            })
        }
    }

    async clearAll() {
        if (!this.service) return
        await this.service.clearData()
        await this.reload(this.service)
    }


    getAllEntities() {
        return Array.from(this.nodes.values())
    }

    dispose() {
        ChartViewState.all.delete(this.viewId)
    }
}

