import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const stepSchema = z.object({
  name: z.string().optional(),
  run: z.string().optional(),
  uses: z.string().optional(),
  with: z.record(z.string(), z.unknown()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});
const jobSchema = z.object({
  needs: z.union([z.string(), z.array(z.string())]).optional(),
  if: z.string().optional(),
  steps: z.array(stepSchema),
});
type Job = z.infer<typeof jobSchema>;
const { jobs } = z
  .object({ jobs: z.record(z.string(), jobSchema) })
  .parse(parse(readFileSync(new URL('../.github/workflows/project.yml', import.meta.url), 'utf8')));
const { scripts } = z
  .object({ scripts: z.record(z.string(), z.string()) })
  .parse(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')));
const sourceJobs = [
  'format',
  'lint-code',
  'lint-styles',
  'lint-markdown',
  'spellcheck',
  'audit-unused',
  'typecheck',
  'test-unit',
];
const dependencies = (job: Job): string[] => (Array.isArray(job.needs) ? job.needs : job.needs ? [job.needs] : []);
const ancestors = (name: string): string[] =>
  dependencies(jobs[name]).flatMap((parent) => [parent, ...ancestors(parent)]);
const steps = (name: string) => jobs[name].steps;
const expand = (command: string): string =>
  command.replace(/npm run ([\w:-]+)/g, (_, name: string) => expand(scripts[name]));
const preDeployCommands = Object.entries(jobs)
  .filter(([name]) => !['deploy', 'smoke-deployed'].includes(name))
  .flatMap(([, job]) => job.steps.flatMap((step) => (step.run ? [expand(step.run)] : [])))
  .join('\n');

describe('website CI dependency and artifact contract', () => {
  it('admits every GitLab validation job in merge requests while keeping publishing disabled', () => {
    const gitlab = z
      .record(
        z.string(),
        z.object({
          rules: z.array(z.record(z.string(), z.string())).optional(),
          extends: z.string().optional(),
        }),
      )
      .parse(parse(readFileSync(new URL('../.gitlab/ci/project.yml', import.meta.url), 'utf8')));
    for (const name of [
      ...sourceJobs,
      'build',
      'test-browser',
      'lighthouse',
      'lint-generated-markdown',
      'validate-build',
    ]) {
      const job = gitlab[name];
      expect(job.rules ?? (job.extends ? gitlab[job.extends]?.rules : undefined), name).toEqual([
        { if: '$CI_PIPELINE_SOURCE == "merge_request_event"' },
        { if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH && $CI_PIPELINE_SOURCE == "push"' },
      ]);
    }
    for (const name of ['deploy', 'smoke-deployed']) {
      expect(gitlab[name].rules, name).toEqual([{ when: 'never' }]);
    }
  });

  it('runs each source check and build once, including through npm wrappers', () => {
    for (const command of [
      'oxfmt --check',
      'oxlint',
      'stylelint ',
      'markdownlint "',
      'cspell ',
      'astro check',
      'vitest run',
      'astro build',
      'pagefind --site dist',
      'knip',
    ]) {
      expect(preDeployCommands.split(command).length - 1, command).toBe(1);
    }
    expect(preDeployCommands).not.toContain('tsc --noEmit');
  });

  it('runs source checks independently so all failures can report', () => {
    for (const name of sourceJobs) {
      expect(dependencies(jobs[name])).toEqual([]);
      expect(steps(name).filter((step) => step.run)).toHaveLength(1);
    }
  });

  it('builds only after source checks and unit tests pass', () => {
    expect(ancestors('build')).toEqual(expect.arrayContaining(sourceJobs));
    const commands = steps('build').map((step) => step.run);
    expect(commands.filter(Boolean)).toEqual(['npm run build']);
    expect(
      steps('validate-build')
        .filter((step) => step.run)
        .map((step) => step.run),
    ).toEqual(['npm run validate:build']);
    expect(commands).not.toContain('npm run lint:resume:markdown');
    expect(
      steps('lint-generated-markdown')
        .filter((step) => step.run)
        .map((step) => step.run),
    ).toEqual(['npm run lint:resume:markdown']);
  });

  it('tests and packages the same build instead of rebuilding downstream', () => {
    for (const consumer of ['test-browser', 'lighthouse', 'lint-generated-markdown', 'validate-build']) {
      expect(dependencies(jobs[consumer])).toEqual(['build']);
      expect(steps(consumer).find((step) => step.uses?.startsWith('actions/download-artifact@'))?.with).toMatchObject({
        name: 'site-build',
        path: './dist',
      });
      expect(steps(consumer).some((step) => step.run && expand(step.run).includes('astro build'))).toBe(false);
    }
    const uploads = steps('build').filter((step) => step.uses?.startsWith('actions/upload-'));
    expect(uploads).toHaveLength(2);
    for (const upload of uploads) expect(upload.with?.path).toBe('./dist');
  });

  it('requires every check directly before deployment and verifies the live result afterward', () => {
    expect(dependencies(jobs.deploy).sort()).toEqual(
      [...sourceJobs, 'build', 'test-browser', 'lighthouse', 'lint-generated-markdown', 'validate-build'].sort(),
    );
    expect(jobs.deploy.if).toBe("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(dependencies(jobs['smoke-deployed'])).toEqual(['deploy']);
    expect(Object.keys(jobs).sort()).toEqual(
      [
        ...sourceJobs,
        'build',
        'test-browser',
        'lighthouse',
        'lint-generated-markdown',
        'validate-build',
        'deploy',
        'smoke-deployed',
      ].sort(),
    );
  });
});

it('formats only CMS branches and accepts follow-up CI without bypassing PR checks', () => {
  const workflowSchema = z.object({ on: z.record(z.string(), z.unknown()) });
  const ci = workflowSchema.parse(
    parse(readFileSync(new URL('../.github/workflows/project.yml', import.meta.url), 'utf8')),
  );
  const formatting = workflowSchema
    .extend({ jobs: z.record(z.string(), jobSchema.extend({ permissions: z.record(z.string(), z.string()) })) })
    .parse(parse(readFileSync(new URL('../.github/workflows/format-cms.yml', import.meta.url), 'utf8')));
  expect(ci.on).toHaveProperty('workflow_dispatch');
  expect(formatting.on).toEqual({ push: { branches: ['cms/**'] } });
  expect(jobs).not.toHaveProperty('source-ready');
  expect(formatting.jobs['format-content'].permissions).toEqual({ contents: 'write', actions: 'write' });
  expect(formatting.jobs['format-content'].steps[0].with).toMatchObject({
    ref: '${{ github.ref_name }}',
    'persist-credentials': false,
  });
});

it('formats CMS Markdown with Oxfmt and only dispatches CI after a safe formatting push', () => {
  const workflow = z
    .object({ jobs: z.record(z.string(), jobSchema) })
    .parse(parse(readFileSync(new URL('../.github/workflows/format-cms.yml', import.meta.url), 'utf8')));
  const formatStep = workflow.jobs['format-content'].steps.find(
    (step) => step.name === 'Format content using repository policy',
  );
  const publishStep = workflow.jobs['format-content'].steps.find(
    (step) => step.name === 'Commit formatting and start validation',
  );
  expect(formatStep?.run).toBeDefined();
  expect(publishStep?.run).toBeDefined();
  if (!formatStep?.run || !publishStep?.run) throw new Error('Expected executable CMS formatting steps');
  const fixture = mkdtempSync(join(tmpdir(), 'cms-format-action-'));
  const repo = join(fixture, 'repo');
  const remote = join(fixture, 'remote.git');
  const git = (...args: string[]) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });
  const dispatchLog = join(fixture, 'dispatch.log');
  try {
    mkdirSync(repo);
    execFileSync('git', ['init', '--bare', '--quiet', remote]);
    git('init', '--quiet', '-b', 'cms/blog/example');
    git('config', 'user.name', 'Test');
    git('config', 'user.email', 'test@example.com');
    git('remote', 'add', 'origin', remote);
    symlinkSync(resolve('node_modules'), join(repo, 'node_modules'), 'dir');
    for (const file of ['oxfmt.config.ts', '.editorconfig', '.gitignore', 'package.json', '.markdownlint.json'])
      copyFileSync(file, join(repo, file));
    mkdirSync(join(repo, 'src/content/blog'), { recursive: true });
    mkdirSync(join(fixture, 'bin'));
    writeFileSync(
      join(fixture, 'bin/gh'),
      '#!/bin/sh\nif [ "$1" = workflow ]; then printf "%s\\n" "$*" >> "$DISPATCH_LOG"; fi\n',
      { mode: 0o755 },
    );
    const env = {
      ...process.env,
      PATH: `${join(fixture, 'bin')}:${process.env.PATH}`,
      DISPATCH_LOG: dispatchLog,
      CMS_BRANCH: 'cms/blog/example',
    };
    const run = (command: string) => spawnSync('bash', ['-c', command], { cwd: repo, env, encoding: 'utf8' });
    const article = join(repo, 'src/content/blog/example.md');
    const prose = 'A useful sentence about writing articles. '.repeat(12).trim();
    const code = 'x'.repeat(150);
    const cell = 'table text '.repeat(20).trim();
    writeFileSync(
      article,
      `---\ntitle: Example\n---\n\n${prose}\n\nFirst line  \nsecond line.\n\n\`\`\`text\n${code}\n\`\`\`\n\n| Column |\n| --- |\n| ${cell} |\n`,
    );
    git('add', '.');
    git('commit', '--quiet', '-m', 'content(blog): create example');
    git('push', '--quiet', 'origin', 'HEAD:refs/heads/cms/blog/example');
    const formatted = run(formatStep.run);
    expect(formatted.status, formatted.stdout + formatted.stderr).toBe(0);
    const body = readFileSync(article, 'utf8');
    const { MD013 } = z
      .object({ MD013: z.object({ line_length: z.number() }) })
      .parse(JSON.parse(readFileSync('.markdownlint.json', 'utf8')));
    expect(
      body
        .split('\n\n')[1]
        .split('\n')
        .every((line) => line.length <= MD013.line_length),
    ).toBe(true);
    expect(body).toContain(code);
    expect(body).toContain(cell);
    expect(body).toMatch(/First line(?: {2}|\\)\nsecond line\./);
    expect(body.replace(/\s+/g, ' ')).toContain(prose);
    const linted = run('npm run lint:markdown -- --ignore node_modules');
    expect(linted.status, linted.stdout + linted.stderr).toBe(0);
    writeFileSync(join(repo, 'unrelated.txt'), 'Do not stage me');
    const published = run(publishStep.run);
    expect(published.status, published.stdout + published.stderr).toBe(0);
    const formattedCommit = git('rev-parse', 'HEAD').trim();
    expect(git('show', '--format=', '--name-only', 'HEAD').trim()).toBe('src/content/blog/example.md');
    expect(git('ls-remote', 'origin', 'refs/heads/cms/blog/example')).toContain(formattedCommit);
    expect(git('ls-remote', 'origin', 'refs/heads/main')).toBe('');
    expect(readFileSync(dispatchLog, 'utf8')).toBe('workflow run project.yml --ref cms/blog/example\n');
    expect(run(formatStep.run).status).toBe(0);
    expect(readFileSync(article, 'utf8')).toBe(body);
    expect(run(publishStep.run).status).toBe(0);
    expect(git('rev-parse', 'HEAD').trim()).toBe(formattedCommit);
    expect(readFileSync(dispatchLog, 'utf8').split('\n').filter(Boolean)).toHaveLength(1);
    // A concurrent save must reject the push, keep the remote commit, and avoid dispatching stale content.
    git('commit', '--allow-empty', '--quiet', '-m', 'content(blog): concurrent save');
    const concurrent = git('rev-parse', 'HEAD').trim();
    git('push', '--quiet', 'origin', 'HEAD:refs/heads/cms/blog/example');
    git('checkout', '--quiet', formattedCommit);
    writeFileSync(article, `${body}\nAnother paragraph.\n`);
    const rejected = run(publishStep.run);
    expect(rejected.status, rejected.stdout + rejected.stderr).not.toBe(0);
    expect(git('ls-remote', 'origin', 'refs/heads/cms/blog/example')).toContain(concurrent);
    expect(readFileSync(dispatchLog, 'utf8').split('\n').filter(Boolean)).toHaveLength(1);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
