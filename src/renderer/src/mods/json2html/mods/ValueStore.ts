import { ValueGenerator, ValueGeneratorRef, JthFileMod, JthFileState } from "../base"
import { JthRenderMod } from "../base/JthRender"
import { blankStoreData } from "../utils"
import { JthRenderScope, JthRenderScopeState } from "./Template"





export type JthValueStoreData = {
    last_mod_ts: number
    store: {
        [key: string]: ValueGenerator
        ['null']: ValueGenerator
        ['blank_string']: ValueGenerator
        ['empty_array']: ValueGenerator
        ['empty_object']: ValueGenerator
        ['true']: ValueGenerator
        ['false']: ValueGenerator
    }
}

export class JthModValueStore extends JthFileMod<JthValueStoreData> {

    static namespace = 'VALUE_STORE'
    readonly namespace = 'VALUE_STORE'

    static isValueGeneratorRef = (x: any): x is ValueGeneratorRef => {
        return x?._VALUE_GENERATOR_REFERENCE_ !== undefined
    }



    public data: JthValueStoreData = blankStoreData()

    constructor(
        file: JthFileState
    ) {
        super(file)
        this.reload()
    }

    reload(): void {
        this.data = this.file.getModData(this.namespace) ?? blankStoreData()
    }

    add(vg: ValueGenerator): ValueGeneratorRef {
        const refKey = Math.random().toString()
        this.data.store[refKey] = vg
        this.update()
        return {
            '_VALUE_GENERATOR_REFERENCE_': refKey
        }
    }

    clear(refs: ValueGeneratorRef[] = []) {
        const set = new Set(refs.map(v => v._VALUE_GENERATOR_REFERENCE_).concat([
            'null', 'blank_string', 'empty_array', 'empty_object', 'true', 'false',
        ]));

        [...Object.keys(this.data.store)].map(name => {
            if (!set.has(name)) {
                delete this.data.store[name]
            }
        })
    }

    get(ref: ValueGeneratorRef) {
        return this.data.store[ref._VALUE_GENERATOR_REFERENCE_]
    }


    storeData() {
        return new Map(Object.entries(this.data.store))
    }

    private update() {
        this.data.last_mod_ts = new Date().getTime()
        this.setData({ ...this.data, store: { ...this.data.store } })
    }
}


export class JthRenderModValueStore extends JthRenderMod<JthValueStoreData> {
    readonly namespace = 'VALUE_STORE'

    cache: JthValueStoreData = blankStoreData()

    update() {
        const data = this.getData()
        if (data && (data.last_mod_ts !== this.cache.last_mod_ts)) {
            this.cache = data
        }
    }

    getValueGenerator(ref: ValueGeneratorRef) {
        this.update()
        const vg = this.cache.store[ref._VALUE_GENERATOR_REFERENCE_]
        if (!vg) {
            throw new Error('ref not exist!')
        } else {
            return vg
        }
    }


    createScopeFromjson(json: string = 'null') {
        this.update()
        const scope = new JthRenderScope(
            new JthRenderScopeState(JSON.parse(json) ?? {}),
            new Map(Object.entries(this.cache.store))
        )
        return scope
    }

}