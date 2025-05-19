<script setup lang="tsx">
import { ToolBarBuilder, ToolBar } from '@renderer/widgets/ToolBar'
import type { PageMutDBChart } from './handler';
import { ModalPanel } from '@renderer/widgets/ModalStack/ModalStack.vue';
import { ModalStack } from '@renderer/widgets/ModalStack/index'
import { nanoid } from 'nanoid';
import FormRecord, { FromRecordBinder } from './FormRecord.vue'
import { Msg } from '@renderer/utils';
import { fixReactive } from '@renderer/fix';
import { HTMLElementInject } from '@renderer/components';
import { DataRepeatDealType } from '@renderer/mods/mutd/struc';

const props = defineProps<{ page: PageMutDBChart }>()

const addTable = () => {

    const binder = fixReactive(new class extends FromRecordBinder {
        constructor() {
            super(props.page.table.info)
        }
        required: string[] = ['repeat_deal_type', 'table_name']

        textEnum: { [key: string]: string[]; } = {
            'repeat_deal_type': [...Object.values(DataRepeatDealType)]
        }

        close() {
            props.page.modal.remove(panel.key)
        }
        
        async submit(data) {
            super.submit(data)
            Msg.success(this.refKey ?? '')
            await props.page.table.update([data])
            Msg.success('更新成功！')
            await props.page.view?.reload()
        }
    })

    const panel: ModalPanel = {
        key: nanoid(),
        content: <FormRecord {...binder} />
    }
    props.page.modal.push(panel)
}

const reload = async () => {
    await props.page.view?.reload()
}

const toolbar = ToolBarBuilder.create()
    .button('addTable', '添加表', addTable)
    .button('reload', '重新加载', reload)
    .build()

</script>

<template>
    <div class="mut-db-chart">

        <ModalStack :handler="props.page.modal"></ModalStack>

        <ToolBar :handler="toolbar"></ToolBar>
        <div class="mut-db-chart__content">
            <HTMLElementInject :target="page.viewElement" :style="{ height: '100%' }"></HTMLElementInject>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.mut-db-chart {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;

    .mut-db-chart__content {
        height: 0;
        flex: 1 1 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
}
</style>