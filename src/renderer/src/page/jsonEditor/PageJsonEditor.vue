<script lang="ts" setup>
import type { PageJsonEditor } from './index';
import { ToolBar, ToolBarBuilder } from '@renderer/components/base/ToolBar'
import TextEditor from "@renderer/components/editor/TextEditor.vue"


const props = defineProps<{
    page: PageJsonEditor
}>()

const toolbar = ToolBarBuilder.create()
    .button('save', '保存', () => { props.page.save() },{
        icon:'del'
    })
    .build()

</script>

<template>
    <div class="page-sql-editor">
        <div class="page-sql-editor__toolbar">
            <ToolBar :handler="toolbar"></ToolBar>
        </div>
        <div class="page-sql-editor__editor">
             <TextEditor :handler="props.page.editorHandler"></TextEditor>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-sql-editor{
    height: 100%;
    display: flex;
    flex-direction: column;
}

.page-sql-editor__toolbar{
    flex: 0 0 auto;
    border-bottom: 1px solid #666;
}

.page-sql-editor__editor{
    flex: 1 1 0;
    height: 0;
}
</style>



