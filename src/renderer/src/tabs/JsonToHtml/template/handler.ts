import { fixReactive } from '@renderer/fix'
import { contextMenu } from '@renderer/parts/GlobalContextMenu'
import { FlatTreeHandler, FlatTreeItem } from '@renderer/widgets/FlatTree'
import { PopMenuBuilder } from '@renderer/widgets/PopMenu'
import { nanoid } from 'nanoid'
import {
  JthComponent,
  JthTemplate,
  JthStateController,
  JthTemplateElement,
  JthTemplateType,
  ValueGenerator,
  ValueField,
  JthTemplateProp,
  JthTemplateApply,
  JthTemplateText,
  JthTemplateCond,
  JthTemplateLoop,
  ValueGeneratorRef
} from '../common'

export class TemplateTreeHandler {
  static all = new WeakMap<JthComponent, TemplateTreeHandler>()

  id = nanoid()
  flatTree = fixReactive(new FlatTreeHandler<FlatTreeItem & { templateData: JthTemplate }>())
  showDetailTemplateId: string | null = null

  static create(controller: JthStateController, component: JthComponent) {
    const tree = new TemplateTreeHandler(controller, component)
    const t = fixReactive(tree)
    t.init()
    TemplateTreeHandler.all.set(component, t)
    return t
  }
  constructor(
    public controller: JthStateController,
    public component: JthComponent
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
        isGroup: true
      }

      const addChildrenAfterEach = () => {
        this.controller.insertTemplateNode(node, { parent: item.templateData.id })
        this.reload()
        this.flatTree.open(item.id)
        this.flatTree.select(node.id)
      }
      const addChildrenBeforeEach = () => {
        const before = this.controller.getTNodeChildren(item.templateData.id)[0]
        if (!before) addChildrenAfterEach()
        else this.controller.insertTemplateNode(node, { before })
        this.reload()
        this.flatTree.open(item.id)
        this.flatTree.select(node.id)
      }

      const inserNodeBefore = () => {
        this.controller.insertTemplateNode(node, { before: item.id })
        this.reload()
        this.flatTree.open(item.id)
        this.flatTree.select(node.id)
      }

      const insertNodeAfter = () => {
        this.controller.insertTemplateNode(node, { after: item.id })
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
    const tree = this.controller.getTemplateTreeByParentId(this.component.rootId).map((item) => ({
      ...item,
      loaded: true,
      isLeaf: !item.templateData.isGroup,
      pid: item.pid === this.component.rootId ? undefined : item.pid
    }))
    const groupId = new Set(tree.filter((v) => !v.isLeaf).map((v) => v.id))
    const itemId = new Set(tree.map((v) => v.id))
    this.flatTree.data = tree
    this.flatTree.openKeys = this.flatTree.openKeys.filter((v) => groupId.has(v))
    this.flatTree.selectedKeys = this.flatTree.selectedKeys.filter((v) => itemId.has(v))
  }

  addTemplateToRoot() {
    console.log('addTemplateToRoot')
    this.controller.insertTemplateNode(
      {
        id: nanoid(),
        type: JthTemplateType.Element,
        tagName: 'div',
        attrs: [],
        isGroup: true
      },
      {
        parent: this.component.rootId
      }
    )

    this.reload()
  }

  treeText(template: JthTemplate) {
    const renderValue = (vgf: ValueGeneratorRef) => {
      const vg = this.controller.getVG(vgf)
      if (!vg) return ''

      if (vg.type === 'static') {
        return `[${vg.type}]: ${vg.json}`
      }
      if (vg.type === 'dynamic:getter') {
        return `[${vg.type}]: ${vg.getter.join('.')}`
      }
      if (vg.type === 'dynamic:script') {
        return `[${vg.type}]: ${vg.script}`
      }
      return ''
    }

    if (template.type === JthTemplateType.Element) {
      return `<${template.tagName} />`
    }

    if (template.type === JthTemplateType.Text) {
      return renderValue(template.text)
    }

    if (template.type === JthTemplateType.Apply) {
      return renderValue(template.component)
    }

    if (template.type === JthTemplateType.Cond) {
      return renderValue(template.test)
    }

    if (template.type === JthTemplateType.Loop) {
      return renderValue(template.loopValue)
    }

    if (template.type === JthTemplateType.Prop) {
      return template.data.map((v) => v.name).join(',')
    }

    return ''
  }
}

