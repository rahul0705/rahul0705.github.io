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
|-- data/             Site, home-page, social, and resume data
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
`src/config/content-models/blog.ts` and validated by `src/content.config.ts`. The same model supplies the article fields
in Sveltia CMS.

Set `draft: true` to keep an article out of production listings and generated routes. Article cover images are stored
under `src/assets/`; the publication date in front matter is authoritative, while existing date-prefixed filenames are
retained to preserve public URLs.

Before publishing an article:

1. Confirm the title is unique and the description is a concise search and social summary.
2. Choose the publication date, section, tags, featured state, and table-of-contents behavior intentionally.
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

## Content manager

Sveltia CMS is available at `/admin/`. Its configuration is created in TypeScript rather than loaded from a
`config.yml` file:

- The shared content model defines the fields available to both Astro and the CMS.
- The Sveltia integration under `src/integrations/sveltia/` adapts that model into CMS collections and owns the CMS
  configuration, branding, and content previews.
- The Astro integration under `src/integrations/astro/` adapts the same model into Astro collection schemas.

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
Shared content model
|-- Astro validation adapter
`-- Sveltia CMS adapter and previews
```

Resume exports are generated from the same structured data used by the HTML page.

## Deployment

The CI workflow runs formatting, linting, type checks, Astro diagnostics, unit tests, browser tests, Lighthouse, and a
production build. A push to `main` deploys the generated `dist/` artifact to GitHub Pages after required checks pass.

The canonical site URL and sitemap configuration are defined in `astro.config.ts`. The custom domain is recorded in
`CNAME`.

## License

This project is licensed under the [MIT License](LICENSE).
