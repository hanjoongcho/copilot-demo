import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import './style.css';
import hljs from 'highlight.js';

// 앱 생성 및 설정 분리
const app = createApp(App);

// 플러그인 등록 등 설정
app.use(ElementPlus);

VueMarkdownEditor.use(vuepressTheme);
app.use(VueMarkdownEditor);

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});
app.use(VMdPreview);

app.mount('#app');
