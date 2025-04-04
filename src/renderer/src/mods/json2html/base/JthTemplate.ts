import { ValueGeneratorRef } from "./JthFile"


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
  target: string
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
