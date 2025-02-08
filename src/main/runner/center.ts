import { uuid } from 'uuidv4'

export class RunnerCenter {
  readonly table: Map<string, Runner> = new Map()
  process?: RunnerProcess
  waitList: RunnerProcess[] = []
  regist(runner: Runner) {
    const keyName = runner.keyName
    if (this.table.has(keyName)) {
      throw new Error(`${keyName} has been regist!!!`)
    } else {
      this.table.set(keyName, runner)
    }
  }
  runners() {
    return Array.from(this.table.values())
  }
  private async run(process: RunnerProcess) {
    this.process = process
    const { runner, handler } = process.option

    const target = this.table.get(runner)?.handlers.get(handler)

    if (!target) {
      throw new Error(`${runner}.${handler} is not exist!!!`)
    }

    if (process.option.checkInputs) {
      const res = await target.checkInputs(...process.option.inputs)
      if (!res) throw new Error(`${runner}.${handler} input error!!!`)
    }

    const result = await target.call(...process.option.inputs)

    if (process.option.checkResult) {
      const res = await target.checkResult(result)
      if (!res) throw new Error(`${runner}.${handler} result error!!!`)
    }

    return result
  }
  private next() {
    if (this.process) return

    const [target, ...next] = this.waitList

    if (!target) return

    this.waitList = next
    this.process = target

    this.run(target)
      .then((res) => {
        this.done(target, undefined, res)
      })
      .catch((e) => {
        this.done(target, e.message, undefined)
      })

    this.next()
  }
  private done(process: RunnerProcess, error: string | undefined, result: any) {
    this.process = undefined
    this.finish?.(process.processId, error, result)
  }
  execute(option: RunnerProcessOption) {
    const processId = uuid()
    const process: RunnerProcess = { processId, option }
    this.waitList = this.waitList.concat([process])
    setTimeout(() => {
      this.next()
    })
    return processId
  }
  finish?: (processId: string, error: string | undefined, result: any) => void
}

interface RunnerProcess {
  processId: string
  option: RunnerProcessOption
}

interface RunnerHandler {
  checkInputs: (...argus: any[]) => Promise<boolean>
  checkResult: (result: any) => Promise<boolean>
  call: (...argus: any[]) => Promise<any>
}

export abstract class Runner {
  abstract readonly keyName: string
  abstract readonly handlers: Map<string, RunnerHandler>
}

export interface RunnerProcessOption {
  runner: string
  handler: string
  inputs: any[]
  checkInputs: boolean
  checkResult: boolean
}
