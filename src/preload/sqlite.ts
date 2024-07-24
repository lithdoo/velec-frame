import { ipcRenderer } from "electron"
import { RawData } from "src/main/sqlite/erd";

export const sqliteApi = {
    getAllTable: async (url: string) => {
        return ipcRenderer.invoke('@sqlite/table/all', url) as Promise<{
            name: string;
            fields: any[];
            foreignKeys: any[]
        }[]>
    },

    getRawData: async (url:string)=>{
        return ipcRenderer.invoke('@sqlite/erd/rawData', url) as Promise<RawData>
    }
}