<template>
  <div class="ani-drawer" :style="{ height: outerHeight }">
    <div class="ani-drawer__inner" ref="inner">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const inner = ref<HTMLElement>()

const props = defineProps<{
  open: boolean
}>()

const finalHeight = computed(() => {
  return props.open ? 'auto' : '0'
})

const outerHeight = ref(finalHeight.value)

let aniTimeout: any | null = null

watch(
  computed(() => props.open),
  (val) => {
    if (aniTimeout) {
      clearTimeout(aniTimeout)
    }
    if (!val) {
      outerHeight.value = inner.value?.getBoundingClientRect().height + 'px'
      setTimeout(() => {
        outerHeight.value = '0'
      }, 0)
      aniTimeout = setTimeout(() => {
        outerHeight.value = finalHeight.value
      }, 300)
    } else {
      outerHeight.value = inner.value?.getBoundingClientRect().height + 'px'
      aniTimeout = setTimeout(() => {
        outerHeight.value = finalHeight.value
      }, 300)
    }
  }
)
</script>
<style scoped lang="scss">
.ani-drawer {
  overflow: hidden;
  transition: height 0.3s ease-in-out;
}
</style>
