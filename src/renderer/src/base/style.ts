export class Vars<T extends { [key: string]: any }> {
    vars: T
    constructor(t: T) {
        this.vars = t
    }
    get<Name extends keyof T>(name: Name) {
        return this.vars[name]
    }
}

export class StyleVars<T extends { [key: string]: any }> extends  Vars<T>{
    add<Name extends string, Value>(name: Name, value: Value) {
        return new StyleVars<T & { [key in Name]: Value }>({ ...this.vars, [name]: value })
    }
}

export class CssVars<T extends string> extends Vars<{ [key in T]: string }> {
    add<Name extends string>(name: Name, value: string) {
        return new CssVars<T & { [key in Name]: string }>({ ...this.vars, [name]: value })
    }
} 