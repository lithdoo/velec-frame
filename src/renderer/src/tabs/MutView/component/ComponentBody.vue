<script setup lang="ts">
import { computed, watch } from 'vue';
import { MVFileController } from '../controller';
import { MVComponent } from '@renderer/mods/mutv-mods/component';
import { FlatTreeHandler, FlatTreeItem, FlatTree } from '@renderer/widgets/FlatTree';
import { isMVTemplateApply, isMVTemplateCond, isMVTemplateScope, isMVTemplateLoop, isMVTemplateText, MVTemplateElement, MVTemplateHtmlType, MVTemplateNode, isMVTemplateElement } from '@renderer/mods/mutv-template';
import { fixReactive } from '@renderer/fix';
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar';
import { nanoid } from 'nanoid';
import TemplateCommon from '../template/TemplateCommon.vue';
import TemplateApply from '../template/TemplateApply.vue';
import TemplateText from '../template/TemplateText.vue';
import TemplateScope from '../template/TemplateScope.vue';
import TemplateCondition from '../template/TemplateCondition.vue';
import TemplateLoop from '../template/TemplateLoop.vue';
import TemplateElement from '../template/TemplateElement.vue';
import { PopMenuBuilder } from '@renderer/widgets/PopMenu';
import { contextMenu } from '@renderer/parts/GlobalContextMenu';
import { TemplateNodeTree } from '@renderer/mods/mutv-mods/template';
// import { JthComponent, JthRenderController, JthStateController } from '../base';
// import TemplateTree from '../template/TemplateTree.vue'
// import { TemplateTreeHandler } from '../template/handler';
// import VxButton from '@renderer/components/VxButton/VxButton.vue';
// import StateJsonEditor from '../testJson/StateJsonEditor.vue';
// import RenderTestView from '../render/RenderTestView.vue';

const props = defineProps<{
    controller: MVFileController,
    component: MVComponent
}>()

const treeData = computed(() => {
    const data: (FlatTreeItem & { templateData: MVTemplateNode })[] = []
    // const todo: { id: string, pid?: string }[] = [{
    //     id: props.component.rootId
    // }]

    const rootId = props.component.rootId

    const todo: { id: string, pid?: string }[] = props.controller.template.children(rootId)
        .map(cid => ({ pid: undefined, id: cid }))


    while (todo.length) {
        const item = todo.shift()
        if (!item) continue
        const { id, pid } = item
        const templateData = props.controller.template.node(id)

        const nodeData: FlatTreeItem & { templateData: MVTemplateNode } = {
            id, pid, loaded: true, isLeaf: templateData.isLeaf, templateData
        }

        data.push(nodeData)

        if (!nodeData.isLeaf) {
            props.controller.template.children(id)
                .map(cid => ({ pid: id, id: cid }))
                .forEach(next => todo.push(next))
        }

    }

    return data
})




const toolbar = computed(() => {

    return ToolBarBuilder.create()
        .button('addNode', '添加根节点', async () => {

            const node: MVTemplateElement = {
                type: MVTemplateHtmlType.Element,
                id: nanoid(),
                tagName: 'div',
                attrs: [],
                isLeaf: false,
            }

            props.controller.template.insertNode(node)
            props.controller.template.updateTree((tree) => {
                tree[props.component.rootId] = (tree[props.component.rootId] ?? []).concat([node.id])
                return { ...tree }
            })
        })
        .button('reload', '展开全部', async () => {
            tree.expandAll()
        })
        .button('save', '收起全部', async () => {
            tree.collapseAll()
        })
        .build()
})


watch(treeData, () => {
    tree.data = treeData.value
})

