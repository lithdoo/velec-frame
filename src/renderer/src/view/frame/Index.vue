<script lang="ts" setup>
import TitleBar from "./TitleBar.vue";
import ActivityBar from "./ActivityBar.vue";
import SideBar from "./SideBar.vue";
import PageTab from './PageTab.vue'

import { SinglePanelSplitHandler, SinglePanelSplit } from "@renderer/components/base/SinglePanelSplit";
import { computed, ref } from "vue";
import { appSider } from "@renderer/state/sider";

const splitCenter = ref(new SinglePanelSplitHandler())
const isSiderBarShown = computed(() => !!appSider.currentPanel())
const siderSplitWidth = computed(() => isSiderBarShown.value ? splitCenter.value.distance : 0)


</script>


<template>
    <div class="app-frame">
        <div class="app-frame__title-bar">
            <TitleBar></TitleBar>
        </div>
        <div class="app-frame__menu-bar"></div>
        <div class="app-frame__main-content">
            <div class="app-frame__activity-bar">
                <ActivityBar></ActivityBar>
            </div>

            <div class="app-frame__center">

                <SinglePanelSplit :handler="splitCenter">
                    <template #panel>
                        <div :class="[
                            'app-frame__side-bar',
                            isSiderBarShown ? '' : 'app-frame__side-bar--hidden'
                        ]" :style="{ width: siderSplitWidth + 'px' }">
                            <SideBar></SideBar>
                        </div>
                    </template>
                    <template #extra>
                        <div class="app-frame__process-tab">
                            <PageTab></PageTab>
                        </div>
                    </template>
                </SinglePanelSplit>
            </div>

        </div>
    </div>
</template>


<style lang="scss" scoped>
.app-frame {
    height: 100%;
    width: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;

    .app-frame__title-bar {
        flex: 0 0 auto;
    }

    .app-frame__menu-bar {
        flex: 0 0 auto;
    }

    .app-frame__main-content {
        flex: 1 1 0;
        height: 0;

        display: flex;
        flex-direction: row;

        .app-frame__activity-bar {
            flex: 0 0 auto;
        }

        .app-frame__center {
            flex: 1 1 0;
            width: 0;
        }


        .app-frame__side-bar {
            height: 100%;
            width: 100%;
            opacity: 1;

            &.app-frame__side-bar--hidden {
                opacity: 0;
            }
        }

        .app-frame__process-tab {
            height: 100%;
            width: 100%;
        }
    }
}
</style>
g