// frontend/vite.config.js (CLEANED)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 'css' block for postcss should be GONE now.
})