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

Formatting automation and repository-specific prose wrapping are separate work. This configuration uses Sveltia's native
serialization and the existing PR checks. Authenticated GitHub save/publish has not been exercised as part of this
change.
