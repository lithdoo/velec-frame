<template>
    <div class="template-tree">
        <div class="template-tree__tree">
            <FlatTree :handler="tree.flatTree">
                <template #item="{ item }">
                    <div>{{ item.templateData.type }} -- {{ tree.treeText(item.templateData)}}</div>
                </template>
            </FlatTree>
        </div>
        <div class="template-tree__detail" v-if="tree.showDetailTemplateId">
            <TemplateDetail :model="tree.controller" :template-id="tree.showDetailTemplateId" :tree="tree"></TemplateDetail>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TemplateTreeHandler } from "./handler";
import { FlatTree } from '@renderer/widgets/FlatTree';
import TemplateDetail from "./TemplateDetail.vue";

// const props = 
defineProps<{ tree: TemplateTreeHandler }>()



</script>

<style scoped lang="scss">
.template-tree {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: row;

    .template-tree__tree {
        flex: 1 1 0;
        width: 0;
        height: 100%;
        overflow: auto;
    }

    .template-tree__detail {
        flex: 0 0 360px;
        width: 360px;
        // border-left: 1px solid #ccc
        background-color: rgb(24, 24, 24);
        box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
    }
}
</style>