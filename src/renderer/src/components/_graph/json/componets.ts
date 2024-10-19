import { MBaseWacher, MBaseElementTemplateNode, MTemplate, MBaseTemplate, MBaseValue, RenderScope, render } from "../common";
import { GhJsonModel, JsonType, JsonStruct, JsonUsage } from "./structs";

interface GhJsonStructNodeState {
    toggleKeys: MBaseValue<Set<string>>
}

export class GhJsonStructNodeComponent {
    static finder: WeakMap<GhJsonModel, GhJsonStructNodeComponent> = new WeakMap()
    static template: MBaseElementTemplateNode<HTMLDivElement, {
        model: GhJsonModel;
        state: GhJsonStructNodeState;
    }>
    static {

        const bindToggleShowUsage = (element: HTMLElement, state: GhJsonStructNodeState) => {
            element.onclick = () => {
                if (state.toggleKeys.getValue().has('show-usages')) {
                    state.toggleKeys.getValue().delete('show-usages')
                } else {
                    state.toggleKeys.getValue().add('show-usages')
                }
                state.toggleKeys.setValue(state.toggleKeys.getValue())
            }
        }

        const renderType = (t: MTemplate<{ type: JsonType }>) => {
            return t.text((s) => s.get('type').key)
        }

        const renderStruct = (t: MTemplate<{ struct: JsonStruct }>) => {
            return t.div('gh-json-model__fields')(
                t.loop((s) => s.get('struct').fields)(
                    t => t.div('gh-json-model__field-item')(
                        t.div('gh-json-model__field-name')(t.text((s) => s.get('_item').name)),
                        t.prop(s => ({ type: s.get('_item').type }))(t =>
                            renderType(t)
                        )
                    )
                )
            )
        }


        const renderUsage = (t: MTemplate<{ usage: JsonUsage }>) => {
            return t.div('gh-json-model__usage-item')(
                t.div('gh-json-model__usage-title')(t.div('')
                    (t.text(s => s.get('usage').name))
                ),
                t.div('gh-json-model__usage-methods')(
                    t.loop(s => s.get('usage').methods)(t =>
                        t.div('gh-json-model__usage-method-item')(
                            t.div('gh-json-model__usage-method-name')(t.text(s => s.get('_item').name)),
                            t.div('gh-json-model__usage-method-output')(t.prop(s => ({ type: s.get('_item').output }))(t => renderType(t))
                            )
                        ),
                    )
                )
            )
        }

        const renderModel = (t: MTemplate<{ model: GhJsonModel, state: GhJsonStructNodeState }>) => {
            return t.div('gh-json-model')(
                t.div('gh-json-model__header')(t.text(s => s.get('model').name)),
                t.div('gh-json-model__body')(
                    t.div('gh-json-model__struct')(
                        t.div('gh-json-model__sub-title')(t.text('结构字段')),
                        t.prop(s => ({ struct: s.get('model').struct }))(
                            t => renderStruct(t)
                        )
                    ),
                    t.div('gh-json-model__usages')(
                        t.div('gh-json-model__sub-title', { created: (s, ele) => bindToggleShowUsage(ele, s.get('state')) })(t.text('用途')),
                        t.cond(s => {
                            const toggleKeys = s.get('state').toggleKeys
                            const watcher = new MBaseWacher(() => {
                                return toggleKeys.getValue().has('show-usages')
                            }, [toggleKeys])
                            return watcher
                        })(
                            t.loop(s => s.get('model').usages)(
                                t => t.prop(s => ({ usage: s.get('_item') }))(t => renderUsage(t))
                            )
                        ))

                )
            )

        }

        GhJsonStructNodeComponent.template = renderModel(new MBaseTemplate()).build()
    }

    template = GhJsonStructNodeComponent.template
    model: GhJsonModel
    state: GhJsonStructNodeState
    element: HTMLElement

    constructor(model: GhJsonModel) {
        const old = GhJsonStructNodeComponent.finder.get(model)
        if (old) old.dispose()
        GhJsonStructNodeComponent.finder.set(model, this)

        this.model = model
        this.state = {
            toggleKeys: new MBaseValue(new Set())
        }
        const scope = RenderScope.create({ model, state: this.state })
        const renderNode = render<{
            model: GhJsonModel;
            state: GhJsonStructNodeState
        }>(GhJsonStructNodeComponent.template, scope)
        this.element = renderNode.nodes.getValue()[0] as HTMLElement
       
    }


    dispose() { }
}
