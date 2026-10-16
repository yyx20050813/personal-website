import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 相对路径，保证构建产物可以部署到任意子目录，也可直接本地打开
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5173,
    open: true,
  },
})
