export enum RunnerClientStatus {
    Free = 'Free',
    Procesing = 'Procesing',
    Offline = 'Offline'
}


export interface RunnerTaskConfig {
    outputs: string[];
    steps: RunnerTaskStep<unknown>[]
    flows: {
        id: string,
        entry?: FlowNode
    }[];
}

export interface RunnerTaskStep<Option> {
    output: string,
    worker: string;
    option: Option;
}

export interface SqliteRunnerStep extends RunnerTaskStep<{
    fileUrl: string,
    sql: string,
    useParams: boolean
    type: 'run' | 'query'
}> {
    worker: 'sqlite-runner'
}

export const isSqliteRunnerStep = (step: RunnerTaskStep<unknown>): step is SqliteRunnerStep => {
    return step.worker === 'sqlite-runner'
}

export interface JsonDataRunnerStep extends RunnerTaskStep<{
    receiveId: string,
    default: any,
}> {
    worker: 'json-data-runner'
}

export const isJsonDataRunnerStep = (step: RunnerTaskStep<unknown>): step is JsonDataRunnerStep => {
    return step.worker === 'json-data-runner'
}


export interface ScopeDataRunnerStep extends RunnerTaskStep<{
    fields: string[]
}> {
    worker: 'scope-data-runner'
}

export const isScopeDataRunnerStep = (step: RunnerTaskStep<unknown>): step is ScopeDataRunnerStep => {
    return step.worker === 'scope-data-runner'
}

export interface NodeJsRunnerStep extends RunnerTaskStep<{
    code: string,
    workdir: string
}> {
    worker: 'node-js-runner'
}

export const isNodeJsRunnerStep = (step: RunnerTaskStep<unknown>): step is NodeJsRunnerStep => {
    return step.worker === 'node-js-runner'
}

export const initBlankRunnerTaskConfig: () => RunnerTaskConfig = () => {
    return {
        outputs: [],
        steps: [],
        flows: []
    }
}


export interface FlowNode {
    id: string,
    flowId: string
    type: string
    children: FlowNode[]
}

export interface FlowStepNode extends FlowNode {
    type: 'step'
    stepId: string
}

export const isFlowStepNode = (node: FlowNode): node is FlowStepNode => {
    return node.type === 'step'
}

export interface FlowLinkNode extends FlowNode {
    type: 'flow'
    flowLinkId: string
}

export const isFlowLinkNode = (node: FlowNode): node is FlowLinkNode => {
    return node.type === 'flow'
}

export interface FlowStopNode extends FlowNode {
    type: 'stop'
}

export const isFlowStopNode = (node: FlowNode): node is FlowStopNode => {
    return node.type === 'stop'
}


export interface FlowLinearNode extends FlowNode {
    type: 'linear'
}


export const isFlowLinearNode = (node: FlowNode): node is FlowLinearNode => {
    return node.type === 'linear'
}
