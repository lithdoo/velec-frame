export enum DataFieldType {
    Number = 'Number',
    Boolean = "Boolean",
    String = "String",
    RefId = 'RefId'
}

export enum DataRepeatDealType {
    Update = "Update",
    Ignore = "Ignore",
    Error = "Error"
}

export interface FieldInfo<T extends string = string> {
    field_name: T,
    is_key: boolean,
    type: DataFieldType,
}


export interface TableInfo<T extends FieldInfo[] = FieldInfo[]> {
    table_name: string,
    fields: T,
    repeat_deal_type: DataRepeatDealType
}


export interface PrivateTableInfo<T extends FieldInfo[] = FieldInfo[]> extends TableInfo<T> {
    blank_data: TableRecord<TableInfo>[]
}

export interface RefInfo {
    source_table: string,
    source_field: string,
    target_table: string,
}

export interface ArrayRefInfo {
    junction_table_name: string,
    source_table: string,
    source_field: string,
    target_table: string,
}

export interface JunctionTableInfo {
    source_ref: string
    target_ref: string
}

export const MutDBInfo = {
    Table: {
        table_name: 'mut_dbc_private_table_info',
        fields: [
            { field_name: 'table_name', type: DataFieldType.String, is_key: true },
            { field_name: 'repeat_deal_type', type: DataFieldType.String, is_key: false }
        ],
        repeat_deal_type: DataRepeatDealType.Error,
        blank_data: []
    } as {
        table_name: 'mut_dbc_private_table_info',
        fields: [
            { field_name: 'table_name', type: DataFieldType.String, is_key: true },
            { field_name: 'repeat_deal_type', type: DataFieldType.String, is_key: false }
        ],
        repeat_deal_type: DataRepeatDealType.Error,
        blank_data: []
    },
    Field: {
        table_name: 'mut_dbc_private_field_info',
        fields: [
            { field_name: 'is_key', type: DataFieldType.Boolean, is_key: false },
            { field_name: 'field_name', type: DataFieldType.String, is_key: true },
            { field_name: 'source_table', type: DataFieldType.RefId, is_key: true },
            { field_name: 'index', type: DataFieldType.Number, is_key: false },
            { field_name: 'type', type: DataFieldType.String, is_key: false }
        ],
        repeat_deal_type: DataRepeatDealType.Error,
        blank_data: []
    } as {
        table_name: 'mut_dbc_private_field_info',
        fields: [
            { field_name: 'is_key', type: DataFieldType.Boolean, is_key: false },
            { field_name: 'field_name', type: DataFieldType.String, is_key: true },
            { field_name: 'source_table', type: DataFieldType.RefId, is_key: true },
            { field_name: 'index', type: DataFieldType.Number, is_key: false },
            { field_name: 'type', type: DataFieldType.String, is_key: false }
        ],
        repeat_deal_type: DataRepeatDealType.Error,
        blank_data: []
    },
    Ref: {
        table_name: 'mut_dbc_private_ref_info',
        fields: [
            { field_name: 'source_field', type: DataFieldType.RefId, is_key: true },
            { field_name: 'target_table', type: DataFieldType.RefId, is_key: false }
        ],
        repeat_deal_type: DataRepeatDealType.Error,
        blank_data: []
    } as {
        table_name: 'mut_dbc_private_ref_info',
        fields: [
            { field_name: 'source_field', type: DataFieldType.RefId, is_key: true },
            { field_name: 'target_table', type: DataFieldType.RefId, is_key: false }
        ],
        repeat_deal_type: DataRepeatDealType.Error,
        blank_data: []
    },
    // RefArray: {
    //     table_name: 'mut_dbc_private_ref_array_info',
    //     fields: [
    //         { field_name: 'junction_table_name', type: DataFieldType.String, is_key: false },
    //         { field_name: 'source_table', type: DataFieldType.String, is_key: true },
    //         { field_name: 'source_field', type: DataFieldType.String, is_key: true },
    //         { field_name: 'target_table', type: DataFieldType.String, is_key: false }
    //     ],
    //     repeat_deal_type: DataRepeatDealType.Error,
    //     blank_data: []
    // } as {
    //     table_name: 'mut_dbc_private_ref_array_info',
    //     fields: [
    //         { field_name: 'junction_table_name', type: DataFieldType.String, is_key: false },
    //         { field_name: 'source_table', type: DataFieldType.String, is_key: true },
    //         { field_name: 'source_field', type: DataFieldType.String, is_key: true },
    //         { field_name: 'target_table', type: DataFieldType.String, is_key: false }
    //     ],
    //     repeat_deal_type: DataRepeatDealType.Error,
    //     blank_data: []
    // },
    // JuncTableField: {
    //     table_name: 'mut_dbc_private_junc_table_field',
    //     fields: [
    //         { field_name: 'source_ref', type: DataFieldType.String, is_key: true },
    //         { field_name: 'target_ref', type: DataFieldType.String, is_key: true },
    //         { field_name: 'idx', type: DataFieldType.Number, is_key: false }
    //     ],
    //     repeat_deal_type: DataRepeatDealType.Error,
    //     blank_data: []
    // } as {
    //     table_name: 'mut_dbc_private_junc_table_field',
    //     fields: [
    //         { field_name: 'source_ref', type: DataFieldType.String, is_key: true },
    //         { field_name: 'target_ref', type: DataFieldType.String, is_key: true },
    //         { field_name: 'idx', type: DataFieldType.Number, is_key: false }
    //     ],
    //     repeat_deal_type: DataRepeatDealType.Error,
    //     blank_data: []
    // },
}

export type RecordValueType = string | number | boolean | [string] | []

export type DataRecord<T extends Record<string, RecordValueType> = Record<string, RecordValueType>> = { _ref_key_: string } & T

export interface MutDBCRecord<T extends DataRecord = any> {
    readonly table_info: TableInfo,
    list: T[]
}

type DealFieldValue<T extends DataFieldType> = T extends DataFieldType.Boolean
    ? boolean
    : T extends DataFieldType.Number
    ? number
    : T extends DataFieldType.String
    ? string
    : T extends DataFieldType.RefId
    ? [string] | []
    : RecordValueType

type DealFieldName<T extends FieldInfo<string>[]> =
    T extends [] ? {} :
    T extends [...infer LeftRest, infer Last]
    ? LeftRest extends FieldInfo<string>[]
    ? Last extends FieldInfo<infer Dext>
    // ? Dext extends string
    ? { [key in Dext]: DealFieldValue<Last['type']> } & DealFieldName<LeftRest>
    // : never
    : never
    : never
    : never

export type TableRecord<T extends TableInfo> =
    DealFieldName<T['fields']> extends never
    ? DataRecord
    : DealFieldName<T['fields']> & { _ref_key_: string }

