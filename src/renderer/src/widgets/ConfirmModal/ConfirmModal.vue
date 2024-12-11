<template>

    <div class="confirm-modal__overlay" v-if="current">

    </div>
    <div class="confirm-modal" v-if="current">
        <div class="confirm-modal__inner">
            <div class="confirm-modal__header">
                <div class="confirm-modal__icon">
                    <VxIcon name="home"></VxIcon>
                </div>
                <div class="confirm-modal__title">{{ current.title }}</div>
            </div>
            <div class="confirm-modal__body">{{ current.message }}</div>
            <div class="confirm-modal__footer">
                <div class="confirm-modal__extra"></div>
                <div class="confirm-modal__buttons">
                    <div class="confirm-modal__button" @click="() => emitAction(current, btn)" :data-type="btn.type"
                        v-for="(btn) in current.buttons" :key="btn.text">{{ btn.text }}
                    </div>
                </div>
            </div>
        </div>
        <div class="confirm-modal__extra" v-for="(_, i) in new Array(extraLenth).fill(0)" :key="i"></div>
    </div>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ConfirmModalHandler, ConfirmModalButton, ConfirmModalContent } from './ConfirmModalHandler';
import { VxIcon } from '@renderer/components';

const props = defineProps<{ handler: ConfirmModalHandler }>()
const current = computed(() => props.handler.stacks[0])
const extraLenth = computed(() => props.handler.stacks.length - 1)
const emitAction = (content: ConfirmModalContent, btn: ConfirmModalButton) => {
    btn.action({
        handler: props.handler,
        close: () => props.handler.close(content),
    })
}




</script>

<style lang="scss" scoped>
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

    .confirm-modal__footer {
        display: flex;
        flex-direction: row;
        padding: 20px 36px;
        padding-top: 8px;

        .confirm-modal__extra {
            flex: 1 1 0;
            width: 0;
        }

        .confirm-modal__buttons {
            flex: 0 0 auto;
            display: flex;
            flex-direction: row;
            gap: 8px;
            align-items: center;

            .confirm-modal__button {
                border-width: 1px;
                border-style: solid;
                border-color: #fff;
                border-radius: 2px;
                height: 32px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                min-width: 96px;
                padding: 0 16px;
                cursor: pointer;

                &[data-type="primary"] {
                    background-color: #66ccff;
                    border-color: #66ccff;
                    color: #fff;

                    &:hover {
                        opacity: 0.8;
                    }
                }

                &[data-type="danger"] {
                    background-color: #b55353;
                    border-color: #b55353;
                    color: #fff;
                    transform: translateY(1px);

                    &:hover {
                        opacity: 0.8;
                    }
                }

                &[data-type="link"] {
                    background-color: transparent;
                    border-color: transparent;
                    color: #fff;

                    &:hover {
                        opacity: 0.8;
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}

.confirm-modal__extra {
    margin-top: 10px;
}
</style>
