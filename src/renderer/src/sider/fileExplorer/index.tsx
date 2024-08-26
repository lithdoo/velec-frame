import { AppSiderPanel, appSider } from "@renderer/state/sider"
import ExplorerSider from "./ExplorerSider.vue"
import { FlatTreeHandler, FlatTreeItem } from "@renderer/components/base/FlatTree"
import { VNode } from "vue"
import { fixReactive } from "@renderer/fix"
import { FileType } from "@common/file"
import { appTab } from "@renderer/state/tab"
import { PageFileEditor } from "@renderer/page/fileEditor"
import { PageGraphEditor } from "@renderer/page/graphEditor"
import { PageSqlErd } from "@renderer/page/sqlErd"
import { contextMenu } from "@renderer/view/fixed/contextmenu"
import { PopMenuBuilder } from "@renderer/components/base/PopMenu"
import { PageSqlEditor } from "@renderer/page/sqlEditor"
import { PageRunner } from "@renderer/page/runner"


export class SiderFileExplorer implements AppSiderPanel {

    static install() {
        const sider = fixReactive(new SiderFileExplorer())
        sider.init()
        appSider.addPanel(sider)
    }

    panelId = 'FRAME_FILE_PANEL'
    icon = 'del'
    label = '资源管理器'
    element: VNode = <div></div>
    list: ExplorerWrokspace[] = []
    constructor() {
        this.element = <ExplorerSider handler={this}></ExplorerSider>

    }

    async addExplorerWrokspace() {
        const root = await window.explorerApi.addWorkspace()
        if (!root) return

        const workspace = await ExplorerWrokspace.create(root)
        if (this.list.find(v => v.rootUrl === workspace.rootUrl)) {
            return
        }
        this.list = this.list.concat([workspace])
    }

    init() {
        this.element = <ExplorerSider handler={this}></ExplorerSider>
    }


    fileOpen(file: FileTreeItem) {
        if (file.name.indexOf('.ts') > 0) {
            appTab.addTab(PageFileEditor.create({
                name: file.name,
                url: file.url
            }))
        }
        if (file.name.indexOf('.json') > 0) {
            appTab.addTab(PageFileEditor.create({
                name: file.name,
                url: file.url
            }, 'json'))
        }
        if (file.name.indexOf('.md') > 0) {
            appTab.addTab(PageGraphEditor.create())
        }

        if (file.name.indexOf('.db') > 0) {
            appTab.addTab(PageSqlErd.sqlite(file.url))
        }
    }




}

export interface FileTreeItem extends FlatTreeItem {
    name: string
    url: string
    type: FileType
}

class ExplorerWrokspace {
    static async create(root: string) {
        const ws = fixReactive(new ExplorerWrokspace(root))
        ws.fetchRoots()
        return ws
    }
    rootUrl: string
    tree: FlatTreeHandler<FileTreeItem>
    constructor(rootUrl: string) {
        this.rootUrl = rootUrl
        this.tree = fixReactive(new FlatTreeHandler<FileTreeItem>())
        this.tree.onload = async (node) => {
            const list = await window.explorerApi.readDir(node.url)
            if(!list){
                this.tree.data = []
                return true
            }
            this.tree.data = this.tree.data.concat(list.map(v => ({
                ...v,
                id: v.url,
                pid: node.id,
                isLeaf: v.type === FileType.File,
                loaded: v.type === FileType.File ? true : false,
            })))
            return true
        }

        this.tree.onItemContextMenu = (item, ev) => {
            setTimeout(() => {
                this.tree.selectedKeys = [item.id]
                this.fileConextmenu(item, ev)
            })
        }
    }

    async fetchRoots() {
        const list = await window.explorerApi.readDir(this.rootUrl)
        if(!list){
            this.tree.data = []
            return
        }
        this.tree.data = list.map(v => ({
            ...v,
            id: v.url,
            isLeaf: v.type === FileType.File,
            loaded: v.type === FileType.File ? true : false,
        }))
    }

    fileConextmenu(file: FileTreeItem, ev: MouseEvent) {
        if (/.db$/.test(file.name)) {
            contextMenu.open(
                PopMenuBuilder.create()
                    .button('openErd', '打开 ER 图', () => {
                        appTab.addTab(PageSqlErd.sqlite(file.url))
                    })
                    .button('openEditor', '打开 SQL 编辑器', () => {
                        appTab.addTab(PageSqlEditor.create({
                            title: `查询窗口 [ ${file.name} ]`,
                            connection: { sqlite: file.url }
                        }))
                    })
                    .build(),
                ev
            )
        }

        if (/.run$/.test(file.name)) {
            contextMenu.open(
                PopMenuBuilder.create()
                    .button('open', '打开', () => {
                        appTab.addTab(PageRunner.create(file.url))
                    })
                    .build(),
                ev
            )
        }
    }
}


