<script lang="ts">
export class StateJsonEditorHandler {

    text: TextEditorHandler

    constructor(public component: JthComponent) {
        this.text = fixReactive(new TextEditorHandler(this.component.testDefaultJson, 'JSON'))
    }

    isChanged() {
        return this.component.testDefaultJson !== this.text.editor?.content
    }

    updateToComponent(){
        console.log('this.text.getContent()',this.text.getContent())
        this.component.testDefaultJson = this.text.getContent()
    }
}

</script>


<script setup lang="ts">
import { TextEditor, TextEditorHandler } from '@renderer/widgets/TextEditor';
import { JthComponent } from '../../common';
import { fixReactive } from '@renderer/fix';

defineProps<{
    handler: StateJsonEditorHandler
}>()


</script>

<template>
    <TextEditor :handler="handler.text"></TextEditor>
</template>