import { FlowNode, FlowStepNode, isFlowLinearNode, isFlowLinkNode, isFlowStepNode, isFlowStopNode, isJsonDataRunnerStep, isNodeJsRunnerStep, isSqliteRunnerStep, RunnerTaskConfig, RunnerTaskStep } from "@common/runnerExt"
import { NodejsRunner } from "./steps/nodejs"
import { ipcMain } from "electron"
import { JsonDataRunner } from "./steps/base"
import { SqliteRunner } from "./steps/sqlite"



export const center = new class RunnerExtCenter {
}


enum RunnerExtTaskStatus {
    // 任务开始
    Created = 'Created',
    // 任务结束
    Started = 'Started',
    // 任务暂停
    Pause = 'Pause',
    // 任务继续
    Done = 'Done',
    // 任务取消
    Canceled = 'Canceled',
    // 任务失败
    Failed = 'Failed',
}



export class RunnerExtTask {

    store: Map<string, unknown> = new Map()
    status: RunnerExtTaskStatus = RunnerExtTaskStatus.Created


    flowMap: Map<string, { id: string, entry?: FlowNode }> = new Map()
    flowNodeMap: Map<string, FlowNode> = new Map()
    stepNodeMap: Map<string, RunnerTaskStep<unknown>> = new Map()


    stack: {
        flowId: string,
        todoList: { nodeId: string, input: string }[]
    }[] = []

    constructor(
        public config: RunnerTaskConfig,
        public startFlowId: string,
    ) {
        const appendFlowNode = (flowNode: FlowNode) => {
            this.flowNodeMap.set(flowNode.id, flowNode)
            flowNode.children.forEach(appendFlowNode)
        }

        this.config.steps.forEach(step => {
            this.stepNodeMap.set(step.output, step)
        })

        this.config.flows.forEach(flow => {
            this.flowMap.set(flow.id, flow)
            if (flow.entry) {
                appendFlowNode(flow.entry)
            }
        })



    }

    start() {
        if (this.status !== RunnerExtTaskStatus.Created) {
            throw new Error('任务状态异常')
        }

        const flow = this.config.flows.find(f => f.id === this.startFlowId)

        if (!flow) {
            throw new Error('找不到对应的流程')
        }

        this.stack = [{
            flowId: flow.id,
            todoList: flow.entry ? [{
                nodeId: flow.entry.id,
                input: ''
            }] : []
        }]

        this.nextStep()
    }

    private async nextStep() {
        const closeCurrentFlow = () => {
            const [_, ...stack] = this.stack
            this.stack = stack
        }

        const done = () => {
            this.status = RunnerExtTaskStatus.Done
        }



        const flow = this.stack[0]

        if (!flow) { return done() }


        const nextChild = (node: FlowNode) => {
            if (node.children && node.children[0]) {
                flow.todoList = [{
                    nodeId: node.children[0].id,
                    input: node.id
                }].concat(flow.todoList)
            }
        }

        const { todoList: todoNodeIds } = flow

        if (!todoNodeIds.length) {
            closeCurrentFlow()
            return this.nextStep()
        }
        const [current, ...nextTodoNodeIds] = todoNodeIds
        const node = this.flowNodeMap.get(current.nodeId)
        flow.todoList = nextTodoNodeIds

        if (!node) {
            throw new Error('找不到对应的流程节点')
        }
        const value = this.store.get(current.input)

        if (isFlowStopNode(node)) {
            this.store.set(node.id, value)
            if (!this.store.get(node.id)) {
                closeCurrentFlow()
            } else {
                nextChild(node)
            }

        } else if (isFlowLinkNode(node)) {
            this.store.set(node.id, value)
            const { flowLinkId } = node
            const nextFlow = this.flowMap.get(flowLinkId)
            if (!nextFlow) {
                throw new Error('找不到对应的流程')
            }
            this.stack = [{
                flowId: nextFlow.id,
                todoList: nextFlow.entry ? [{
                    nodeId: nextFlow.entry.id,
                    input: node.id
                }] : []
            }].concat(this.stack)
        } else if (isFlowLinearNode(node)) {
            this.store.set(node.id, value)
            flow.todoList = node.children.map((child) => {
                return {
                    nodeId: child.id,
                    input: node.id
                }
            }).concat(flow.todoList)
        } else if (isFlowStepNode(node)) {
            const currentVal = await this.runStep(node, value)
            this.store.set(node.id, currentVal)
            nextChild(node)
        }

        return this.nextStep()
    }


    private async runStep(node: FlowStepNode, value: unknown) {
        const step = this.config.steps.find(s => s.output === node.stepId)
        if (!step) {
            throw new Error('找不到对应的步骤')
        }

        if (isNodeJsRunnerStep(step)) {
            return await new NodejsRunner(this, step, [value]).run()
        }

        if (isJsonDataRunnerStep(step)) {
            return await new JsonDataRunner(this, step, [value]).run()
        }

        if (isSqliteRunnerStep(step)) {
            return await new SqliteRunner(this, step, [value]).run()
        }

        throw new Error('不支持的步骤类型')
    }
}





export class RunnerExtService {
    static install() {
        ipcMain.handle('@runnerExt/config/run', async (_, config: RunnerTaskConfig, startFlowId) => {
            new RunnerExtTask(config, startFlowId).start()
        })
    }
}

