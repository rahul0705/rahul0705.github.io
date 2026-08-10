import { spawn } from 'node:child_process';
import { appendFile } from 'node:fs/promises';
import process from 'node:process';

const [label, command, ...args] = process.argv.slice(2);

if (!label || !command) {
  console.error('Usage: npm run ci:summary -- <label> <command> [args...]');
  process.exit(2);
}

const output: string[] = [];
const child = spawn(command, args, {
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk: Buffer) => {
  process.stdout.write(chunk);
  output.push(chunk.toString());
});
child.stderr.on('data', (chunk: Buffer) => {
  process.stderr.write(chunk);
  output.push(chunk.toString());
});

const result = await new Promise<{ code: number; signal: NodeJS.Signals | null }>((resolve) => {
  child.on('error', (error) => {
    output.push(`${error.name}: ${error.message}\n`);
    resolve({ code: 1, signal: null });
  });
  child.on('close', (code, signal) => resolve({ code: code ?? 1, signal }));
});

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (summaryPath) {
  const ansiPattern = /\u001B(?:\[[0-?]*[ -/]*[@-~]|\][^\u0007]*(?:\u0007|\u001B\\))/gu;
  const cleanOutput = output.join('').replace(ansiPattern, '').trim().split('\n').slice(-200).join('\n').slice(-20_000);
  const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const status = result.code === 0 ? '✅ Passed' : '❌ Failed';
  const commandLine = [command, ...args].join(' ');
  const details = cleanOutput
    ? [
        '',
        `<details${result.code === 0 ? '' : ' open'}>`,
        '<summary>Command output (last 200 lines)</summary>',
        '',
        `<pre>${escapeHtml(cleanOutput)}</pre>`,
        '',
        '</details>',
      ]
    : [];
  const summary = [
    `### ${status}: ${label}`,
    '',
    `Command: \`${commandLine}\``,
    ...(result.signal ? ['', `Terminated by signal: \`${result.signal}\``] : []),
    ...details,
    '',
  ].join('\n');

  await appendFile(summaryPath, summary);
}

process.exitCode = result.code;
