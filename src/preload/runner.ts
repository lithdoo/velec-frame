import { RunnerClientStatus, RunnerTaskConfig } from "@common/runnerExt"
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
    },

    runFlow: async (clientId: string, config: RunnerTaskConfig) => {
        return ipcRenderer.invoke('@runner/client/run', clientId, config) as Promise<void>
    }
}

export const runerExtApi = {
    runFlow: async (config: RunnerTaskConfig, flowId: string) => {
        return ipcRenderer.invoke('@runnerExt/config/run', config, flowId) as Promise<void>
    }
}