import { RunnerClientStatus } from "@common/runner"
import { ipcRenderer } from "electron"

export const runnerApi = {
    clientStatus: async (clientId: string) => {
        return ipcRenderer.invoke('@runner/client/status', clientId) as Promise<RunnerClientStatus>
    },
    createClient: async () => {
        return ipcRenderer.invoke('@runner/client/create') as Promise<string>
    },
    disposeClient: async (clientId: string) => {
        return ipcRenderer.invoke('@runner/client/dispose', clientId) as Promise<void>
    }
}