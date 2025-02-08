import { JsonDataRunnerStep, RunnerTaskStep } from '@common/runnerExt'
import type { RunnerExtTask } from '..'

export abstract class StepRunner<T extends RunnerTaskStep<any>> {
  constructor(
    public task: RunnerExtTask,
    public step: T,
    public inputs: any[]
  ) {}
  abstract run(): Promise<any>
}

export class JsonDataRunner extends StepRunner<JsonDataRunnerStep> {
  async run() {
    const option = this.step.option
    return option.default
  }
}
