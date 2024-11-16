<template>
    <div class="flow-render">
        <div class="flow-render__flow-lables">
            <div class="flow-render__flow-label" @contextmenu="(e) => flowCtxMenu(e, item.id)" v-for="item in flowList"
                :key="item.id" :data-current="item.id === currentShow">
                <template v-if="currentEdit && currentEdit.id === item.id">
                    <BtnInput v-model="currentEdit.value">
                        <template #btns>
                            <VxButton icon="del" only-icon :click="cancelEdit"></VxButton>
                            <VxButton icon="home" only-icon :click="submitEdit"></VxButton>
                        </template>
                    </BtnInput>
                </template>

                <template v-else>
                    <div @click="() => showDetail(item.id)" class="flow-render__flow-label-inner">{{ item.label ||
                        item.id }}</div>
                </template>

            </div>
        </div>
        <div class="flow-render__flow-detail">
            <template v-for="item in flowDetailGrid">
                <div v-if="item.node.type === 'flow-node' && !selector.isEditNode(item.node)"
                    :style="{ gridColumn: item.col + 1, gridRow: item.row + 1 }"
                    class="flow-render__render-node flow-render__render-node--flow"
                    @contextmenu="(e) => renderNodeCtxMenu(e, item.node)">

                    {{ renderNodeToShow(item.node) }}
                </div>

                <div v-else :style="{ gridColumn: item.col + 1, gridRow: item.row + 1 }"
                    class="flow-render__render-node flow-render__render-node--placeholder">
                    <BtnSelector :options="insertSelectOptions" v-model="selector.value">
                        <template #btns>
                            <VxButton icon="del" only-icon :click="() => selector.cancelEdit()"></VxButton>
                            <VxButton icon="home" only-icon :click="() => selector.submitEdit()"></VxButton>
                        </template>
                    </BtnSelector>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FlowLinearNode, FlowLinkNode, FlowNode, FlowStepNode, FlowStopNode, RunnerTaskConfig } from '@common/runnerExt';
import { RunnnerModel } from './runner';
import { computed, ref } from 'vue';
import { VxButton } from '@renderer/components/base/VxButton';
import { BtnInput, BtnSelector } from '@renderer/components/base/BtnInput';
import { Menu, PopMenuListHandler } from '@renderer/components/base/PopMenu';
import { contextMenu } from '@renderer/view/fixed/contextmenu';
import { nanoid } from 'nanoid';
import { fixReactive } from '@renderer/fix';


const props = defineProps<{ config: RunnerTaskConfig, runner: RunnnerModel }>()
const config = computed(() => props.config)

const flowList = computed(() => {
    return (config.value.flows ?? []).map(item => ({
        ...item, label: props.runner.getComment(`flow-${item.id}`)
    }))
})

const currentEdit = ref<null | { id: string, value: string }>(null)

const currentShow = ref<null | string>(null)

const cancelEdit = () => {
    currentEdit.value = null
}

const submitEdit = () => {
    if (currentEdit.value) {
        const { id, value } = currentEdit.value
        props.runner.setComment(`flow-${id}`, value)
    }
    currentEdit.value = null
}

const showDetail = (id: string) => {
    currentShow.value = id
}

const flowCtxMenu = (e: MouseEvent, id: string) => {
    const flow = props.config.flows?.find(item => item.id === id)
    if (!flow) return

    contextMenu.open(PopMenuListHandler.create(
        [Menu.button({
            icon: 'del', key: nanoid(), label: '执行', action: () => {
                props.runner.run(id)
            }
        }), Menu.button({
            icon: 'del', key: nanoid(), label: '删除', action: () => {
                props.runner.removeFlow(id)
            }
        }), Menu.button({
            icon: 'del', key: nanoid(), label: '备注', action: () => {
                currentEdit.value = { id, value: props.runner.getComment(`flow-${id}`) }
            }
        })].concat(flow.entry ? []
            : [Menu.button({
                icon: 'del', key: nanoid(), label: '添加根节点', action: () => {
                    showDetail(id)
                    selector.addNode()
                }
            })]
        )
    ), e)
}

