import { fixReactive } from "@renderer/fix";
import { FileControl } from "@renderer/mods/fileUtils";
import { MVFileState } from "@renderer/mods/mutv-mods/base";
import { TabPage } from "@renderer/parts/PageTab";
import { ModalStackHandler } from "@renderer/widgets/ModalStack";
import { VNode } from "vue";
import PageMutVRenderCaseVue from './PageMutVRenderCase.vue'
import PageMutVTemplateVue  from './PageMutVTemplate.vue'
import { MVFileController, MVRenderController } from "../controller";


export class PageMutVTemplate implements TabPage {

  static create(fileUrl: string) {
    const page = fixReactive(new PageMutVTemplate(fileUrl))
    page.init()
    return page
  }


  tabId: string = Math.random().toString()
  element: VNode
  icon = 'del'
  readonly controller: MVFileController
  readonly fileState: MVFileState
  title: string
  file: FileControl
  modal: ModalStackHandler = fixReactive(new ModalStackHandler())


  constructor(public fileUrl: string) {
    this.title = fileUrl
    this.file = new FileControl(fileUrl)
    this.fileState = fixReactive(new MVFileState())
    this.controller = fixReactive(new MVFileController(this.fileState))
    this.element = <div></div>
  }


  async init() {
    this.element = <PageMutVTemplateVue page={this}></PageMutVTemplateVue>
    MVFileController.modalWeakMap.set(this.controller, this.modal)
    await this.reload()
  }

  async save() {
    const fileContent = this.controller.file()
    await this.file.saveContent(fileContent)
  }

  async reload() {
    const fileContent = await this.file.loadFileContent()
    if (fileContent.success) {
      this.controller.reload(this.file.content)
    }
  }

}

export class PageMutVCaseRender implements TabPage {

  static create(fileUrl: string) {
    const page = fixReactive(new PageMutVCaseRender(fileUrl))
    page.init()
    return page
  }


  tabId: string = Math.random().toString()
  element: VNode
  icon = 'del'
  readonly fileController: MVFileController
  readonly renderController: MVRenderController
  readonly fileState: MVFileState
  title: string
  file: FileControl
  modal: ModalStackHandler = fixReactive(new ModalStackHandler())


  constructor(public fileUrl: string) {
    this.title = fileUrl
    this.file = new FileControl(fileUrl)
    this.fileState = fixReactive(new MVFileState())
    this.fileController = fixReactive(new MVFileController(this.fileState))
    this.renderController = fixReactive(new MVRenderController(this.fileState))
    this.element = <div></div>
  }


  async init() {
    this.element = <PageMutVRenderCaseVue page={this}></PageMutVRenderCaseVue>
    MVRenderController.modalWeakMap.set(this.renderController, this.modal)
    MVFileController.modalWeakMap.set(this.fileController, this.modal)
    await this.reload()
  }

  async save() {
    const fileContent = this.fileController.file()
    await this.file.saveContent(fileContent)
  }

  async reload() {
    const fileContent = await this.file.loadFileContent()
    if (fileContent.success) {
      this.fileController.reload(this.file.content)
    }
  }

}