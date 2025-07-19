# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

---

## GitHub Pages 배포 방법

이 프로젝트는 GitHub Pages로 정적 배포할 수 있습니다.

### 1. `vite.config.js`에서 base 경로 설정

리포지토리명에 맞게 `base` 옵션을 추가합니다.

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/copilot-demo/', // 리포지토리명으로 변경
})
```

### 2. 빌드

```sh
npm run build
```

### 3. gh-pages 패키지 설치 및 배포 스크립트 추가

```sh
npm install --save-dev gh-pages 
```

`package.json`에 아래 스크립트 추가:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

### 4. 배포

```sh
npm run deploy
```

### 5. GitHub Pages 설정

GitHub 리포지토리의 Settings > Pages에서 배포 브랜치를 `gh-pages`로 지정하세요.

자세한 내용은 [Vue Docs - GitHub Pages 배포](https://vuejs.org/guide/deployment/github-pages.html)를 참고하세요.
