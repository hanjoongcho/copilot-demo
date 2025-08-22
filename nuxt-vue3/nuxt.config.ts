// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  plugins: ['~/plugins/element-plus'],
  css: ['element-plus/dist/index.css'],
  ssr: false,
  app: {
    baseURL: '/nuxt-vue3/', // GitHub Pages repo name
    buildAssetsDir: 'assets',
  },
});
