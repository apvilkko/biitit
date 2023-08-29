import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/shared': { target: 'http://aapee.kapsi.fi', changeOrigin: true },
    },
  },
})
