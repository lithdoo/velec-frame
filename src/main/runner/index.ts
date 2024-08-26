import { RunnerClientStatus } from "@common/runner"
import { ipcMain } from "electron"
import { uuid } from "uuidv4"

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
    }
}


class RunnerClient {
    static all: Map<string, RunnerClient> = new Map()

    static checkTimeout() {
        Array.from(this.all.values()).forEach(v => v.chechTimeout())
        setTimeout(() => RunnerClient.checkTimeout(), 1000 * 60 * 2)
    }

    static {
        RunnerClient.checkTimeout()
    }

    static status(clientId: string) {
        const client = this.all.get(clientId)
        if (client) {
            return client.status()
        } else {
            return RunnerClientStatus.Disposed
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

    current: any = null
    tasks: any[] = []

    constructor() {
        RunnerClient.all.set(this.id, this)
    }


    dispose() {

    }

    status() {
        this.updateRequestTime()
        if (this.current || this.tasks.length) {
            return RunnerClientStatus.Procesing
        } else {
            return RunnerClientStatus.Free
        }
    }



    chechTimeout() {
        if (this.current || this.tasks.length) {
            return
        }

        if ((new Date().getTime() - this.lastRequestTime) < RunnerClient.timeout) {
            return
        }

        this.dispose()
    }
}