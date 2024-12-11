import { fixReactive } from "@renderer/fix";
import { ConfirmModalHandler } from "@renderer/widgets/ConfirmModal";
import type { DBChartModel } from "./DBChartModel";

export const modalControl = new class {

    tabel: WeakMap<DBChartModel,ConfirmModalHandler> = new WeakMap()

    get(page:DBChartModel){
        if(!this.tabel.has(page)){
            const handler = fixReactive(new ConfirmModalHandler())
            this.tabel.set(page,handler)
        }
        return this.tabel.get(page)!
    }
}