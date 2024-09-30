export interface GsRunner {
    keyName: string
}

export interface GsCall {
    id: string
    runner: string
    option: unknown
    s_args: string[]
    s_result: string
}

export interface GsStep {
    id: string
    requestId: string
    above: { callId: string }
    next: { callId: string }
    s_inputs: string[]
}

export interface GsCode {
    store: string[]
    runners: GsRunner[]
    extra: { [key: string]: any }
    requests: GsRequest[]
}

export interface GsRequest {
    id: string
}

export interface GsExtend {
    keyName: string
    save(): any
    load(data: any): void
    emitUpdate?: () => void
}

export class GsState {
    private code: GsCode = {
        store: [],
        runners: [],
        extra: {},
        requests:[],
    }

    private readonly exts: GsExtend[] = []

    constructor(exts: GsExtend[]) {
        this.exts = exts
        this.exts.forEach(v => v.emitUpdate = () => {
            this.code.extra[v.keyName] = v.save()
        })
    }

    loadFile(code: GsCode) {
        this.code = code
        this.exts.forEach(v => v.load(this.code.extra[v.keyName]))
    }
    saveFile() {
        return this.code
    }
    getRunnerList() {
        return [...this.code.runners]
    }
    addRunner(runner: GsRunner) {
        this.code.runners = this.code.runners
            .filter(v => v.keyName === runner.keyName)
            .concat(runner)
    }
    delRunnder(keyName: string) {
        this.code.runners = this.code.runners
            .filter(v => v.keyName === keyName)
    }

    getCode() {
        return this.code
    }
}

export class GsScript {
    state: GsState
    constructor(exts: GsExtend[]) {
        this.state = new GsState(exts)
    }
}