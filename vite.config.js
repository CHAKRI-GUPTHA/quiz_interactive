import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use GitHub Pages base only for production build.
  base: command === 'build' ? '/quiz_interactive/' : '/',
}))
