import { MutDomRender, MutValueHandler } from './dom'

export class MBaseValue<T> {
  private val: T
  onchangeCall: Map<Symbol, (t: T) => void> = new Map()
  constructor(def: T) {
    this.val = def
  }

  addListener(call: (t: T) => void): Symbol {
    const key = Symbol()
    this.onchangeCall.set(key, call)
    return key
  }

  removeListener(key: Symbol) {
    this.onchangeCall.delete(key)
  }

  setValue(t: T) {
    this.val = t
    Array.from(this.onchangeCall.values()).map((v) => v(this.val))
  }

  getValue() {
    return this.val
  }
}

export class MBaseWacher<T> extends MBaseValue<T> {
  static fromVal<T>(val: MayBeMBase<T>): MBaseWacher<T> {
    if (val instanceof MBaseValue) {
      return new MBaseWacher(() => val.getValue(), [val])
    } else {
      return new MBaseWacher(() => val, []) as unknown as MBaseWacher<T>
    }
  }

  fn: () => T
  cancel: (() => void)[]
  constructor(fn: () => T, list: MBaseValue<any>[]) {
    super(fn())
    this.fn = fn
    this.cancel = list.map((v) => {
      const key = v.addListener(() => {
        this.update()
      })
      return () => v.removeListener(key)
    })
  }

  update() {
    this.setValue(this.fn())
  }

  dispose() {
    this.cancel.forEach((v) => v())
  }
}

export class MBaseHandler implements MutValueHandler {
  isMutValue(value: unknown) {
    if (value instanceof MBaseValue) {
      return true
    } else {
      return false
    }
  }
  getRawValue<T>(value: MBaseValue<T>) {
    return value.getValue()
  }

  onValueChange<T>(value: MBaseValue<T>, onchange: () => void, callOnInit?: boolean) {
    const key = value.addListener(onchange)
    if (callOnInit) {
      onchange()
    }
    return () => value.removeListener(key)
  }
}

export type MayBeMBase<T> = MBaseValue<T> | T

type MayBeMBaseWatch<T> = MBaseWacher<T> | T

export abstract class MBaseRenderFragment {
  abstract readonly nodes: MBaseValue<Node[]>
  abstract dispose(): void
}

export abstract class MBaseRenderNode extends MBaseRenderFragment {
  abstract readonly node: Node
  abstract dispose(): void

  get nodes() {
    return new MBaseValue([this.node])
  }
}

type MBaseRenderInput = {
  text: MBaseValue<string>
  className: MBaseValue<string | string[]>
  style: MBaseValue<Partial<CSSStyleDeclaration>>
  attrStyle: MBaseValue<{ [key: string]: string | CSSStyleValue }>
  children: MBaseValue<Node[]>
}

type MBaseDomRender = MutDomRender<MBaseRenderInput>

export const mbaseDomRedner = new MutDomRender(new MBaseHandler())

export class MBaseElementRenderNode<T extends HTMLElement> extends MBaseRenderNode {
  render: MBaseDomRender
  watchers: MBaseWacher<unknown>[]
  node: T
  // created?: (node: T) => void

  constructor(
    render: MBaseDomRender,
    option: {
      node: T
      className: MayBeMBaseWatch<string | string[]>
      style: MayBeMBaseWatch<Partial<CSSStyleDeclaration>>
      attrStyle: MayBeMBaseWatch<{ [key: string]: string | CSSStyleValue }>
    }
  ) {
    super()
    const { className, style, attrStyle, node } = option

    this.render = render
    this.node = this.render.htmlElement(node, {
      className,
      style,
      attrStyle
    })

    this.watchers = [className, style, attrStyle].filter(
      (v) => v instanceof MBaseWacher
    ) as MBaseWacher<unknown>[]
  }

  dispose() {
    this.watchers.forEach((v) => v.dispose())
    this.render.disposeNode(this.node)
  }
}

export class MBaseParentRenderNode<T extends HTMLElement> extends MBaseRenderNode {
  render: MBaseDomRender
  target: MBaseElementRenderNode<T>
  // children: MBaseWacher<Node[]>
  children: MBaseGroupFragment

  constructor(
    render: MBaseDomRender,
    option: {
      target: MBaseElementRenderNode<T>
      children: MBaseGroupFragment
    }
  ) {
    super()
    const { target, children } = option

    this.target = target
    this.render = render
    this.children = children

    this.render.setChildren(this.target.node, this.children.nodes)
  }

  get node() {
    return this.target.node
  }

  dispose() {
    this.children.dispose()
    this.render.disposeNode(this.target.node)
  }
}

export class MBaseTextRenderNode extends MBaseRenderNode {
  render: MBaseDomRender
  watchers: MBaseWacher<any>[]
  node: Text

