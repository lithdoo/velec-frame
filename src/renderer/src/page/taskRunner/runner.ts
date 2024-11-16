import { initBlankRunnerTaskConfig, JsonDataRunnerStep, NodeJsRunnerStep, RunnerTaskConfig, RunnerTaskStep, ScopeDataRunnerStep, SqliteRunnerStep } from "@common/runnerExt";
import { fixReactive } from "@renderer/fix";
import { nanoid } from "nanoid";


export enum RunnerStepType {
    Sqlite = 'sqlite-runner',
    Json = 'json-data-runner',
    Scope = 'scope-data-runner',
    NodeJs = 'node-js-runner',
}


export class RunnnerModel {

    static async read(fileUrl: string) {
        const runner = new RunnnerModel(fileUrl)
        const data = await window.explorerApi.readJson(fileUrl)
        if (data) {
            const { config, comments } = data
            runner.config = config
            runner.comments = comments
            if(!runner.config.flows) runner.config.flows = []
        }
        return fixReactive(runner)
    }


    fileUrl: string = ''
    config: RunnerTaskConfig = initBlankRunnerTaskConfig()
    comments: { [key: string]: string } = {}


    constructor(fileUrl: string) {
        this.fileUrl = fileUrl
    }

    async save() {
        const { config, comments } = this
        const text = JSON.stringify({ config, comments })

        await window.explorerApi.saveJson(this.fileUrl, JSON.parse(text))
    }


    private insertAfter(step: RunnerTaskStep<unknown>, place?: RunnerTaskStep<unknown>) {
        const isExist = !!this.config.outputs.find(v => v === step.output)

        if (isExist) throw new Error('step is exist')

        if (!place) {
            this.config.outputs = this.config.outputs.concat([step.output])
            this.config.steps = [step, ...this.config.steps]
            return
        }

        const target = this.config.steps.find(v => v.output === place.output)
        if (!target) return
        this.config.outputs = this.config.outputs.concat([step.output])

        this.config.steps = this.config.steps.flatMap(val => {
            return val.output === place.output ? [val, place] : [val]
        })
    }


    createBlankStep(
        type: RunnerStepType,
        place?: RunnerTaskStep<unknown>
    ) {
        let step: null | RunnerTaskStep<unknown> = null

        if (type === RunnerStepType.Sqlite) {
            const s: SqliteRunnerStep = {
                output: nanoid(),
                worker: RunnerStepType.Sqlite,
                option: {
                    fileUrl: '',
                    sql: '',
                    useParams: false,
                    type: 'run'
                }
            }

            step = s
        }

        if (type === RunnerStepType.Json) {
            const s: JsonDataRunnerStep = {
                output: nanoid(),
                worker: RunnerStepType.Json,
                option: {
                    receiveId: nanoid(),
                    default: null
                }
            }

            step = s
        }

        if (type === RunnerStepType.Scope) {
            const s: ScopeDataRunnerStep = {
                output: nanoid(),
                worker: RunnerStepType.Scope,
                option: {
                    fields: [],
                }
            }

            step = s
        }

        if (type === RunnerStepType.NodeJs) {
            const s: NodeJsRunnerStep = {
                output: nanoid(),
                worker: RunnerStepType.NodeJs,
                option: {
                    code: '',
                    workdir: '',
                }
            }

            step = s
        }

        if (step) {
            this.insertAfter(step, place)
        }
    }

    createBlankFlow() {
        const id = nanoid()
        this.config.flows = [{ id }, ...(this.config.flows ?? [])]
        console.log('this.config.flows', this.config.flows)
    }

    removeStep(id: string) {
        const isExist = !!this.config.outputs.find(v => v === id)
        if (!isExist) return
        this.config.steps = this.config.steps.filter(v => v.output !== id)
        this.config.outputs = this.config.outputs.filter(v => v !== id)

    }

    removeFlow(id: string) {
        const isExist = !!this.config.flows.find(v => v.id === id)
        if (!isExist) return
        this.config.flows = this.config.flows.filter(v => v.id !== id)
    }

    setComment(key: string, value: string) {
        this.comments[key] = value
    }

    getComment(key: string) {
        return this.comments[key] ?? ''
    }

    run(flowId: string) {
        const flow = this.config.flows.find(v => v.id === flowId)
        if (!flow) throw new Error('flow not found')
        const config = JSON.parse(JSON.stringify(this.config))
        window.runerExtApi.runFlow(config, flowId)
    }
}