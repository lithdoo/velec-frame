
import { BrowserWindow, ipcMain } from "electron"

export class JsonDataService {
    static install() {
        ipcMain.handle('@json-data/store/data', async (_, receiveId: string, clear: boolean = true) => {
            return JsonDataStore.main.get(receiveId, clear)
        })
        ipcMain.handle('@json-data/store/save', async (_, receiveId: string, value: any = true) => {
            console.log(receiveId, value)
            return JsonDataStore.main.set(receiveId, value)
        })
    }
}

export class JsonDataStore {

    static main = new JsonDataStore()

    table: Map<string, any> = new Map()

    get(receiveId: string, clear: boolean) {
        console.log('json get', { receiveId, clear })
        const data = this.table.get(receiveId)
        if (clear) this.table.delete(receiveId)
        return data
    }

    set(receiveId: string, value: any) {
        console.log('json set', { receiveId, value })
        this.table.set(receiveId, value)
        this.broadcast(receiveId)
    }


    private broadcast(receiveId: string) {
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('@json-data/data/done', receiveId)
        })
    }
}

