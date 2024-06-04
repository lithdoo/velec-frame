# 文字排版

关于文本字体相关的排版规则。


<script setup>
const font_level = [
    [12,20],
    [14,22],
    [16,24],
    [20,28],
    [24,32],
    [30,38],
    [38,46],
    [46,54],
    [56,64],
    [68,76],
]

const font_weight = [
    200,
    400,
    600,
    800
]

const text_color = [
    { title:'标题字体', type:'title', light:'#000000E0', dark: '#FFFFFFD9',warm:'#645435'},
    { title:'常规文本', type:'normal', light:'#000000E0', dark: '#FFFFFFD9',warm:'#645435'},
    { title:'次级文本', type:'secondary', light:'#000000A6', dark: '#FFFFFFA6',warm:'#7d6228'},
    { title:'禁用字体', type:'disabled', light:'#00000040', dark: '#FFFFFF40',warm:'#beb478'},
    { title:'一级边框', type:'border', light:'#D9D9D9FF', dark: '#424242FF',warm:'#c8be96'},
    { title:'分割线',   type:'divide', light:'#0505050F', dark: '#FDFDFD1F',warm:'#ddd6c1'},
    { title:'布局背景', type:'background', light:'#F5F5F5FF', dark: '#000000FF',warm:'#eee8d5'},
]

</script>

## 字体

- 主字体

在不同的系统环境下，字体渲染会存在不同的效果。因此，主字体优先选择当前系统的默认字体。

```
font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';
```


- 衬线字体

todo...

- 等宽字体

todo...


## 字阶/行高

针对常见的功能，准备了一套字体大小和对应行高的模板，以控制页面的字体整体效果。

在开发过程中，可以根据这一套规则拓展出更为具体的文字功能规范。

其中 **level:1** 作为常规字体的字体大小。

<table>
<tr>
    <th>level</th>
    <td v-for="(_,idx) in font_level" :key="`fl_${idx}`">{{idx}}</td>
</tr>
<tr>
    <th>font-size</th>
    <td v-for="(val,idx) in font_level" :key="`fs_${idx}`">{{val[0]}}</td>
</tr>
<tr>
    <th>line-height</th>
    <td v-for="(val,idx) in font_level" :key="`lh_${idx}`">{{val[1]}}</td>
</tr>


</table>

## 字重/颜色

目前提供 <span>{{font_weight.length}}</span> 种字重以供选择。

其中 **level:1** 作为常规字重

并且为了保持整体页面效果的整洁有序，无特殊情况请仅使用 **level:1**  和 **level:2** 字重

<div style="display:flex;align-items: center;justify-content: space-around;margin: 24px 0;">
    <div 
        v-for="(val,idx) in font_weight"
        :key="`fw_${idx}`"
        style="display: flex;flex-direction: column;align-items: center;margin-right:24px"
    >
        <div>level: {{idx}}</div>
        <div :style="{
            'font-size':'68px',
            'line-height': '76px',
            'font-weight': val,
            'padding':'8px 0'
        }">永</div>
        <div>font-weight: {{val}}</div>
    </div>
</div>

字体颜色与具体用途和当前主题相关。

根据经验以将功能主要分为一下 <span>{{text_color.length}}</span> 种。对于不同颜色主题均需要声明相关的主题色。


<table>
    <tr>
        <th>类型</th>
        <th>描述</th>
        <th> 浅色主题 </th>
        <th> 暖色主题 </th>
        <th> 深色主题 </th>
    </tr>
    <tr 
        v-for="(color,idx) in text_color"
        :key="`tc_${idx}`"
    >
        <td>{{color.type}}</td>
        <td>{{color.title}}</td>
        <td :style="{
            'background':'#fff'
        }"> <span :style="{
            height: '16px', 
            width: '16px',
            display: 'inline-block',
            background: color.light,
            border:'1px solid #333',
            'vertical-align': '-3px',
            'margin-right': '4px',
        }"></span> {{color.light}}</td>
        <td :style="{
            'background':'#fdf6e3',
            'color':'#7d6228'
        }"><span :style="{
            height: '16px', 
            width: '16px',
            display: 'inline-block',
            background: color.warm,
            border:'1px solid #333',
            'vertical-align': '-3px',
            'margin-right': '4px',
        }"></span> {{color.dark}}</td>
        <td :style="{
            'background':'#000',
            'color':'#fff'
        }"><span :style="{
            height: '16px', 
            width: '16px',
            display: 'inline-block',
            background: color.dark,
            border:'1px solid #fff',
            'vertical-align': '-3px',
            'margin-right': '4px',
        }"></span> {{color.dark}}</td>
    </tr>
</table>

文本颜色如果和背景颜色太接近就会难以阅读。考虑到无障碍设计的需求，请将正文文本、标题和背景色之间保持在了 7:1 以上对比度。