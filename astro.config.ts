import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const nonIndexablePaths = ['/admin/', '/resume.json', '/resume.md', '/resume.txt'];

export default defineConfig({
  site: 'https://www.rahulmohandas.com',
  integrations: [
    sitemap({
      filter: (page) => !nonIndexablePaths.some((path) => page.endsWith(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
