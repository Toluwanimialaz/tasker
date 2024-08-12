import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiURL=import.meta.env.VITE_API_URL
// https://vitejs.dev/config/
export default defineConfig({
  server:{
    proxy:{
      "/api":`${apiURL}`
    }
  },
  plugins: [react()]
})
