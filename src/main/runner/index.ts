import { RunnerClientStatus, RunnerTaskConfig } from "@common/runner"
import { ipcMain } from "electron"
import { uuid } from "uuidv4"
import { RunnerWorker } from "./common"
import { SqliteRunnerWorker } from "./worker/sqlite"
import { JsonDataRunnerWorker } from "./worker/jsonData"

export class RunnerService {
    static install() {
        ipcMain.handle('@runner/client/status', async (_, clientId: string) => {
            return RunnerClient.status(clientId)
        })

        ipcMain.handle('@runner/client/create', async (_) => {
            return new RunnerClient().id
        })

        ipcMain.handle('@runner/client/dispose', async (_, clientId: string) => {
            return RunnerClient.dispose(clientId)
        })

        ipcMain.handle('@runner/client/run', async (_, clientId: string, config: RunnerTaskConfig) => {
            return RunnerClient.run(clientId, config)
        })
    }
}



export class RunnerClient {
    static all: Map<string, RunnerClient> = new Map()

    static workers: RunnerWorker<unknown>[] = [
        new SqliteRunnerWorker(),
        new JsonDataRunnerWorker()
    ]

    static checkTimeout() {
        Array.from(this.all.values()).forEach(v => v.chechTimeout())
        setTimeout(() => RunnerClient.checkTimeout(), 1000 * 60 * 2)
    }

    static {
        RunnerClient.checkTimeout()
    }

    static run(clientId: string, config: RunnerTaskConfig) {
        const client = this.all.get(clientId)
        if (!client) return
        const status = client.status()
        if (status !== RunnerClientStatus.Free) return
        client.run(config)
    }

    static status(clientId: string) {
        const client = this.all.get(clientId)
        if (client) {
            return client.status()
        } else {
            return RunnerClientStatus.Offline
        }
    }

    static dispose(clientId: string) {
        const client = this.all.get(clientId)
        if (client) {
            return client.dispose()
        }
    }

    static timeout = 1000 * 60 * 10
    private lastRequestTime: number = new Date().getTime()
    private updateRequestTime() { this.lastRequestTime = new Date().getTime() }

    readonly id = uuid()

    current: RunnerTask | null = null

    constructor() {
        RunnerClient.all.set(this.id, this)
    }


    run(config: RunnerTaskConfig) {
        if (this.current) return
        this.current = new RunnerTask(config, RunnerClient.workers, () => {
            this.current = null
        })
    }


    dispose() {
        this.stopTask()
    }

    stopTask() {
        if (this.current) {
            this.current.stop()
            this.current = null
        }
    }

    status() {
        this.updateRequestTime()
        if (this.current) {
            return RunnerClientStatus.Procesing
        } else {
            return RunnerClientStatus.Free
        }
    }

    chechTimeout() {
        if (this.current) {
            return
        }

        if ((new Date().getTime() - this.lastRequestTime) < RunnerClient.timeout) {
            return
        }

        this.dispose()
    }
}


export class RunnerTask {
    readonly config: RunnerTaskConfig
    readonly workers: Map<string, RunnerWorker<unknown>> = new Map()
    constructor(
        config: RunnerTaskConfig,
        workers: RunnerWorker<unknown>[],
        onfinish: () => void
    ) {
        this.config = config
        this.workers = new Map(workers.map(w => [w.keyName, w]))
        
        this.next([]).finally(()=>{
            onfinish()
        })
    }
    private current: number = -1
    private working: boolean = true

    async next(argus: any[]) {
        console.log('next', this.current, argus)
        if (!this.working) {
            return null
        }
        this.current++
        const step = this.config.steps[this.current]
        if (!step) {
            return null
        }
        const worker = this.workers.get(step.worker)
        if (!worker) {
            return null
        }

        const { process } = worker.run(step.option, argus)

        try {
            const { result } = await process
            return this.next([result])
        } catch (e) {
            return null
        }
    }

    stop() {
        this.working = false
    }
}