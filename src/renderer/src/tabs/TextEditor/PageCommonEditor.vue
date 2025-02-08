<script lang="ts" setup>
import { TextEditorHandler, TextEditor } from '@renderer/widgets/TextEditor'
import { ToolBar, ToolBarHandler } from '@renderer/widgets/ToolBar'

defineProps<{
  toolbar: ToolBarHandler
  editor: TextEditorHandler
}>()
</script>

<template>
  <div class="page-common-editor">
    <div class="page-common-editor__header">
      <ToolBar :handler="toolbar"></ToolBar>
    </div>
    <div class="page-common-editor__content">
      <TextEditor :handler="editor"></TextEditor>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-common-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  &__header {
    flex: 0 0 auto;
  }

  &__content {
    flex: 1 1 0;
    height: 0;
  }
}
</style>
