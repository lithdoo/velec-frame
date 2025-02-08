import { RunnerWorker } from '../common'
import { SqliteService } from '../../sqlite'

export interface Option {
  fileUrl: string
  sql: string
  type: 'run' | 'query'
}

export class SqliteRunnerWorker extends RunnerWorker<Option> {
  readonly keyName = 'sqlite-runner'

  run(option: Option, argus: any[]) {
    const { fileUrl, sql, type } = option

    const [params] = argus

    const process = (async () => {
      const connection = SqliteService.connection(fileUrl)

      if (type === 'query') {
        const result = await connection.query(sql, params)
        return this.result(result)
      } else {
        return this.result(await connection.run(sql, params))
      }
    })()
    return { process }
  }
}
