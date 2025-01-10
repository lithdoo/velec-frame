import { fixReactive } from "@renderer/fix"
import { contextMenu } from "@renderer/parts/GlobalContextMenu"
import { FlatTreeHandler, FlatTreeItem } from "@renderer/widgets/FlatTree"
import { PopMenuBuilder } from "@renderer/widgets/PopMenu"
import { nanoid } from "nanoid"
import { JthComponent, JthTemplate, JthStateModel, JthTemplateElement, JthTemplateType, ValueGenerator, JthComponentHandler, ValueField, JthTemplateProp, JthTemplateApply, JthTemplateText, JthTemplateCond, JthTemplateLoop } from "../JthState"

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
                attrs: [],
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
            attrs: [],
            isGroup: true,
        }, {
            parent: this.component.rootId,
        })

        this.reload()
    }
}



export class TemplateDetailHandler<T extends JthTemplate> {

    static all = new WeakMap<JthTemplate, TemplateDetailHandler<JthTemplate>>()

    static create(model: JthStateModel, templateId: string) {
        const template = model.component.templateData(templateId)

        if (!template) {
            throw new Error('template not found')
        }



        const handler = TemplateDetailHandler.all.get(template)

        if (handler) {
            return handler
        } else if (template.type === JthTemplateType.Element) {
            return fixReactive(new TemplateDetailElementHandler(template, model))
        } else if (template.type === JthTemplateType.Prop) {
            return fixReactive(new TemplateDetailPropHandler(template, model))
        } else if (template.type === JthTemplateType.Apply) {
            return fixReactive(new TemplateDetailApplyHandler(template, model))
        } else if (template.type === JthTemplateType.Text) {
            return fixReactive(new TemplateDetailTextHandler(template, model))
        } else if (template.type === JthTemplateType.Cond) {
            return fixReactive(new TemplateDetailCondHandler(template, model))
        } else if (template.type === JthTemplateType.Loop) {
            return fixReactive(new TemplateDetailLoopHandler(template, model))
        } else {
            return fixReactive(new TemplateDetailHandler(template, model))
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


export class TemplateDetailElementHandler extends TemplateDetailHandler<JthTemplateElement> {

    tagName() {
        return this.target.tagName
    }
    attrs() {
        return this.target.attrs
    }

    addField() {
        const target = this.target
        const attrs = target.attrs
        const newAttrs: ValueField[] = [{
            name: 'field',
            value: JthComponentHandler.staticValue('null')
        }].concat(attrs)

        this.model.component.templateData(this.target.id, {
            ...this.target,
            attrs: newAttrs
        })

        this.reload()
    }


    reload() {
        const newone = this.model.component.templateData(this.target.id)
        console.log('newone', newone)
        if (newone.type !== JthTemplateType.Element) throw new Error('not element')
        this.target = newone
    }

}


export class TemplateDetailApplyHandler extends TemplateDetailHandler<JthTemplateApply> {



    data() {
        return this.target.data
    }

    addField() {
        const target = this.target
        const data = target.data
        const newAttrs: ValueField[] = [{
            name: 'field',
            value: JthComponentHandler.staticValue('null')
        }].concat(data)

        this.model.component.templateData(this.target.id, {
            ...this.target,
            data: newAttrs
        })

        this.reload()
    }

    setComponent(t: ValueGenerator) {
        this.target.component = t
    }


    reload() {
        const newone = this.model.component.templateData(this.target.id)
        console.log('newone', newone)
        if (newone.type !== JthTemplateType.Apply) throw new Error('not prop')
        this.target = newone
    }

}

export class TemplateDetailPropHandler extends TemplateDetailHandler<JthTemplateProp> {


    data() {
        return this.target.data
    }

    addField() {
        const target = this.target
        const data = target.data
        const newAttrs: ValueField[] = [{
            name: 'field',
            value: JthComponentHandler.staticValue('null')
        }].concat(data)

        this.model.component.templateData(this.target.id, {
            ...this.target,
            data: newAttrs
        })

        this.reload()
    }


    reload() {
        const newone = this.model.component.templateData(this.target.id)
        console.log('newone', newone)
        if (newone.type !== JthTemplateType.Prop) throw new Error('not prop')
        this.target = newone
    }

}


export class TemplateDetailTextHandler extends TemplateDetailHandler<JthTemplateText> {

    setText(t: ValueGenerator) {
        this.target.text = t
    }

    reload() {
        const newone = this.model.component.templateData(this.target.id)
        if (newone.type !== JthTemplateType.Text) throw new Error('not prop')
        this.target = newone
    }

}



export class TemplateDetailCondHandler extends TemplateDetailHandler<JthTemplateCond> {

    setTest(t: ValueGenerator) {
        this.target.test = t
    }

    reload() {
        const newone = this.model.component.templateData(this.target.id)
        if (newone.type !== JthTemplateType.Cond) throw new Error('not prop')
        this.target = newone
    }

}

export class TemplateDetailLoopHandler extends TemplateDetailHandler<JthTemplateLoop> {

    setLoopValue(t: ValueGenerator) {
        this.target.loopValue = t
    }

    reload() {
        const newone = this.model.component.templateData(this.target.id)
        if (newone.type !== JthTemplateType.Loop) throw new Error('not prop')
        this.target = newone
    }

}




export abstract class BaseEditorHandler<T> {
    options: { key: ValueGenerator['type'], label: string, target: ValueGenerator }[] = []
    currentValue: { key: ValueGenerator['type'], label: string, target: ValueGenerator } | null = null

    target: T | null = null


    beginEdit(t: T) {
        this.target = t
        const old = this.getVG(t)


        this.options = [
            {
                key: 'static', label: 'Static',
                target: old.type === 'static'
                    ? JSON.parse(JSON.stringify(old))
                    : { type: 'static', json: '' }
            },
            {
                key: 'dynamic:getter', label: 'Getter',
                target: old.type === 'dynamic:getter'
                    ? JSON.parse(JSON.stringify(old))
                    : { type: 'dynamic:getter', getter: [] }
            },
            {
                key: 'dynamic:script', label: 'Script',
                target: old.type === 'dynamic:script'
                    ? JSON.parse(JSON.stringify(old))
                    : { type: 'dynamic:script', script: '' }
            },
        ]


        this.currentValue = this.options.find(o => o.key === old.type) ?? null

    }

    submitEdit() {
        if (!this.target) return
        if (!this.currentValue) return
        this.setVG(this.currentValue.target)
        this.cancelEdit()
    }

    cancelEdit() {
        this.target = null
    }


    abstract getVG(t: T): ValueGenerator
    abstract setVG(t: ValueGenerator): void

}


export abstract class ValueEditorHandler extends BaseEditorHandler<ValueGenerator> {

    getVG(t: ValueGenerator): ValueGenerator {
        return JSON.parse(JSON.stringify(t))
    }

    setVG(t: ValueGenerator) {
        return this.onSubmit(t)
    }

    abstract onSubmit(t: ValueGenerator): void
}

export class FieldEditorHandler extends BaseEditorHandler<ValueField> {
    currentName: string = ''
    target: ValueField | null = null

    getVG(t: ValueField): ValueGenerator {
        const old: ValueGenerator = JSON.parse(JSON.stringify(t.value))
        return old
    }

    setVG(vg: ValueGenerator) {
        if (!this.target) return
        this.target.value = vg
    }

    beginEdit(filed: ValueField) {
        this.target = filed
        const old: ValueGenerator = JSON.parse(JSON.stringify(filed.value))

        this.options = [
            {
                key: 'static', label: 'Static',
                target: old.type === 'static'
                    ? JSON.parse(JSON.stringify(old))
                    : { type: 'static', json: '' }
            },
            {
                key: 'dynamic:getter', label: 'Getter',
                target: old.type === 'dynamic:getter'
                    ? JSON.parse(JSON.stringify(old))
                    : { type: 'dynamic:getter', getter: [] }
            },
            {
                key: 'dynamic:script', label: 'Script',
                target: old.type === 'dynamic:script'
                    ? JSON.parse(JSON.stringify(old))
                    : { type: 'dynamic:script', script: '' }
            },
        ]

        this.currentValue = this.options.find(o => o.key === old.type) ?? null
        this.currentName = filed.name
    }

    submitEdit() {
        if (!this.target) return
        if (!this.currentName) return
        if (!this.currentValue) return
        this.target.name = this.currentName
        super.submitEdit()
    }
}