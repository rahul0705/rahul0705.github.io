import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.rahulmohandas.com',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/admin/') && !page.endsWith('/resume.json'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
