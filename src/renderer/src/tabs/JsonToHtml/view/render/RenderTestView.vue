<script lang="ts">
export abstract class RenderTestHandler {


    abstract file(): JthFile
    abstract componet: JthComponent

    viewNode?: JthViewFragment


    render() {

        const res = JthRender.fromJsonState(
            this.file(),
            this.componet.rootId,
            this.componet.testDefaultJson
        )

        console.log(res)
        this.viewNode = res
    }

}
</script>


<script setup lang="ts">
import { JthRender } from '@renderer/mods/json2html/JthRender';
import { JthComponent, JthFile } from '../../common';
import { JthViewFragment, JthWrapedNode } from '@renderer/mods/json2html/JthViewNode';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    handler: RenderTestHandler
}>()

const container = ref<HTMLDivElement | null>(null)

const viewNode = computed(() => {
    return props.handler.viewNode
})

watch(viewNode, () => {
    console.log('viewNode')
    const containerDiv = container.value
    console.log('viewNode',containerDiv)
    if (!containerDiv) return
    containerDiv.innerHTML = ''
    console.log('viewNode',containerDiv.innerHTML)
    const list = viewNode.value?.list.val() ?? []
    console.log('viewNode',list)
    list.forEach((vn) => {
        const list = vn.target.val().map(v=>v.node())
        list.forEach(e=>{
            containerDiv.appendChild(e)
        })
    })
})

</script>


<template>
    <div class="render-test-view">
        <div ref="container"></div>
    </div>
</template>