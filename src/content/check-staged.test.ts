import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, it } from 'vitest';

it('checks staged Markdown without overwriting a partially staged correction', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'staged-content-test-'));
  const git = (...args: string[]) => execFileSync('git', args, { cwd: fixture, encoding: 'utf8' });
  const filename = 'article with spaces.md';
  const invalid = `# Example\n\n${'Words in an overlong paragraph. '.repeat(12).trim()}\n`;
  const corrected = '# Example\n\nA short paragraph.\n';
  const run = () =>
    spawnSync(process.execPath, [fileURLToPath(new URL('./check-staged.mjs', import.meta.url))], {
      cwd: fixture,
      encoding: 'utf8',
    });
  try {
    git('init', '--quiet');
    symlinkSync(resolve('node_modules'), join(fixture, 'node_modules'), 'dir');
    for (const file of ['oxfmt.config.ts', '.markdownlint.json', '.editorconfig', '.gitignore'])
      copyFileSync(file, join(fixture, file));
    writeFileSync(join(fixture, 'package.json'), '{\n  "type": "module"\n}\n');
    writeFileSync(join(fixture, filename), invalid);
    git('add', filename, 'oxfmt.config.ts', '.markdownlint.json', '.editorconfig', '.gitignore', 'package.json');
    writeFileSync(join(fixture, filename), corrected);
    const failed = run();
    expect(failed.status, failed.stdout + failed.stderr).toBe(1);
    expect(failed.stdout + failed.stderr).toContain('MD013');
    expect(git('show', `:${filename}`)).toBe(invalid);
    expect(readFileSync(join(fixture, filename), 'utf8')).toBe(corrected);
    git('add', filename);
    const passed = run();
    expect(passed.status, passed.stdout + passed.stderr).toBe(0);
    expect(git('show', `:${filename}`)).toBe(corrected);
    expect(readFileSync(join(fixture, filename), 'utf8')).toBe(corrected);
    // A policy-only change must also check articles already in the repository.
    writeFileSync(join(fixture, filename), invalid);
    git('add', filename);
    git(
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.com',
      'commit',
      '--no-verify',
      '--quiet',
      '-m',
      'Fixture',
    );
    writeFileSync(
      join(fixture, '.editorconfig'),
      `${readFileSync(join(fixture, '.editorconfig'), 'utf8')}\n# Policy change\n`,
    );
    git('add', '.editorconfig');
    const policyFailure = run();
    expect(policyFailure.status, policyFailure.stdout + policyFailure.stderr).toBe(1);
    expect(policyFailure.stdout + policyFailure.stderr).toContain('MD013');
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
