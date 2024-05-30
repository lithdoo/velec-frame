# 色彩管理

关于颜色的声明与使用。

<script setup>
// import { ref } from 'vue'
import { ColorPalette } from '@renderer/base/color'

const palette = (cp) => {
    return cp.list.map(color=>({
        bgColor: color.rgba(),
        hex: color.hex(),
        shadow: color.shadow(),
        text: color.text()
    }))
}

</script>

<style>
    .color-palette-list{
        display: flex;
        flex-direction: row;
        padding: 8px!important;
        margin: 0 0 42px 0!important;
    }

    .color-palette-list__item{
        list-style: none;
        height: 72px;
        width: 72px;
        padding: 0!important;
        margin: 0!important;
        line-height: 72px;
        text-align:center;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        color: transparent;
    }

    
    .color-palette-list__item:hover{
        box-shadow: var(--box-shadow);
        color: var(--text-color);
    }

</style>

## 颜色声明

颜色声明根据不同的色相值作为区分。

根据不同的色相会生成对应 10 个不同明度的色值作为应用色。

目前有一下颜色声明：

- Dust_Red

<ul class="color-palette-list">
    <li 
        class="color-palette-list__item"
        v-for="(item) in palette(ColorPalette.Dust_Red)"
        :key="item.bgColor"
        :style="{
            'background':item.bgColor,
            '--box-shadow': item.shadow,
            '--text-color': item.text,
        }"
    >
        {{item.hex}}
    </li>
</ul>

- Sunset_Orange

<ul class="color-palette-list">
    <li 
        class="color-palette-list__item"
        v-for="(item) in palette(ColorPalette.Sunset_Orange)"
        :key="item.bgColor"
        :style="{
            'background':item.bgColor,
            '--box-shadow': item.shadow,
            '--text-color': item.text,
        }"
    >
        {{item.hex}}
    </li>
</ul>

- Polar_Green

<ul class="color-palette-list">
    <li 
        class="color-palette-list__item"
        v-for="(item) in palette(ColorPalette.Polar_Green)"
        :key="item.bgColor"
        :style="{
            'background':item.bgColor,
            '--box-shadow': item.shadow,
            '--text-color': item.text,
        }"
    >
        {{item.hex}}
    </li>
</ul>

- Daybreak_Blue

<ul class="color-palette-list">
    <li 
        class="color-palette-list__item"
        v-for="(item) in palette(ColorPalette.Daybreak_Blue)"
        :key="item.bgColor"
        :style="{
            'background':item.bgColor,
            '--box-shadow': item.shadow,
            '--text-color': item.text,
        }"
    >
        {{item.hex}}
    </li>
</ul>


## 衍生色

根据确定的色度，可以生成对应的衍生色。

常见的如同 文字底色和bi



## 应用

### 功能色

### 组件色