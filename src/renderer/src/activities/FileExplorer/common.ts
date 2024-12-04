import { tabControl } from "@renderer/parts/PageTab";
import { PageTextEditor } from "@renderer/tabs/TextEditor";
import { Menu } from "@renderer/widgets/PopMenu";
import { parseFileName } from "./FileOperation";
import { PageDBChart } from "@renderer/tabs/DBChart";

export const opCopyPath = (fileUrl: string) =>
    Menu.button({ key: 'copyPath', label: '复制路径', action: () => navigator.clipboard.writeText(fileUrl) })

export const opOpenInEditor = (fileUrl: string, lang?: string) =>
    Menu.button({
        key: 'openEditorTab', label: '打开', action: async () => {
            const tab = await PageTextEditor.file(parseFileName(fileUrl), fileUrl, lang);
            tabControl.addTab(tab)
        }
    })

export const opOpenDBChartTab = (fileUrl: string,) =>
    Menu.button({
        key: 'openEditorTab', label: '打开', action: async () => {
            const tab = await PageDBChart.create(fileUrl);
            tabControl.addTab(tab)
        }
    })
