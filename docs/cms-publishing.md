# CMS publishing

Sveltia's built-in [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) is enabled for every content
collection. Entry saves go to a `cms/[collection]/[slug]` branch and a pull request instead of directly to `main`.
Further saves update the same pending entry.

Use the native Draft, In Review, and Ready stages to manage the pending edit. Publish merges its pull request, subject
to GitHub's required checks and branch rules. Alternatively, review and merge the pull request in GitHub. If publishing
is attempted while checks are running, retry after they pass. Main's normal push pipeline handles deployment after
merge.

The CMS sign-in token needs Pull requests read/write permission as well as Contents read/write. This change adds no
application token, GitHub Action, service, auto-merge policy, or repository-rule bypass.

Editorial status describes the edit's review progress. The article's `draft` boolean separately controls whether the
site includes it after merge. New CMS articles still default to `draft: true`; turn Draft off for an article that should
appear on the public site. The explicit-value migration is separate in
[PR #175](https://github.com/rahul0705/rahul0705.github.io/pull/175); merge it before editing existing published
articles that currently omit the boolean.

This workflow handles entry changes and their attached assets. Standalone Asset Library operations remain subject to the
configured branch's permissions and rules. It does not make direct writes to a protected branch permissible.

Articles use Markdown (`.md`); MDX authoring is deferred until rendering, editing, and formatting support are verified.
Content-model 1.1.9 and Sveltia 0.250.1 provide native serialization. Each article save serializes through Sveltia
first, then formats the complete Markdown document with the self-hosted browser formatter and verified build policy. The
first save starts a worker; subsequent saves reuse it. Local `npm run format:fix` applies the same repository policy.

Authenticated GitHub save/publish still requires a maintainer check against the repository's real branch rules. Local
save/reopen checks cover content persistence and draft defaults, not GitHub authorization or merge behavior.

## Frontmatter ordering

`npm run lint:markdown` uses Markdownlint CLI2 and the Forge frontmatter plugin for article files. Its configuration in
`.markdownlint-cli2.mjs` derives the expected field order from the shared blog model, matching Sveltia's field order.
Documentation outside the article collection keeps the existing Markdown quality checks without an ordering rule.

EditorConfig is the source of the prose width for both Oxfmt and Markdownlint. CLI2 reads `max_line_length` directly
from the root `.editorconfig` shared `[*]` section and requires a positive integer; there is no representative filename,
separate lint width, or fallback. Other root sections may repeat the same width or configure unrelated properties, but
conflicting widths are rejected conservatively, including in non-Markdown sections. The code-block and table exceptions
remain lint settings. Supporting different widths by file path would require extending this configuration.

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

## Browser formatter assets

The Astro integration in `src/integrations/sveltia/formatter-assets.ts` resolves browser options from `oxfmt.config.ts`
and `.editorconfig` during configuration. Its uniform-policy check covers future Markdown paths while preserving the
experience JSON width override. Unsupported options, potentially applicable Markdown overrides, nested configuration,
and an installed Oxfmt version that differs from the browser engine stop the build. Upgrade Oxfmt and browser-oxfmt
together, using a browser package release that supports the intended engine version.

Development and production serve the complete published module, worker, bindings, and WASM tree under
`/admin/formatter/`, relative to Astro's configured base. `policy.json` contains only the verified serializable options.
Loading the entry does not start a worker; the package starts one on its first formatting request and reuses it. CMS
saves invoke the formatter after native serialization.

`tests/cms-formatting.spec.ts` checks current articles and deliberately unformatted prose, YAML, and JavaScript against
the installed CLI, including idempotence. It also verifies JavaScript/WASM content types and formatting under a scoped
CSP allowing `script-src 'self' 'wasm-unsafe-eval'` and `worker-src 'self'`, without JavaScript `unsafe-eval`.
Deployment headers must preserve those capabilities if a CSP is introduced; the integration does not replace the CMS's
existing network or style policy.

Browser formatting preserves Tailwind class order. The build reports this approved limitation and the browser test shows
the difference in a fenced HTML example. CLI formatting may still reorder those classes; Forge #365 tracks future
support. This exception does not disable native CSS formatting or block adoption. MDX and manual iPhone/Safari checks
remain outside this stage.

## Save failures and rollback

If formatting fails, Sveltia blocks the save and shows an error with the reason. Dismiss the dialog, check the
connection, and retry Save. Unsaved edits stay in the editor and the existing file is untouched. If retry keeps failing,
copy unsaved content before reloading and report the displayed error. Module-load failures retry with a fresh URL;
worker-load failures are reset by the formatter package. There is no unformatted save fallback.

Formatting handles layout, wrapping, and supported code fences. Frontmatter ordering remains the model-derived
Markdownlint check; Markdown quality rules and Astro schema validation remain independent checks in CI. Run
`npm run format`, `npm run lint:markdown`, and `npm run typecheck` for hand-edited files as well as CMS changes.

To roll back activation, remove the custom frontmatter format registration in `src/pages/admin/index.astro` and rebuild.
This restores native Sveltia saves without changing existing content. Before deploying or reloading a different build,
finish the pending save or copy unsaved edits; rollout does not migrate an open editor's in-memory draft.
