/// <reference types="vitest/config" />
import yaml from '@rollup/plugin-yaml'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so the build works when itch.io serves it from a subfolder.
  base: './',
  plugins: [react(), yaml()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
