<script setup lang="ts" generic="T extends { label: string; key: string }">
import { Select, SelectOption } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
const model = defineModel<T | null>()
const inputRef = ref<typeof Select | null>(null)
const props = defineProps<{
  options: T[]
  placeholder?: string,
  disabled?:boolean
  mounted?: (el: { focus: () => void }) => void
}>()

const value = computed(() => {
  if (model.value) return model.value.key
  else return undefined
})

const onchange = (key: string) => {
  model.value = props.options.find((item) => item.key === key) ?? null
}

onMounted(() => {
  if (props.mounted) {
    props.mounted({
      focus: () => {
        inputRef.value?.focus()
      }
    })
  }
})
</script>

<template>
  <div class="btn-selector">
    <Select
      :value="value"
      ref="inputRef"
      @change="(val) => onchange(val as any)"
      style="width: 100%"
      :disabled="disabled"
      :placeholder="placeholder"
    >
      <SelectOption v-for="item in options" :key="item.key" :value="item.key">{{
        item.label
      }}</SelectOption>
      <template #suffixIcon>
        <div class="btn-input-suffix">
          <slot name="suffix"></slot>
        </div>
      </template>
    </Select>
  </div>
</template>

<style>
.btn-selector .ant-select-arrow {
  user-select: all !important;
  color: inherit !important;
  pointer-events: all !important;
}

.btn-input-suffix {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: -7px;
}
</style>
