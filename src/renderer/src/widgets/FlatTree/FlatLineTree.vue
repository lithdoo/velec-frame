<script lang="ts" setup generic="T extends FlatTreeItem">

import { computed } from 'vue'
import { FlatTreeHandler, type FlatTreeItem } from './handler'

const props = defineProps<{
    handler: FlatTreeHandler<T>,
}>()


interface Place {
    row: number,
    col: number
}

const renderGrid = computed(() => {
    console.log('renderGrid')
    const handler = props.handler
    const nodes = handler.data
    const childrenTable = new Map<string, T[]>()
    const roots: T[] = []
    const openKeys = new Set(handler.openKeys)

    const nodePlace = new Map<string, (Place & { isFirst: boolean, isRoot: boolean })>()
    const emptyPlace: Place[] = []
    const closeNodes = new Set<string>()
    const openNodes = new Set<string>()

    nodes.forEach((data) => {
        const pid = data.pid
        if (!pid) {
            roots.push(data)
        } else {
            childrenTable.set(pid, (childrenTable.get(pid) ?? []).concat([data]))
        }
    })

    // 虽然返回了 Place，但只需要返回的 row
    const step = (node: T, start: Place, option: { isFirst: boolean, isRoot: boolean }): Place => {
        console.log('step', node.id, node)
        const place = { ...start, ...option }
        nodePlace.set(node.id, { ...start, ...option })
        const isLeaf = node.isLeaf
        if (isLeaf) return start
        const isOpen = openKeys.has(node.id)
        if (!isOpen) {
            closeNodes.add(node.id)
            return start
        } else {
            openNodes.add(node.id)
        }
        const children = childrenTable.get(node.id) ?? []

        console.log('children', children)
        if (!children.length) {
            emptyPlace.push({ row: start.row, col: start.col + 1 })
            return start
        }
        else {
            const next = children.reduce<Place>((place, node, idx) => {
                const s = step(node, place, { isFirst: idx === 0, isRoot: false })
                return { col: place.col, row: s.row + 1 }
            }, { row: start.row, col: start.col + 1 })
            return next
        }
    }

    roots.reduce<Place>((place, node, idx) => {
        const s = step(node, place, {
            isFirst: idx === 0,
            isRoot: true
        })
        return { col: place.col, row: s.row + 1 }
    }, { row: 0, col: 0 })

    // const places = emptyPlace.concat([...nodePlace.values()])
    // const maxRow = Math.max(...places.map(v => v.row))
    // const maxCol = Math.max(...places.map(v => v.col))

    return {
        closeNodes,
        openNodes,
        emptyPlace,
        nodePlace,
    }
    // roots.forEach((data) => step(data, {row:0}))
})

const emptyNodes = computed(() => {
    const {
        emptyPlace,
    } = renderGrid.value

    return emptyPlace.map(place => ({
        row: place.row + 1,
        col: place.col + 1
    }))
})

const openNodes = computed(() => {
    return renderGrid.value.openNodes
})



const selectKeysSet = computed(() => new Set(props.handler.selectedKeys))

const renderNodes = computed(() => {

    const handler = props.handler
    const nodes = handler.data


    console.log(renderGrid.value)
    const {
        closeNodes,
        openNodes,
        nodePlace,
    } = renderGrid.value


    return nodes.map(node => {
        const place = nodePlace.get(node.id)
        if (!place) return null
        const isOpen = openNodes.has(node.id)
        const isClose = closeNodes.has(node.id)
        return {
            node,
            isClose,
            isOpen,
            isFirst: place.isFirst,
            isRoot: place.isRoot,
            row: place.row + 1,
            col: place.col + 1
        }
    })

})

const toggleNode = (node: T) => {
    if (node.isLeaf) return
    props.handler.toggle(node.id)
}


const selectNode = (node: T) => {
    props.handler.$emitSelect(node)
}


</script>

<template>

    <div class="flat-line-tree">

        <template v-for="place in emptyNodes">
            <div class="flat-line-tree_node" :style="{ gridRow: place.row, gridColumn: place.col }">
                <div class="flat-line-tree_node-before-line" :data-is-first-child="true"></div>
                <div class="flat-line-tree_node-content__empty">
                    {{ "<empty>" }}
                </div>
                <div class="flat-line-tree_node-after-line"></div>
            </div>
        </template>
        <template v-for="render in renderNodes">
            <template v-if="render">
                <div class="flat-line-tree_node" :data-selected="selectKeysSet.has(render.node.id)"
                    :style="{ gridRow: render.row, gridColumn: render.col }">
                    <div class="flat-line-tree_node-before-line" :data-is-first-child="render.isFirst"
                        v-if="!render.isRoot"></div>
                    <div class="flat-line-tree_toggle-btn"
                        :data-view-type="render.isOpen ? 'open' : render.isClose ? 'close' : 'leaf'"
                        @click="() => toggleNode(render.node)"></div>
                    <div class="flat-line-tree_node-content" @click="() => selectNode(render.node)">
                        <slot name="item" :item="render.node"></slot>
                    </div>
                    <div class="flat-line-tree_node-after-line" v-if="openNodes.has(render.node.id)"></div>
                </div>
            </template>
        </template>
    </div>



</template>


<style lang="scss">
.flat-line-tree {
    display: inline-grid;
    grid-template-columns: auto;
    grid-template-rows: auto auto;
}

.flat-line-tree_empty {
    color: #999;
    cursor: not-allowed;
}

.flat-line-tree_node {
    display: flex;
    gap: 4px;

    &[data-selected="true"] {
        text-decoration: underline;
        font-weight: 800;
    }
}

.flat-line-tree_node-content {
    cursor: pointer;
}

.flat-line-tree_node-after-line {
    flex: 1 1 0;
    width: 0;
    align-items: center;
    display: flex;
    justify-content: end;
    position: relative;

    &::after {
        display: block;
        content: '';
        border-top: 1px solid #666;
        width: 100%;
    }
}

.flat-line-tree_toggle-btn {
    flex: 0 0 auto;
    width: 12px;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -6px;

    &[data-view-type="leaf"]::after{
        display: block;
        width: 100%;
        content: '';
        border-bottom: 1px solid #666;
    }
    &[data-view-type="close"]::after{
        display: block;
        width: 100%;
        content: '';
        height: 8px;
        width: 8px;
        border: 2px  solid #666;
        border-radius: 50%;
        opacity: 0.3;
    }

    &[data-view-type="open"]::after {
        display: block;
        width: 100%;
        content: '';
        height: 6px;
        width: 6px;
        background-color: #666;
        border-radius: 50%;
    }
}

.flat-line-tree_node-before-line {
    flex: 0 0 auto;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: end;
    position: relative;

    &[data-is-first-child="true"]::after {
        display: block;
        content: '';
        border-top: 1px solid #666;
        width: 100%;
    }

    &[data-is-first-child="false"]::after {
        display: block;
        content: '';
        border-top: 1px solid #666;
        width: 50%;
    }

    &[data-is-first-child="false"]::before {
        display: block;
        content: '';
        position: absolute;
        border-left: 1px solid #666;
        height: 100%;
        left: 50%;
        bottom: 50%;
    }

}

.flat-line-tree_node-content {
    flex: 0 0 auto;
}

.flat-line-tree_node-content__empty {
    flex: 0 0 auto;
    color: #999;
}

.flat-line-tree_node-after-line {}
</style>