import { RunnerWorker } from '../common'

export interface Option {
  fields: string[]
}

export class ScopeDataRunnerWorker extends RunnerWorker<Option> {
  readonly keyName = 'scope-data-runner'

  run(option: Option, argus: any[]) {
    const process = (async () => {
      const data: { [key: string]: any } = {}
      const { fields } = option
      fields.forEach((name, idx) => {
        data[name] = argus[idx]
      })
      return this.result(data)
    })()
    return { process }
  }
}
