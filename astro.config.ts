import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { siteConfig } from './src/config/site';
import { sveltiaFormatterAssets } from './src/integrations/sveltia/formatter-assets';

export default defineConfig({
  site: 'https://www.rahulmohandas.com',
  base: '/',
  // Preserve word boundaries around inline elements split across source lines.
  compressHTML: true,
  integrations: [
    sveltiaFormatterAssets(),
    sitemap({
      filter: (page) => !siteConfig.nonIndexablePaths.some((path) => page.endsWith(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
