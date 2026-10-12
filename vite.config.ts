import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base works on GitHub Pages (user or project site), Netlify, Vercel, or any static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2020', cssCodeSplit: true },
})
