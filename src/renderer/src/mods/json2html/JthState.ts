import { nanoid } from 'nanoid'
import {
  JthTemplate,
  JthTemplateBase,
  JthTemplateGroup,
  JthTemplateRoot,
  JthTemplateType,
  ValueGeneratorRef
} from './JthTemplate'

export type JthComponent = {
  keyName: string
  rootId: string
  testJson: { name: string, json: string }[]
  testDefaultJson: string
}

export type ValueGenerator =
  | {
    type: 'static'
    json: string
  }
  | {
    type: 'dynamic:script'
    script: string
  }
  | {
    type: 'dynamic:getter'
    getter: string[]
  }

export const isValueGeneratorRef = (x: any): x is ValueGeneratorRef => {
  return x?._VALUE_GENERATOR_REFERENCE_ !== undefined
}

export type JthFile = {
  vg_store: {
    [key: string]: ValueGenerator
    ['null']: ValueGenerator
    ['blank_string']: ValueGenerator
    ['empty_array']: ValueGenerator
    ['empty_object']: ValueGenerator
    ['true']: ValueGenerator
    ['false']: ValueGenerator
  }

  template_node: {
    [key: string]: JthTemplate
  }

  template_tree: {
    [key: string]: string[]
  }

  components: JthComponent[]
}

export class Snapshot<T> {
  old: T[] = []
  idx: number = -1

  constructor(public lastest: T) { }

  current() {
    const old = this.old[this.idx]
    return old ?? this.lastest
  }

  update(updateFn: (current: T) => T | void) {
    const old = this.old[this.idx]
    if (!old) {
      this.old = [JSON.parse(JSON.stringify(this.lastest))].concat(this.old)
      const res = updateFn(this.lastest)
      this.lastest = res ?? this.lastest
    } else {
      this.old = this.old.filter((_, i) => i <= this.idx)
      this.idx = -1
      this.lastest = old
      const res = updateFn(this.lastest)
      this.lastest = res ?? this.lastest
    }
  }
}

export type Tree = {
  [key: string]: string[]
}

// 控制所有关于数据的修改操作
export class JthState {
  static blank() {
    const blankFile: JthFile = {
      components: [],
      template_node: {},
      template_tree: {},
      vg_store: {
        ['null']: JthStateController.staticValue('null'),
        ['blank_string']: JthStateController.staticValue('blank_string'),
        ['empty_array']: JthStateController.staticValue('empty_array'),
        ['empty_object']: JthStateController.staticValue('empty_object'),
        ['true']: JthStateController.staticValue('true'),
        ['false']: JthStateController.staticValue('false')
      }
    }
    const state = new JthState()
    state.reload(blankFile)
    return state
  }

  static getNodeVgRefs(node: JthTemplate): ValueGeneratorRef[] {
    if (node.type === JthTemplateType.Apply) {
      return [node.component, ...node.data.map((v) => v.value)]
    } else if (node.type === JthTemplateType.Cond) {
      return [node.test]
    }
    if (node.type === JthTemplateType.Element) {
      return [...node.attrs.map((v) => v.value)]
    }
    if (node.type === JthTemplateType.Loop) {
      return [node.loopValue]
    }
    if (node.type === JthTemplateType.Prop) {
      return [...node.data.map((v) => v.value)]
    }
    if (node.type === JthTemplateType.Root) {
      return []
    }
    if (node.type === JthTemplateType.Text) {
      return [node.text]
    }
    return []
  }

  constructor() { }

  private snapNodes: Map<string, Snapshot<JthTemplate>> = new Map()
  private snapTree: Snapshot<Tree> = new Snapshot({})
  components: JthComponent[] = []
  vg_store: { [key: string]: ValueGenerator } = {}

  reload(file: JthFile) {
    this.snapNodes = new Map()
    Array.from(Object.values(file.template_node)).forEach((node) => {
      this.snapNodes.set(node.id, new Snapshot(node))
    })
    this.snapTree = new Snapshot(file.template_tree)
    this.components = file.components
    this.vg_store = file.vg_store
  }

  // get file() {
  //     const snapshot = this.snapshot[this.currentSnapshotIndex]
  //     return snapshot ?? this.current
  // }

