import { MutDomHTMLElementOption, MutDomRender, MutValueHandler } from "./dom"

export class MBaseValue<T> {
  val: T
  onchangeCall: Map<Symbol, () => void> = new Map()
  constructor(def: T) {
    this.val = def
  }

  addListener(call: () => void): Symbol {
    const key = Symbol()
    this.onchangeCall.set(key, call)
    return key
  }

  removeListener(key: Symbol) {
    this.onchangeCall.delete(key)
  }

  setValue(t: T) {
    this.val = t
    Array.from(Object.values(this.onchangeCall)).map(v => v())
  }
}

export class MBaseWacher<T> extends MBaseValue<T> {
  fn: () => T
  cancel: (() => void)[]
  constructor(fn: () => T, list: MBaseValue<unknown>[]) {
    super(fn())
    this.fn = fn
    this.cancel = list.map(v => {
      const key = v.addListener(() => this.update())
      return () => v.removeListener(key)
    })
  }

  update() {
    this.setValue(this.fn())
  }

  dispose() {
    this.cancel.forEach(v => v())
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
    return value.val
  }

  onValueChange<T>(value: MBaseValue<T>, onchange: () => void, callOnInit?: boolean) {
    const key = value.addListener(onchange)
    if (callOnInit) { onchange() }
    return () => value.removeListener(key)
  }
}


interface MBaseRenderNode {
  dispose(): void
}

interface MBaseRenderFragment {
  dispose(): void
}


type MBaseRenderInput = {
  text: MBaseValue<string>,
  className: MBaseValue<string | string[]>
  style: MBaseValue<Partial<CSSStyleDeclaration>>
  attrStyle: MBaseValue<{ [key: string]: string | CSSStyleValue }>
  children: never
}

type MBaseDomRender = MutDomRender<MBaseRenderInput>


export class MBaseElementRenderNode<T extends HTMLElement> implements MBaseRenderNode {
  render: MBaseDomRender
  watchers: MBaseWacher<unknown>[]
  node: T

  constructor(render: MBaseDomRender, option: {
    node: T,
    className: MBaseWacher<string | string[]> | string | string[],
    style: MBaseWacher<Partial<CSSStyleDeclaration>> | Partial<CSSStyleDeclaration>,
    attrStyle: MBaseWacher<{ [key: string]: string | CSSStyleValue }> | { [key: string]: string | CSSStyleValue },
  }) {
    const {
      className, style, attrStyle, node
    } = option

    this.render = render
    this.node = this.render.htmlElement(node, {
      className, style, attrStyle
    })

    this.watchers = [ className, style, attrStyle].filter(v=>v instanceof MBaseWacher)
  }

  dispose() {
    this.watchers.forEach(v => v.dispose())
    this.render.disposeNode(this.node)
  }
}


export class MBaseParentRenderNode<T extends HTMLElement>  implements MBaseRenderNode {
  render: MBaseDomRender
  target: MBaseElementRenderNode<T>
  constructor(render: MBaseDomRender, option: {
    target: MBaseElementRenderNode<T>,
  }) {
    const {
      target
    } = option

    this.target = target
    this.render = render
  }

  dispose() {
    // this.watchers.forEach(v => v.dispose())
    // this.render.disposeNode(this.node)
  }

}


export abstract class MBaseTextRenderNode implements MBaseRenderNode {
  render: MBaseDomRender
  watchers: MBaseWacher<unknown>[]
  node: Text

  constructor(render: MBaseDomRender, option: { content: MBaseWacher<string> }) {
    this.render = render
    this.watchers = [option.content]
    this.node = this.render.textNode(option.content)
  }

  dispose() {
    this.watchers.forEach(v => v.dispose())
    this.render.disposeNode(this.node)
  }
}

export abstract class MBaseCondRenderNode implements MBaseRenderNode {
  abstract render: MBaseDomRender
  abstract watchers: MBaseWacher<unknown>[]
  abstract node: Text

  dispose() {
    this.watchers.forEach(v => v.dispose())
    this.render.disposeNode(this.node)
  }
}

export abstract class MBaseLoopRenderNode implements MBaseRenderNode {
  abstract render: MBaseDomRender
  abstract watchers: MBaseWacher<unknown>[]
  abstract nodes: [string, MBaseRenderNode][]

  dispose() {
    this.watchers.forEach(v => v.dispose())
    // this.render.disposeNode(this.node)
  }
}



// interface MBaseTScope<T extends {}> {
//   get<K extends keyof T>(name: K): T[K]
//   map<S extends {}>(fn: (t: T) => S): MBaseTScope<S>
// }

