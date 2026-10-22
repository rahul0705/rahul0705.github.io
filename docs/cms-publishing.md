# CMS publishing

Sveltia's built-in [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) is enabled for every content
collection. Entry saves go to a `cms/[collection]/[slug]` branch and a pull request instead of directly to `main`.
Further saves update the same pending entry.

Use the native Draft, In Review, and Ready stages to manage the pending edit. Publish merges its pull request, subject
to GitHub's required checks and branch rules. Alternatively, review and merge the pull request in GitHub. If publishing
is attempted while checks are running, retry after they pass. Main's normal push pipeline handles deployment after
merge.

The CMS sign-in token needs Pull requests read/write permission as well as Contents read/write. This change adds no
application token, formatter hook, GitHub Action, service, auto-merge policy, or repository-rule bypass.

Editorial status describes the edit's review progress. The article's `draft` boolean separately controls whether the
site includes it after merge. New CMS articles still default to `draft: true`; turn Draft off for an article that should
appear on the public site. The explicit-value migration is separate in
[PR #175](https://github.com/rahul0705/rahul0705.github.io/pull/175); merge it before editing existing published
articles that currently omit the boolean.

This workflow handles entry changes and their attached assets. Standalone Asset Library operations remain subject to the
configured branch's permissions and rules. It does not make direct writes to a protected branch permissible.

Articles use Markdown (`.md`); MDX authoring is deferred until rendering, editing, and formatting support are verified.
Content-model 1.1.9 and Sveltia 0.250.1 provide the native serialization API needed for later browser formatting. This
stage keeps native CMS saves and the existing PR checks; no browser formatter is registered yet. Local
`npm run format:fix` applies the repository's prose-wrapping policy. The remaining adoption work is tracked in
[#177](https://github.com/rahul0705/rahul0705.github.io/issues/177).

Authenticated GitHub save/publish still requires a maintainer check against the repository's real branch rules. Local
save/reopen checks cover content persistence and draft defaults, not GitHub authorization or merge behavior.

## Frontmatter ordering

`npm run lint:markdown` uses Markdownlint CLI2 and the Forge frontmatter plugin for article files. Its configuration in
`.markdownlint-cli2.mjs` derives the expected field order from the shared blog model, matching Sveltia's field order.
Documentation outside the article collection keeps the existing Markdown quality checks without an ordering rule.

Run `npm run lint:markdown:fix` to correct safe ordering problems, then `npm run format:fix` and `npm run lint:markdown`
to verify the result. Present model fields follow model order; unknown keys remain afterward in their original relative
order, optional fields remain absent, and nested mappings are unchanged. The fix preserves field values, attached
comments, and the article body. It does not add defaults or change draft state.

Ambiguous comments, duplicate keys, anchors, aliases, or malformed YAML receive diagnostics without an ordering fix.
Review those documents manually rather than deleting metadata or forcing a rewrite. Formatting, schema validation, and
Markdown quality remain separate checks. The ordering plugin runs through the same npm commands in CI for hand edits and
CMS commits; it does not run as a CMS save hook or Git hook.

`npm run lint:resume:markdown` reads the generated resume through CLI2's standard input, so it still checks the build
output even though source lint ignores `dist` through `.gitignore`. Its diagnostics identify standard input.
