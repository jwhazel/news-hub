// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    contentEndpoint: process.env.CONTENT_ENDPOINT,
    contentApiKey: process.env.CONTENT_API_KEY,
    sitecode: process.env.SITECODE,
    userAgent: process.env.USER_AGENT,
    mediaBaseUrl: process.env.MEDIA_BASE_URL
  },
  fonts: {
    families: [
      { name: 'Newsreader', provider: 'google', weights: ['400', '600', '700'] },
      { name: 'DM Sans', provider: 'google', weights: ['400', '500', '600'] }
    ]
  },
  routeRules: {
    '/api/get-article/**': { swr: 3600 },
    '/api/get-asset/**': { swr: 86400 }
  }
})
