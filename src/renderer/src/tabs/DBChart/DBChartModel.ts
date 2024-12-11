import { fixReactive } from "@renderer/fix";
import { ChartViewState } from "./ChartState";
import { DBChartService } from "./DBService";
import "./ChartRender"
import { ChartGraphView } from "./ChartView";

export class DBChartModel {
    static async create(dbUrl: string) {
        const service = new DBChartService(dbUrl);
        const state = new ChartViewState(service);
        const model = new DBChartModel(service, state);
        return fixReactive(model)
    }
    constructor(
        public readonly service: DBChartService,
        public readonly state: ChartViewState,
        public readonly view = new ChartGraphView(state)
    ) {

    }

    async reload() {
        await this.state.reload(this.service)
    }

    async clearCache() {
        await this.state.clearAll()
        await this.view.refresh()
    }

    async sortTable(list: { table: string, idx: number }[]) {
        await this.service.sortTable(list)
        await this.reload()
        // await this.view.refresh()
    }

    despose() {
        this.state.dispose()
        this.view.dispose()
    }
}