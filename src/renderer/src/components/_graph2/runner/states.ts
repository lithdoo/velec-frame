import { RunnerTaskStep } from "@common/runnerExt"
import { GraphStateCenter } from "../base/state"
import { RunnerStateExtend, RunnerStateKey } from "./common"
import { FlowEdgeData, FlowNodeData } from "./flow/cell"
import { RunnerFlowState } from "./flow/state"
import { JsonNodeData } from "./json/cell"
import { RunnerJsonState } from "./json/state"
import { ScopeNodeData } from "./scope/cell"
import { RunnerScopeState } from "./scope/state"
import { SqlNodeData } from "./sql/cell"
import { RunnerSqlState } from "./sql/state"

export type AllNodeData = JsonNodeData | SqlNodeData | FlowNodeData | ScopeNodeData
export type AllEdgeData = FlowEdgeData



export class RunnerGraphStateCenter<S extends { [key: string]: RunnerStateExtend<any, any> }> extends GraphStateCenter<RunnerStateKey,
    AllNodeData,
    AllEdgeData, RunnerStateExtend<any, any>, S> {

    static create(viewId: string) {
        return new RunnerGraphStateCenter(viewId, {}, [])
            .extends({ sql: new RunnerSqlState() })
            .extends({ json: new RunnerJsonState() })
            .extends({ flow: new RunnerFlowState() })
            .extends({ scope: new RunnerScopeState() })
            .init()
    }

    extends<T extends {
        [key: string]: RunnerStateExtend<any, any>
    }>(states: T)
        : RunnerGraphStateCenter<S & T> {

        return new RunnerGraphStateCenter(
            this.viewId,
            { ...this.states, ...states },
            this.list.concat(Array.from(Object.values(states)))
        )
    }
    getEdges() {
        const edges = super.getEdges()
        return edges
    }

    updateNode(id: string, node?: AllNodeData) {
        this.list.forEach(state => {
            state.updateNode(id, node)
        })
    }

    setNodeSize(id: string, size: { height: number, width: number }) {
        this.list.forEach(v => v.setNodeSize?.(id, size))
    }

    generateRunnerStep(node: AllNodeData, inputs: { edge: AllEdgeData, node: AllNodeData }[]): RunnerTaskStep<unknown> | null {
        let result: RunnerTaskStep<unknown> | null = null
        for (const state of this.list) {
            result = state.generateRunnerStep(node, inputs)
            if (result) { break }
        }
        return result
    }
}



