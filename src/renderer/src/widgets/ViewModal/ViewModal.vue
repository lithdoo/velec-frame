<template>
    <div class="confirm-modal-cntr" v-if="current">
        <div class="confirm-modal__overlay" v-if="current">

        </div>
        <div class="confirm-modal" v-if="current">
            <div class="confirm-modal__inner">
                <div class="confirm-modal__header">
                    <div class="confirm-modal__icon" v-if="current.icon">
                        <template v-if="typeof current.icon === 'string'">
                            <VxIcon :name="current.icon"></VxIcon>
                        </template>
                        <template v-else>
                            <ElementInject :target="current.icon" />
                        </template>
                    </div>
                    <div class="confirm-modal__title">{{ current.title }}</div>
                </div>
                <div class="confirm-modal__body">
                    <ElementInject :target="current.content" />
                </div>
            </div>
            <div class="confirm-modal__extra" v-for="(_, i) in new Array(extraLenth).fill(0)" :key="i"></div>
        </div>
        
    </div>


</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ViewModalHandler } from './ViewModalHandler';
import { VxIcon } from '@renderer/components';
import { ElementInject } from '@renderer/components';

const props = defineProps<{ handler: ViewModalHandler }>()
const current = computed(() => props.handler.stacks[props.handler.stacks.length - 1])
const extraLenth = computed(() => props.handler.stacks.length - 1)


</script>

<style lang="scss" scoped>

.confirm-modal-cntr{
    position: absolute;
    z-index: 100;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    overflow: hidden;
}
.confirm-modal__overlay {
    position: absolute;
    z-index: 100;
    background: rgba(0, 0, 0, 0.6);
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
}

.confirm-modal {
    position: absolute;
    z-index: 100;
    background: #1f1f1f;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    // height: 400px;
    // width: 600px;
}

.confirm-modal {
    background-color: #1f1f1f;
    background-clip: padding-box;
    border: 0;
    border-radius: 8px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);


    .confirm-modal__header {
        padding: 20px 24px;
        background-color: rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        flex-direction: column;

        .confirm-modal__icon {
            font-size: 36px;
        }

        .confirm-modal__title {
            margin: 0;
            color: rgba(255, 255, 255, 0.85);
            font-weight: 600;
            font-size: 18px;
            line-height: 1.5;
            word-wrap: break-word;
        }


    }

    .confirm-modal__body {
        padding: 20px 36px;
        color: rgba(255, 255, 255, 0.65);
    }
}

.confirm-modal__extra {
    margin-top: 10px;
}
</style>
