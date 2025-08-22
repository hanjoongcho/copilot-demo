// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  plugins: ['~/plugins/element-plus'],
  css: ['element-plus/dist/index.css'],
  ssr: false,
  app: {
    baseURL: '/copilot-demo/', // GitHub Pages repo name
    buildAssetsDir: 'assets',
  },
  nitro: {
    preset: 'static', // 정적 사이트 생성
  },
});
