import { fixReactive } from "@renderer/fix"
import { contextMenu } from "@renderer/parts/GlobalContextMenu"
import { FlatTreeHandler, FlatTreeItem } from "@renderer/widgets/FlatTree"
import { PopMenuBuilder } from "@renderer/widgets/PopMenu"
import { nanoid } from "nanoid"
import { JthComponent, JthTemplate, JthStateModel, JthTemplateElement, JthTemplateType } from "../JthState"

export class TemplateTreeHandler {
    static all = new WeakMap<JthComponent, TemplateTreeHandler>()

    id = nanoid()
    flatTree = fixReactive(new FlatTreeHandler<FlatTreeItem & { templateData: JthTemplate }>())
    showDetailTemplateId: string | null = null

    static create(
        model: JthStateModel,
        component: JthComponent,
    ) {
        const tree = new TemplateTreeHandler(model, component)
        const t = fixReactive(tree)
        t.init()
        TemplateTreeHandler.all.set(component, t)
        return t
    }
    constructor(
        public model: JthStateModel,
        public component: JthComponent,
    ) {
        this.reload()

    }

    init() {
        this.flatTree.onItemContextMenu = (item, ev) => {

            console.log(item)
            let builder = PopMenuBuilder.create()

            const node: JthTemplateElement = {
                id: nanoid(),
                type: JthTemplateType.Element,
                tagName: 'div',
                attrs: {},
                isGroup: true,
            }

            const addChildrenAfterEach = () => {
                this.model.component.insertTemplateNode(node, { parent: item.templateData.id })
                this.reload()
                this.flatTree.open(item.id)
                this.flatTree.select(node.id)
            }
            const addChildrenBeforeEach = () => {
                const before = this.model.component.templateChildren(item.templateData.id)[0]
                if (!before) addChildrenAfterEach()
                else this.model.component.insertTemplateNode(node, { before })
                this.reload()
                this.flatTree.open(item.id)
                this.flatTree.select(node.id)
            }

            const inserNodeBefore = () => {
                this.model.component.insertTemplateNode(node, { before: item.id })
                this.reload()
                this.flatTree.open(item.id)
                this.flatTree.select(node.id)

            }

            const insertNodeAfter = () => {
                this.model.component.insertTemplateNode(node, { after: item.id })
                this.reload()
                this.flatTree.open(item.id)
                this.flatTree.select(node.id)
            }

            if (item.templateData.isGroup) {
                builder = builder.button('addChildrenBeforeEach', '添加子节点于起首', addChildrenBeforeEach)
                builder = builder.button('addChildrenAfterEach', '添加子节点于末尾', addChildrenAfterEach)
            }

            builder = builder.button('addChildrenBeforeEach', '向前插入节点', inserNodeBefore)
            builder = builder.button('addChildrenAfterEach', '向后插入节点', insertNodeAfter)

            contextMenu.open(builder.build(), ev)
        }
        this.flatTree.onItemSelect = (item) => {
            this.detail(item.id)
        }
    }

    detail(id: string) {
        console.log('detail', id)
        this.showDetailTemplateId = this.showDetailTemplateId === id ? null : id
    }

    reload() {
        const tree = this.model.component
            .getTemplateTreeByParentId(this.component.rootId)
            .map(item => ({
                ...item,
                loaded: true,
                isLeaf: !item.templateData.isGroup,
                pid: item.pid === this.component.rootId ? undefined : item.pid
            }))
        const groupId = new Set(tree.filter(v => !v.isLeaf).map(v => v.id))
        const itemId = new Set(tree.map(v => v.id))
        this.flatTree.data = tree
        this.flatTree.openKeys = this.flatTree.openKeys.filter(v => groupId.has(v))
        this.flatTree.selectedKeys = this.flatTree.selectedKeys.filter(v => itemId.has(v))
        console.log('template', this.model.state.file.template)
    }

    addTemplateToRoot() {
        console.log('addTemplateToRoot')
        this.model.component.insertTemplateNode({
            id: nanoid(),
            type: JthTemplateType.Element,
            tagName: 'div',
            attrs: {},
            isGroup: true,
        }, {
            parent: this.component.rootId,
        })

        this.reload()
    }
}



export class TemplateDetailHander<T extends JthTemplate> {

    static all = new WeakMap<JthTemplate, TemplateDetailHander<JthTemplate>>()

    static create(model: JthStateModel, templateId: string) {
        const template = model.component.templateData(templateId)

        if (!template) {
            throw new Error('template not found')
        }



        const handler = TemplateDetailHander.all.get(template)

        if(handler){
            return handler
        }else if(template.type === JthTemplateType.Element){
            return fixReactive(new TemplateDetailElementHander(template, model))
        }else{
            return fixReactive(new TemplateDetailHander(template, model))
        }
    }

    constructor(
        public target: T,
        public model: JthStateModel
    ) { }

    isGroup() {
        return this.target.isGroup
    }

    type() {
        return this.target.type
    }

    getChildren() {
        if (!this.isGroup()) return []
        return this.model.component.templateChildren(this.target.id)
            .map(id => this.model.component.templateData(id))
    }
}


export class TemplateDetailElementHander extends TemplateDetailHander<JthTemplateElement> {

    tagName(){
        return this.target.tagName
    }

}