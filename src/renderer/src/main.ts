import './assets/main.css'
import './assets/iconfont.js';

import { createApp } from 'vue'
import App from './App.vue'
import { SiderFileExplorer } from './sider/fileExplorer/index';
import { SiderBgTask } from './sider/bgTask';

createApp(App).mount('#app')

SiderFileExplorer.install()
SiderBgTask.install()