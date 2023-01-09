import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSvgSpritePlugin({
      include: '**/icons/**/*.svg',
      symbolId: 'icon-[name]-[hash]', // if you need special name: symbolId: 'icon-[name]-[hash]'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      "/fetch/data": {
        target: "https://c.m.163.com/ug/api/wuhan/app/data/list-total",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fetch\/data/, '').concat(`?t=${Date.now()}`)
      },
      "/fetch/map": {
        target: "https://geo.datav.aliyun.com/areas_v3/bound/geojson",
        changeOrigin: true,
        rewrite: (path) => {
          const adcode = path.replace(/^\/fetch\/map\//, '');
          return `?code=${adcode}_full`;
        }
      }
    }
  }
})
