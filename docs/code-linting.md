# Code linting policy

`npm run lint:code` and `npm run lint:code:fix` read `.oxlintrc.json`.
The GitHub and GitLab source checks use the same npm command. Editors that use
Oxlint also read this configuration. Formatting remains Oxfmt's responsibility;
`npm run typecheck` remains the Astro and TypeScript diagnostic check.

## Selected checks

The policy enables the correctness category as errors, with the existing
TypeScript, Unicorn, and Oxc plugins. Warnings fail the command too, so a newly
reported problem cannot silently pass CI. Unused suppression comments are errors.

Before this change, Oxlint 1.85.0 resolved 111 rules at warning severity. Useful
existing checks include unreachable code, duplicate keys and branches, invalid
regular expressions, unsafe optional chaining, async Promise executors, and
non-null assertions on optional chains. The printed configuration also listed
checks such as floating promises and invalid awaits, but these did not run without
the optional type-aware engine.

| Addition                           | Purpose                                                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript/no-non-null-assertion` | Require narrowed data or a documented, local invariant instead of unchecked `!`.                                                                                |
| `typescript/no-explicit-any`       | Preserve type checking at component and function boundaries.                                                                                                    |
| `typescript/no-misused-promises`   | Catch async callbacks passed where a synchronous result is expected.                                                                                            |
| `eqeqeq`                           | Prevent accidental type coercion in equality checks.                                                                                                            |
| `no-fallthrough`                   | Catch unintended execution of the next switch branch.                                                                                                           |
| `options.typeAware`                | Actually execute the existing type-dependent correctness checks, including `no-floating-promises`, `await-thenable`, `no-base-to-string`, and `unbound-method`. |

The configuration uses Oxlint's correctness category rather than copying its full
rule list. Review effective-rule changes when upgrading Oxlint:

```sh
npm exec -- oxlint --print-config
npm exec -- oxlint --debug files
```

We evaluated the suspicious preset, explicit `any` checks, and the Vitest plugin.
The suspicious preset mostly requested changing sorts, including sorts of fresh
copies, plus harmless shadowing and literal concatenation. It is not enabled as a
bundle. Explicit `any` checks exposed four article component props, now typed with
Astro's collection and image types. The full Vitest preset also reports supported
two-argument assertions and deliberate conditional schema assertions; it is not
enabled wholesale. Blanket unsafe-assignment restrictions and stylistic rules are
not part of this policy. They would require a separate assessment of data parsing
boundaries and practical findings.

## Non-null assertions

The initial audit reported 39 assertions. Runtime test assertions now establish
that responses, metadata, collections, and layout bounds exist before inspecting
them. The existing behavioral comparisons remain. Role filtering retains start
date narrowing, and interval merging checks the first element directly.

No non-null assertion exceptions remain. `BlogLayout`, `BlogCard`, and
`FeaturedPostCard` guard cover alt text and report the offending post ID if it is
missing. The shared blog schema also validates this requirement at collection load.
These component guards preserve narrowing even if a future caller supplies a draft
or bypasses collection validation. The image-loading browser test uses
`Promise.withResolvers` rather than a definite-assignment assertion for its release
callback. There are no source-wide or test-wide overrides.

Prefer assertions that execute in tests and fail clearly over casts or optional
chaining that lets a missing value escape a test. Browser evaluation callbacks run
in the page, so they use their own guard rather than an imported Node assertion.

## Type-aware engine and file coverage

`oxlint-tsgolint` is pinned as a development dependency. It provides checks based
on TypeScript program information; merely naming a type-dependent rule does not
run it. This adds a native development-tool binary, not a shipped site dependency.
On this checkout, three warmed command runs took about 0.35 seconds with type-aware
checks versus 0.12 seconds without them (including process startup). These are
local measurements, not CI budgets. No separate build or lint job is needed.

Oxlint 1.85.0 selects TypeScript files across source, configuration, scripts,
unit tests, browser tests, and test support. It respects the existing ignored
output and dependency directories. The explicit file inventory included 132 files
at implementation time. This count is observational, not a required target.

A local bad-example probe verified the following coverage:

| Location                  | Syntax checks | Type-aware promise checks           |
| ------------------------- | ------------- | ----------------------------------- |
| `.ts`                     | Yes           | Yes                                 |
| Astro front matter        | Yes           | Not reported by this engine/version |
| Astro embedded script     | Yes           | Not reported by this engine/version |
| Astro template expression | Not analyzed  | Not analyzed                        |

For example, `value!` was rejected in front matter and an embedded script, but not
in `{value!}` in the template. A floating `Promise.resolve(1)` was rejected in a
TypeScript file, but not in either Astro script region. Keep `astro check`, schema
validation, and browser tests: Oxlint is not full Astro template analysis.
Do not infer coverage just because an `.astro` path appears in `--debug files`.

See the official [type-aware linting guide](https://oxc.rs/docs/guide/usage/linter/type-aware.html)
and [configuration reference](https://oxc.rs/docs/guide/usage/linter/config-file-reference).
The installed-version probes are authoritative for the coverage recorded here.

## Enforcement verification

Temporary fixtures were run through `npm run lint:code -- <fixture> --format json`,
then removed. The command exited with status 1 and the expected diagnostics for:

- An unchecked nullable `value!` and an explicit `any` parameter.
- Loose equality and an unintended switch fallthrough.
- `await 42` (`typescript/await-thenable`).
- An unhandled `Promise.resolve(1)` (`typescript/no-floating-promises`).
- `[1].forEach(async () => { await Promise.resolve(); })`
  (`typescript/no-misused-promises`).

The type-aware audit also found a real fetch-mock mismatch: a possible `Request`
was stringified instead of reading its URL. The mock now handles that input type.
The repository passes this policy without a suppressed baseline. No coverage
percentage target or unrelated package upgrades are introduced.
