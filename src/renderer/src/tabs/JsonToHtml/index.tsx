import { TabPage } from '@renderer/parts/PageTab'
import PageJthTemplateVue from './PageJthTemplate.vue'
import { JthFileState, JthStateController } from './view/base'
import { VNode } from 'vue'
import { fixReactive } from '@renderer/fix'
import { FileControl } from '@renderer/mods/fileUtils'
import { ModalStackHandler } from '@renderer/widgets/ModalStack/index'
import { PageJthBase } from './pageBase'

export class PageJthTemplate implements TabPage {

  static create(fileUrl: string) {
    const page = fixReactive(new PageJthTemplate(fileUrl))
    page.init()
    return page
  }

  tabId: string = Math.random().toString()
  element: VNode
  icon = 'del'
  controller: JthStateController
  title: string
  file: FileControl
  modal: ModalStackHandler = fixReactive(new ModalStackHandler())

  constructor(public fileUrl: string) {
    this.title = fileUrl
    this.file = new FileControl(fileUrl)
    this.controller = fixReactive(new JthStateController(new JthFileState()))
    this.element = <div></div>
  }

  async init() {
    this.element = <PageJthTemplateVue page={this}></PageJthTemplateVue>
    PageJthBase.modalWeakMap.set(this.controller, this.modal)
    await this.reload()
  }

  async save() {
    const fileContent = this.controller.file()
    await this.file.saveContent(fileContent)
  }

  async reload() {
    const fileContent = await this.file.loadFileContent()
    if (fileContent.success) {
      console.log('fileContent', this.file.content)
      this.controller.reload(this.file.content)
    }
  }
}
