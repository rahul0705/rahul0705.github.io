# rahulmohandas.com

Source for [rahulmohandas.com](https://www.rahulmohandas.com), a personal site containing selected writing,
professional experience, and machine-readable resume exports.

The site is statically generated with Astro and deployed to GitHub Pages. Tailwind CSS and DaisyUI provide the
visual system, while Sveltia CMS supports browser-based editing of articles and experience entries.

## Requirements

- Node.js 22.12 or newer
- npm
- Chromium for the Playwright browser tests

## Local development

```sh
npm ci
npm run dev
```

The development server is available at <http://localhost:4321>.

To test the production output locally:

```sh
npm run build
npm run preview
```

## Common commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Start the Astro development server                 |
| `npm run build`         | Generate the static site in `dist/`                |
| `npm run preview`       | Serve the generated production build               |
| `npm run typecheck`     | Check TypeScript types                             |
| `npm run astro:check`   | Run Astro diagnostics                              |
| `npm run format`        | Check formatting                                   |
| `npm run format:fix`    | Apply formatting                                   |
| `npm run lint:all`      | Lint code, CSS, and Markdown                       |
| `npm run test:unit`     | Run Vitest unit tests                              |
| `npm run test:e2e`      | Run Playwright interaction and accessibility tests |
| `npm run test:coverage` | Generate unit-test coverage                        |
| `npm run quality`       | Run the complete local quality pipeline            |
| `npm run audit:unused`  | Report unused files, exports, and dependencies     |

Install the Playwright browser before running browser tests for the first time:

```sh
npx playwright install chromium
```

## Project structure

```text
src/
|-- components/       Reusable Astro components
|-- config/           Integration-independent site configuration
|-- content/blog/     Markdown articles
|-- content/experience/
|                     Individual JSON experience records
|-- config/           Typed site, content-model, analytics, and integration configuration
|-- data/             Computed site, home-page, and resume data
|-- integrations/     Astro and Sveltia integration boundaries
|-- layouts/          Shared page layouts
|-- pages/            Astro routes and resume export endpoints
|-- styles/           Global and print styles
|-- themes/           Catppuccin DaisyUI themes
public/               Static assets and site metadata
tests/                Playwright browser tests
test-support/         Vitest setup utilities
```

## Editing content

### Articles

Articles live in `src/content/blog/` as Markdown files. Their front matter fields are defined in
`src/config/content-models/blog.ts` and validated by `src/content.config.ts` through `@rm-industries/content-model`. The
same model supplies the article fields in Sveltia CMS.

Set `draft: true` to keep an article out of production listings and generated routes. Article cover images are stored
under `src/assets/`. The date prefix in the article filename is the authoritative publication date and determines its
position in newest-first article lists. The homepage Recent Articles section automatically uses the three newest
published articles; there is no separate editorial featured state.

Before publishing an article:

1. Confirm the title is unique and the description is a concise search and social summary.
2. Confirm the filename date, section, tags, and table-of-contents behavior. Check whether the filename date places the
   article in the three newest posts shown under Recent Articles; do not add duplicate publication or featured fields.
3. Store the cover in `src/assets/`, write alt text that describes its meaningful visual content, and record any
   third-party source in the `ATTRIBUTION.md` file beside the image.
4. Build or preview the site and review the generated article title, publication date, canonical URL, Open Graph and
   Twitter copy, cover image, and social-image alt text.
5. Keep the article as a draft until those checks are complete; then remove `draft: true` or switch Draft off in the CMS.

### Experience and resume

Individual experience records live in `src/content/experience/` as JSON. Reusable skill and financial-scope records
live in `src/content/skills/` and `src/content/financial-scopes/`. The site validates their stable filename IDs, combines
them with the structured data in `src/data/resume/`, and renders the resume and its alternate formats.

The public resume routes are:

- `/resume/` — HTML resume with print support
- `/resume.json` — JSON Resume-compatible data
- `/resume.txt` — plain-text resume
- `/resume.md` — Markdown resume

When changing resume generation, run:

```sh
npm run verify:resume:markdown
```

## Buttons and color

Use DaisyUI semantic colors from the Catppuccin theme. Filled primary buttons identify the main action in a
context: View Resume in the hero, Email in Contact, Export Resume on the resume, and Go home on the error page.
Use outlined buttons for secondary actions, including article browsing and Contact profile links. Ghost buttons
serve navigation and lightweight profile shortcuts. Choose variants by purpose, never by array position; Contact
actions without an explicit variant default to outline.

Primary-colored text also serves as the site accent for labels and links; it does not always indicate a button.
Use base-content for body text and the matching content token on filled colored surfaces. Catppuccin's secondary
token is a dark surface in Mocha, so it is not suitable as text on the page background.

## Content manager

Sveltia CMS is available at `/admin/`. Its configuration is created in TypeScript rather than loaded from a
`config.yml` file:

- The shared content model defines the fields available to both Astro and the CMS.
- The published content-model package adapts the shared models into Astro collection schemas and base Sveltia CMS
  collections.
- The Sveltia integration under `src/integrations/sveltia/` owns site-specific CMS configuration, collection overrides,
  branding, and content previews.

On localhost, choose **Work with Local Repository** and grant access to this repository. On the deployed site, use a
GitHub personal access token with access to the repository.

### Adding resume catalog entries

Skills and financial scopes are first-class CMS collections. Their filename is a stable ID persisted by experience
relations, so changing a filename requires updating every referencing experience in the same change.

To add a catalog record and use it in an experience:

1. Create and save the skill or financial scope in its CMS collection. Choose a concise, durable slug in the slug field.
2. Allow the CMS to commit the new JSON entry, then reload the CMS so it refreshes repository-backed relation data.
3. Create or edit the experience, select the new entry in the searchable relation field, and save the second commit.

The catalog commit may trigger a deployment, but that deployment does not need to finish before the relation becomes
available after the CMS refresh. Sveltia currently saves these related entries as two commits rather than one atomic
editorial change. An intermediate build containing an unreferenced catalog entry is valid.

Deleting or renaming a catalog record without updating its references causes resume generation to fail with the missing
ID and referring entry. Financial scopes retain checked-in fallback values; supported external sources refresh those
values during builds without making upstream availability a deployment requirement.

## Architecture

| Area          | Implementation                                           |
| ------------- | -------------------------------------------------------- |
| Framework     | Astro static-site generation                             |
| Styling       | Tailwind CSS 4, DaisyUI 5, and Catppuccin themes         |
| Content       | Astro content collections and structured TypeScript data |
| CMS           | Sveltia CMS initialized with an in-code configuration    |
| Unit tests    | Vitest                                                   |
| Browser tests | Playwright and axe-core                                  |
| Deployment    | GitHub Actions and GitHub Pages                          |

The integration-independent content model is the source for both Astro validation and Sveltia CMS configuration,
reducing schema drift without coupling either integration to the other:

```text
Shared content models
|-- @rm-industries/content-model/astro
`-- @rm-industries/content-model/sveltia + site-specific CMS configuration and previews
```

Resume exports are generated from the same structured data used by the HTML page.

### Public route decisions

The Forge route comparison in [issue #67](https://github.com/rahul0705/rahul0705.github.io/issues/67) resulted in these
decisions:

- Generate `robots.txt` from `src/config/site.ts` through `src/pages/robots.txt.ts`. Astro writes the endpoint to
  `dist/robots.txt` at build time, so GitHub Pages still serves a static file. The existing directives are preserved.
  `robotsDisallowPaths` controls crawling separately from sitemap exclusions: crawlers can access `/admin/` so its HTML
  `noindex` directive can be read, while raw resume exports remain disallowed.
- Omit a web app manifest for now. This portfolio has no installation or app-specific experience that warrants one.
- Retain the existing fallback social image, `src/assets/covers/code.jpg`, used by `SeoHead` when a page supplies no
  image. Article covers continue to override it; a second fallback asset would duplicate an existing capability.
- Keep the article index unpaginated while its seven articles remain easy to browse together. Revisit pagination when
  the collection becomes cumbersome to scan or materially affects page performance.
- Keep About content on the homepage, with the resume providing career detail. Add a separate About route only when
  there is distinct content that benefits from its own page.

The browser suite checks the generated crawl policy, sitemap exclusions, sharing metadata, and accessibility of the
existing public pages.

## Deployment

### Dependency updates

`.github/dependabot.yml` follows the
[Forge template policy](https://github.com/rm-industries/forge/blob/main/templates/default/.github/dependabot.yml),
with a dedicated compatibility group for this site's shared content model, Astro, and Sveltia CMS:

- npm checks run Mondays at 05:30 UTC. Minor and patch updates form separate production and development PRs, based on
  `dependencies` and `devDependencies` in `package.json`. Astro integrations and other build tooling currently belong
  to the development group even though they affect the generated site.
- Major releases wait 21 days, minor releases 7 days, and patches 3 days; releases without a matching version category
  use 7 days. These are minimum release ages, followed by the next scheduled check, not promises of a PR on that day.
- Sveltia CMS, `@rm-industries/content-model`, and Astro minor/patch updates share the `content-platform` group across
  production and development dependencies. Review their peer dependency ranges together. Major npm updates remain
  individual PRs, including these three packages; required peer changes may need a coordinated upgrade.
- All npm PRs carry `dependencies` and `npm`. The dependency-label workflow adds `deps:production`, `deps:development`,
  or `deps:content-platform` to the corresponding grouped PR. Individual major and security PRs retain ecosystem labels.
  Group labels must exist in the repository. The workflow uses only Dependabot PR metadata and never checks out PR code.
- GitHub Actions checks run Mondays at 05:00 UTC and retain one group with a 7-day cooldown. Keep full commit SHA pins
  and the adjacent version comments (`# v7`, for example) in workflows and composite actions. Review both the SHA and
  version comment when updating an action.
- Each ecosystem allows up to five open version-update PRs. Security updates use GitHub's separate security-update
  mechanism and limit; the npm groups apply only to version updates. Keep Dependabot security updates enabled in
  repository settings. Version-update cooldown periods do not delay security updates.

For example, eligible font updates share a production PR, eligible linting tools share a development PR, and eligible
Sveltia, content-model, and Astro patches share a content-platform PR. A TypeScript major gets its own PR. Dependabot
may include required dependency changes to resolve compatibility. GitHub Actions PRs retain `dependencies` and
`github-actions` labels. Group labeling starts after the workflow is merged into the default branch.
See the [GitHub options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
for grouping and cooldown semantics.

### Publishing

The CI workflow runs formatting, linting, type checks, Astro diagnostics, unit tests, browser tests, Lighthouse, and a
production build. A push to `main` deploys the generated `dist/` artifact to GitHub Pages after required checks pass.

Shared identity, author, canonical URL, repository, navigation, social, RSS, analytics, and indexing metadata are defined
in `src/config/site.ts`. Astro, page metadata, navigation, feeds, analytics, and resume basics consume that typed source.
Environment-specific and secret values must remain in environment variables or deployment settings. The custom domain
is recorded in `CNAME`.

## License

This project is licensed under the [MIT License](LICENSE).
