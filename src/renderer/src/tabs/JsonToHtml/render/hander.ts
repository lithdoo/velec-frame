import { JthFile, JthTemplate, JthTemplateApply, JthTemplateCond, JthTemplateElement, JthTemplateLoop, JthTemplateProp, JthTemplateRoot, JthTemplateText, JthTemplateType, ValueField, ValueGenerator, ValueGeneratorRef } from "../common";

export class JthRenderer {

    constructor(
        public readonly file: JthFile
    ) { }




    renderTemplateNode(nodeId: string, scope: JthScope): Node[] {
        const node = this.file.template_node[nodeId]

        if (!node) {
            throw new Error(`Template node ${nodeId} not found`)
        }

        if (node.type === JthTemplateType.Cond) {
            return this.renderCond(node, scope)
        }
        if (node.type === JthTemplateType.Apply) {
            return this.renderApply(node, scope)
        }
        if (node.type === JthTemplateType.Loop) {
            return this.renderLoop(node, scope)
        }
        if (node.type === JthTemplateType.Text) {
            return this.renderText(node, scope)
        }
        if (node.type === JthTemplateType.Element) {
            return this.renderElement(node, scope)
        }
        if (node.type === JthTemplateType.Prop) {
            return this.renderProp(node, scope)
        }
        if (node.type === JthTemplateType.Root) {
            return this.renderRoot(node, scope)
        }
        throw new Error('Unknown node type')
    }

    renderTemplateChildren(nodeId: string, scope: JthScope): Node[] {
        const children = this.file.template_tree[nodeId] ?? []
        return children.flatMap((childId) => this.renderTemplateNode(childId, scope))
    }

    renderCond(node: JthTemplateCond, scope: JthScope): Node[] {
        // todo 
        return [document.createElement('div')]
    }
    renderApply(node: JthTemplateApply, scope: JthScope): Node[] {
        // todo 
        return [document.createElement('div')]
    }
    renderLoop(node: JthTemplateLoop, scope: JthScope): Node[] {
        // todo 
        return [document.createElement('div')]
    }
    renderElement(node: JthTemplateElement, scope: JthScope): Node[] {
        // todo 
        return [document.createElement('div')]
    }
    renderText(node: JthTemplateText, scope: JthScope): Node[] {
        const { text } = node
        return [document.createTextNode(this.val(text, scope))]
    }
    renderProp(node: JthTemplateProp, scope: JthScope): Node[] {
        const { data } = node
        const newScope = this.extends(data, scope)
        return this.renderTemplateChildren(node.id, newScope)
    }
    renderRoot(node: JthTemplateRoot, scope: JthScope): Node[] {
        // todo 
        return [document.createElement('div')]
    }


    val(ref: ValueGeneratorRef, scope: JthScope): any {
        const vg = this.file.vg_store[ref._VALUE_GENERATOR_REFERENCE_]
        if (!vg) {
            throw new Error('ValueGenerator not found')
        }
        return scope.run(vg)
    }

    extends(props: ValueField[], prev: JthScope): JthScope {
        // todo 
        return new JthScope()
    }

}


export class JthScope {


    arguNames(): string[] {
        return []
    }

    arguValues(): any[] {
        return []
    }


    run(vg: ValueGenerator) {
        if (vg.type === 'static') {
            return JSON.parse(vg.json)
        }

        if (vg.type === 'dynamic:script') {
            const names = this.arguNames()
            const values = this.arguValues()
            const fn = new Function(...names, vg.script)
            return fn.apply(null, values)
        }

        if (vg.type === 'dynamic:getter') {
            throw new Error('dynamic:getter not implemented')
        }

        throw new Error('Unknown value generator type')
    }
}