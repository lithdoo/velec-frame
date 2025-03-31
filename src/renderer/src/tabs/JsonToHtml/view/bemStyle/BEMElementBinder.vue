<script lang="ts">
export abstract class BEMElementBinderHandler {
    abstract readonly templateId: string
    abstract readonly bem: JthModBEMStyle
    abstract readonly store: JthModValueStore
    abstract readonly controller: JthStateController

    tagList() {
        console.log(this.bem.getTagsByTemplateId(this.templateId))
        return this.bem.getTagsByTemplateId(this.templateId)
    }

    edit?: {
        old?: BemTag,
        current: BemTag | null
    }



    editContent(tag: BemTag) {
        const modal = PageJthBase.modal(this.controller)
        const title = `CSS (${JthModBEMStyle.tagClass(tag)})`
        const content = this.bem.fetchContent(tag)
        modal.textEditor({
            content, lang: 'css', title,
            submit: (content) => {
                this.bem.updateContent(tag, content)
            }
        })
    }



    confirm() {
        console.log({ edit: this.edit })
        if (!this.edit) return
        const { old, current } = this.edit
        if (old) {
            this.bem.delTagTemplate(old, this.templateId)
        }
        if (!current) return
        this.bem.addTagTemplate(current, this.templateId)
        this.edit = undefined
    }

    cancel() {
        this.edit = undefined
    }

    newTag() {
        this.edit = { current: null }
    }

    editTag(tag: BemTag) {
        this.edit = { current: tag, old: tag }
    }

    delTag(tag: BemTag) {
        this.bem.delTagTemplate(tag, this.templateId)
    }

}


</script>


<script setup lang="ts">
import { computed } from 'vue';
import { BemTag, JthModBEMStyle, JthModValueStore, JthStateController } from '../base';
import VxButton from '@renderer/components/VxButton/VxButton.vue';
import BEMSelector from './BEMSelector.vue';
import { PageJthBase } from '../../PageBase';

const props = defineProps<{ handler: BEMElementBinderHandler }>()
const list = computed(() => props.handler.tagList())

</script>


<template>

    <div class="bem-binder">
        <div class="bem-binder__tag-item" :data-edit-mode="true" v-if="handler.edit && !handler.edit.old">
            <BEMSelector :bem="handler.bem" v-model="handler.edit.current"></BEMSelector>
            <div class="bem-binder__confirm">
                <VxButton icon="clear" :click="() => handler.cancel()">取消</VxButton>
                <VxButton icon="done" :click="() => handler.confirm()">确定</VxButton>
            </div>
        </div>
        <div class="bem-binder__tag-item" :data-edit-mode="handler.edit?.old === item.tag" v-for="item in list">
            <div v-if="handler.edit?.old === item.tag" class="bem-binder__tag-editor">
                <BEMSelector :bem="handler.bem" v-model="handler.edit.current"></BEMSelector>
                <div class="bem-binder__confirm">
                    <VxButton icon="clear" :click="() => handler.cancel()">取消</VxButton>
                    <VxButton icon="done" :click="() => handler.confirm()">确定</VxButton>
                </div>
            </div>
            <div v-else class="bem-binder__tag">
                <div class="bem-binder__tag-text">
                    <span>{{ item.tag[0] }}</span>
                    <span v-if="item.tag[1]">__{{ item.tag[1] }}</span>
                    <span v-if="item.tag[2]">--{{ item.tag[2] }}</span>
                </div>
                <VxButton only-icon icon="plus" :click="() => handler.editContent(item.tag)"></VxButton>
                <VxButton only-icon icon="edit" :click="() => handler.editTag(item.tag)"></VxButton>
                <VxButton only-icon icon="del" :click="() => handler.delTag(item.tag)"></VxButton>
            </div>
        </div>

    </div>



</template>

<style lang="scss" scoped>
.bem-binder__confirm {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    gap: 6px;
    padding: 6px 0;
    margin-top: 6px;
}

.bem-binder__tag-item {
    &[data-edit-mode="true"] {
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
    }

    padding: 6px 0;
}

.bem-binder__tag {
    display: flex;
    gap: 6px;

    .bem-binder__tag-text {
        flex: 1 1 0;
    }
}
</style>
