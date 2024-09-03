import { ipcRenderer } from "electron"

export const jsonDataApi = {
    getData: async (receiveId: string, clear: boolean = false) => {
        return ipcRenderer.invoke('@json-data/store/data', receiveId, clear) as Promise<any>
    },
    onDataLoaded: (event: (e: Electron.IpcRendererEvent, receiveId: string) => void) => {
        const listenerKey: string = Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7)
        evDataLoaded.set(listenerKey, event)
        return listenerKey
    },
    offDataLoaded: (listenerKey: string) => {
        evDataLoaded.delete(listenerKey)
    }
}

const evDataLoaded = new Map<string, (e: Electron.IpcRendererEvent, receiveId: string) => void>()

ipcRenderer.on('@json-data/data/done', (e, receiveId: string) => {
    console.log(evDataLoaded, evDataLoaded.size)
    evDataLoaded.forEach((ev) => { ev(e, receiveId) })
})


jsonDataApi.onDataLoaded(async (_: any, receiveId: any) => {
    console.log('Data loaded', receiveId)
    console.log('Data Content', await jsonDataApi.getData(receiveId, false))
})