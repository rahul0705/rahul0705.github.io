import { closeSync, existsSync, fstatSync, openSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

export const requiredOutputPaths = [
  'index.html',
  '404.html',
  'blog/index.html',
  'privacy/index.html',
  'admin/index.html',
  'resume/index.html',
  'resume.json',
  'resume.md',
  'resume.txt',
  'favicon.svg',
  'robots.txt',
  'rss.xml',
  'sitemap-index.xml',
  'sitemap-0.xml',
] as const;

export function validateBuild(outputDirectory: string, contentDirectory: string): void {
  const output = resolve(outputDirectory);
  if (!existsSync(output) || !statSync(output).isDirectory()) {
    throw new Error(`Build output directory does not exist: ${output}`);
  }
  const required: string[] = [...requiredOutputPaths];
  const forbidden = ['site.webmanifest', 'manifest.json'];
  for (const file of readdirSync(contentDirectory).filter((file) => file.endsWith('.md'))) {
    const source = readFileSync(join(contentDirectory, file), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) throw new Error(`${file}: missing article front matter`);
    const route = `blog/${file.slice(0, -3)}/index.html`;
    (parse(frontmatter[1]).draft ? forbidden : required).push(route);
  }
  const errors = [];
  for (const file of required) {
    const path = join(output, file);
    if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size === 0) {
      errors.push(`${file}: required output is missing or empty`);
    }
  }
  for (const file of forbidden) {
    if (existsSync(join(output, file))) errors.push(`${file}: output must not be published`);
  }
  for (const file of readdirSync(output, { recursive: true }).map(String)) {
    if (!/\.(?:html|css|js|json|xml|txt|md)$/.test(file)) continue;
    const path = join(output, file);
    const descriptor = openSync(path, 'r');
    try {
      if (!fstatSync(descriptor).isFile()) continue;
      const token = readFileSync(descriptor, 'utf8').match(/__FORGE_[A-Z0-9_]+__|FORGE_[A-Z0-9_]+_PLACEHOLDER/);
      if (token) errors.push(`${file}: unresolved template token ${token[0]}`);
    } finally {
      closeSync(descriptor);
    }
  }
  if (errors.length) throw new Error(`Build validation failed:\n${errors.join('\n')}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  validateBuild(join(project, 'dist'), join(project, 'src/content/blog'));
  console.log('Production build smoke check passed.');
}
