import { AppSiderPanel, siderControl } from "@renderer/parts/SideBar"
import ExplorerSider from "./ExplorerSider.vue"
import { FlatTreeHandler, FlatTreeItem } from "@renderer/widgets/FlatTree"
import { computed, ref, VNode } from "vue"
import { fixReactive } from "@renderer/fix"
import { FileType } from "@common/file"
import { fileHandler } from "./FileOperation"
import { contextMenu } from "@renderer/parts/GlobalContextMenu"
import { PopMenuBuilder, PopMenuListHandler } from "@renderer/widgets/PopMenu"
import { ModalContent, ViewModalHandler } from "@renderer/widgets/ViewModal/ViewModalHandler"
import { nanoid } from "nanoid"
import VxInput from "@renderer/components/VxInput/VxInput.vue"
import VxSelector from "@renderer/components/VxInput/VxSelector.vue"
import VxButton from "@renderer/components/VxButton/VxButton.vue"

// import { tabControl } from "@renderer/parts/PageTab"
// import { PageSqlErd } from "@renderer/page/_sqlErd"
// import { contextMenu } from "@renderer/view/fixed/contextmenu"
// import { PopMenuBuilder } from "@renderer/components/base/PopMenu"
// import { PageSqlEditor } from "@renderer/page/sqlEditor"
// import { PageTaskRunner } from "@renderer/page/taskRunner"
// import { PageFileEditor } from "@renderer/page/fileEditor"
// import { PageGraphEditor } from "@renderer/page/graphEditor"
// import { PageRunner } from "@renderer/page/runner2"


export class ActivFileExplorer implements AppSiderPanel {

    static install() {
        const sider = fixReactive(new ActivFileExplorer())
        sider.init()
        siderControl.addPanel(sider)
    }

    panelId = 'FRAME_FILE_PANEL'
    icon = 'folder'
    label = '资源管理器'
    element: VNode = <div></div>
    list: ExplorerWrokspace[] = []

    modal: ViewModalHandler = new ViewModalHandler()

    constructor() {
        this.element = <ExplorerSider handler={this}></ExplorerSider>

    }

    async addExplorerWrokspace() {
        const root = await window.explorerApi.addWorkspace()
        if (!root) return

        const workspace = await ExplorerWrokspace.create(root, this)
        // if (this.list.find(v => v.rootUrl === workspace.rootUrl)) {
        //     return
        // }
        // this.list = this.list.concat([workspace])

        this.list = [workspace]
    }

    async reloadCurrentWorkspace() {
        const [workspace, ...extra] = this.list
        if (!workspace) return
        const root = workspace.rootUrl
        if (!root) return
        const newWorkspace = await ExplorerWrokspace.create(root, this)
        this.list = [newWorkspace, ...extra]
    }

    async reloadWorkspace(rootUrl: string) {
        const workspace = this.list.find(v => v.rootUrl === rootUrl)
        if (!workspace) return
        const newWorkspace = await ExplorerWrokspace.create(rootUrl, this)
        this.list = this.list.map(v => v=== workspace ? newWorkspace : v)
    }

    init() {
        this.element = <ExplorerSider handler={this}></ExplorerSider>
        window.explorerApi.onDirChanged((dirUrl) => {
            this.list.forEach(v => {
                if(v.rootUrl === dirUrl) {
                    this.reloadWorkspace(dirUrl)
                }else{
                    v.onDirChanged(dirUrl)
                }
            })
        })
    }


    fileOpen(file: FileTreeItem) {
        return fileHandler.onFileOpen(file.url)
        // if (file.name.indexOf('.ts') > 0) {
        //     tabControl.addTab(PageFileEditor.create({
        //         name: file.name,
        //         url: file.url
        //     }))
        // }

        // if (file.name.indexOf('.trunner') > 0) {
        //     PageTaskRunner.add(file.url)
        // }

        // if (file.name.indexOf('.json') > 0) {
        //     tabControl.addTab(PageFileEditor.create({
        //         name: file.name,
        //         url: file.url
        //     }, 'json'))
        // }


        // if (file.name.indexOf('.md') > 0) {
        //     appTab.addTab(PageGraphEditor.create())
        // }

        // if (file.name.indexOf('.db') > 0) {
        //     appTab.addTab(PageSqlErd.sqlite(file.url))
        // }
    }




}