  constructor(render: MBaseDomRender, option: { content: MBaseWacher<string> }) {
    super()
    this.render = render
    this.watchers = [option.content]
    this.node = this.render.textNode(option.content)
  }

  dispose() {
    this.watchers.forEach((v) => v.dispose())
    this.render.disposeNode(this.node)
  }
}

export class MBaseGroupFragment implements MBaseRenderFragment {
  fragments: MBaseRenderFragment[]
  nodes: MBaseWacher<Node[]>

  constructor(fragments: MBaseRenderFragment[]) {
    this.fragments = fragments
    this.nodes = new MBaseWacher(
      () => this.fragments.flatMap((v) => v.nodes.getValue()),
      this.fragments.map((v) => v.nodes)
    )
  }

  dispose(): void {
    this.nodes.dispose()
    this.fragments.forEach((v) => v.dispose())
  }
}

export class MBaseCondRenderNode implements MBaseRenderFragment {
  readonly nodes: MBaseValue<Node[]>
  readonly genrate: () => MBaseRenderFragment
  readonly cond: MBaseWacher<boolean>
  current: {
    fragment: MBaseRenderFragment
    cancelWatch: () => void
  } | null = null

  constructor(cond: MBaseWacher<boolean>, genrate: () => MBaseRenderFragment) {
    this.cond = cond
    this.genrate = genrate
    this.nodes = new MBaseValue<Node[]>([])
    this.update()
    this.cond.addListener(() => {
      this.update()
    })
  }

  private update() {
    const val = this.cond.getValue()
    if (val && this.current) return
    if (!val && !this.current) return
    if (!val && this.current) {
      this.current.fragment.dispose()
      this.current.cancelWatch()
      this.current = null
    }

    if (val && !this.current) {
      const fragment = this.genrate()
      const cancelKey = fragment.nodes.addListener((nodes) => {
        this.nodes.setValue(nodes)
      })
      const mutValue = fragment.nodes
      const cancelWatch = () => {
        mutValue.removeListener(cancelKey)
      }

      this.current = {
        fragment,
        cancelWatch
      }
    }

    if (!this.current) {
      this.nodes.setValue([])
    } else {
      this.nodes.setValue(this.current.fragment.nodes.getValue())
    }
  }

  dispose() {
    this.cond.dispose()
  }
}

export class MBaseLoopRenderNode<T> implements MBaseRenderFragment {
  readonly nodes: MBaseValue<Node[]>
  readonly genrateFragment: (item: T, idx: number) => MBaseRenderFragment
  readonly genrateKey: (item: T, idx: number) => string
  readonly list: MBaseWacher<T[]>
  currentMap: Map<
    string,
    {
      key: string
      item: T
      fragment: MBaseRenderFragment
      cancelWatch: () => void
    }
  > = new Map()
  currentList: {
    key: string
    item: T
    fragment: MBaseRenderFragment
    cancelWatch: () => void
  }[] = []

  constructor(
    list: MBaseWacher<T[]>,
    genrateFragment: (item: T, idx: number) => MBaseRenderFragment,
    genrateKey: (item: T, idx: number) => string
  ) {
    this.list = list
    this.genrateFragment = genrateFragment
    this.genrateKey = genrateKey
    this.nodes = new MBaseValue<Node[]>([])
    this.list.addListener(() => {
      this.update()
    })
    this.update()
  }

  private update() {
    const currentKeySet = new Set()
    const withKey = this.list.getValue().map((item, idx) => {
      let key = this.genrateKey(item, idx)
      if (currentKeySet.has(key)) {
        console.warn(`MBaseLoopRenderNode: loop key named "${key}" has been used!!!`)
        key = Math.random().toString()
      }
      currentKeySet.add(key)
      return { item, key }
    })

    const withFragment = withKey.map((v, idx) => {
      const old = this.currentMap.get(v.key)
      if (old) {
        return old
      } else {
        const fragment = this.genrateFragment(v.item, idx)
        const nodes = fragment.nodes
        const cancelKey = nodes.addListener(() => {
          this.refresh()
        })
        const cancelWatch = () => {
          nodes.removeListener(cancelKey)
        }
        return {
          ...v,
          fragment,
          cancelWatch
        }
      }
    })

    this.currentList.forEach((v) => {
      if (!currentKeySet.has(v.key)) v.cancelWatch()
    })

    this.currentList = withFragment
    this.currentMap = this.currentList.reduce<
      Map<
        string,
        {
          key: string
          item: T
          fragment: MBaseRenderFragment
          cancelWatch: () => void
        }
      >
    >((res, val) => {
      res.set(val.key, val)
      return res
    }, new Map())

    this.refresh()
  }

  private refresh() {
    const nodes = this.currentList.flatMap((v) => v.fragment.nodes.getValue())
    this.nodes.setValue(nodes)
  }
  dispose() {
    this.currentList.forEach((v) => v.cancelWatch())
    this.list.dispose()
  }
}
