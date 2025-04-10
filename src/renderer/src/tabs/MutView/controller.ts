import { MVFileState } from "@renderer/mods/mutv-mods/base";
import { MVModBEMStyle } from "@renderer/mods/mutv-mods/bem";
import { MVModComponent } from "@renderer/mods/mutv-mods/component";
import { MVModValueStore } from "@renderer/mods/mutv-mods/store";
import { MVModTemplate } from "@renderer/mods/mutv-mods/template";
import { ModalStackHandler } from "@renderer/widgets/ModalStack";



export class MVFileController {
    static modalWeakMap:WeakMap<MVFileController,ModalStackHandler> = new WeakMap()
    static modal(controller:MVFileController){
        const modal = this.modalWeakMap.get(controller)
        if(!modal) throw new Error()
        return modal
    }

    constructor(
        public fileState: MVFileState,
        public store: MVModValueStore = new MVModValueStore(fileState),
        public template: MVModTemplate = new MVModTemplate(fileState),
        public component: MVModComponent = new MVModComponent(fileState, template),
        public bem: MVModBEMStyle = new MVModBEMStyle(fileState)
    ) {

    }

    getFileState(){
        return this.fileState.clone()
    }

    file() {
        return this.fileState.content()
    }

    reload(content: string) {
        this.fileState.reload(content);
        [
            this.store,
            this.template,
            this.component,
            this.bem,
        ].forEach(v => v.reload())
    }
}