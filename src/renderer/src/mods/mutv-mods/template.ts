import { Snapshot } from "@renderer/utils"
import { MVTemplateNode } from "../mutv-template"
import { MVFileMod, MVFileState } from "./base"
import { fixReactive } from "@renderer/fix"

export type MVTemplateTreeData = {
    last_mod_ts: number
    template_node: TemplateNodeTable
    template_tree: TemplateNodeTree
}

export type TemplateNodeTable = {
    [key: string]: MVTemplateNode
}

export type TemplateNodeTree = {
    [key: string]: string[]
}


export class MVModTemplate extends MVFileMod<MVTemplateTreeData> {
    static namespace: 'TEMPLATE_TREE_NODE' = 'TEMPLATE_TREE_NODE'
    static blank(): MVTemplateTreeData {
        return {
            last_mod_ts: new Date().getTime(),
            template_node: {},
            template_tree: {},
        }
    }

    readonly namespace: 'TEMPLATE_TREE_NODE' = MVModTemplate.namespace

    private readonly snapNodes: Map<string, Snapshot<MVTemplateNode>> = fixReactive(new Map())
    private readonly snapTree: Snapshot<TemplateNodeTree> = fixReactive(new Snapshot({}))


    constructor(file: MVFileState) {
        super(file)
        this.reload()
    }



    reload() {
        const data = this.getData() ?? MVModTemplate.blank()
        const { template_node, template_tree } = data

        this.snapNodes.clear()

        Array.from(Object.values(template_node)).forEach((node) => {
            this.snapNodes.set(node.id, new Snapshot(node))
        })

        this.snapTree.init(template_tree)
    }


    insertNode(node: MVTemplateNode) {
        if (this.snapNodes.has(node.id)) {
            throw new Error(`Node ${node.id} is exist!!!`)
        }
        this.snapNodes.set(node.id, new Snapshot(node))
        this.update()
    }

    replaceNode(sourceId: string, target: MVTemplateNode) {
        this.snapNodes.delete(sourceId)
        
        if (this.snapNodes.has(target.id)) {
            throw new Error(`Node ${target.id} is exist!!!`)
        }
        this.insertNode(target)

        this.snapTree.update(tree => {
            const newTree = [...Object.entries(tree)]
                .map(([id, list]) => {
                    const newId = id === sourceId ? target.id : id
                    const newList = list.map(v => v === sourceId ? target.id : v)
                    return { newId, newList }
                })
                .reduce((res,current)=>{
                    return {  ...res, [current.newId]: current.newList }
                },{} as TemplateNodeTree)

            if(newTree[target.id] && target.isLeaf){
                delete newTree[target.id]
            }

            return newTree
        })
    }

    removeNode(nodeId: string) {
        if (this.snapNodes.has(nodeId)) {
            this.snapNodes.delete(nodeId)
        }

        const tree = this.snapTree.current()
        const children = tree[nodeId] ?? []
        if (tree[nodeId]) {
            delete tree[nodeId]
        }
        this.snapTree.update(() => tree)
        children.forEach(v => this.removeNode(v))
        this.update()
    }

    updateNode<T extends MVTemplateNode>(id: string, updateFn: (node: T) => void) {
        const snapshot = this.snapNodes.get(id)
        if (!snapshot) {
            throw new Error(`Node ${id} not found!!!`)
        }
        snapshot.update(updateFn as any)
        this.update()
    }

    updateTree(updateFn: (tree: TemplateNodeTree) => void) {
        this.snapTree.update(updateFn)
        this.update()
    }

    hasNode(id: string) {
        return this.snapNodes.has(id)
    }


    tree() {
        return this.snapTree.current()
    }

    table() {
        return [...this.snapNodes.entries()].reduce((res, [id, snap]) => {
            return { ...res, [id]: snap.current() }
        }, {} as TemplateNodeTable)
    }

    node(id: string) {
        const node = this.snapNodes.get(id)
        if (!node) {
            throw new Error(`Node ${id} not found!!!`)
        }
        return node.current()
    }

    children(id: string) {
        return this.snapTree.current()[id] ?? []
    }

    allChildren() {
        return Array.from(Object.entries(this.snapTree.current()))

    }

    private update() {
        this.setData({
            last_mod_ts: new Date().getTime(),
            template_node: this.table(),
            template_tree: this.tree(),
        })
    }



}