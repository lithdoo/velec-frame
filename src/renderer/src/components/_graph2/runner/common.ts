import { RunnerTaskStep } from "@common/runnerExt"
import { initNodeViewData, NodeData, toX6Node } from "../base/cell"
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

export type CheckNodeData<T extends NodeData<string, any> = NodeData<string, any>> = Partial<T> & {
    view: T['view'],
    id: T['id'],
    _viewId: T['_viewId'],
    meta: T['meta']
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

    static checkNodeData<T extends NodeData<string, any>>(node: CheckNodeData<T>) {
        Object.assign(node.view, initNodeViewData(node.view))
        node._x6 = toX6Node(node.view, node._x6 ?? {})
        return node as T
    }

    protected checkNodeData<T extends NodeData<string, any>>(node: CheckNodeData<T>) {
        Object.assign(node.view, initNodeViewData(node.view))
        node._x6 = toX6Node(node.view, node._x6 ?? {})
        return node as T
    }

    generateRunnerStep(node: AllNodeData, inputs: { edge: AllEdgeData, node: AllNodeData }[]): RunnerTaskStep<unknown> | null {
        return null
    }
}