export interface FileTreeItem extends FlatTreeItem {
    name: string
    url: string
    type: FileType
}

export class ExplorerWrokspace {
    static async create(root: string, sider: ActivFileExplorer) {
        const ws = fixReactive(new ExplorerWrokspace(root, sider))
        ws.fetchRoots()
        return ws
    }
    tree: FlatTreeHandler<FileTreeItem>
    constructor(
        public rootUrl: string,
        public sider: ActivFileExplorer
    ) {
        this.rootUrl = rootUrl
        this.tree = fixReactive(new FlatTreeHandler<FileTreeItem>())
        this.tree.onload = async (node) => {
            const list = await window.explorerApi.readDir(node.url)
            if (!list) {
                this.tree.removeNode(node.id)
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
        if (!list) {
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
        if (file.type === FileType.Directory) {
            this.dirContextMenu(ev, file.url)
        } else {
            const operations = fileHandler.getOperations(file.url)
            contextMenu.open(PopMenuListHandler.create(operations), ev)
        }


        // if (/.db$/.test(file.name)) {
        //     contextMenu.open(
        //         PopMenuBuilder.create()
        //             .button('openErd', '打开 ER 图', () => {
        //                 tabControl.addTab(PageSqlErd.sqlite(file.url))
        //             })
        //             .button('openEditor', '打开 SQL 编辑器', () => {
        //                 tabControl.addTab(PageSqlEditor.create({
        //                     title: `查询窗口 [ ${file.name} ]`,
        //                     connection: { sqlite: file.url }
        //                 }))
        //             })
        //             .build(),
        //         ev
        //     )
        // }

        // if (/.run$/.test(file.name)) {
        //     contextMenu.open(
        //         PopMenuBuilder.create()
        //             .button('open', '打开', async () => {
        //                 // appTab.addTab(await PageRunner.create(file.url))
        //             })
        //             .build(),
        //         ev
        //     )
        // }
    }


    onDirChanged(dirUrl:string){
        const node = this.tree.data.find(v=>v.url === dirUrl)
        if(node){this.tree.reloadNode(node.id)}
    }

    dirContextMenu(ev: MouseEvent, dirUrl: string) {
        contextMenu.open(
            PopMenuBuilder.create()
                .button('createFile', '新建文件', async () => {
                    this.newFile(dirUrl)
                })
                .build(),
            ev
        )
    }

    async newFile(dirUrl: string) {
        const list = (await window.explorerApi.getFileTemplates()).map(template=>({
            key:nanoid(),
            label:template.name,
            ...template
        }))

        const input = ref<{
            template: typeof list ['0'] | null,name: string;
        }>({
            template: null, name: ''
        })

        const ext = computed(() => {
            return input.value?.template?.ext || ''
        })


        const submit = async ()=>{

            if(!input.value.template){return}
            if(!input.value.name){return}

            const fileName = `${input.value.name}${ext.value}`
            const templateUrl = input.value.template.url

            await window.explorerApi.createFileFromTemplate(fileName, templateUrl,dirUrl)
            removeFile()
        }


        const content: ModalContent = {
            key: nanoid(),
            title: '新建文件',
            content: <div style="min-width: 240px;">
                {/* {dirUrl.split('/').pop()}
                <button onClick={() => this.newFile(dirUrl)}>新建文件</button> */}
                <VxSelector
                    options={list}
                    v-bind:modelValue={input.value.template}
                    placeholder="选择模板"
                    onUpdate:model-value={(v) => {
                        console.log(v)
                        input.value.template = v
                    }}
                    mounted={el=>{ 
                        input.value.template = list[0]
                        el.focus() 
                    }}
                    ref={el=>{console.log({el})}}
                ></VxSelector>
                <div style="height:16px"></div>
                <VxInput
                    v-bind:modelValue={input.value.name}
                    placeholder="文件名"
                    onUpdate:model-value={(v) => {
                        input.value.name = v
                    }}

                    v-slots={{
                        suffix: () => [
                            <span style="padding-right:4px">{ext.value}</span>,
                            <VxButton only-icon icon='clear' click={() => removeFile()}></VxButton>,
                            <VxButton only-icon icon='done' click={() => submit()}></VxButton>,
                        ]
                    }}
                >
                </VxInput>
            </div>
        }

        const removeFile = () => {
            this.sider.modal.remove(content.key)
        }
        this.sider.modal.push(content)
    }
}