  fileContent() {
    const components: JthFile['components'] = this.components
    const vg_store: JthFile['vg_store'] = {
      ['null']: this.vg_store['null'],
      ['blank_string']: this.vg_store['blank_string'],
      ['empty_array']: this.vg_store['empty_array'],
      ['empty_object']: this.vg_store['empty_object'],
      ['true']: this.vg_store['true'],
      ['false']: this.vg_store['false']
    }
    const template_node: JthFile['template_node'] = {}
    const template_tree: JthFile['template_tree'] = {}

    const tree = this.snapTree.current()
    let todo: string[] = this.components.map((v) => v.rootId)

    while (todo.length > 0) {
      const id = todo.pop()
      if (!id) continue
      const children = tree[id]
      const snapshot = this.snapNodes.get(id)
      if (!snapshot) throw new Error('no snapshot')

      if (children) {
        template_tree[id] = children.map((v) => v)
        todo = children.concat(todo)
      }

      const node = snapshot.current()
      template_node[id] = node
      const refs = JthState.getNodeVgRefs(node)
      refs.forEach((ref) => {
        if (vg_store[ref['_VALUE_GENERATOR_REFERENCE_']]) {
          return
        }
        if (!this.vg_store[ref['_VALUE_GENERATOR_REFERENCE_']]) {
          throw new Error('no vg')
        }
        vg_store[ref['_VALUE_GENERATOR_REFERENCE_']] =
          this.vg_store[ref['_VALUE_GENERATOR_REFERENCE_']]
      })
    }

    const file: JthFile = {
      vg_store,
      template_node,
      template_tree,
      components
    }

    return file

    // export type JthFile = {
    //     vg_store: {
    //         [key: string]: ValueGenerator,
    //         ['null']: ValueGenerator,
    //         ["blank_string"]: ValueGenerator,
    //         ["empty_array"]: ValueGenerator,
    //         ["empty_object"]: ValueGenerator,
    //         ['true']: ValueGenerator,
    //         ['false']: ValueGenerator,
    //     },

    //     template_node: {
    //         [key: string]: JthTemplate
    //     }

    //     template_tree: {
    //         [key: string]: string[]
    //     }

    //     components: JthComponent[]
    // }
  }

  // updateVG(ref: ValueGeneratorRef, value: ValueGenerator) {
  //     const refKey = ref._VALUE_GENERATOR_REFERENCE_
  //     if (!this.file.vg_store[refKey]) {
  //         throw new Error(`ValueGeneratorRef ${refKey} not found`)
  //     }
  // }

  updateTemplate() { }

  insertNode(node: JthTemplate) {
    if (this.snapNodes.has(node.id)) {
      throw new Error(`Node ${node.id} is exist!!!`)
    }
    this.snapNodes.set(node.id, new Snapshot(node))
  }

  updateNode<T extends JthTemplate>(id: string, updateFn: (node: T) => void) {
    const snapshot = this.snapNodes.get(id)
    if (!snapshot) {
      throw new Error(`Node ${id} not found!!!`)
    }
    snapshot.update(updateFn as any)
  }

  updateTree(updateFn: (tree: Tree) => void) {
    this.snapTree.update(updateFn)
  }

  hasNode(id: string) {
    return this.snapNodes.has(id)
  }

  tree() {
    return this.snapTree.current()
  }

  node(id: string) {
    const node = this.snapNodes.get(id)
    if (!node) {
      throw new Error(`Node ${id} not found!!!`)
    }
    return node.current()
  }

  children(id: string) {
    return this.snapTree.current()[id] ?? []
  }

  allChildren() {
    return Array.from(Object.entries(this.snapTree.current()))
  }
}

// State 对外的业务接口
export class JthStateController {
  static staticValueRef(
    input: 'null' | 'blank_string' | 'empty_array' | 'empty_object' | 'true' | 'false'
  ): ValueGeneratorRef {
    return { ['_VALUE_GENERATOR_REFERENCE_']: input }
  }

  static staticValue(
    input: 'null' | 'blank_string' | 'empty_array' | 'empty_object' | 'true' | 'false'
  ): ValueGenerator {
    switch (input) {
      case 'null':
        return { type: 'static', json: 'null' }
      case 'blank_string':
        return { type: 'static', json: '""' }
      case 'empty_array':
        return { type: 'static', json: '[]' }
      case 'empty_object':
        return { type: 'static', json: '{}' }
      case 'true':
        return { type: 'static', json: 'true' }
      case 'false':
        return { type: 'static', json: 'false' }
      default:
        throw new Error(`Unknown static value ref: ${input}`)
    }
  }

  static isGroup(
    template: JthTemplateBase<any> | JthTemplateGroup<any>
  ): template is JthTemplateGroup<any> {
    return !!(template as JthTemplateGroup<any>).isGroup
  }

  static createBlankNode(type: JthTemplateType) {
    let node: JthTemplate | null = null
    if (type === JthTemplateType.Root) {
      node = {
        id: nanoid(),
        type,
        isGroup: true,
        props: []
      }
    } else if (type === JthTemplateType.Text) {
      node = {
        id: nanoid(),
        type,
        isGroup: false,
        text: JthStateController.staticValueRef('blank_string')
      }
    } else if (type === JthTemplateType.Element) {
      node = {
        id: nanoid(),
        type,
        isGroup: true,
        tagName: 'div',
        attrs: []
      }
    } else if (type === JthTemplateType.Apply) {
      node = {
        id: nanoid(),
        type,
        isGroup: false,
        data: [],
        component: JthStateController.staticValueRef('null')
      }
    } else if (type === JthTemplateType.Loop) {
      node = {
        id: nanoid(),
        type,
        isGroup: true,
        loopValue: JthStateController.staticValueRef('empty_array'),
        valueField: 'value',
        indexField: 'index'
      }
    } else if (type === JthTemplateType.Prop) {
      node = {
        id: nanoid(),
        type,
        isGroup: true,
        data: []
      }
    } else if (type === JthTemplateType.Cond) {
      node = {
        id: nanoid(),
        type,
        isGroup: true,
        test: JthStateController.staticValueRef('true')
      }
    }

    if (!node) {
      throw new Error('Unknown template type')
    } else return node
  }

