import { FileStat } from "@common/file"


export enum FileLoadStatus {
    NotExist,
    Unchanged,
    Oversize,
    Reloaded,
}


const asyncPromise = <T>(func: () => Promise<T>): Promise<T> => {
    return Promise.resolve(func())
}

export class FileControl {


    static getFileStatus: (fileUrl: string) => Promise<FileStat | null> = async () => {
        throw new Error('not install')
    }

    static readFileContent: (fileUrl: string) => Promise<string> = () => {
        throw new Error('not install')
    }


    static saveFileContent: (fileUrl: string, content: string)=> Promise<void> =()=>{
        throw new Error('not install')
    }

    constructor(
        public fileUrl: string,
    ) {}

    public async saveContent(content: string) {
        await FileControl.saveFileContent(this.fileUrl, content)
    }


    public async readContent(): Promise<string> {
        return await FileControl.readFileContent(this.fileUrl)

    }

    lastReadStat: FileStat | null = null
    currentStat: FileStat | null = null

    content: string = ''
    maxSize: number = 20 * 1024 * 1024


    updatePromise: Promise<{
        success: boolean,
        loadStatus: FileLoadStatus
    }> | null = null

    updateFileContent(): Promise<{
        success: boolean,
        loadStatus: FileLoadStatus
    }> {
        if (this.updatePromise) {
            return this.updatePromise
        }

        return asyncPromise<{
            success: boolean,
            loadStatus: FileLoadStatus
        }>(async () => {
            const stat = await FileControl.getFileStatus(this.fileUrl)
            if (!stat) {
                this.currentStat = null
                return {
                    success: false,
                    loadStatus: FileLoadStatus.NotExist,
                }
            }
            if (this.currentStat && this.currentStat.mtimeMs === stat.mtimeMs) {
                this.currentStat = this.lastReadStat = this.currentStat
                return {
                    success: true,
                    loadStatus: FileLoadStatus.Unchanged,
                }
            }

            if (stat.size > this.maxSize) {
                this.currentStat = stat
                return {
                    success: false,
                    loadStatus: FileLoadStatus.Oversize,
                }
            }

            const content = await FileControl.readFileContent(this.fileUrl)

            this.content = content
            this.currentStat = this.lastReadStat = stat

            return {
                success: true,
                loadStatus: FileLoadStatus.Reloaded,
            }
        })

    }
}

export class FileWatchControl extends FileControl {
    static watchers: FileWatchControl[] = []

    constructor(
        public fileUrl: string,
    ) {
        super(fileUrl)
        FileWatchControl.watchers.push(this)
    }

    isWatching: boolean = false

    public startWatch() {
        this.isWatching = true
    }

    public stopWatch() {
        this.isWatching = false
    }

    public destroy() {
        FileWatchControl.watchers = FileWatchControl.watchers.filter(w => w !== this)
    }
}