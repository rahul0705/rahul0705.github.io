# Quarterly security and dependency review

Rahul Mohandas owns this review each January, April, July, and October.
The October 17, 2026 review below establishes the cadence; the next review is
January 2027. Weekly automated scans complement this manual review.

## Review procedure

1. Review open Dependabot alerts, security updates, and dependency pull requests.
   Link unresolved findings to remediation issues; record severity and scope.
2. Review CodeQL and workflow-security findings and the latest analysis results.
3. Confirm dependency review still rejects high and critical findings on pull
   requests, and Dependabot alerts and security updates remain enabled.
4. Check action SHA pins and version comments, least-privilege permissions,
   checkout credential handling, concurrency cancellation, and `npm ci`.
5. Read required checks and deployment environment protection separately.
   Record findings without changing settings as part of the review.
6. Append the review date, evidence, follow-up links, and next review month here.
   Accepted risks need an owner, rationale, scope, and review date.

## October 17, 2026

Reviewed main at `407df0dcf8404437dd80e7000cdd04b0d6c67cc0` through the GitHub API
and the checked-in workflow definitions.

- Dependabot alerts and security updates are enabled. Five open alerts remain:
  [52](https://github.com/rahul0705/rahul0705.github.io/security/dependabot/52),
  [51](https://github.com/rahul0705/rahul0705.github.io/security/dependabot/51),
  [46](https://github.com/rahul0705/rahul0705.github.io/security/dependabot/46), and
  [26](https://github.com/rahul0705/rahul0705.github.io/security/dependabot/26)
  are medium severity; [50](https://github.com/rahul0705/rahul0705.github.io/security/dependabot/50)
  is low. Alert 51 is classified as runtime; the others as development.
  Remediation remains tracked by [#11](https://github.com/rahul0705/rahul0705.github.io/issues/11)
  and audit-policy decisions by [#70](https://github.com/rahul0705/rahul0705.github.io/issues/70).
  This review does not accept or suppress those findings.
- A separate local `npm audit` also reports high-severity findings in the
  dependency tree, including `tmp` through Lighthouse tooling. GitHub's five
  open alerts are not an exhaustive local audit result. These findings remain
  unresolved under #11; no forced remediation or exception was applied.
- Dependency update [PR #144](https://github.com/rahul0705/rahul0705.github.io/pull/144)
  is open for the content platform. No separate security-update PR is open.
- Both latest main CodeQL analyses report zero results and no analysis errors.
  Eight open workflow-scanner alerts, 37 through 44, concern version comments
  referring to moving major tags. Exact patch tags were verified through GitHub:
  setup-node v7.0.0, upload-artifact v7.0.1, and download-artifact v8.0.1.
  This batch corrects comments while retaining the same pinned action commits.
  Hosted scanning must confirm alert resolution after merge.
- Security analysis covers Actions and JavaScript/TypeScript on main and dev,
  with a weekly schedule. Pull-request dependency review rejects high and
  critical findings. Remote actions are SHA-pinned, checkout credentials are not
  persisted, and project setup uses `npm ci`. Permissions are scoped per job.
  Pull-request runs cancel obsolete work; main deployment runs are serialized.
- The active Main ruleset requires `build`, `validate-build`,
  `lint-generated-markdown`, `test-browser`, and `lighthouse`. These are the
  observed settings, distinct from the broader recommendation in the CI guide.
  The github-pages environment has a branch-policy protection rule.
- Secret scanning and push protection are disabled. No repository or environment
  settings were changed; any enablement decision requires a separate review.

Next review: January 2027, owned by Rahul Mohandas. GitLab runner execution,
dependency exploitability, and remediation upgrades were not evaluated here.
