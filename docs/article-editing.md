# Article editing and formatting

The shared blog model defines the canonical frontmatter key order. Sveltia uses
that model to generate its form and save fields in the same order. Unknown keys
follow the modeled fields, preserving their relative order. Optional keys can
remain absent; ordering never inserts defaults or changes draft status.

The article-order test checks every checked-in article, including drafts. Run:

```sh
npm run test:unit -- src/content/article-format.test.ts
```

A failure names the article and lists the expected order of its present keys.
Move those YAML key/value blocks into that order, retaining attached comments.
Do not reorder the article body. The initial normalization preserves frontmatter
values, comments, and body bytes. Future changes to the model may require another
frontmatter-only normalization.

## Editor and CMS saves

EditorConfig supplies line width, indentation, and line endings. Oxfmt is the
editor and repository formatter. Its article override wraps prose to that width
while preserving fenced code examples. Markdownlint CLI checks Markdown rules,
including line-length exceptions for code blocks and tables. Intentional Markdown
hard breaks are exempt from general trailing-whitespace trimming.

VS Code uses the configured Oxc formatter on save. Formatting does not infer the
blog model's key order, so the article-order check still applies to hand edits.
Existing articles have been rewrapped to match the same formatter policy without
changing their frontmatter values or body text.

The CMS has no formatting or linting `preSave` hook. Sveltia serializes content
using the shared model's field order. Its rich-text editor can change Markdown
syntax before saving; use raw editing mode for constructs it does not preserve.

## Formatting CMS commits in GitHub Actions

Sveltia's built-in Editorial Workflow saves entries on `cms/[collection]/[slug]`
branches and opens pull requests. Continue editing the entry in the CMS, then
move it through its native Draft, In Review, and Ready stages. Publish merges the
PR, subject to GitHub's required checks. You can also review and merge on GitHub.
The sign-in token needs Pull requests read/write as well as Contents read/write.
This uses Sveltia's existing workflow, with no custom publishing UI or service.

`format-cms.yml` runs on pushes to `cms/**`. It checks out the latest version of
that branch, runs the existing Oxfmt command on `src/content`, and commits only
formatting changes there. It uses GitHub's built-in token; no additional secret
or formatter dependency is required. Already formatted saves create no extra
commit and use their normal PR checks.

When formatting changes a file, the action explicitly dispatches `project.yml`
on the CMS branch after pushing the formatting commit. This is necessary because
pushes made with `GITHUB_TOKEN` do not trigger another push workflow. The initial
PR run may start before formatting; validation of the new revision replaces that
older run. CMS branches run the normal checks and build tests without deployment.
Merging the PR into `main` triggers the usual deployment pipeline.

Formatting runs are serialized per CMS branch and start from its latest content.
Pushes are fast-forward only: a concurrent save can reject the formatting push,
never overwrite that save. A later CMS run formats the latest content; otherwise
rerun the failed **Format CMS content** run. No formatting action pushes to `main`
or bypasses its rules. A failed formatting or validation run must be resolved
before publishing. If publishing is attempted while checks are running, retry it
after they pass, or publish through GitHub's PR interface.

CI remains authoritative. Oxfmt handles formatting; Markdownlint and the existing
article-order tests report remaining violations. These failures appear in GitHub
after saving, rather than inside the CMS. A draft with incomplete required fields
can fail the build until it is filled in; nothing reaches production until merge.
Editorial Workflow status is separate from the article's `draft` frontmatter.

This work does not change draft defaults or introduce the draft-removal hook tracked
in issue #171.
