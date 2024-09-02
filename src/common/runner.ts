
export enum RunnerClientStatus {
    Free = 'Free',
    Procesing = 'Procesing',
    Offline = 'Offline'
}


export interface RunnerTaskConfig {
    steps: RunnerTaskStep<unknown>[];
}

export interface RunnerTaskStep<Option> {
    worker: string;
    option: Option;
}



export interface SqliteRunnerStep extends RunnerTaskStep<{
    fileUrl: string,
    sql: string,
    type: 'run' | 'query'
}> {
    worker: 'sqlite-runner'
}

export const isSqliteRunnerStep = (step: RunnerTaskStep<unknown>): step is SqliteRunnerStep => {
    return step.worker === 'sqlite-runner'
}


export interface JsonDataRunnerStep extends RunnerTaskStep<{
    receiveId: string
}> {
    worker: 'json-data-runner'
}

export const isJsonDataRunnerStep = (step: RunnerTaskStep<unknown>): step is JsonDataRunnerStep => {
    return step.worker === 'json-data-runner'
}