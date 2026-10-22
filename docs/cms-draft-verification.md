# CMS draft save and reopen verification

For [issue #171](https://github.com/rahul0705/rahul0705.github.io/issues/171), `tests/cms-draft.spec.ts` exercises the
installed Sveltia CMS against the built `/admin/` page and its actual bundled collection configuration.

The test replaces only the native directory picker with an isolated Origin Private File System directory. Sveltia reads
and writes real browser file handles through its local repository backend. This follows
[Sveltia's local backend tests](https://github.com/sveltia/sveltia-cms/blob/v0.235.1/e2e/specs/local.e2e.js). No live
repository content or GitHub credentials are used; GitHub API requests are blocked.

Each case checks the initial Draft switch, saves an edit, parses the saved YAML metadata to assert an explicit boolean,
signs out, reloads the page, selects the same stored repository again, and checks the reopened switch:

| Case                    | Initial switch | Saved boolean | Reopened switch |
| ----------------------- | -------------- | ------------- | --------------- |
| Existing explicit false | Off            | `false`       | Off             |
| Existing explicit true  | On             | `true`        | On              |
| Turn Draft off          | On             | `false`       | Off             |
| New article             | On             | `true`        | On              |

Signing out before reloading avoids Chromium's inability to restore Sveltia's cached browser file handle from IndexedDB,
also documented in the upstream tests. Reopening therefore reads stored files in a fresh CMS session rather than reusing
editor state. Firefox and WebKit skip these cases because local repository editing requires the File System Access API.

Run with the project's existing tools:

```sh
npm run build
npx playwright test tests/cms-draft.spec.ts tests/cms.spec.ts --project=chromium --workers=1
```

On October 20, 2026, all four cases and the existing admin smoke test passed with Sveltia 0.235.1. The seven CMS
configuration unit tests also passed.

## Remaining verification and dependency

[PR #173](https://github.com/rahul0705/rahul0705.github.io/pull/173) owns the explicit boolean backfill, checked-in
article contract, editing guidance, and Editorial Workflow configuration. These tests are independently based on main;
they seed explicit values and do not duplicate that migration.

Authenticated GitHub save/reopen and Editorial Workflow branch/PR behavior have not been verified here. Local file
persistence does not establish those remote behaviors. Keep issue #171 open until that verification is recorded and the
backfill is integrated. No dummy article was published and no merge was made.
