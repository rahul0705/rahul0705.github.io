# GitLab CI

GitHub remains the primary CI and deployment provider. GitLab's native project
pipeline mirrors the existing GitHub project checks, using Node LTS.
Independent checks start immediately through `needs: []`; downstream checks
reuse one successful production build through DAG dependencies.

Vitest and Playwright publish JUnit results, including failed runs. Oxlint publishes
Code Quality findings. Unit tests retain the existing non-coverage policy; the coverage script supports Cobertura when invoked.
HTML reports, traces and Lighthouse results remain downloadable artifacts.

GitLab Pages deployment and deployed smoke checks are present with `when: never`.
To switch providers, configure the GitLab Pages site URL and canonical site
settings, replace both never rules with default-branch push rules, and disable
GitHub deployment. GitHub security and repository automation remain on GitHub.

Use Linux container runners with Node images. Validate this configuration using
GitLab CI Lint and a real runner before relying on the GitLab mirror.
