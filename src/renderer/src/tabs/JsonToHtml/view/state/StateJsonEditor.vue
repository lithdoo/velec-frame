<script lang="ts">
export class StateJsonEditorHandler {

    text: TextEditorHandler

    constructor(public component: JthComponent) {
        this.text = new TextEditorHandler(this.component.testDefaultJson, 'JSON')
    }

    isChanged() {
        return this.component.testDefaultJson === this.text.getContent()
    }

    curContent: string = ''
}

</script>


<script setup lang="ts">
import { TextEditor, TextEditorHandler } from '@renderer/widgets/TextEditor';
import { JthComponent } from '../../common';

defineProps<{
    handler: StateJsonEditorHandler
}>()


</script>

<template>
    <TextEditor :handler="handler.text"></TextEditor>
</template>