// type Ext<Current extends {}, Next extends {}> = {
//   [Key in keyof (Next & Current)]: Next extends { [K in Key]: any } ? Next[Key] : Current extends { [K in Key]: any } ? Current[Key] : never
// }

// interface MBaseTemplateNode<Current extends {} = {}> {
//   scope: MBaseTScope<Current>,
//   children: null | (MBaseTemplateNode<{}>[])
// }




// interface MBaseTemplateLoopNode<Current extends {}, Item> extends MBaseTemplateNode<Current> {
//   children: MBaseTemplateNode[]
// }

// interface MBaseTemplateCondNode<Current extends {}> extends MBaseTemplateNode<Current> {
//   children: MBaseTemplateNode[]
// }


// interface MBaseTemplateTextNode<Current extends {}> extends MBaseTemplateNode<Current> {
//   children: null
// }

// interface MBaseTemplateDivNode<Current extends {}> extends MBaseTemplateNode<Current> {
//   children: null
// }



// export class MBaseTemplate {
//   render: MutDomRender = new MutDomRender(new MBaseHandler())
// }



// type MBaseRenderInput = {
//   text: MBaseValue<string>,
//   className: MBaseValue<string | string[]>
//   style: MBaseValue<Partial<CSSStyleDeclaration>>
//   attrStyle: MBaseValue<{ [key: string]: string | CSSStyleValue }>
//   children: never
// }


// type MBaseHTMLCommonInput = MutDomHTMLElementOption<MBaseRenderInput>

// type MBaseTemplatChildrenCreator<T extends {}> = (h: MBaseTemplateBuilder<T>) => MBaseTemplateNode[]


// interface MBaseTemplateBuilder<T extends {}> {
//   // (
//   //     node: MBaseTemplateNode<T>,
//   //     children: (h: MBaseTemplateBuilder<T>) => MBaseTemplateNode<T>[]
//   // ): MBaseTemplateNode<T>,


//   div: (
//     option?: (scope: MBaseTScope<T>) => MBaseHTMLCommonInput,
//     children?: MBaseTemplatChildrenCreator<T>
//   ) => MBaseTemplateDivNode<T>,
//   span: (option?: (scope: MBaseTScope<T>) => MBaseHTMLCommonInput) => MBaseTemplateDivNode<T>,

//   text: (text: (scope: MBaseTScope<T>) => MBaseValue<string> | string) => MBaseTemplateTextNode<T>


//   $if: (
//     val: (scope: MBaseTScope<T>) => MBaseValue<boolean> | boolean,
//     children?: MBaseTemplatChildrenCreator<T>
//   ) => MBaseTemplateCondNode<T>,

//   $loop: <Item>(
//     val: (scope: MBaseTScope<T>) => MBaseValue<Item[]> | Item[],
//     children?: MBaseTemplatChildrenCreator<Ext<T, { $index: number, $item: Item }>>
//   ) => MBaseTemplateLoopNode<T, Item>,

//   $scope: MBaseTScope<T>,

//   $map<S extends {}>(fn: (t: T) => S): MBaseTemplateBuilder<S>
// }


// type MBaseDomRender = MutDomRender<MBaseRenderInput>


// // 以下测试

// export enum JsonFieldTypeKey {
//   String = 'String',
//   Integer = 'Integer',
//   Number = 'Number',
//   Boolean = 'Boolean',
//   Null = 'Null',
//   Array = 'Array',
//   Object = 'Object',
//   Anyone = 'Anyone',
// }

// export interface JsonStruct {
//   fields: { name: string, type: JsonType }[]
// }

// export interface JsonField {
//   name: string
//   type: JsonType
// }

// export interface JsonType {
//   key: JsonFieldTypeKey
// }



// const renderType = (_: MBaseTemplateBuilder<JsonType>) => {
//   return _.text(scope => scope.get('key'))
// }


// const renderStruct = (t: MBaseTemplateBuilder<JsonStruct>) =>
//   t.div(
//     () => ({ className: 'gh-json-model__fields' }),
//     t => [
//       t.$if($ => !!$.get('fields'),
//         t => [
//           t.$loop($ => $.get('fields'), t => [
//             t.div(() => ({ className: 'gh-json-model__field-item' }), t => [
//               t.div(() => ({ className: 'gh-json-model__field-name' }), t => [
//                 t.text($ => $.get('$item').name)
//               ]),
//               renderType(t.$map(struct => struct.$item.type))
//             ])
//           ])
//         ]
//       )
//     ]
//   )


// const div: any = null

// div()
//   .className('')
//   .style({})
//   .attrStyle({})
//   .done()
//   .apply(() => [
//     div().className('')

//   ])



