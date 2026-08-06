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
|-- config/           Shared content models and CMS configuration
|-- content/blog/     Markdown articles
|-- content/experience/
|                     Individual JSON experience records
|-- data/             Site, home-page, social, and resume data
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
`src/config/content-model.ts` and validated by `src/content.config.ts`.

Set `draft: true` to keep an article out of production listings and generated routes. Article cover images are stored
under `src/assets/<year>/`.

### Experience and resume

Individual experience records live in `src/content/experience/` as JSON. The site combines them with the structured
data in `src/data/resume/` to render the resume and generate its alternate formats.

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

- `src/config/content-model.ts` defines the shared content schema.
- `src/config/sveltia-adapter.ts` converts the schema into Sveltia collections.
- `src/config/sveltia-config.ts` configures the repository, media paths, and CMS branding.

On localhost, choose **Work with Local Repository** and grant access to this repository. On the deployed site, use a
GitHub personal access token with access to the repository.

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

The content model is shared between Astro validation and Sveltia CMS adapters to reduce schema drift. Resume exports
are generated from the same structured data used by the HTML page.

## Deployment

The CI workflow runs formatting, linting, type checks, Astro diagnostics, unit tests, browser tests, Lighthouse, and a
production build. A push to `main` deploys the generated `dist/` artifact to GitHub Pages after required checks pass.

The canonical site URL and sitemap configuration are defined in `astro.config.ts`. The custom domain is recorded in
`CNAME`.
