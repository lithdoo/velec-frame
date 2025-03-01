import { JthComponent } from "./JthState"
import { JthViewCondition, JthViewElement, JthViewFragment, JthViewLoop, JthViewNode, JthViewText, Mut } from "./JthViewNode"

export type ValueGeneratorRef = {
  ['_VALUE_GENERATOR_REFERENCE_']: string
}

export enum JthTemplateType {
  Apply = 'Apply',
  Element = 'Element',
  Text = 'Text',
  Cond = 'Cond',
  Loop = 'Loop',
  Prop = 'Prop',
  Root = 'Root'
}

export type JthTemplateBase<T extends JthTemplateType> = {
  readonly id: string
  type: T
  isGroup: boolean
}

export type JthTemplateGroup<T extends JthTemplateType> = JthTemplateBase<T> & {
  type: T
  isGroup: true
}

export type ValueField = {
  name: string
  value: ValueGeneratorRef
}

export type JthTemplateElement = JthTemplateGroup<JthTemplateType.Element> & {
  tagName: string
  attrs: ValueField[]
}

export type JthTemplateRoot = JthTemplateGroup<JthTemplateType.Root> & {
  props: string[]
}

export type JthTemplateText = JthTemplateBase<JthTemplateType.Text> & {
  text: ValueGeneratorRef
  isGroup: false
}

export type JthTemplateCond = JthTemplateGroup<JthTemplateType.Cond> & {
  test: ValueGeneratorRef
}

export type JthTemplateApply = JthTemplateBase<JthTemplateType.Apply> & {
  component: ValueGeneratorRef
  isGroup: false
  data: ValueField[]
}

export type JthTemplateLoop = JthTemplateGroup<JthTemplateType.Loop> & {
  loopValue: ValueGeneratorRef
  valueField: string
  indexField: string
}

export type JthTemplateProp = JthTemplateGroup<JthTemplateType.Prop> & {
  data: ValueField[]
}

export type JthTemplate =
  | JthTemplateProp
  | JthTemplateLoop
  | JthTemplateApply
  | JthTemplateCond
  | JthTemplateText
  | JthTemplateElement
  | JthTemplateRoot



abstract class JthRenderScope {
  abstract children(): JthRenderScope
  abstract add(trans: { key: string, value: any }[]): JthRenderScope
}


abstract class JthComponentNode {
  constructor(
    public readonly template_node: {
      [key: string]: JthTemplate
    },

    public readonly template_tree: {
      [key: string]: string[]
    },
    public component: JthComponent
  ) { }

  abstract getValue(ref: ValueGeneratorRef, scope: JthRenderScope): Mut<any>
  abstract getObjValue(data: ValueField[], scope: JthRenderScope): Mut<{ [key: string]: any }>

  renderRoot(scope: JthRenderScope) {
    const { rootId } = this.component
    const node = this.template_node[rootId]
    if (!node)
      throw new Error('error root id!')
    if (node.type !== JthTemplateType.Root)
      throw new Error('error root id!')

    return this.renderChildren(rootId, scope)
  }

  private render(id: string, scope: JthRenderScope): JthViewNode {
    const node = this.template_node[id]
    if (!node)
      throw new Error('error node id!')

    if (node.type === JthTemplateType.Text) {
      const text = this.getValue(node.text, scope)
      const vnode = new JthViewText(text)
      return vnode
    }

    if (node.type === JthTemplateType.Element) {
      const tagName = node.tagName
      const attrs = this.getObjValue(node.attrs, scope)
      const children = this.renderChildren(id, scope)
      const vnode = new JthViewElement(tagName, attrs, children)
      return vnode
    }

    if (node.type === JthTemplateType.Cond) {
      const test = this.getValue(node.test, scope)
      const render = () => this.renderChildren(id, scope)
      const vnode = new JthViewCondition(test, render)
      return vnode
    }

    if (node.type === JthTemplateType.Loop) {
      const list = this.getValue(node.loopValue, scope)
      const render = (val: unknown, idx: number) => this.renderChildren(
        id, scope.add([
          { key: node.indexField, value: idx },
          { key: node.valueField, value: val }
        ])
      )
      const vnode = new JthViewLoop(list, render)
      return vnode
    }

    if (node.type === JthTemplateType.Prop) {
      // todo
    }

    if (node.type === JthTemplateType.Apply) {
      // todo
    }

    throw new Error('unknown node type')
  }


  renderChildren(id: string, scope: JthRenderScope): JthViewFragment {
    const childIds = this.template_tree[id] ?? []
    const children = childIds.map(v => this.render(id, scope.children()))
    const fragment = new JthViewFragment(new Mut(children))
    return fragment
  }
}