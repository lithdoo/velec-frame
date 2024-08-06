export class CommonForm {
    readonly list: Field[] = []
    constructor(list: Field[]) {
        this.list = list
    }
}


export class CommonFormBuilder {
    list: Field[] = []

    constructor(list: Field[]) {
        this.list = list
    }

    private add(field: Field) {
        return new CommonFormBuilder(this.list.concat([field]))
    }

    selector(keyName: string, option: Partial<
        OptionField
    >) {

        const field: OptionField = Object.assign({
            keyName: '',
            title: '',
            label: '',
            required: false,
            options: [],
            multi: false,
            stringify: false,
            render: ''
        }, option, {
            keyName, render: 'selector'
        })

        return this.add(field)
    }

    input(keyName: string, option: Partial<TextField>) {
        const field: TextField = Object.assign({
            keyName: '',
            title: '',
            label: '',
            required: false,
            render: '',
            max: Infinity,
            min: 0,
        }, option, {
            keyName, render: 'input'
        })
        return this.add(field)
    }

    build() {
        return new CommonForm(this.list)
    }

}

export interface Field {
    keyName: string,
    title: string,
    label: string,
    required: boolean,
    render: string
}

export interface OptionField extends Field {
    options: { key: string, title: string }[]
    multi: boolean
    stringify: boolean
    render: 'selector' | 'checkbox' | 'radio'
}

export interface TextField extends Field {
    render: 'input' | 'textarea'
    max: number
    min: number
}




