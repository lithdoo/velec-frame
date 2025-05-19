import { DataFieldType, DataRecord, DataRepeatDealType, FieldInfo, MutDBCRecord, RecordValueType, TableInfo, TableRecord } from "./struc"

export abstract class JsonTableController<T extends TableInfo> {

    abstract info: T
    constructor(public file: FileControl) { }
    get filePath() { return this.info.table_name + '.json' }

    async read() {
        if (!await this.file.existFile(this.filePath)) {
            this.file.createFile(this.filePath, "[]")
            return new MutDBCRecordData<TableRecord<T>>(this.info, [])
        } else {
            const data = await this.file.readFile(this.filePath)
            return new MutDBCRecordData<TableRecord<T>>(this.info, JSON.parse(data))
        }
    }

    async update(records: TableRecord<T>[]) {

        const checked = MutDBCRecordValue.pre(this.info.fields, records)
        const data = await this.read()
        const table = data.table()
        const keyFields = this.info.fields.filter(v => v.is_key)

        checked.forEach(record => {
            const repeat = data.list.find(v => {
                const notEqualField = keyFields.find(({ field_name }) => {
                    return !MutDBCRecordValue.equal(record[field_name], v[field_name])
                })
                return !notEqualField
            })

            const same = table.get(record._ref_key_)

            if (!repeat) {
                table.set(record._ref_key_, record)
            } else {
                if (same && same._ref_key_ === repeat._ref_key_) {
                    table.set(record._ref_key_, record)
                } else if (this.info.repeat_deal_type === DataRepeatDealType.Error) {
                    throw new Error('repeat!!!!')
                } else if (this.info.repeat_deal_type === DataRepeatDealType.Update) {
                    table.set(repeat._ref_key_, {
                        ...record,
                        _ref_key_: repeat._ref_key_
                    })
                    if (same && (same._ref_key_ !== repeat._ref_key_)) {
                        table.delete(same._ref_key_)
                    }
                }
            }
        })

        const newList = [...table.values()]

        await this.file.writeFile(this.filePath, JSON.stringify(newList, null, 2))
    }

    async delete(keys: string[]) {
        const data = await this.read()
        const keySet = new Set(keys)
        const newList = data.list.filter(v=>!keySet.has(v._ref_key_))
        await this.file.writeFile(this.filePath, JSON.stringify(newList, null, 2))
    }
}


export class MutDBCRecordValue {
    static equal(a: RecordValueType, b: RecordValueType) {
        if (typeof a !== typeof b) return false
        if (typeof a === 'object') return a[0] === b[0]
        return a === b
    }
    static pre(fields: FieldInfo[], rawData: any[]) {
        return rawData
            .filter(v => !!v)
            .filter(v => typeof v['_ref_key_'] === 'string')
            .map(v => {
                return fields.reduce((res, { field_name, type }) => {
                    if (type === DataFieldType.Boolean) {
                        res[field_name] = typeof v[field_name] === 'boolean'
                            ? v[field_name]
                            : false
                    }
                    if (type === DataFieldType.Number) {
                        res[field_name] = typeof v[field_name] === 'number'
                            ? v[field_name]
                            : 0
                    }
                    if (type === DataFieldType.String) {
                        res[field_name] = typeof v[field_name] === 'string'
                            ? v[field_name]
                            : ''
                    }
                    if (type === DataFieldType.RefId) {
                        res[field_name] = v[field_name] instanceof Array
                            ? v[field_name]
                            : []
                    }
                    return res
                }, { ['_ref_key_']: v['_ref_key_'] } as any)
            })
    }

}

export class MutDBCRecordData<T extends DataRecord> implements MutDBCRecord<T> {

    list: T[]

    constructor(
        public readonly table_info: TableInfo,
        public rawData: any[],
    ) {
        const fields = this.table_info.fields
        this.list = MutDBCRecordValue.pre(fields, rawData)
    }

    table() {
        return this.list.reduce((res, current) => {
            res.set(current._ref_key_, current)
            return res
        }, new Map() as Map<string, T>)
    }
}

export interface FileControl {
    existFile(file: string): Promise<boolean>,
    createFile(file: string, content: string): Promise<void>,
    readFile(file: string): Promise<string>,
    writeFile(file: string, content: string): Promise<void>
}


