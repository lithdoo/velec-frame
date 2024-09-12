import { StateExtend } from "../base/state"
import type { AllEdgeData, AllNodeData } from "./states"

export enum NodeShapeKey {
    GH_RUNNER_SQL_NODE = 'GH_RUNNER_SQL_NODE',
    GH_RUNNER_JSON_NODE = 'GH_RUNNER_JSON_NODE',
    GH_RUNNER_SCOPE_NODE = 'GH_RUNNER_SCOPE_NODE',
    GH_RUNNER_FLOW_NODE = 'GH_RUNNER_FLOW_NODE',
}
export enum EdgeShapeKey {
    GH_RUNNER_FLOW_EDGE = 'GH_RUNNER_FLOW_EDGE',
}
export enum RunnerStateKey {
    SQL = "GH_RUNNER_STATE_SQL",
    JSON = "GH_RUNNER_STATE_JSON",
    FLOW = "GH_RUNNER_STATE_FLOW",
    SCOPE = "GH_RUNNER_STATE_SCOPE"
}

export abstract class RunnerStateExtend<
    Upper extends { [key: string]: RunnerStateExtend<any> },
    File = any
> extends StateExtend<
    RunnerStateKey,
    AllNodeData,
    AllEdgeData,
    null,
    Upper,
    File
> {

}