export class TemplateDetailHandler<T extends JthTemplate> {
  static all = new WeakMap<JthTemplate, TemplateDetailHandler<JthTemplate>>()

  static create(controller: JthStateController, templateId: string) {
    const template = controller.getTNode(templateId)

    if (!template) {
      throw new Error('template not found')
    }

    const handler = TemplateDetailHandler.all.get(template)

    if (handler) {
      return handler
    } else if (template.type === JthTemplateType.Element) {
      return fixReactive(new TemplateDetailElementHandler(template, controller))
    } else if (template.type === JthTemplateType.Prop) {
      return fixReactive(new TemplateDetailPropHandler(template, controller))
    } else if (template.type === JthTemplateType.Apply) {
      return fixReactive(new TemplateDetailApplyHandler(template, controller))
    } else if (template.type === JthTemplateType.Text) {
      return fixReactive(new TemplateDetailTextHandler(template, controller))
    } else if (template.type === JthTemplateType.Cond) {
      return fixReactive(new TemplateDetailCondHandler(template, controller))
    } else if (template.type === JthTemplateType.Loop) {
      return fixReactive(new TemplateDetailLoopHandler(template, controller))
    } else {
      return fixReactive(new TemplateDetailHandler(template, controller))
    }
  }

  constructor(
    public target: T,
    public controller: JthStateController
  ) {}

  isGroup() {
    return this.target.isGroup
  }

  type() {
    return this.target.type
  }

  getChildren() {
    if (!this.isGroup()) return []
    return this.controller
      .getTNodeChildren(this.target.id)
      .map((id) => this.controller.getTNode(id))
  }

  reload() {
    const newone = this.controller.getTNode(this.target.id)
    const currentType = this.target.type
    console.log('newone', newone)
    if (newone.type !== currentType) throw new Error('not same type')
    this.target = newone as T
  }
}

export class TemplateDetailElementHandler extends TemplateDetailHandler<JthTemplateElement> {
  tagName() {
    return this.target.tagName
  }
  attrs() {
    return this.target.attrs
  }

  addAttr() {
    const target = this.target
    const attrs = target.attrs
    const newAttrs: ValueField[] = [
      {
        name: 'field',
        value: JthStateController.staticValueRef('null')
      }
    ].concat(attrs)

    this.controller.updateTNode({
      ...this.target,
      attrs: newAttrs
    })

    this.reload()
  }

  updateAttr(old: ValueField, newone: ValueField) {
    const hasAttr = this.target.attrs.findIndex((attr) => attr === old) >= 0
    if (!hasAttr) throw new Error('no such attr')
    this.controller.updateTNode({
      ...this.target,
      attrs: this.target.attrs.map((attr) => (attr === old ? newone : attr))
    })
  }

  changeTagName(newName: string) {
    this.controller.updateTNode({
      ...this.target,
      tagName: newName
    })
    this.reload()
  }
}

export class TemplateDetailApplyHandler extends TemplateDetailHandler<JthTemplateApply> {
  data() {
    return this.target.data
  }

  addField() {
    const target = this.target
    const data = target.data
    const newAttrs: ValueField[] = [
      {
        name: 'field',
        value: JthStateController.staticValueRef('null')
      }
    ].concat(data)

    this.controller.updateTNode({
      ...this.target,
      data: newAttrs
    })

    this.reload()
  }

  updateAttr(old: ValueField, newone: ValueField) {
    const hasAttr = this.target.data.findIndex((attr) => attr === old) >= 0
    if (!hasAttr) throw new Error('no such attr')
    this.controller.updateTNode({
      ...this.target,
      data: this.target.data.map((attr) => (attr === old ? newone : attr))
    })
    this.reload()
  }

  setComponent(t: ValueGeneratorRef) {
    this.controller.updateTNode<JthTemplateApply>({
      ...this.target,
      component: t
    })
    this.reload()
  }
}

export class TemplateDetailPropHandler extends TemplateDetailHandler<JthTemplateProp> {
  data() {
    return this.target.data
  }

  addField() {
    const target = this.target
    const data = target.data
    const newAttrs: ValueField[] = [
      {
        name: 'field',
        value: JthStateController.staticValueRef('null')
      }
    ].concat(data)

    this.controller.updateTNode<JthTemplateProp>({
      ...this.target,
      data: newAttrs
    })

    this.reload()
  }

