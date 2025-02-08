import { MayBeMBase, MBaseValue } from './mut'
import {
  MBaseTempalteNode,
  Ext,
  MBaseTempalteParentNode,
  MBaseElementTemplateNode,
  MBaseTextTemplateNode,
  MBaseCondTemplateNode,
  MBaseLoopTemplateNode,
  MBaseTScope,
  MBasePropTemplateNode,
  MBaseTempalteNodeType
} from './template'

interface TemplateNodeBuilder<
  S extends Record<string, unknown>,
  T extends MBaseTempalteNode<S> = MBaseTempalteNode<S>
> {
  ['__TemplateNodeBuilder__']: true
  build(): T
}

function isBuilder<
  S extends Record<string, unknown>,
  T extends MBaseTempalteNode<S> = MBaseTempalteNode<S>
>(node: any): node is TemplateNodeBuilder<S, T> {
  return !!node['__TemplateNodeBuilder__']
}

type LoopScope<S extends Record<string, unknown>, T> = Ext<S, { _index: number; _item: T }>

type TemplateBuilderChildren<Scope extends Record<string, unknown>> =
  | TemplateNodeBuilder<Scope>
  | ((t: MTemplate<Scope>) => TemplateNodeBuilder<Scope>)

export interface TemplateParentNodeBuilder<
  S extends Record<string, unknown>,
  C extends Record<string, unknown>,
  T extends MBaseTempalteParentNode<S, C>
> extends TemplateNodeBuilder<S, T> {
  (...children: TemplateBuilderChildren<C>[]): TemplateParentNodeBuilder<S, C, T>
}

type TemplateElementOption<Scope extends Record<string, unknown>, T extends HTMLElement> = {
  created?: (scope: MBaseTScope<Scope>, element: T) => void
}

export interface MTemplate<Scope extends Record<string, unknown>> {
  Pre: (
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option?: TemplateElementOption<Scope, HTMLPreElement>
  ) => TemplateParentNodeBuilder<Scope, Scope, MBaseElementTemplateNode<HTMLPreElement, Scope>>
  Div: (
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option?: TemplateElementOption<Scope, HTMLDivElement>
  ) => TemplateParentNodeBuilder<Scope, Scope, MBaseElementTemplateNode<HTMLDivElement, Scope>>
  Span: (
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option?: TemplateElementOption<Scope, HTMLSpanElement>
  ) => TemplateParentNodeBuilder<Scope, Scope, MBaseElementTemplateNode<HTMLSpanElement, Scope>>
  Text: (
    content: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string>>
  ) => TemplateNodeBuilder<Scope, MBaseTextTemplateNode<Scope>>
  cond: (
    cond: (scope: MBaseTScope<Scope>) => MayBeMBase<boolean>
  ) => TemplateParentNodeBuilder<Scope, Scope, MBaseCondTemplateNode<Scope>>
  loop: <T>(
    list: (scope: MBaseTScope<Scope>) => MayBeMBase<T[]>
  ) => TemplateParentNodeBuilder<Scope, LoopScope<Scope, T>, MBaseLoopTemplateNode<T, Scope>>
  prop: <Next extends Record<string, unknown>>(
    trans: (scope: MBaseTScope<Scope>) => Next
  ) => TemplateParentNodeBuilder<Scope, Next, MBasePropTemplateNode<Scope, Next>>
}

type MayBeStatic<Argu extends any[], Res> = Res extends Function
  ? never
  : ((...argu: Argu) => Res) | Res

export class MBaseTemplate<Scope extends Record<string, unknown>> implements MTemplate<Scope> {
  static toGenerate = <Argu extends any[], Res>(
    argu: MayBeStatic<Argu, Res>
  ): ((...argu: Argu) => Res) => {
    if (argu instanceof Function) {
      return argu as (...argu: Argu) => Res
    } else {
      return (() => argu) as (...argu: Argu) => Res
    }
  }

