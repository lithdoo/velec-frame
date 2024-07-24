import { AppSiderPanel, appSider } from "@renderer/state/sider"
import ExplorerSider from "./ExplorerSider.vue"
import { FlatTreeHandler, FlatTreeItem } from "@renderer/components/base/FlatTree"
import { VNode } from "vue"
import { fixReactive } from "@renderer/fix"
import { FileType } from "@common/file"
import { appTab } from "@renderer/state/tab"
import { PageFileEditor } from "@renderer/view/page/fileEditor"
import { PageGraphEditor } from "@renderer/view/page/graphEditor"
import { PageSqlErdEditor } from "@renderer/view/page/sqlErd"


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
        console.log(this.list)
    }

    init() {
        this.element = <ExplorerSider handler={this}></ExplorerSider>
    }


    openFile(file:FileTreeItem){
        if(file.name.indexOf('.ts')>0){
            appTab.addTab(PageFileEditor.create({
                name:file.name,
                url:file.url
            }))
        }
        if(file.name.indexOf('.json')>0){
            appTab.addTab(PageFileEditor.create({
                name:file.name,
                url:file.url
            },'json'))
        }
        if(file.name.indexOf('.md')>0){
            appTab.addTab(PageGraphEditor.create())
        }
        
        if(file.name.indexOf('.db')>0){
            appTab.addTab(PageSqlErdEditor.create(file.url))
        }
    }

}

interface FileTreeItem extends FlatTreeItem {
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
        this.tree = new FlatTreeHandler<FileTreeItem>()
        this.tree.onload = async (node) => {
            const list = await window.explorerApi.readDir(node.url)
            this.tree.data = this.tree.data.concat(list.map(v => ({
                ...v,
                id: v.url,
                pid: node.id,
                isLeaf: v.type === FileType.File,
                loaded: v.type === FileType.File ? true : false,
            })))
            return true
        }
    }

    async fetchRoots() {
        const list = await window.explorerApi.readDir(this.rootUrl)
        this.tree.data = list.map(v => ({
            ...v,
            id: v.url,
            isLeaf: v.type === FileType.File,
            loaded: v.type === FileType.File ? true : false,
        }))
    }
}