  updateAttr(old: ValueField, newone: ValueField) {
    const hasAttr = this.target.data.findIndex((attr) => attr === old) >= 0
    if (!hasAttr) throw new Error('no such attr')
    this.controller.updateTNode({
      ...this.target,
      data: this.target.data.map((attr) => (attr === old ? newone : attr))
    })
    this.reload()
  }
}

export class TemplateDetailTextHandler extends TemplateDetailHandler<JthTemplateText> {
  setText(t: ValueGeneratorRef) {
    this.controller.updateTNode<JthTemplateText>({
      ...this.target,
      text: t
    })
    this.reload()
  }
}

export class TemplateDetailCondHandler extends TemplateDetailHandler<JthTemplateCond> {
  setTest(t: ValueGeneratorRef) {
    this.controller.updateTNode<JthTemplateCond>({
      ...this.target,
      test: t
    })
    this.reload()
  }
}

export class TemplateDetailLoopHandler extends TemplateDetailHandler<JthTemplateLoop> {
  setLoopValue(t: ValueGeneratorRef) {
    this.controller.updateTNode<JthTemplateLoop>({
      ...this.target,
      loopValue: t
    })
    this.reload()
  }
}

export class ValueEditorHandler {
  options: { key: ValueGenerator['type']; label: string; target: ValueGenerator }[] = []
  currentValue: { key: ValueGenerator['type']; label: string; target: ValueGenerator } | null = null
  target: ValueGeneratorRef | null = null
  constructor(
    public controller: JthStateController,
    protected onChangeField: (oldone: ValueGeneratorRef, newone: ValueGeneratorRef) => void
  ) {}

  beginEdit(filed: ValueGeneratorRef) {
    this.target = filed
    const old: ValueGenerator = JSON.parse(JSON.stringify(this.controller.getVG(filed)))

    this.options = [
      {
        key: 'static',
        label: 'Static',
        target:
          old.type === 'static' ? JSON.parse(JSON.stringify(old)) : { type: 'static', json: '' }
      },
      {
        key: 'dynamic:getter',
        label: 'Getter',
        target:
          old.type === 'dynamic:getter'
            ? JSON.parse(JSON.stringify(old))
            : { type: 'dynamic:getter', getter: [] }
      },
      {
        key: 'dynamic:script',
        label: 'Script',
        target:
          old.type === 'dynamic:script'
            ? JSON.parse(JSON.stringify(old))
            : { type: 'dynamic:script', script: '' }
      }
    ]

    this.currentValue = this.options.find((o) => o.key === old.type) ?? null
  }

  submitEdit() {
    if (!this.target) return
    if (!this.currentValue) return

    const newone: ValueGeneratorRef = this.controller.newVG(this.currentValue.target)

    this.onChangeField(this.target, newone)
  }

  cancelEdit() {
    this.target = null
  }
}

export class FieldEditorHandler {
  options: { key: ValueGenerator['type']; label: string; target: ValueGenerator }[] = []
  currentValue: { key: ValueGenerator['type']; label: string; target: ValueGenerator } | null = null
  currentName: string = ''

  target: ValueField | null = null

  constructor(
    public controller: JthStateController,
    protected onChangeField: (oldone: ValueField, newone: ValueField) => void
  ) {}

  beginEdit(filed: ValueField) {
    this.target = filed
    const old: ValueGenerator = JSON.parse(JSON.stringify(this.controller.getVG(filed.value)))

    this.options = [
      {
        key: 'static',
        label: 'Static',
        target:
          old.type === 'static' ? JSON.parse(JSON.stringify(old)) : { type: 'static', json: '' }
      },
      {
        key: 'dynamic:getter',
        label: 'Getter',
        target:
          old.type === 'dynamic:getter'
            ? JSON.parse(JSON.stringify(old))
            : { type: 'dynamic:getter', getter: [] }
      },
      {
        key: 'dynamic:script',
        label: 'Script',
        target:
          old.type === 'dynamic:script'
            ? JSON.parse(JSON.stringify(old))
            : { type: 'dynamic:script', script: '' }
      }
    ]

    this.currentValue = this.options.find((o) => o.key === old.type) ?? null
    this.currentName = filed.name
  }

  submitEdit() {
    if (!this.target) return
    if (!this.currentName) return
    if (!this.currentValue) return

    const newone: ValueField = {
      name: this.currentName,
      value: this.controller.newVG(this.currentValue.target)
    }

    this.onChangeField(this.target, newone)
  }

  cancelEdit() {
    this.target = null
  }
}
