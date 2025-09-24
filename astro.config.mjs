// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://geshem.space',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 2000
    }
  },

  adapter: cloudflare({
    imageService: "compile"
  })
});