  constructor(public state: JthState) { }

  newComponent(keyName: string) {
    const root: JthTemplateRoot = {
      id: nanoid(),
      type: JthTemplateType.Root,
      isGroup: true,
      props: []
    }

    this.state.components.push({ keyName, rootId: root.id, testJson: [], testDefaultJson: '' })
    this.state.insertNode(root)
  }

  removeComponent(keyName: string) {
    const component = this.state.components.find((v) => v.keyName === keyName)
    if (!component) return
    this.state.components = this.state.components.filter((v) => v.keyName !== keyName)
    // this.removeTemplateNode(component.rootId)
  }

  insertTemplateNode(
    template: JthTemplate,
    pos: { parent?: string; before?: string; after?: string } = {}
  ) {
    if (this.state.hasNode(template.id)) {
      throw new Error('Node already exists')
    }
    const parent = pos.parent ? this.state.node(pos.parent) : undefined
    const before = pos.before ? this.state.node(pos.before) : undefined
    const after = pos.after ? this.state.node(pos.after) : undefined

    if (before) {
      let hasInsert = false
      this.state.updateTree((tree) => {
        const all = [...Object.entries(tree)]
        all.forEach(([id, children]) => {
          if (hasInsert) return
          if (children.findIndex((v) => v === before.id) < 0) return
          const newChildren = children.flatMap((id) =>
            id === before.id ? [template.id, id] : [id]
          )
          tree[id] = newChildren
          hasInsert = true
        })
      })
      if (hasInsert) {
        this.state.insertNode(template)
      }
    } else if (after) {
      let hasInsert = false
      this.state.updateTree((tree) => {
        const all = [...Object.entries(tree)]
        all.forEach(([id, children]) => {
          if (hasInsert) return
          if (children.findIndex((v) => v === after.id) < 0) return
          const newChildren = children.flatMap((id) => (id === after.id ? [id, template.id] : [id]))
          tree[id] = newChildren
          hasInsert = true
        })
      })
      if (hasInsert) {
        this.state.insertNode(template)
      }
    } else if (parent) {
      let hasInsert = false
      this.state.updateTree((tree) => {
        const old = tree[parent.id] ?? []
        const newChildren = [...old, template.id]
        tree[parent.id] = newChildren
        hasInsert = true
      })
      if (hasInsert) {
        this.state.insertNode(template)
      }
    }
  }

  removeTNode(templateId: string) {
    this.state.updateTree((tree) => {
      const all = [...Object.entries(tree)]
      all.forEach(([id, children]) => {
        if (children.findIndex((v) => v === templateId) < 0) return
        const newChildren = children.filter((v) => v !== templateId)
        tree[id] = newChildren
      })
      delete tree[templateId]
    })
  }

  updateTNode<T extends JthTemplate = JthTemplate>(newone: T) {
    this.state.updateNode(newone.id, () => {
      return newone
    })
  }

  getVG(ref: ValueGeneratorRef) {
    return this.state.vg_store[ref._VALUE_GENERATOR_REFERENCE_]
  }

  newVG(vg: ValueGenerator): ValueGeneratorRef {
    const id = nanoid()
    this.state.vg_store[id] = vg
    return { _VALUE_GENERATOR_REFERENCE_: id }
  }

  getTNodeChildren(id: string) {
    const node = this.state.node(id)
    if (!JthStateController.isGroup(node)) return []
    else return this.state.children(id)
  }

  getTNode(id: string) {
    return this.state.node(id)
  }

  findParentId(templateId: string) {
    const todo = [...Object.entries(this.state.tree())]

    while (todo.length) {
      const current = todo.shift()
      if (!current) continue
      const [pid, children] = current
      if (children.findIndex((id) => id === templateId) < 0) continue
      return pid
    }

    return null
  }

  allComponents() {
    return this.state.components
  }

  getTemplateTreeByParentId(rootId: string) {
    const tree: {
      id: string
      pid: string
      templateData: JthTemplate
    }[] = []

    const table = this.state.tree()

    const todo = (table[rootId] ?? []).map((id) => ({ id, pid: rootId }))

    while (todo.length) {
      const current = todo.shift()
      if (!current) continue
      const { id, pid } = current
      const templateData = this.state.node(id)

      if (!templateData) continue
      tree.push({ id, pid, templateData })

      if (!JthStateController.isGroup(templateData)) continue
      const children = this.state.children(id)?.map((cid) => ({ id: cid, pid: id })) ?? []
      if (children.length) todo.push(...children)
    }
    return tree
  }
}
