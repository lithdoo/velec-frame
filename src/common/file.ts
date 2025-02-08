export enum FileType {
  File = 'File',
  Directory = 'Directory'
}

export type FileStat = {
  size: number
  mtimeMs: number
}
