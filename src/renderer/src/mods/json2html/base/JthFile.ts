export type ValueGeneratorRef = {
    ['_VALUE_GENERATOR_REFERENCE_']: string
}

export type ValueGenerator =
    | {
        type: 'static'
        json: string
    }
    | {
        type: 'dynamic:script'
        script: string
    }
    | {
        type: 'dynamic:getter'
        getter: string[]
    }

export class JthFileState {


    file: {
        [key: string]: unknown
    } = {}


    getModData<T>(namspace: string) {
        const data = this.file[namspace]
        if (!data) return null
        else return JSON.parse(JSON.stringify(data)) as T
    }

    setModData<T>(namespace: string, data: T | null) {
        if (!data) delete this.file[namespace]
        else this.file[namespace] = data
    }

    content() {
        return JSON.stringify(this.file, null, 2)
    }

    reload(content: string) {
        if (content && content.trim()) {
            try {
                const data = JSON.parse(content)
                if (data && typeof data === 'object') {
                    this.file = data
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    clone(){
        const newone = new JthFileState()
        newone.reload(JSON.stringify(this.file))
        return newone
    }

}


export abstract class JthFileMod<T> {
    abstract readonly namespace: string

    constructor(
        protected readonly file: JthFileState
    ) { }

    getData() {
        return this.file.getModData<T>(this.namespace)
    }

    setData(data: T | null) {
        return this.file.setModData(this.namespace, data)
    }


    getAllValueRef(): ValueGeneratorRef[] {
        return []
    }

    abstract reload(): void
}
