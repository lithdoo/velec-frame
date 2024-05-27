<template>
<div class="app-frame">
    <div class="app-frame__title-bar"></div>
    <div class="app-frame__menu-bar"></div>
    <div class="app-frame__conent"></div>
</div>    
</template>


<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.app-frame{
    height: 100%;
    width: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;

    .app-frame__title-bar{
        flex: 0 0 auto;
    }
    
    .app-frame__menu-bar{
        flex: 0 0 auto;
    }

    .app-frame__conent{
        flex: 1 1 0;
        height: 0;
    }
}

</style>
g