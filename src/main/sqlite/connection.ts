import { fileURLToPath } from "node:url"
import { Database, verbose } from "sqlite3"

const sqlite3 = verbose()

interface SqlMethods {
    all: <T = any>(sql: string, params:any) => Promise<T[]>;
    run: (sql: string, params:any) => Promise<void>
}

export class SqliteConection {
    static connectionTimeout = 1000 * 60 * 10

    url: string
    path: string
    db: Database
    lastRequestTime: number
    requsetKey: Set<symbol> = new Set()
    onDestroy: () => void = () => { }

    constructor(url: string) {
        const path = fileURLToPath(url)
        this.url = url
        this.path = path
        this.db = new sqlite3.Database(this.path)
        this.db.on('error', (e) => { console.error(e) })
        this.lastRequestTime = new Date().getTime()
    }

    private get sql(): SqlMethods {
        const all = <T = any>(sql: string,params:any) => new Promise<T[]>((res, rej) => {
            console.log({sql,params})
            this.db.all<T>(sql,params, (error, rows) => {
                console.log({error})
                if (error) rej(error)
                else res(rows)
            })
        })

        const run = (sql: string,params:any) => new Promise<void>((res, rej) => {
            console.log({sql,params})
            this.db.run(sql,params, (error) => {
                console.log({error})
                if (error) rej(error)
                else res()
            })
        })

        return { all, run }
    }

    async requset<T>(fn: (sql: SqlMethods) => Promise<T>) {
        const key = Symbol()
        this.requsetKey.add(key)
        try {
            const res = await fn(this.sql)
            return res
        } catch (e) {
            throw e
        } finally {
            this.lastRequestTime = new Date().getTime()
            this.requsetKey.delete(key)
        }
    }

    destory() {
        try {
            this.db.close()
        } catch (e) {
            console.error(e)
        }
        this.onDestroy()
    }

    chechTimeout() {
        if (this.requsetKey.size) {
            return
        }

        if ((new Date().getTime() - this.lastRequestTime) < SqliteConection.connectionTimeout) {
            return
        }

        this.destory()
    }


    async runSelectAll(sql: string, params: any = undefined) {
        return this.requset(async () => {
            const res = await this.sql.all<any[]>(sql,params)
            return res
        })
    }

    async run(sql: string, params: any = undefined) {
        return this.requset(async () => {
            return await this.sql.run(sql,params)
        })
    }

    async query(sql: string , params: any = undefined) {
        return this.requset(async () => {
           return await this.sql.all(sql,params)
        })
    }

    async getAllTables() {
        return this.requset(async () => {
            const rowNameArr = await this.sql.all<{ name: string }>(`select name from sqlite_master where type = 'table' order by name;`,undefined)
            const rows = await Promise.all(rowNameArr.map(async ({ name }) => {
                const fields: {
                    cid: number
                    dflt_value: any
                    name: string
                    notnull: number
                    pk: number
                    type: string
                    label: string
                }[] = await this.sql.all(`pragma table_info(${name})`,undefined)
                return {
                    name, label: '', fieldList: fields.map(field => {
                        return {
                            name: field.name,
                            label: '',
                            type: field.type,     
                            primaryKey: !!field.pk,     
                            unique: false,
                            notNull: !!field.notnull,
                        }
                    })
                }
            }))
            return rows
        })
    }
    async getTableInfo(name: string) {
        return this.requset(async () => {
            const rowNameArr = await this.sql.all<{ name: string }>(`select name from sqlite_master where type = 'table' and name = '${name}'`,undefined)
            const rows = await Promise.all(rowNameArr.map(async ({ name }) => {
                const fields: {
                    cid: number
                    dflt_value: any
                    name: string
                    notnull: number
                    pk: number
                    type: string
                    label: string
                }[] = await this.sql.all(`pragma table_info(${name})`,undefined)
                return {
                    name, label: '', fieldList: fields.map(field => {
                        return {
                            name: field.name,
                            label: '',
                            type: field.type,     
                            primaryKey: !!field.pk,     
                            unique: false,
                            notNull: !!field.notnull,
                        }
                    })
                }
            }))
            return rows[0] ?? null
        })
    }
}

