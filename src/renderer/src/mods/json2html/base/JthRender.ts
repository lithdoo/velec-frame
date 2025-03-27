
import { JthFileState } from "./JthFile"

export abstract class JthRenderState {


    file: {
        [key: string]: unknown
    } = {}


    getModData<T>(namspace: string) {
        const data = this.file[namspace]
        if (!data) return null
        else return JSON.parse(JSON.stringify(data)) as T
    }

    abstract render(): void
}


export abstract class JthRenderMod<T> {
    abstract readonly namespace: string

    constructor(
        protected readonly file: JthFileState
    ) { }

    getData() {
        return this.file.getModData<T>(this.namespace)
    }

}
