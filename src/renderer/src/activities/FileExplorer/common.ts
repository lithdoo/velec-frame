import { tabControl } from '@renderer/parts/PageTab'
import { PageTextEditor } from '@renderer/tabs/TextEditor'
import { Menu } from '@renderer/widgets/PopMenu'
import { parseFileName } from './FileOperation'
import { PageDBChart } from '@renderer/tabs/DBChart'
import { PageJthTemplate } from '@renderer/tabs/JsonToHtml'
import { PageMutVCaseRender, PageMutVTemplate } from '@renderer/tabs/MutView/page/handler'

export const opCopyPath = (fileUrl: string) =>
  Menu.button({
    key: 'copyPath',
    label: '复制路径',
    action: () => navigator.clipboard.writeText(fileUrl)
  })

export const opOpenInEditor = (fileUrl: string, lang?: string) =>
  Menu.button({
    key: 'openEditorTab',
    label: '打开',
    action: async () => {
      const tab = await PageTextEditor.file(parseFileName(fileUrl), fileUrl, lang)
      tabControl.addTab(tab)
    }
  })

export const opOpenDBChartTab = (fileUrl: string) =>
  Menu.button({
    key: 'openEditorTab',
    label: '打开',
    action: async () => {
      const tab = await PageDBChart.create(fileUrl)
      tabControl.addTab(tab)
    }
  })

export const opOpenJthTemplateTab = (fileUrl: string) =>
  Menu.button({
    key: 'openJthTemplateTab',
    label: '打开',
    action: async () => {
      const tab = await PageJthTemplate.create(fileUrl)
      tabControl.addTab(tab)
    }
  })


export const opOpenMutViewTempltateTab = (fileUrl: string) =>
  Menu.button({
    key: 'opOpenMutViewTempltateTab',
    label: '编辑',
    action: async () => {
      const tab = await PageMutVTemplate.create(fileUrl)
      tabControl.addTab(tab)
    }
  })

export const opOpenMutViewRenderTab = (fileUrl: string) =>
  Menu.button({
    key: 'opOpenMutViewTempltateTab',
    label: '打开',
    action: async () => {
      const tab = await PageMutVCaseRender.create(fileUrl)
      tabControl.addTab(tab)
    }
  })