const tree = fixReactive(new class extends FlatTreeHandler<FlatTreeItem & { templateData: MVTemplateNode }> {
    isLeaf: (item: FlatTreeItem & { templateData: MVTemplateNode; }) => boolean = (item) => item.isLeaf ?? false
    data = treeData.value
    openKeys: string[] = this.data.filter(v => !v.templateData.isLeaf).map(v => v.id)

    onItemContextMenu: (item: FlatTreeItem & { templateData: MVTemplateNode; }, ev: MouseEvent) => boolean | void
        = (item, ev) => {

            let builder = PopMenuBuilder.create()

            const node: MVTemplateElement = {
                id: nanoid(),
                type: MVTemplateHtmlType.Element,
                tagName: 'div',
                attrs: [],
                isLeaf: false,
            }

            const addChildrenBeforeEach = () => {
                props.controller.template.insertNode(node)
                props.controller.template.updateTree((tree) => {
                    const newTree = {
                        ...tree, [item.templateData.id]:
                            [node.id, ...(tree[item.templateData.id] ?? [])]
                    }
                    return newTree
                })

                setTimeout(()=>{
                    tree.open(node.id)
                    tree.select(node.id)
                })
            }

            const inserNodeBefore = () => {
                let isInsert = false
                props.controller.template.insertNode(node)
                props.controller.template.updateTree((tree) => {
                    const newTree = Object.entries(tree)
                        .map(([pid, chidren]) => {
                            return [pid, chidren.flatMap(id => (
                                !isInsert &&
                                id === item.templateData.id
                            )
                                ? (isInsert = true, [node.id, id])
                                : [id]
                            )] as [string, string[]]
                        })
                        .reduce((res, [pid, chidren]) => {
                            return { ...res, [pid]: chidren }
                        }, {} as TemplateNodeTree)
                    return newTree
                })
                setTimeout(()=>{
                    tree.select(node.id)
                })
            }

            const insertNodeAfter = () => {
                let isInsert = false
                props.controller.template.insertNode(node)
                props.controller.template.updateTree((tree) => {
                    const newTree = Object.entries(tree)
                        .map(([pid, chidren]) => {
                            return [pid, chidren.flatMap(id => (
                                !isInsert &&
                                id === item.templateData.id
                            )
                                ? (isInsert = true, [id, node.id])
                                : [id]
                            )] as [string, string[]]
                        })
                        .reduce((res, [pid, chidren]) => {
                            return { ...res, [pid]: chidren }
                        }, {} as TemplateNodeTree)
                    return newTree
                })
                
                setTimeout(()=>{
                    tree.select(node.id)
                })
            }

            const removeTNode = () => {
                props.controller.template.removeNode(item.templateData.id)
            }


            if (!item.templateData.isLeaf) {
                builder = builder.button('addChildrenBeforeEach', '添加子节点', addChildrenBeforeEach)
                builder = builder.divide()
            }

            builder = builder.button('addChildrenBeforeEach', '向前插入节点', inserNodeBefore)
            builder = builder.button('addChildrenAfterEach', '向后插入节点', insertNodeAfter)
            builder = builder.divide()
            builder = builder.button('removeTNode', '删除节点', removeTNode)

            contextMenu.open(builder.build(), ev)
        }
})


const current = computed(() => {
    const id = tree.selectedKeys[0]
    if (!id) return null
    try {
        const treeData = props.controller.template.node(id)
        return treeData ?? null
    } catch (_) {
        return null
    }
})

</script>

<template>
    <div class="jth-component-body">
        <div class="jth-component-body__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>

        <div class="jth-component-body__content">
            <div class="jth-component-body__detail" v-if="current">

                <TemplateCommon :controller="controller" :template="current"></TemplateCommon>

                <TemplateApply v-if="isMVTemplateApply(current)" :controller="controller" :template="current">
                </TemplateApply>

                <TemplateText v-if="isMVTemplateText(current)" :controller="controller" :template="current">
                </TemplateText>

                <TemplateScope v-if="isMVTemplateScope(current)" :controller="controller" :template="current">
                </TemplateScope>

                <TemplateCondition v-if="isMVTemplateCond(current)" :controller="controller" :template="current">
                </TemplateCondition>

                <TemplateLoop v-if="isMVTemplateLoop(current)" :controller="controller" :template="current">
                </TemplateLoop>

                <TemplateElement v-if="isMVTemplateElement(current)" :controller="controller" :template="current">
                </TemplateElement>

            </div>

            <div class="jth-component-body__tree">

                <FlatTree :handler="tree">
                    <template #item="{ item }">
                        <div>{{ item.templateData.type }}</div>
                    </template>
                </FlatTree>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.jth-component-body {
    height: 100%;

    display: flex;
    flex-direction: column;

    .jth-component-body__toolbar {
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        // gap: 8px;
        // padding: 12px 6px;

        [data-actived="true"] {
            outline: 2px solid #fff;
            font-weight: bolder;
        }

        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        .jth-component-body__toolbar-divide {
            height: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    }


    .jth-component-body__content {
        height: 0;
        flex: 1 1 0;

        >div {
            height: 100%;
        }

        display: flex;
        flex-direction: row;

        .jth-component-body__detail {
            flex: 0 0 auto;
            width: 360px;
            // background-color: rgba(255, 255, 255, 0.1);
            // margin: 8px -4px 8px 8px;

            border-right: 1px solid rgba(255, 255, 255, 0.1);
            margin-left: 6px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .jth-component-body__tree {
            flex: 1 1 0;
            width: 0;
        }
    }
}
</style>