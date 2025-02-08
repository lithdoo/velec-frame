import { SqliteRunnerStep } from '@common/runnerExt'
import { StepRunner } from './base'
import { SqliteService } from '../../sqlite'

export class SqliteRunner extends StepRunner<SqliteRunnerStep> {
  async run() {
    const { fileUrl, sql, type, useParams } = this.step.option

    const input = useParams ? this.inputs : []
    const connection = SqliteService.connection(fileUrl)

    if (type === 'run') {
      await connection.run(sql, input)
    } else if (type === 'query') {
      await connection.query(sql, input)
    }
  }
}
