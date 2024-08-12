import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/confin m,.;''g/
export default defineConfig({
  server:{
    proxy:{
      "/api":'https://tasker-backend-mu.vercel.app/'
    }
  },
  plugins: [react()]
})
