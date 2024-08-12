import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiURL=import.meta.env.VITE_API_URL
// https://vitejs.dev/confin m,.;''g/
export default defineConfig({
  server:{
    proxy:{
      "/api":`${apiURL}`
    }
  },
  plugins: [react()]
})
