import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


// https://vitejs.dev/confin m,.;''g/
export default defineConfig({
  server:{
    proxy:{
      "/api":'https://tasker-backend-mu.vercel.app'
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // '@' now points to 'src'
    },
  },
  css: {
    postcss: './postcss.config.cjs', // optional, usually auto-detected
  }
})
