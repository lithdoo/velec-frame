import { ModalStackHandler } from "@renderer/widgets/ModalStack"
import { JthStateController } from "./view/base"

export class PageJthBase {
    static modalWeakMap = new WeakMap<JthStateController, ModalStackHandler>()

    static modal(controller: JthStateController) {
        const modal = this.modalWeakMap.get(controller)
        if (!modal) throw new Error('unfound modal')
        return modal
    }
}