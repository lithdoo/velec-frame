import { TabPage } from "@renderer/state/tab";
import { App, VNode, createApp } from "vue";
import PageFileEditorVue from './PageFileEditor.vue'
import { fixReactive } from "@renderer/fix";
import * as monaco from 'monaco-editor';
import { FileEditorHandler } from "@renderer/components/editor/handler";
import FileEditor from "@renderer/components/editor/FileEditor.vue";

export class PageFileEditor implements TabPage {

    static create(file: { name: string, url: string }) {
        const page = fixReactive(new PageFileEditor(file))
        page.init()
        return page
    }
    tabId: string = Math.random().toString()
    element: VNode
    icon = 'del'
    title = ''
    file: { name: string, url: string }
    handler: FileEditorHandler



    constructor(file: { name: string, url: string }) {
        this.file = file
        this.title = this.file.name
        this.handler = new FileEditorHandler(this.file.url, 'typescript')
        this.element = <FileEditor handler={this.handler}></FileEditor>
    }

    async init() {
        const buffer = await window.editorApi.fileContent(this.file.url)
        const decoder = new TextDecoder()
        const content = decoder.decode(buffer)
        this.handler.setContent(content)
    }

}