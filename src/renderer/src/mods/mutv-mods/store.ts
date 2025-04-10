import { EvalRef, EvalVal, EvalValStore } from "../mutv-eval"
import { MVFileMod, MVFileState } from "./base"

export type MVValueStoreData = {
    last_mod_ts: number
    data: { [key: string]: EvalVal }
}

export class MVModValueStore extends MVFileMod<MVValueStoreData> {

    static namespace = 'VALUE_STORE_V0'
    readonly namespace = MVModValueStore.namespace
    static blank() { return { last_mod_ts: new Date().getTime(), store: {} } }

    public store = new EvalValStore()

    constructor(
        file: MVFileState
    ) {
        super(file)
        this.reload()
    }

    reload(): void {
        const data = this.file.getModData<MVValueStoreData>(this.namespace)?.data ?? {}
        this.store = new EvalValStore(data)
    }

    add(val: EvalVal): EvalRef {
        const ref = { '_VALUE_GENERATOR_REFERENCE_': Math.random().toString() }
        this.store.set(ref, val)
        this.update()
        return ref
    }

    clear(refs: EvalRef[] = []) {
        this.store.clear(refs)
        this.update()
    }

    get(ref: EvalRef) {
        return this.store.val(ref)
    }

    private update() {
        this.setData({
            last_mod_ts: new Date().getTime(),
            data: { ...this.store.table() }
        })
    }
}


// export class MVRenderModValueStore extends MVRenderMod<MVValueStoreData> {
//     readonly namespace = 'VALUE_STORE'

//     cache: MVValueStoreData = blankStoreData()

//     update() {
//         const data = this.getData()
//         if (data && (data.last_mod_ts !== this.cache.last_mod_ts)) {
//             this.cache = data
//         }
//     }

//     getValueGenerator(ref: ValueGeneratorRef) {
//         this.update()
//         const vg = this.cache.data[ref._VALUE_GENERATOR_REFERENCE_]
//         if (!vg) {
//             throw new Error('ref not exist!')
//         } else {
//             return vg
//         }
//     }


//     createScopeFromjson(json: string = 'null') {
//         this.update()
//         const scope = new MVRenderScope(
//             new MVRenderScopeState(JSON.parse(json) ?? {}),
//             new Map(Object.entries(this.cache.data))
//         )
//         return scope
//     }

// }