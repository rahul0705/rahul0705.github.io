import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Step {
  name?: string;
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
}
interface Job {
  needs?: string | string[];
  if?: string;
  steps: Step[];
}
const { jobs } = parse(readFileSync(new URL('../.github/workflows/project.yml', import.meta.url), 'utf8')) as {
  jobs: Record<string, Job>;
};
const { scripts } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  scripts: Record<string, string>;
};
const sourceJobs = [
  'format',
  'lint-code',
  'lint-css',
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
    expect(ancestors('build-artifact')).toEqual(expect.arrayContaining(sourceJobs));
    const commands = steps('build-artifact').map((step) => step.run);
    expect(commands.indexOf('npm run build')).toBeLessThan(commands.indexOf('npm run validate:build'));
    expect(commands.indexOf('npm run validate:build')).toBeLessThan(commands.indexOf('npm run lint:resume:markdown'));
  });

  it('tests and packages the same build instead of rebuilding downstream', () => {
    for (const consumer of ['test-browser', 'lighthouse']) {
      expect(ancestors(consumer)).toContain('build-artifact');
      expect(steps(consumer).find((step) => step.uses?.startsWith('actions/download-artifact@'))?.with).toMatchObject({
        name: 'site-build',
        path: './dist',
      });
      expect(steps(consumer).some((step) => step.run && expand(step.run).includes('astro build'))).toBe(false);
    }
    const uploads = steps('build-artifact').filter((step) => step.uses?.startsWith('actions/upload-'));
    expect(uploads).toHaveLength(2);
    for (const upload of uploads) expect(upload.with?.path).toBe('./dist');
  });

  it('requires every check directly before deployment and verifies the live result afterward', () => {
    expect(dependencies(jobs.deploy).sort()).toEqual(
      [...sourceJobs, 'build-artifact', 'test-browser', 'lighthouse'].sort(),
    );
    expect(jobs.deploy.if).toBe("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(dependencies(jobs['smoke-deployed'])).toEqual(['deploy']);
    expect(Object.keys(jobs).sort()).toEqual(
      [...sourceJobs, 'build-artifact', 'test-browser', 'lighthouse', 'deploy', 'smoke-deployed'].sort(),
    );
  });
});
