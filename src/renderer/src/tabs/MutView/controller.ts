import { MVFileState, MVRenderMod } from "@renderer/mods/mutv-mods/base";
import { MVModBEMStyle, MVRenderBEMStyle } from "@renderer/mods/mutv-mods/bem";
import { MVModComponent, MVRenderComponent } from "@renderer/mods/mutv-mods/component";
import { MVModContext, MVRenderContext } from "@renderer/mods/mutv-mods/context";
import { MVModValueStore, MVRenderValueStore } from "@renderer/mods/mutv-mods/store";
import { MVModTemplate, MVRenderTemplate } from "@renderer/mods/mutv-mods/template";
import { Mut, MutVal } from "@renderer/mods/mutv/mut";
import { MutViewNode, WrapedNode } from "@renderer/mods/mutv/vnode";
import { ModalStackHandler } from "@renderer/widgets/ModalStack";



export class MVFileController {
    static modalWeakMap: WeakMap<MVFileController, ModalStackHandler> = new WeakMap()
    static modal(controller: MVFileController) {
        const modal = this.modalWeakMap.get(controller)
        if (!modal) throw new Error()
        return modal
    }

    constructor(
        public fileState: MVFileState,
        public store: MVModValueStore = new MVModValueStore(fileState),
        public template: MVModTemplate = new MVModTemplate(fileState),
        public context: MVModContext = new MVModContext(fileState),
        public component: MVModComponent = new MVModComponent(fileState, template),
        public bem: MVModBEMStyle = new MVModBEMStyle(fileState)
    ) {

    }

    getFileState() {
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
            this.context
        ].forEach(v => v.reload())
    }
}

export class MVRenderController {
    static modalWeakMap: WeakMap<MVRenderController, ModalStackHandler> = new WeakMap()
    static modal(controller: MVRenderController) {
        const modal = this.modalWeakMap.get(controller)
        if (!modal) throw new Error()
        return modal
    }

    renderRoot = new MVRenderRoot()

    constructor(
        public fileState: MVFileState,
        public store: MVRenderValueStore = new MVRenderValueStore(fileState),
        public template: MVRenderTemplate = new MVRenderTemplate(fileState, store),
        public component: MVRenderComponent = new MVRenderComponent(fileState, template, store),
        public bem: MVRenderBEMStyle = new MVRenderBEMStyle(fileState, template, store),
        public context: MVRenderContext = new MVRenderContext(fileState, store),
    ) { }

    dealRoot() {
        [
            this.store,
            this.context,
            this.template,
            this.component,
            this.bem,
        ].forEach((v: MVRenderMod<unknown>) => v.onRootCompleted(this.renderRoot.shadow))
    }

    preRender() {
        [
            this.store,
            this.context,
            this.template,
            this.component,
            this.bem,
        ].forEach(v => v.onBeforeRender())
    }

    render(data: Mut<unknown>, rootId: string) {
        this.preRender()
        this.dealRoot()
        const node = this.component.render(rootId, data)
        this.renderRoot.inject(node)
    }

}


export class MVRenderRoot {
    shadow: ShadowRoot
    viewNode?: MutViewNode

    private updateFn = () => { this.update() }
    constructor(
        public cntr = document.createElement('div')
    ) {
        this.cntr.style.height = '100%'
        this.shadow = this.cntr.attachShadow({ mode: 'open' })
    }

    private caches: WrapedNode[] = []

    inject(viewNode: MutViewNode) {
        if (this.viewNode) {
            this.viewNode.target.off(this.updateFn)
        }
        this.viewNode = viewNode
        this.viewNode.target.on(this.updateFn)
        this.update()
    }

    update() {
        const blank = document.createElement('div')
        this.caches.forEach(node => node.appendTo(blank))
        this.caches = []
        this.viewNode?.target.val().forEach(node => {
            node.appendTo(this.shadow)
            this.caches.push(node)
        })
    }

    element() {
        return this.cntr
    }
}
