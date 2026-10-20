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

EditorConfig supplies line width, indentation, and line endings. Oxfmt remains the
editor and repository formatter. Its article override preserves fenced code examples
instead of reformatting their contents. Markdownlint supplies Markdown rules, including
its configured line-length exceptions for code blocks and tables. The CMS build
checks that the formatter width agrees with Markdownlint rather than defining a
second line-length policy. Markdown's intentional hard breaks are exempt from
EditorConfig's general trailing-whitespace trimming; Markdownlint and the formatter
handle them instead.

VS Code uses the configured Oxc formatter on save. Formatting does not infer the
blog model's key order, so the article-order check still applies to hand edits.

Before an article save, Sveltia's supported `preSave` hook formats the body using
Prettier's browser formatter and checks it with the same Markdownlint configuration
used by CI. These packages were already present through development tooling and are
now declared directly because the CMS imports them. They load only on the first
article save. The CMS receives its formatter options from EditorConfig and Oxfmt
at build time; rebuild after changing those policies.

Existing prose wrapping is preserved when it passes lint. If prose exceeds the
configured line length, the CMS wraps it before checking again. Code blocks and
tables retain their configured exceptions, and intentional hard breaks remain
hard breaks. Other lint failures stop the save with a body line number and rule
name, allowing correction before retrying. Sveltia continues to serialize the
frontmatter itself, using the model's field order and configured indentation.

This does not customize Sveltia's rich-text-to-Markdown conversion. For Markdown
constructs that its rich-text editor does not preserve, use its raw editing mode.
The hook normalizes the Markdown produced by that editor; it cannot reconstruct
syntax already changed by the editor.

## Local commits and remote saves

Install the repository's check-only pre-commit hook explicitly:

```sh
npm run hooks:install
```

This sets the checkout's local `core.hooksPath` to `.githooks`. If you already use
another hooks directory, integrate its existing checks before replacing that
setting. Hooks are not installed automatically by dependency installation.

Run the same check manually with:

```sh
npm run lint:staged
```

The hook copies the Git index to a temporary directory and checks relevant staged
files with the existing formatter and Markdown linter. Staged article or model
changes also run the article-order tests against that snapshot. It never formats,
stages, or overwrites working files. If a partially staged file fails, fix it and
stage the intended correction before retrying. The temporary directory is removed
on completion.

GitHub-backed CMS commits bypass local Git hooks. Their article body is checked
by the CMS save hook, and the existing CI format, Markdown lint, and unit-test jobs
remain authoritative for the complete saved files. Local hooks can also be bypassed;
CI does not rely on them. A CMS commit that violates a check stops deployment through
the existing build gates; it is not silently rewritten by a bot.

This work does not change draft defaults or introduce the draft-removal hook tracked
in issue #171.
