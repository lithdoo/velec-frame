import { TabPage } from '@renderer/parts/PageTab'
import { VNode } from 'vue'
import { fixReactive } from '@renderer/fix'
import { TextEditorHandler, TextEditor } from '@renderer/widgets/TextEditor'
import { ToolBarHandler } from '@renderer/widgets/ToolBar'
import PageCommonEditorVue from './PageCommonEditor.vue'
// import FileEditor from "@renderer/";

export class PageTextEditor implements TabPage {
  static create(title: string, content: string, lang?: string, fileUrl?: string) {
    const page = fixReactive(new PageTextEditor(title, content, lang, fileUrl))
    return page
  }

  static async file(title: string, fileUrl: string, lang?: string) {
    const buffer = await window.editorApi.fileContent(fileUrl)
    const decoder = new TextDecoder()
    const content = decoder.decode(buffer)
    return PageTextEditor.create(title, content, lang, fileUrl)
  }

  tabId: string = Math.random().toString()
  element: VNode
  icon = 'del'
  handler: TextEditorHandler

  constructor(
    public title: string,
    content: string,
    public lang?: string,
    public fileUrl?: string
  ) {
    this.handler = new TextEditorHandler(content, lang ?? '', fileUrl)
    this.element = <TextEditor handler={this.handler}></TextEditor>
  }

  // async init() {
  //     const buffer = await window.editorApi.fileContent(this.file.url)
  //     const decoder = new TextDecoder()
  //     const content = decoder.decode(buffer)
  //     this.handler.setContent(content)
  // }

  onDestroy(): void {
    this.handler.destory()
  }
}

export class PageCommonEditor implements TabPage {
  static create(title: string, content: string, toolbar: ToolBarHandler, lang?: string) {
    const page = fixReactive(new PageCommonEditor(title, content, toolbar, lang))
    return page
  }

  static async file(title: string, fileUrl: string, lang?: string) {
    const buffer = await window.editorApi.fileContent(fileUrl)
    const decoder = new TextDecoder()
    const content = decoder.decode(buffer)
    return PageTextEditor.create(title, content, lang, fileUrl)
  }

  tabId: string = Math.random().toString()
  element: VNode
  icon = 'del'
  handler: TextEditorHandler

  constructor(
    public title: string,
    content: string,
    public toolbar: ToolBarHandler,
    public lang?: string
  ) {
    this.handler = new TextEditorHandler(content, lang ?? '')
    this.element = (
      <PageCommonEditorVue toolbar={this.toolbar} editor={this.handler}></PageCommonEditorVue>
    )
  }

  // async init() {
  //     const buffer = await window.editorApi.fileContent(this.file.url)
  //     const decoder = new TextDecoder()
  //     const content = decoder.decode(buffer)
  //     this.handler.setContent(content)
  // }

  onDestroy(): void {
    this.handler.destory()
  }
}
