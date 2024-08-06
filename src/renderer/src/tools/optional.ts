export class ReData<T> {
    _isError = false
    val: T
    constructor(val) {
        this.val = val
    }
}


export class ReError<T = string> {
    _isError = true
    val: T
    constructor(val) {
        this.val = val
    }
}


export type Result<Data, Err> = ReData<Data> | ReError<Err>


export const result = {
    catch: <Data, Err>(
        result: Result<Data, Err>,
        handler: (err: Err) => boolean | void = () => { }) => {
        if (result instanceof ReData) {
            return result.val
        } else {
            const err = result.val
            const showMessage = !(handler(err) === false)
            if (showMessage) {
                const msg = err?.toString() || '发生了不明错误！'
                window.alert(msg)
            }
            throw (err)
        }
    },

    catchAwait: <Data, Err>(
        resultPromise: Promise<Result<Data, Err>>,
        handler: (err: Err | string) => boolean | void = () => { }) => {

        resultPromise.then(result => {
            if (result instanceof ReData) {
                return result.val
            } else {
                const err = result.val
                const showMessage = !(handler(err) === false)
                if (showMessage) {
                    const msg = err?.toString() || '发生了不明错误！'
                    window.alert(msg)
                }
                throw (err)
            }
        }).catch((e: Error) => {

            const showMessage = !(handler(e.message) === false)
            if (showMessage) {
                const msg = e.message || '发生了不明错误！'
                window.alert(msg)
            }
            throw (e)

        })
    }
}