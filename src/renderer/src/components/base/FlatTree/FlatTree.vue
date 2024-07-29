<script lang="ts" setup generic="T extends FlatTreeItem">
import { computed } from 'vue';
import { FlatTreeHandler, type FlatTreeItem } from './handler'
import { VxIcon } from '../VxIcon';


const props = defineProps<{
  handler: FlatTreeHandler<T>
}>()

const handler = computed(() => props.handler)

const listToRender = computed(() => {
  const handler = props.handler
  const childrenTable = new Map<string, T[]>()
  const roots: T[] = []
  const list = handler.data
  const openKeys = new Set(handler.openKeys)

  list.forEach(data => {
    const pid = data.pid
    if (!pid) {
      roots.push(data)
    } else {
      childrenTable[pid] = (childrenTable[pid] || []).concat([data])
    }
  })

  const res: {
    id: string, pid?: string, data: T, deep: number, isOpen: boolean, isLeaf: boolean
  }[] = []

  const step = (data, deep = 0) => {
    const id = data.id
    const isLeaf = data.isLeaf
    const isOpen = openKeys.has(id)
    res.push({ data, id, deep, isOpen, isLeaf })
    const children = childrenTable[id]
    if (!children) return
    if (!isOpen) return
    else children.forEach(data => step(data, deep + 1))
  }

  roots.forEach(data => step(data))

  return res
})

const selectKeysSet = computed(() => new Set(props.handler.selectedKeys))

const toggle = (id, e: Event) => {
  handler.value.toggle(id)
  e.stopPropagation()
}

</script>


<template>
  <div class="flat-tree">

    <div class="flat-tree__inner">
      <div v-if="handler.loadingId" class="flat-tree__loadding-mask"></div>
      <div :class="{ 'flat-tree__item': true, 'flat-tree__item--selected': selectKeysSet.has(v.id) }"
        v-for="v in listToRender" :key="v.id" :style="{ paddingLeft: v.deep * 16 + 'px' }"
        @mouseover="() => handler.$emitHover(v.data)" @mouseleave="() => handler.$emitLeave(v.data)"
        @click="() => handler.$emitSelect(v.data)" @contextmenu="(ev) => handler.$emitContextMenu(v.data,ev)">

        <div
          :class="['flat-tree__item-open-icon', v.id === handler.loadingId ? 'flat-tree__item-open-icon--loading' : '']"
          @click="(e) => toggle(v.id, e)">
          <VxIcon v-if="v.id === handler.loadingId" :name="'auto_renew'"></VxIcon>
          <VxIcon v-else-if="(!v.isLeaf) && v.isOpen" :name="'menu_down'"></VxIcon>
          <VxIcon v-else-if="(!v.isLeaf) && (!v.isOpen)" :name="'menu_right'"></VxIcon>
          <slot v-else name="leaf-icon" :item="v.data"></slot>
        </div>
        <div class="flat-tree__item-content" :class="{ 'flat-tree__item-content--v-scroll': handler.vScroll }">
          <slot name="item" :item="v.data"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --flat-tree-hover-bg: rgba(255, 255, 255, 0.1);
  --flat-tree-selected-bg: rgba(255, 255, 255, 0.1);
  --flat-tree-border-radius: 2px;
}
</style>

<style lang="scss" scoped>
.flat-tree {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 8px 4px;

  .flat-tree__inner {
    flex-direction: column;
    display: flex;
    width: fit-content;
    min-width: 100%;
    position: relative
  }

  .flat-tree__loadding-mask {
    z-index: 999;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .flat-tree__item {
    display: flex;
    flex-direction: row;
    border-radius: var(--flat-tree-border-radius);

    &:hover {
      background-color: var(--flat-tree-hover-bg);
    }

    cursor: pointer;
  }

  .flat-tree__item.flat-tree__item--selected {
    background-color: var(--flat-tree-selected-bg);
  }

  .flat-tree__item-open-icon {
    flex: 0 0 auto;
    width: 16px;
    display: flex;
    align-items: center;
    transform: translateY(1px);
    margin-left: 11px;
    margin-right: 4px;
  }

  @keyframes flat-tree__item-open-icon--rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .flat-tree__item-open-icon--loading {
    animation: flat-tree__item-open-icon--rotate 2s linear infinite;
  }


  .flat-tree__item-content {
    flex: 1 1 0;
    width: 0;
  }

  .flat-tree__item-content--v-scroll {
    flex: 1 0 auto;
    width: auto;
    white-space: nowrap;
  }

}
</style>