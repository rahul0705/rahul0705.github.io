import { mkdir, writeFile } from 'node:fs/promises';

import type { AstroConfig, AstroIntegration } from 'astro';

import { renderSecurityTxt, securityTxtPath, type SecurityConfig } from './render';

export default function securityTxt(security: SecurityConfig | undefined): AstroIntegration {
  let deployment: Pick<AstroConfig, 'site' | 'base'>;

  return {
    name: 'security-txt',
    hooks: {
      'astro:config:done': ({ config }) => {
        deployment = config;
      },
      'astro:build:done': async ({ dir }) => {
        if (!security) return;
        const body = renderSecurityTxt(security, deployment.site, deployment.base);
        const destination = new URL(`.${securityTxtPath}`, dir);
        await mkdir(new URL('.', destination), { recursive: true });
        await writeFile(destination, body, 'utf8');
      },
    },
  };
}
