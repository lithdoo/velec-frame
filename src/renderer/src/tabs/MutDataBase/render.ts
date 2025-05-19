import { MVFileState } from "@renderer/mods/mutv-mods/base"
import { MVRenderController } from "../MutView/controller"
import { MutVal } from "@renderer/mods/mutv/mut"
import { Shape } from "@antv/x6"



export class DBChartRender {

    static shape = 'DATABASE_CHART_ENTITY_NODE'

    static style = {
        outterBorderWidth: 3,
        colorBarWidth: 6,
        headerHeight: 32,
        fieldHeight: 30,
        fieldBorderWidth: 1
    }

    static async init() {
        const mutvNodeFileUrl = await window.explorerApi.getSettingFileUrl('./mut_dbc/node.muv')
        if (!mutvNodeFileUrl) return
        const nodeContent = await window.explorerApi.readContent(mutvNodeFileUrl) ?? ''
        const state = new MVFileState()
        state.reload(nodeContent)
        const renderer = new MVRenderController(state)
        const rootId = renderer.component.allComponents().find(v => v.keyName === 'EntityNode')
            ?.rootId
        if (!rootId) throw new Error('todo')
        const renderFn = (data: any) => {
            const val = new MutVal(data)
            const renderer = new MVRenderController(state)
            renderer.render(val, rootId)
            return renderer.renderRoot.element()
        }


        Shape.HTML.register({
            shape: DBChartRender.shape,
            effect: [],
            html(cell) {
                const data = cell.getData()
                return renderFn(data)
            }
        })
    }

}