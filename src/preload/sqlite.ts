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
    },

    sqlSelectAll: async(url:string,sql:string)=>{
        return ipcRenderer.invoke('@sqlite/sql/selectAll',url,sql) as Promise<any[]>
    },

    sqlRun: async(url:string,sql:string)=>{
        return ipcRenderer.invoke('@sqlite/sql/run',url,sql) as Promise<any[]>
    },
}