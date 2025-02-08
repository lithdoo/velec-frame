export abstract class RunnerWorker<Option> {
  abstract readonly keyName: string
  abstract run(
    option: Option,
    argus: any[]
  ): {
    process: Promise<{
      result: any
    }>
  }

  protected async result<T>(value: T) {
    return {
      result: value
    }
  }
}
