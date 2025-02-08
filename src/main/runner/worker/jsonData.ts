import { JsonDataStore } from '../../jsonData'
import { RunnerWorker } from '../common'

export interface Option {
  receiveId: string
}

export class JsonDataRunnerWorker extends RunnerWorker<Option> {
  readonly keyName = 'json-data-runner'

  run(option: Option, argus: any[]) {
    const { receiveId } = option
    const [data] = argus

    const process = (async () => {
      if (data !== undefined) {
        JsonDataStore.main.set(receiveId, data)
      }
      return this.result(JsonDataStore.main.get(receiveId, false))
    })()
    return { process }
  }
}
