import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Velec Frame 开发文档",
  description: "基于 Vue3 & Electron 的应用开发框架",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速上手', link: '/entry/' },
      { text: '设计体系', link: '/design/' },
      { text: '框架模块', link: '/frame/' },
      { text: '结构布局', link: '/layout/' },
      { text: '基础组件', link: '/components/' },
    ],

    sidebar: [
      {
        text: '快速上手',
        collapsed: true,
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: '设计体系',
        collapsed: true,
        items: [
          { text: '概述', link: '/design/' },
          { text: '主题标识', link: '/design/theme' },
          { text: '色彩管理', link: '/design/color' },
          { text: '文字排版', link: '/design/text' },
          { text: '块级元素', link: '/design/block' },
          { text: '过渡动效', link: '/design/animation' },
        ]
      },
      {
        text: '框架模块',
        collapsed: true,
        items: [
          { text: '概述', link: '/frame/' },
        ]
      },
      {
        text: '结构布局',
        collapsed: true,
        items: [
          { text: '概述', link: '/layout/' },
        ]
      },
      {
        text: '基础组件',
        collapsed: true,
        items: [
          { text: '概述', link: '/component/' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