const renderNodeCtxMenu = (e: MouseEvent, node: RenderNode) => {

    if (node.type === 'placehoder-node') return

    contextMenu.open(PopMenuListHandler.create(
        [Menu.button({
            icon: 'del', key: nanoid(), label: '仅删除当前节点', action: () => {
                selector.removeNode(node.node, true)
            }
        }), Menu.button({
            icon: 'del', key: nanoid(), label: '删除节点及子节点', action: () => {
                selector.removeNode(node.node, false)
            }
        }), Menu.button({
            icon: 'del', key: nanoid(), label: '编辑', action: () => {
                selector.editNode(node.node)
            }
        }), Menu.button({
            icon: 'del', key: nanoid(), label: '添加子节点', action: () => {
                selector.addNode(node.node)
            }
        })]
    ), e)
}

const renderNodeToShow = (node: RenderNode) => {
    if (node.type === 'flow-node') {
        if (node.node.type === 'stop') {
            return '判断结束'
        }
        if (node.node.type === 'linear') {
            return '线性分支'
        }

        if (node.node.type === 'flow') {
            const flowLinkId = (node.node as FlowLinkNode).flowLinkId
            const text = props.runner.getComment(`flow-${flowLinkId}`) || flowLinkId
            return `[ FLOW ] ${text}`
        }


        if (node.node.type === 'step') {
            const stepId = (node.node as FlowStepNode).stepId
            const text = props.runner.getComment(`step-${stepId}`) || stepId
            return `[ STEP ] ${text}`
        }

        return ''

    }
    return ''

}

type RenderFlowNode = {
    type: 'flow-node',
    node: FlowNode
}

type RenderPlaceHolder = {
    type: 'placehoder-node',
    parent?: FlowNode
}

type RenderNode = RenderFlowNode | RenderPlaceHolder


const flowDetailGrid = computed((): { node: RenderNode, col: number, row: number }[] => {
    const id = currentShow.value
    const flow = props.runner.config.flows.find(f => f.id === id)
    if (!id || !flow) return []


    const posTable = new Map<RenderNode, { col: number, row: number }>()
    const renderNodeTable = new Map<FlowNode, RenderFlowNode>()

    const getRenderFlowNode = (node: FlowNode) => {
        const rnode = renderNodeTable.get(node)
        if (rnode) {
            return rnode
        }
        const renderNode: RenderFlowNode = {
            type: 'flow-node', node
        }
        renderNodeTable.set(node, renderNode)
        return renderNode
    }
    const getRenderChildren = (rnode: RenderNode): RenderNode[] => {
        if (rnode.type === 'placehoder-node') {
            return []
        }
        if (rnode.type === 'flow-node') {
            return rnode.node.children.map<RenderNode>(v => getRenderFlowNode(v)).concat(
                (selector.placeHolder && selector.placeHolder.parent === rnode.node) ? [selector.placeHolder] : []
            )
        }
        return []
    }

    const setRow = (renderNode: RenderNode, row: number) => {
        const pos: { col: number, row: number } = {
            col: 0,
            ...posTable.get(renderNode),
            row
        }
        posTable.set(renderNode, pos)
    }

    const setCol = (renderNode: RenderNode, col: number) => {
        const pos: { col: number, row: number } = {
            row: 0,
            ...posTable.get(renderNode),
            col
        }
        posTable.set(renderNode, pos)
    }

    const setPosRow = (node: RenderNode, row: number = 0): number => {
        setRow(node, row)
        return getRenderChildren(node).reduce((prev, item) => {
            const next = setPosRow(item, row + 1)
            if (next > prev) return next
            else return prev
        }, row)
    }

    const setPosCol = (node: RenderNode, col: number = 0): number => {
        setCol(node, col)
        const [first, ...next] = getRenderChildren(node)
        if (!first) return col
        const nextCol = setPosCol(first, col)
        return next.reduceRight((prev, item) => {
            return setPosCol(item, prev + 1)
        }, nextCol)
    }

    if (flow.entry) {
        setPosRow(getRenderFlowNode(flow.entry))
        setPosCol(getRenderFlowNode(flow.entry))
    } else if (selector.placeHolder && !selector.placeHolder.parent) {
        setPosRow(selector.placeHolder)
        setPosCol(selector.placeHolder)
    }
    return Array.from(posTable.entries()).map(([node, pos]) => {
        return {
            node, ...pos
        }
    })
})


const insertSelectOptions = computed(() => {
    const flows = props.config.flows.map(v => ({
        type: 'flow', flowId: v.id, label: `flow:${props.runner.getComment(`flow-${v.id}`) ?? v.id}`, key: `flow-${v.id}`
    }))

    const inner = [{ type: 'stop', label: 'stop', key: 'stop' }, { type: 'linear', label: 'linear', key: 'linear' }]

    const steps = props.config.steps.map(v => ({
        type: 'step', stepId: v.output, label: `step:${props.runner.getComment(`step-${v.output}`) ?? v.output}`, key: `step-${v.output}`
    }))
    return [...flows, ...inner, ...steps] as SelectValueType[]
})

