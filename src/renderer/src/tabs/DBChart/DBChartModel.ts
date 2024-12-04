import { fixReactive } from "@renderer/fix";
import { ChartViewState } from "./ChartState";
import { DBChartService, DBService } from "./DBService";
import "./ChartRender"
import { ChartGraphView } from "./ChartView";

export class DBChartModel {
    static async create(dbUrl: string) {
        const service = new DBChartService(dbUrl);
        const state = new ChartViewState();
        await state.reload(service)
        const model = new DBChartModel(service, state);
        return fixReactive(model)
    }
    constructor(
        public readonly service: DBService,
        public readonly state: ChartViewState,
        public readonly view = new ChartGraphView(state)
    ) {

    }

    despose() {
        this.state.dispose()
        this.view.dispose()
    }
}