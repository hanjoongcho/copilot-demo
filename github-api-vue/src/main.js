import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

// 앱 생성 및 설정 분리
const app = createApp(App)

// 플러그인 등록 등 설정
app.use(ElementPlus)

app.mount('#app')   
  