import { nanoid } from "nanoid"
import { JthTemplate, JthTemplateType, ValueGenerator, ValueGeneratorRef } from "./base"
import { JthValueStoreData } from "./mods"


export function staticValueRef(
    input: 'null' | 'blank_string' | 'empty_array' | 'empty_object' | 'true' | 'false'
): ValueGeneratorRef {
    return { ['_VALUE_GENERATOR_REFERENCE_']: input }
}

export function staticValue(
    input: 'null' | 'blank_string' | 'empty_array' | 'empty_object' | 'true' | 'false'
): ValueGenerator {
    switch (input) {
        case 'null':
            return { type: 'static', json: 'null' }
        case 'blank_string':
            return { type: 'static', json: '""' }
        case 'empty_array':
            return { type: 'static', json: '[]' }
        case 'empty_object':
            return { type: 'static', json: '{}' }
        case 'true':
            return { type: 'static', json: 'true' }
        case 'false':
            return { type: 'static', json: 'false' }
        default:
            throw new Error(`Unknown static value ref: ${input}`)
    }
}

export function createBlankNode(type: JthTemplateType) {
    let node: JthTemplate | null = null
    if (type === JthTemplateType.Root) {
        node = {
            id: nanoid(),
            type,
            isGroup: true,
            props: []
        }
    } else if (type === JthTemplateType.Text) {
        node = {
            id: nanoid(),
            type,
            isGroup: false,
            text: staticValueRef('blank_string')
        }
    } else if (type === JthTemplateType.Element) {
        node = {
            id: nanoid(),
            type,
            isGroup: true,
            tagName: 'div',
            attrs: []
        }
    } else if (type === JthTemplateType.Apply) {
        node = {
            id: nanoid(),
            type,
            isGroup: false,
            data: [],
            component: staticValueRef('null')
        }
    } else if (type === JthTemplateType.Loop) {
        node = {
            id: nanoid(),
            type,
            isGroup: true,
            loopValue: staticValueRef('empty_array'),
            valueField: 'value',
            indexField: 'index'
        }
    } else if (type === JthTemplateType.Prop) {
        node = {
            id: nanoid(),
            type,
            isGroup: true,
            data: []
        }
    } else if (type === JthTemplateType.Cond) {
        node = {
            id: nanoid(),
            type,
            isGroup: true,
            test: staticValueRef('true')
        }
    }

    if (!node) {
        throw new Error('Unknown template type')
    } else return node
}


export function blankStoreData(): JthValueStoreData {
    return {
        last_mod_ts: new Date().getTime(),
        store: {
            ['null']: staticValue('null'),
            ['blank_string']: staticValue('blank_string'),
            ['empty_array']: staticValue('empty_array'),
            ['empty_object']: staticValue('empty_object'),
            ['true']: staticValue('true'),
            ['false']: staticValue('false')
        }
    }
}