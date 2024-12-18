import { SqliteDataType, TableInfo } from "@common/sql";
import { ipcRenderer } from "electron"
import { RawData } from "src/main/sqlite/erd";

export const sqliteApi = {

    getRawData: async (url: string) => {
        return ipcRenderer.invoke('@sqlite/erd/rawData', url) as Promise<RawData>
    },

    sqlSelectAll: async (url: string, sql: string) => {
        return ipcRenderer.invoke('@sqlite/sql/selectAll', url, sql) as Promise<any[]>
    },

    sqlSelectAlltoFile: async (url: string, sql: string) => {
        return ipcRenderer.invoke('@sqlite/sql/selectAlltoFile', url, sql) as Promise<any[]>
    },

    sqlRun: async (url: string, sql: string, params?: any[]) => {
        return ipcRenderer.invoke('@sqlite/sql/run', url, sql, params) as Promise<any[]>
    },

    sqlRunList: async (url: string, sqls: string[], params?: any[][]) => {
        return ipcRenderer.invoke('@sqlite/sql/runList', url, sqls, params) as Promise<any[]>
    },
    getAllTables: async (url: string) => {
        return ipcRenderer.invoke('@sqlite/table/all', url) as Promise<TableInfo<SqliteDataType>[]>
    },

    getTableInfo: async (url: string, name: string) => {
        return ipcRenderer.invoke('@sqlite/table/info', url, name) as Promise<TableInfo<SqliteDataType> | null>
    },
}