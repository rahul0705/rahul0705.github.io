interface WorkflowRun {
  conclusion: string | null;
  head_sha: string;
  html_url: string;
  id: number;
  name: string;
}

interface JobStep {
  conclusion: string | null;
  name: string;
}

interface WorkflowJob {
  conclusion: string | null;
  html_url: string;
  id: number;
  name: string;
  status: string;
  steps?: JobStep[];
}

interface CheckAnnotation {
  annotation_level: string;
  message: string;
  path?: string;
  start_line?: number;
  title?: string;
}

interface ReportAnnotation extends CheckAnnotation {
  job: string;
}

interface IssueComment {
  body?: string;
  id: number;
  user?: { login?: string };
}

type ApiEndpoint = (parameters: Record<string, unknown>) => Promise<unknown>;

interface GitHubClient {
  paginate<T>(endpoint: ApiEndpoint, parameters: Record<string, unknown>): Promise<T[]>;
  rest: {
    actions: { listJobsForWorkflowRun: ApiEndpoint };
    checks: { listAnnotations: ApiEndpoint };
    issues: {
      createComment: ApiEndpoint;
      listComments: ApiEndpoint;
      updateComment: ApiEndpoint;
    };
  };
}

interface ScriptArguments {
  github: GitHubClient;
  context: {
    issue: { number?: number };
    payload: { pull_request?: { head: { sha: string }; number: number } };
    repo: { owner: string; repo: string };
    runId: number;
    sha: string;
    workflow: string;
  };
  core: {
    info(message: string): void;
    warning(message: string): void;
  };
}

export default async function report({ github, context, core }: ScriptArguments) {
  const pullRequestNumber = context.payload.pull_request?.number ?? context.issue.number;

  if (!pullRequestNumber) {
    core.info('The workflow is not associated with a pull request.');
    return;
  }

  const { owner, repo } = context.repo;
  const jobs = (
    await github.paginate<WorkflowJob>(github.rest.actions.listJobsForWorkflowRun, {
      owner,
      repo,
      run_id: context.runId,
      per_page: 100,
    })
  ).filter((job) => job.status === 'completed');

  const icons: Record<string, string> = {
    success: '✅',
    failure: '❌',
    cancelled: '⛔',
    skipped: '⏭️',
    neutral: '➖',
    timed_out: '⏱️',
    action_required: '⚠️',
  };
  const annotationIcons: Record<string, string> = { failure: '❌', warning: '⚠️', notice: 'ℹ️' };
  const escapeCell = (value) =>
    String(value ?? '')
      .replaceAll('|', '\\|')
      .replaceAll('\n', '<br>');

  const rows = jobs.map((job) => {
    const failedSteps = (job.steps ?? [])
      .filter((step) => !['success', 'skipped', null].includes(step.conclusion))
      .map((step) => step.name)
      .join(', ');
    const result = `${icons[job.conclusion] ?? '❓'} ${job.conclusion ?? job.status}`;
    return `| [${escapeCell(job.name)}](${job.html_url}) | ${result} | ${escapeCell(failedSteps || '—')} |`;
  });

  const annotations: ReportAnnotation[] = [];
  for (const job of jobs) {
    if (job.conclusion === 'success' || job.conclusion === 'skipped') continue;

    try {
      const jobAnnotations = await github.paginate<CheckAnnotation>(github.rest.checks.listAnnotations, {
        owner,
        repo,
        check_run_id: job.id,
        per_page: 100,
      });
      for (const annotation of jobAnnotations) {
        annotations.push({ job: job.name, ...annotation });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      core.warning(`Could not read annotations for ${job.name}: ${message}`);
    }
  }

  const annotationLimit = 50;
  const annotationLines = annotations.slice(0, annotationLimit).map((annotation) => {
    const location = annotation.path
      ? `\`${annotation.path}${annotation.start_line ? `:${annotation.start_line}` : ''}\``
      : 'No file location';
    const title = annotation.title ? ` **${annotation.title}**:` : '';
    return `- ${annotationIcons[annotation.annotation_level] ?? '⚠️'} ${location} —${title} ${annotation.message}`;
  });
  if (annotations.length > annotationLimit) {
    annotationLines.push(
      `- …and ${annotations.length - annotationLimit} more annotations. See the workflow run for the full report.`,
    );
  }

  const conclusions = jobs.map((job) => job.conclusion);
  const conclusion = ['failure', 'timed_out', 'action_required'].some((value) => conclusions.includes(value))
    ? 'failure'
    : conclusions.includes('cancelled')
      ? 'cancelled'
      : 'success';
  const run: WorkflowRun = {
    conclusion,
    head_sha: context.payload.pull_request?.head.sha ?? context.sha,
    html_url: `${process.env.GITHUB_SERVER_URL}/${owner}/${repo}/actions/runs/${context.runId}`,
    id: context.runId,
    name: context.workflow,
  };
  const marker = `<!-- pr-check-report:${run.name} -->`;
  const body = [
    marker,
    `### ${icons[run.conclusion] ?? '❓'} ${run.name}`,
    '',
    `[Open workflow run](${run.html_url}) · Commit \`${run.head_sha.slice(0, 7)}\``,
    '',
    '| Job | Result | Failed step(s) |',
    '| --- | --- | --- |',
    ...rows,
    ...(annotationLines.length > 0
      ? ['', '<details open>', '<summary>Annotations</summary>', '', ...annotationLines, '', '</details>']
      : []),
    '',
    '_This comment is updated after each run of this workflow._',
  ].join('\n');

  const comments = await github.paginate<IssueComment>(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number: pullRequestNumber,
    per_page: 100,
  });
  const previous = comments.find(
    (comment) => comment.user?.login === 'github-actions[bot]' && comment.body?.includes(marker),
  );

  if (previous) {
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: previous.id,
      body,
    });
  } else {
    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullRequestNumber,
      body,
    });
  }
}
