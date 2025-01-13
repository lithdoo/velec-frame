import { type MenuItem } from "@renderer/widgets/PopMenu";
import { opCopyPath, opOpenDBChartTab, opOpenInEditor, opOpenJthTemplateTab } from "./common";


export enum FileExtType {
    JSON = 'json',
    Typescript = 'ts',
    JavaScript = 'js',
    SqliteDB = 'db',
    JthFile = 'jth',
    Unknown = 'unknown',
}


export const parseFileExt = (fileUrlOrName: string): FileExtType => {
    const fileName = decodeURIComponent(fileUrlOrName).split('/').pop() || '';

    const ext = fileName.split('.').pop();
    if (ext === 'json') {
        return FileExtType.JSON;
    }
    if (ext === 'erd') {
        return FileExtType.JSON;
    }
    if (ext === 'ts') {
        return FileExtType.Typescript;
    }
    if (ext === 'js') {
        return FileExtType.JavaScript;
    }
    if (ext === 'db') {
        return FileExtType.SqliteDB;
    }
    if (ext === 'jth') {
        return FileExtType.JthFile;
    }
    return FileExtType.Unknown;
}

export const parseFileName = (fileUrl: string): string => {
    const fileName = decodeURIComponent(fileUrl).split('/').pop() || '';
    return fileName
}


export interface FileOperationConfig {
    operations: (fileUrl: string) => MenuItem[]
    onFileOpen: (fileUrl: string) => boolean | void
}


const unknownConfig = {
    operations: (fileUrl: string) => [opCopyPath(fileUrl)],
    onFileOpen: () => false,
}


export const fileHandler = new class {
    configTable: Map<FileExtType, FileOperationConfig> = new Map()

    constructor() {
        this.regist(FileExtType.Unknown, unknownConfig)
    }
    regist(type: FileExtType, config: FileOperationConfig) {
        this.configTable.set(type, config);
    }

    getOperations(fileUrl: string) {
        const type = parseFileExt(fileUrl);
        const config = this.configTable.get(type)
        if (!config) { return [] }
        return config.operations(fileUrl)
    }

    onFileOpen(fileUrl: string) {
        const type = parseFileExt(fileUrl);
        const config = this.configTable.get(type)
        if (!config) { return }
        config.onFileOpen(fileUrl)
    }
}

fileHandler.regist(FileExtType.JSON, {
    onFileOpen: (fileUrl) => {
        opOpenInEditor(fileUrl, FileExtType.JSON).action?.(new MouseEvent('click'))
    },
    operations: (fileUrl: string) => [opCopyPath(fileUrl), opOpenInEditor(fileUrl, FileExtType.JSON)]
})


fileHandler.regist(FileExtType.SqliteDB, {
    onFileOpen: (fileUrl) => {
        opOpenDBChartTab(fileUrl).action?.(new MouseEvent('click'))
    },
    operations: (fileUrl: string) => [opCopyPath(fileUrl), opOpenDBChartTab(fileUrl)]
})


fileHandler.regist(FileExtType.JthFile, {
    onFileOpen: (fileUrl) => {
        opOpenJthTemplateTab(fileUrl).action?.(new MouseEvent('click'))
    },
    operations: (fileUrl: string) => [opCopyPath(fileUrl), opOpenJthTemplateTab(fileUrl)]
})