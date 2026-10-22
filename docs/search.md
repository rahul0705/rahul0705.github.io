# Article search

Search opens from the navbar search icon in a DaisyUI dialog on every page. It uses
[Pagefind](https://pagefind.app/docs/) to search published article titles, descriptions, section/tag metadata, and body
text entirely in the browser. Search terms are not sent to a hosted search service or added to page URLs.

## Build and local preview

```sh
npm run build
npm run preview
```

Then open the preview server and select the navbar search icon. The build command runs Astro once, then indexes `dist`
with the installed Pagefind CLI. The ordinary Astro development server does not generate or serve the production index;
use the built preview to work on search. Rebuild after editing articles or search markup.

GitHub and GitLab already call `npm run build` before uploading the single site artifact. Search files are therefore
included in the same tested/deployed output, without another CI build or an indexing service. Build validation requires
the core search assets; browser tests exercise the generated index.

The Pagefind dependency uses a caret range, with the resolved version in the npm lockfile. No additional frontend
framework or search dependency is required.

## What is indexed

`BlogLayout.astro` marks the article with `data-pagefind-body`. Pagefind excludes pages without that marker. Drafts have
no generated article route and are excluded. The surrounding navbar/footer and the article's repeated table of contents
are not indexed.

The layout exposes title, section, tags, publication date, and optional update date as metadata. Section and Tags are
also filters. Published content is searchable by its visible description and body, with matching excerpts and heading
links supplied by Pagefind. Article text stays in the HTML; no separate body-extraction pipeline or hand-maintained JSON
index is needed.

## UI and failure behavior

`components/search/SearchDialog.astro` uses DaisyUI's `modal`, `modal-box`, and `modal-backdrop` with the native HTML
dialog element. The navbar trigger uses a DaisyUI icon button, visible beside the mobile menu as well as desktop
navigation. Opening search focuses the input. Escape, the close button, and the backdrop dismiss the dialog and return
focus to the trigger. Search does not navigate away from the current page until an article result is selected.

`components/search/ArticleSearch.astro` uses DaisyUI inputs, selects, buttons, and list rows for the form, filters, and
results. Its co-located client loads Pagefind's search API only after a query or filter is entered. Results include
article titles, metadata, excerpts, and matching heading links. Arrow Down from the input focuses the first result;
Clear resets the query and filters. Empty input, pending queries, and no-result states are explicit.

DaisyUI provides presentation and dialog behavior, while Pagefind supplies search. No separate search page or frontend
framework is needed.

The client validates the API data it consumes and renders text without injecting result HTML. Only links to this site's
article routes are accepted. A request counter prevents older responses from overwriting a newer query.

If the module, index, or an article fragment cannot load, the page offers a clear unavailable message, a reload/retry
button, and the article index. After reloading, open search again to retry. Without JavaScript the search trigger stays
hidden; the existing Articles navigation link still works. Browser tests cover each download failure, recovery after
retry, and dialog focus/dismissal.

All search asset paths and result prefixes follow Astro's configured base through the existing URL helper and Pagefind's
base option. Subpath verification is a local check, not another CI matrix or build.

## Measured footprint

For nine published articles, Pagefind 1.5.2 indexed 1,964 unique words and two filters in about 0.04 seconds on the
local machine. These observations are not performance budgets.

| Asset                 | File bytes | Gzip estimate |
| --------------------- | ---------: | ------------: |
| Site search client    |      3,811 |         1,526 |
| Search API JavaScript |     45,555 |        12,849 |
| Search worker         |     41,255 |        11,901 |
| English search engine |     72,740 |        72,783 |

The English engine is already compressed internally, so gzip does not improve it. All generated Pagefind files together
occupy about 735 KB (including unused alternative UI bundles that the CLI generates). A cold search for `code` requested
about 239 KB of Pagefind assets from the uncompressed local preview, or about 177 KB when those files are
gzip-compressed. The figures include the worker, metadata, index chunk, and matching article fragments; they exclude the
site's shared fonts/styles and the small site search client listed above. Actual hosting compression and caching
determine transfer sizes. The prebuilt Pagefind UI JavaScript and CSS are not requested.

Navigation and opening the dialog make zero Pagefind requests. Index chunks and article fragments are fetched as needed
after entering search. The browser payload test attaches the requested asset paths and byte counts, and the mobile
accessibility test attaches a rendered preview for review.
