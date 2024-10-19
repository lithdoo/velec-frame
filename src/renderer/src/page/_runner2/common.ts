import { RunnerTaskStep } from "@common/runnerExt"
import { EdgeData, NodeData, StateExtend } from "@renderer/mods/graph"



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
    StateNodeData extends NodeData = NodeData,
    StateEdgeData extends EdgeData = EdgeData,
    Upper extends { [key: string]: RunnerStateExtend<any> } = {},
    File = any
> extends StateExtend<
    StateNodeData,
    StateEdgeData,
    null,
    Upper,
    File
> {
    generateRunnerStep(_node: NodeData, _inputs: { edge: EdgeData, node: NodeData }[])
        : RunnerTaskStep<unknown> | null {
        return null
    }
}