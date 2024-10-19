import { StateExtend } from "../common";
import { AllEdgeData, AllNodeData, RunnerStateKey } from "./state";

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
> { }

export class BaseState extends RunnerStateExtend<{}, {
    nodes: AllNodeData[],
    edges: AllEdgeData[],
}> {
    readonly key = RunnerStateKey.SQL

    nodes: AllNodeData[] = []
    edges: AllEdgeData[] = []

    save() {
        const { nodes, edges } = this
        return { nodes, edges }
    }

    load(cache: { nodes: AllNodeData[]; edges: AllEdgeData[]; } | null) {
        if (cache) {
            this.nodes = cache.nodes
            this.edges = cache.edges
        }
    }
    setNodeSize(){}
}
