import { TabPage } from "@renderer/state/tab";
import FileEditor from './FileEditor.vue'

export class PageFileEditor implements TabPage {
    tabId: string = Math.random().toString()
    element = <FileEditor/>
    icon = 'del'
    title = ''
    constructor(path: string) {
        this.title = path
    }

}