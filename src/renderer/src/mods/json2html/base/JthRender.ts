
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


const preRender = Symbol()
const dealRoot = Symbol()

export abstract class JthRenderMod<T> {
    static preRender = preRender
    static dealRoot = dealRoot


    abstract readonly namespace: string


    constructor(
        protected readonly file: JthFileState
    ) { }

    getData() {
        return this.file.getModData<T>(this.namespace)
    }

    [preRender]() { }
    [dealRoot](_root: ShadowRoot): void { }
}
