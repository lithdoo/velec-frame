import { EdgeData, NodeData, StateExtend } from "@renderer/mods/graph";
import { RunnerScript } from "../script";

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

    getScript() {
        const res = RunnerScript.finder.get(this.viewId)
        if (!res) throw new Error('script is not found!!!')
        return res
    }

    abstract readFromScript(): void

    // generateRunnerStep(_node: NodeData, _inputs: { edge: EdgeData, node: NodeData }[])
    //     : RunnerTaskStep<unknown> | null {
    //     return null
    // }
}