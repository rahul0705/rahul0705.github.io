# GitLab CI

GitHub remains the primary CI and deployment provider. GitLab's native project pipeline mirrors the existing GitHub
project checks, using Node 26 and npm 11. Independent checks start immediately through `needs: []`; downstream checks
reuse one successful production build through DAG dependencies.

All validation jobs inherit explicit rules for merge-request and default-branch push pipelines. Jobs without rules are
excluded from merge-request pipelines by default, even when workflow rules admit the pipeline. The workflow suppresses
branch push pipelines with open merge requests to avoid duplicate validation. CI-only changes receive the same checks;
there are no path exclusions. See the [GitLab job rules reference](https://docs.gitlab.com/ci/jobs/job_rules/).

Vitest and Playwright publish JUnit results, including failed runs. Oxlint publishes Code Quality findings. Unit tests
retain the existing non-coverage policy; the coverage script supports Cobertura when invoked. HTML reports, traces and
Lighthouse results remain downloadable artifacts.

GitLab Pages deployment and deployed smoke checks are present with `when: never`. To switch providers, configure the
GitLab Pages site URL and canonical site settings, replace both never rules with default-branch push rules, and disable
GitHub deployment, deployed smoke, and Pages artifact upload. GitHub owns CodeQL, dependency review, Dependabot alerts
and updates, and workflow security/syntax scanning. GitLab quality checks do not establish equivalent security coverage.
Automation validation stays provider-local; GitHub setup-action changes do not require cross-provider triggers.

Use Linux container runners with Node images. Validate this configuration using GitLab CI Lint and a real runner before
relying on the GitLab mirror.

Lighthouse jobs set `LHCI_COLLECT__SETTINGS__CHROME_FLAGS=--no-sandbox` because the Node containers run Chrome as root.
This setting is scoped to the GitLab audit jobs; Chromium is selected through `CHROME_PATH`.
