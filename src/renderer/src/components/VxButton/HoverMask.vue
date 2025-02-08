<template>
  <div class="btn-hover-mask" ref="mask">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  postion?: string
}>()

const mask = ref<HTMLDivElement | null>(null)

const parent = computed(() => {
  if (!mask.value) {
    return null
  }

  if (!mask.value.parentElement) {
    return null
  }
  return mask.value.parentElement
})

const bind = (newParent: HTMLElement | null) => {
  if (!newParent) {
    return
  }

  newParent.addEventListener('mouseenter', () => {
    newParent.classList.add('active')
  })

  newParent.addEventListener('mouseleave', () => {
    newParent.classList.remove('active')
  })

  newParent.style.position = props.postion ?? 'relative'
}

watch(parent, (newParent) => {
  bind(newParent)
})

onMounted(() => {
  bind(parent.value)
})
</script>

<style lang="scss">
.btn-hover-mask {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(66, 66, 66, 0.8);
}

.active .btn-hover-mask {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
