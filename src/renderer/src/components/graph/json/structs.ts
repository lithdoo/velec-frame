
export enum JsonFieldTypeKey {
    String = 'String',
    Integer = 'Integer',
    Number = 'Number',
    Boolean = 'Boolean',
    Null = 'Null',
    Array = 'Array',
    Object = 'Object',
    Anyone = 'Anyone',
}

export interface JsonStruct {
    fields: { name: string, type: JsonType }[]
}

export interface JsonField {
    name: string
    type: JsonType
}

export interface JsonType {
    key: JsonFieldTypeKey
}

export interface JsonUsage {
    name: string,
    methods: {
        name: string,
        input: JsonStruct
        output: JsonType
    }[],
}

export class GhJsonModel {
    modelId: string
    name: string = 'Test'
    struct: JsonStruct = {
        fields: []
    }
    usages: JsonUsage[] = []
    constructor(modelId: string) {
        this.modelId = modelId
        this.struct.fields = [
            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
            { name: 'test3', type: { key: JsonFieldTypeKey.String } },
            { name: 'test4', type: { key: JsonFieldTypeKey.String } },
            { name: 'test5', type: { key: JsonFieldTypeKey.String } },
        ]

        this.usages = [
            {
                name: 'usage1', methods: [{
                    name: 'method1', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                }, {
                    name: 'method2', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                }, {
                    name: 'method3', input: {
                        fields: [
                            { name: 'test1', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test2', type: { key: JsonFieldTypeKey.String } },
                            { name: 'test3', type: { key: JsonFieldTypeKey.String } }
                        ]
                    },
                    output: { key: JsonFieldTypeKey.Null }
                },]
            }
        ]
    }
}
