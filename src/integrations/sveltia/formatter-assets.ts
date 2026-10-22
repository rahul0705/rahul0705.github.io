import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { resolveBrowserOptions } from '@rm-industries/browser-oxfmt/build';
import type { AstroIntegration } from 'astro';

// Keep relative worker and WASM imports intact instead of asking Vite to rewrite a dependency's worker graph.
export function sveltiaFormatterAssets(): AstroIntegration {
  const directory = new URL('.', import.meta.resolve('@rm-industries/browser-oxfmt'));
  let policy = '';
  let assetPath = '';
  let files: Set<string>;
  return {
    name: 'sveltia-formatter-assets',
    hooks: {
      'astro:config:setup': async ({ config, logger }) => {
        const result = await resolveBrowserOptions({
          cwd: fileURLToPath(config.root),
          filename: 'src/content/blog/article.md',
          requireUniformPolicy: true,
        });
        for (const diagnostic of result.diagnostics) logger.warn(diagnostic.message);
        policy = JSON.stringify(result.resolvedOptions);
        files = new Set(await readdir(directory, { recursive: true }));
        assetPath = `${config.base.replace(/\/$/, '')}/admin/formatter/`;
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((request, response, next) => {
          void (async () => {
            const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
            if (!pathname.startsWith(assetPath)) return next();
            const filename = pathname.slice(assetPath.length);
            if (filename !== 'policy.json' && !files.has(filename)) return next();
            try {
              const content = filename === 'policy.json' ? policy : await readFile(new URL(filename, directory));
              response.setHeader(
                'Content-Type',
                filename.endsWith('.wasm')
                  ? 'application/wasm'
                  : filename.endsWith('.json')
                    ? 'application/json'
                    : 'text/javascript',
              );
              response.end(content);
            } catch {
              next();
            }
          })().catch(next);
        });
      },
      'astro:build:done': async ({ dir }) => {
        const destination = new URL('admin/formatter/', dir);
        await mkdir(destination, { recursive: true });
        await cp(directory, destination, { recursive: true });
        await writeFile(new URL('policy.json', destination), policy);
      },
    },
  };
}
