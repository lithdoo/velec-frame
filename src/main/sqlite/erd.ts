import { SqliteConection } from "./connection";

type RawTable = {
    name: string;
    originalKey: string;
    label: string;
    fieldList: {
        name: string;
        originalKey: string;
        label: string;
        type: string;                // 类型
        foreignKey: boolean        // 是否外键
        primaryKey: boolean        // 是否主键
        unique: boolean;
        notNull: boolean;
    }[],
}

type RawForeignKey = {
    originalKey: string;
    fromTableKey: string,
    toTableKey: string,
    fromTableName: string,
    toTableName: string,

    targetNodeRelation: null,
    sourceNodeRelation: null,

    fields: {
        from: string,
        to: string,
        seq: number
    }[]
}

// type ArrayItem<T extends any[],> = T extends (infer S)[] ? S : never


export type RawData = {
    tables: RawTable[],
    fkeys: RawForeignKey[],
}

export const getRawData = async (connect: SqliteConection) => {
    const allTables = await connect.requset(async (sql) => {
        const rowNameArr = await sql.all<{ name: string }>(`select name from sqlite_master where type = 'table' order by name;`)
        const rows = await Promise.all(rowNameArr.map(async ({ name }) => {
            const fields: {
                cid: number
                dflt_value: any
                name: string
                notnull: number
                pk: number
                type: string
            }[] = await sql.all(`pragma table_info(${name})`)
            const foreignKeys: {
                from: string
                to: string
                table: string
                id: string
                // match: "NONE"
                // on_delete: "NO ACTION"
                // on_update: "NO ACTION"
                seq: 0
            }[] = await sql.all(`pragma foreign_key_list(${name})`)

            return { name, fields, foreignKeys }
        }))
        return rows
    })


    const tables = allTables.map(table => {
        const rawTable: RawTable = {
            name: table.name,
            originalKey: table.name,
            label: '',
            fieldList: table.fields.map(field => ({
                name: field.name,
                originalKey: field.cid.toString(),
                label: '',
                type: field.type,                // 类型
                foreignKey: false,        // 是否外键
                primaryKey: !!field.pk,        // 是否主键
                notNull: !!field.notnull,
                unique: false,
            }))
        }
        return rawTable
    })

    const fkMap = new Map<string, RawForeignKey>()

    allTables.forEach(table => {
        table.foreignKeys.forEach(fk => {
            const fromTableName = table.name
            const toTableName = fk.table

            const fromField = fk.from
            const toField = fk.to
            const seq = fk.seq

            const originalKey = `${fk.id}/${fromTableName}/${toTableName}`

            const old = fkMap.get(originalKey)

            if (old) {
                old.fields.push({
                    from: fromField,
                    to: toField,
                    seq
                })
            } else {
                const fk = {
                    originalKey,
                    fromTableKey: fromTableName,
                    toTableKey: toTableName,
                    fromTableName,
                    toTableName,

                    targetNodeRelation: null,
                    sourceNodeRelation: null,

                    fields: [{
                        from: fromField,
                        to: toField,
                        seq,
                    }]
                }

                fkMap.set(originalKey, fk)
            }

        })

    })

    const fkeys = Array.from(fkMap.values())

    return { tables, fkeys }
}
