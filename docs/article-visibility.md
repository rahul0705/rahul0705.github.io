# Article visibility

Every article stores an explicit `draft` boolean:

- `draft: true` excludes the article from the public site.
- `draft: false` makes the article eligible for inclusion after deployment.

The nine existing published articles have been backfilled with `draft: false`; the existing draft keeps `true`. Other
metadata and article body bytes are unchanged. The article visibility test rejects missing or non-boolean values.

New CMS articles still start with Draft enabled. Turn Draft off when the article should appear on the site, and retain
the saved `draft: false`. No save hook removes that value. The shared model's existing read default remains unchanged.

Sveltia intentionally applies defaults to missing fields on existing entries, as confirmed in
[upstream #1097](https://github.com/sveltia/sveltia-cms/issues/1097). Explicit values prevent an existing published
article from picking up the CMS's creation default. Other optional fields can remain absent; this policy does not fill
unrelated text or asset fields with empty values.

If Editorial Workflow is enabled, its Draft/In Review/Ready status describes a pending edit's review progress. The
article's boolean separately controls site visibility after publishing and deployment.

[Issue #171](https://github.com/rahul0705/rahul0705.github.io/issues/171) tracks the save/reopen verification.
[PR #174](https://github.com/rahul0705/rahul0705.github.io/pull/174) adds local CMS regression coverage; authenticated
GitHub verification remains separate. This storage change adds no publishing workflow or formatting automation.
