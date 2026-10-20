// cspell:ignore ACMR
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Git command failed');
  return result.stdout;
}

const root = git(['rev-parse', '--show-toplevel']).trim();
const files = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean);
const formatFiles = files.filter((file) => /\.(?:[cm]?[jt]sx?|jsonc?|ya?ml|css|scss|html|mdx?)$/.test(file));
const policyChanged = files.some((file) => ['.editorconfig', '.markdownlint.json', 'oxfmt.config.ts'].includes(file));
if (formatFiles.length || policyChanged) {
  const snapshot = mkdtempSync(join(tmpdir(), 'website-staged-'));
  try {
    // Validate the index in isolation; never format or stage the developer's working files.
    git(['checkout-index', '--all', `--prefix=${snapshot}/`]);
    symlinkSync(join(root, 'node_modules'), join(snapshot, 'node_modules'), 'dir');
    const run = (tool, args) => {
      const result = spawnSync(join(root, 'node_modules', '.bin', tool), args, { cwd: snapshot, stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0)
        throw new Error(`Staged ${tool} check failed. Fix the reported files and stage them again.`);
    };
    if (policyChanged) run('oxfmt', ['--check']);
    else if (formatFiles.length) run('oxfmt', ['--check', '--', ...formatFiles]);
    const markdown = files.filter((file) => file.endsWith('.md'));
    if (policyChanged) run('markdownlint', ['**/*.md', '--ignore-path', '.gitignore']);
    else if (markdown.length) run('markdownlint', ['--', ...markdown]);
    if (files.some((file) => file.startsWith('src/content/blog/') || file.startsWith('src/config/content-models/'))) {
      run('vitest', ['run', 'src/content/article-format.test.ts']);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    rmSync(snapshot, { recursive: true, force: true });
  }
}
