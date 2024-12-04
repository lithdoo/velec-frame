import './assets/main.css'
import './assets/iconfont.js';

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

import { ActivFileExplorer } from './activities/FileExplorer';
// import { SiderBgTask } from './sider/bgTask';

ActivFileExplorer.install()

// SiderFileExplorer.install()
// SiderBgTask.install()