const currentFlow = computed(() => props.config.flows.find(v => v.id === currentShow.value) ?? null)

type SelectValueType = {
    key: string,
    type: string,
    label: string,
    stepId?: string,
    flowId?: string,
}

const selector = fixReactive(new class {
    value: null | SelectValueType = null
    placeHolder: null | RenderPlaceHolder = null
    currentEdit: null | FlowNode = null

    isEditNode(node: RenderNode) {
        if (node.type === 'flow-node') {
            return node.node.id === this.currentEdit?.id
        }
        return false
    }

    addNode(parent?: FlowNode) {
        this.cancelEdit()
        this.placeHolder = { parent, type: 'placehoder-node' }

    }

    editNode(node: FlowNode) {
        this.cancelEdit()
        this.currentEdit = node
    }

    removeNode(node: FlowNode, keepChild?: boolean) {
        const chech = (cur: FlowNode): FlowNode[] => {
            if (cur.id === node.id) {
                return keepChild ? cur.children : []
            }
            cur.children = cur.children.flatMap(v => chech(v))
            return [cur]
        }

        if (!currentFlow.value?.entry) return
        chech(currentFlow.value.entry)
    }

    private selectValueToFlowNode(value: SelectValueType) {

        const { type, stepId, flowId } = value

        let target: FlowNode | null = null

        if (!currentShow.value) throw new Error('currentShow is null')

        if (flowId) {
            const t: FlowLinkNode = {
                id: nanoid(),
                flowId: currentShow.value,
                flowLinkId: flowId,
                type: 'flow',
                children: []
            }
            target = t
        } else if (stepId) {
            const t: FlowStepNode = {
                id: nanoid(),
                flowId: currentShow.value,
                stepId,
                type: 'step',
                children: []
            }
            target = t
        } else if (type === 'stop') {
            const t: FlowStopNode = {
                id: nanoid(),
                flowId: currentShow.value,
                type: 'stop',
                children: []
            }
            target = t
        } else if (type === 'linear') {
            const t: FlowLinearNode = {
                id: nanoid(),
                flowId: currentShow.value,
                type: 'linear',
                children: []
            }
            target = t
        }

        if (!target) throw new Error('target is undefined')

        return target

    }

    cancelEdit() {
        this.placeHolder = null
        this.currentEdit = null
        this.value = null
    }

    submitEdit() {
        if (!this.value) return
        if (!currentShow.value) return

        if (this.placeHolder) {
            const { parent } = this.placeHolder
            const target = this.selectValueToFlowNode(this.value)
            if (!parent) {
                const flow = props.runner.config.flows.find(f => f.id === currentShow.value)
                if (flow) flow.entry = target
            } else {
                parent.children.push(target)
            }

            selector.cancelEdit()
            return
        }

        if (this.currentEdit) {
            const current = this.currentEdit
            const flow = currentFlow.value
            if (!flow?.entry) return

            const target = this.selectValueToFlowNode(this.value)
            const check = (node: FlowNode): FlowNode => {
                if (node.id === current.id) {
                    target.children = node.children
                    return target
                }

                node.children = node.children.map(c => check(c))
                return node
            }
            flow.entry = check(flow.entry)
            selector.cancelEdit()
            return
        }

    }
})


</script>

<style lang="scss" scoped>
.flow-render__flow-detail {
    display: grid;
    gap: 20px;
    padding: 20px;
    grid-auto-columns: 240px;
    grid-auto-rows: 32px;

    .flow-render__render-node {}

    .flow-render__render-node--flow {
        border: 1px solid #ccc;
        display: flex;
        justify-content: center;
        align-items: center;
    }

}

.flow-render {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .flow-render__flow-lables {
        flex: 0 0 auto;
        margin: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;


        .flow-render__flow-label {
            flex: 0 0 auto;
            width: 240px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;

            .flow-render__flow-label-inner {
                padding: 0 12px;
                line-height: 32px;
                border: 1px solid salmon;
                color: salmon;
                cursor: pointer;
            }

            &[data-current="true"] {
                .flow-render__flow-label-inner {
                    padding: 0 12px;
                    line-height: 32px;
                    border: 1px solid salmon;
                    background-color: salmon;
                    color: #fff;
                }
            }

        }


    }
}
</style>