import { VNode } from "vue"

export interface CFormField {
    keyName: string,
    title: string,
    help?: {
        status: 'info' | 'error' | 'warning',
        text: string
    },
    extra: HTMLElement | VNode,
    required: boolean,
    readonly: boolean
}

export interface CFormInput<Value> {
    value: Value,
    default?: Value,
}


export interface CFormText extends CFormInput<String> {
    fieldType: 'input'
    render: 'input' | 'textarea'
}


export interface CFormOptional extends CFormInput<String[]> {
    fieldType: 'optional'
    options: { key: string, title: string }[]
    render: 'selector' | 'checkbox' | 'radio'
}

export interface CFormSwitch extends CFormInput<Boolean> {
    fieldType: 'switch'
}


export interface CFormFileUrl extends CFormInput<string> {
    fieldType: 'fileUrl'
    selectFolder: boolean
    extensions: string[]
}
