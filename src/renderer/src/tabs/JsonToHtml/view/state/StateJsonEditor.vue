<script lang="ts">
export class StateJsonEditorHandler {

    text: TextEditorHandler

    constructor(public component: JthComponent) {
        this.text = new TextEditorHandler(this.component.testDefaultJson, 'JSON')
    }

    async init() {
        const manaco = await this.text.monaco
        manaco.onDidChangeModelContent(() => {
            this.updateContent()
        })
    }


    updateContentTimeout: any
    updateContent() {
        if (this.updateContentTimeout) {
            clearTimeout(this.updateContentTimeout)
        }
        this.updateContentTimeout = setTimeout(async () => {
            this.updateContentTimeout = null
            const manaco = await this.text.monaco
            const content = manaco.getValue() ?? ''
            this.curContent = content
            console.log({content})
        }, 200)
    }

    isChanged() {
        return this.component.testDefaultJson === this.curContent
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