  private element<ElementNode extends HTMLElement>(
    createElement: () => ElementNode,
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option: TemplateElementOption<Scope, ElementNode> = {}
  ) {
    const { created } = option

    const template: MBaseElementTemplateNode<ElementNode, Scope> = {
      _type: MBaseTempalteNodeType.Element,
      createElement: !created
        ? createElement
        : (scope: MBaseTScope<Scope>) => {
            const element = createElement()
            created(scope, element)
            return element
          },
      className: MBaseTemplate.toGenerate(className),
      style: () => new MBaseValue({}),
      attrStyle: () => new MBaseValue({}),
      children: [] as MBaseElementTemplateNode<ElementNode, Scope>['children']
    }

    return this.createParentBuilder<Scope, MBaseElementTemplateNode<ElementNode, Scope>>(template)
  }

  private createParentBuilder<
    Next extends Record<string, unknown>,
    TemplateNode extends MBaseTempalteParentNode<Scope, Next>
  >(node: TemplateNode) {
    const build = () => node

    const append: TemplateParentNodeBuilder<Scope, Next, TemplateNode> = Object.assign(
      (...children: TemplateBuilderChildren<Next>[]) => {
        const list = children.map((v) => {
          if (isBuilder(v)) {
            return v.build()
          } else {
            return v(new MBaseTemplate()).build()
          }
        })
        node.children = node.children.concat(list)
        return append
      },
      { build },
      { ['__TemplateNodeBuilder__']: true } as { ['__TemplateNodeBuilder__']: true }
    )

    return append
  }

  Span(
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option: TemplateElementOption<Scope, HTMLSpanElement> = {}
  ) {
    return this.element<HTMLSpanElement>(() => document.createElement('span'), className, option)
  }

  Div(
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option: TemplateElementOption<Scope, HTMLDivElement> = {}
  ) {
    return this.element<HTMLDivElement>(() => document.createElement('div'), className, option)
  }

  Pre(
    className: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string | string[]>>,
    option: TemplateElementOption<Scope, HTMLPreElement> = {}
  ) {
    return this.element<HTMLPreElement>(() => document.createElement('pre'), className, option)
  }

  cond(cond: (scope: MBaseTScope<Scope>) => MayBeMBase<boolean>) {
    const template: MBaseCondTemplateNode<Scope> = {
      _type: MBaseTempalteNodeType.Cond,
      cond,
      children: [] as MBaseCondTemplateNode<Scope>['children']
    }

    return this.createParentBuilder<Scope, MBaseCondTemplateNode<Scope>>(template)
  }

  Text(content: MayBeStatic<[MBaseTScope<Scope>], MayBeMBase<string>>) {
    const template: MBaseTextTemplateNode<Scope> = {
      _type: MBaseTempalteNodeType.Text,
      text: MBaseTemplate.toGenerate(content)
    }

    const builder: TemplateNodeBuilder<Scope, MBaseTextTemplateNode<Scope>> = {
      build: () => template,
      ['__TemplateNodeBuilder__']: true
    }

    return builder
  }
  loop<T>(list: (scope: MBaseTScope<Scope>) => MayBeMBase<T[]>) {
    const template: MBaseLoopTemplateNode<T, Scope> = {
      _type: MBaseTempalteNodeType.Loop,
      list,
      children: [] as MBaseLoopTemplateNode<T, Scope>['children']
    }

    return this.createParentBuilder<LoopScope<Scope, T>, MBaseLoopTemplateNode<T, Scope>>(template)
  }

  prop<Next extends Record<string, unknown>>(trans: (scope: MBaseTScope<Scope>) => Next) {
    const template: MBasePropTemplateNode<Scope, Next> = {
      _type: MBaseTempalteNodeType.Prop,
      trans,
      children: [] as MBasePropTemplateNode<Scope, Next>['children']
    }

    return this.createParentBuilder<Next, MBasePropTemplateNode<Scope, Next>>(template)
  }
}
