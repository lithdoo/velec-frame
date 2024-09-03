import { fileURLToPath } from "node:url"
import { Database, verbose } from "sqlite3"

const sqlite3 = verbose()

interface SqlMethods {
    all: <T = any>(sql: string) => Promise<T[]>;
    run: (sql: string) => Promise<void>
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
        const all = <T = any>(sql: string) => new Promise<T[]>((res, rej) => {
            this.db.all<T>(sql, (error, rows) => {
                if (error) rej(error)
                else res(rows)
            })
        })

        const run = (sql: string) => new Promise<void>((res, rej) => {
            this.db.run(sql, (error) => {
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


    async runSelectAll(sql: string) {
        return this.requset(async () => {
            const res = await this.sql.all<any[]>(sql)
            return res
        })
    }

    async run(sql: string) {
        return this.requset(async () => {
            return await this.sql.run(sql)
        })
    }

    async query(sql: string) {
        return this.requset(async () => {
           return await this.sql.all(sql)
        })
    }

    async getAllTables() {
        return this.requset(async () => {
            const rowNameArr = await this.sql.all<{ name: string }>(`select name from sqlite_master where type = 'table' order by name;`)
            const rows = await Promise.all(rowNameArr.map(async ({ name }) => {
                const fields: {
                    cid: number
                    dflt_value: any
                    name: string
                    notnull: number
                    pk: number
                    type: string
                    label: string
                }[] = await this.sql.all(`pragma table_info(${name})`)
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
            const rowNameArr = await this.sql.all<{ name: string }>(`select name from sqlite_master where type = 'table' and name = '${name}'`)
            const rows = await Promise.all(rowNameArr.map(async ({ name }) => {
                const fields: {
                    cid: number
                    dflt_value: any
                    name: string
                    notnull: number
                    pk: number
                    type: string
                    label: string
                }[] = await this.sql.all(`pragma table_info(${name})`)
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

