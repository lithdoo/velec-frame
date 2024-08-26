

type FormKey = string

type FormBase = Record<string, unknown>

type FromExtend<Form extends FormBase, Key extends FormKey, Value> = {
    [key in Key]: Value;
} & {
    [P in keyof Form]: Form[P]
}

export class CommonFormHandler<Form extends FormBase> {
    readonly list: Field<FormKey, unknown>[] = []
    readonly validateMesssage: Map<Field<any, unknown>, string> = new Map()
    constructor(list: Field<FormKey, unknown>[]) {
        this.list = list
    }
    async emitValidate(keyName: string) {
        const field = this.list.find(v => v.keyName === keyName)
        if (!field) {
            return true
        }
        const value = field.transfer ? field.transfer(field.value) : field.value
        if (
            (!field.required) || (value)
        ) {
            this.validateMesssage.delete(field)
            return true
        } else {
            const msg = `${field.title} 为必填项`
            this.validateMesssage.set(field, msg)
            return false
        }
    }

    async submit() {
        const validate = await Promise.all(this.list.map(field => this.emitValidate(field.keyName)))
        if (validate.find(v => !v)) {
            throw new Error('表单验证失败！！！')
        }

        const res = {} as any
        this.list.forEach(field => {
            const value = field.transfer ? field.transfer(field.value) : field.value
            res[field.keyName] = value ?? field.blank
        })
        return res as Form
    }
}


export class CommonFormBuilder<Form extends FormBase> {
    static create() {
        return new CommonFormBuilder<{}>([])
    }

    readonly list: Field<FormKey, unknown>[] = []

    constructor(list: Field<FormKey, unknown>[]) {
        this.list = list
    }

    private add<Key extends FormKey, Value>(field: Field<Key, Value>) {
        return new CommonFormBuilder<FromExtend<Form, Key, Value>>(this.list.concat([field as any]))
    }

    selector<Key extends string, T extends string = string>(keyName: Key, option: Partial<
        OptionField<Key, T>
    >) {

        const field: OptionField<Key, T> = Object.assign({
            keyName,
            title: '',
            label: '',
            required: false,
            options: [],
            multi: false,
            stringify: false,
            render: '',
            value: '',
            blank: '',
        }, option, {
            keyName, render: 'selector'
        })

        return this.add(field)
    }
    switch<Key extends string>(keyName: Key, option: Partial<
        SwitchField<Key>
    >) {

        const field: SwitchField<Key> = Object.assign({
            keyName,
            title: '',
            label: '',
            required: false,
            render: 'switch',
            value: false,
            blank: false,
        }, option, {
            keyName, render: 'switch'
        })

        return this.add(field)
    }

    input<Key extends string>(keyName: Key, option: Partial<TextField<Key>>) {
        const field: TextField<Key> = Object.assign({
            keyName,
            title: '',
            label: '',
            required: false,
            render: '',
            max: Infinity,
            min: 0,
            value: '',
            blank: '',
            transfer: (text: string) => text.trim()
        }, option, {
            keyName, render: 'input'
        })
        return this.add(field)
    }

    fileUrl<Key extends string>(keyName: Key, option: Partial<FileUrlField<Key>>) {
        const field: FileUrlField<Key> = Object.assign({
            keyName,
            title: '',
            label: '',
            required: false,
            render: '',
            value: '',
            blank: '',
            transfer: (text: string) => text.trim(),
            extensions: ['*'],
        }, option, {
            keyName, render: 'file'
        })
        return this.add(field)
    }

    build() {
        return new CommonFormHandler<Form>(this.list)
    }

}

export interface Field<Key extends FormKey, Value = any> {
    keyName: Key,
    title: string,
    label: string,
    required: boolean,
    render: string,
    value: Value,
    blank: Value,
    transfer?: (val: Value) => Value
}

export interface OptionField<Key extends FormKey, T extends string = string> extends Field<Key, T> {
    options: { key: string, title: string }[]
    multi: boolean
    stringify: boolean
    render: 'selector' | 'checkbox' | 'radio'
}

export interface SwitchField<Key extends FormKey> extends Field<Key, boolean> {
    required: false
    render: 'switch'
}


export interface TextField<Key extends FormKey> extends Field<Key, string> {
    render: 'input' | 'textarea'
    max: number
    min: number
}

export interface FileUrlField<Key extends FormKey> extends Field<Key, string> {
    render: 'file',
    extensions: string[]
}


// export interface 

export function isOptionField<Key extends FormKey>(item: Field<Key, any>): item is OptionField<Key> {
    return item.render === 'selector' || item.render === 'checkbox' || item.render === 'radio'
}

export function isTextField<Key extends FormKey>(item: Field<Key, any>): item is TextField<Key> {
    return item.render === 'input' || item.render === 'textarea'
}

export function isSwitchField<Key extends FormKey>(item: Field<Key, any>): item is SwitchField<Key> {
    return item.render === 'switch'
}

export function isFileUrlField<Key extends FormKey>(item: Field<Key, any>): item is FileUrlField<Key> {
    return item.render === 'file'
}


