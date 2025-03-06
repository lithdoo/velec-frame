import { MonacoEditor } from '@renderer/mods/lspClient'

export class TextEditorHandler {

  private resolveEditor: (editor: MonacoEditor) => void = () => { }

  waitter: Promise<MonacoEditor> | undefined
  editor?: MonacoEditor

  constructor(
    private content: string,
    public lang: string,
    public url?: string
  ) {
    this.lang = lang
    this.content = content

    this.waitter = new Promise(res => {
      this.resolveEditor = res
    })
  }



  async initEditor(element: HTMLElement) {
    const language = this.lang
    // const isJson = language.toLocaleLowerCase() === 'json'
    const content = this.content

    const editor = new class extends MonacoEditor {
      content = content
      language = language
      ext = ''
      element = element
      uri = undefined
      langClientConfigs = {}
    }

    this.editor = editor
    await this.editor.init()
    this.resolveEditor(editor)

  }

  async setContent(content: string) {
    if (!this.editor) { this.content = content }
    (await this.waitter)?.setContent(content)
  }

  getContent() {
    if (!this.editor) {
      return this.content
    } else {
      return this.editor.content
    }
  }


  destory() {
    this.editor?.dispose()
  }
}