# Production metadata and CMS branding review

Reviewed October 17, 2026 for issues
[#5](https://github.com/rahul0705/rahul0705.github.io/issues/5) and
[#23](https://github.com/rahul0705/rahul0705.github.io/issues/23).

## Production SEO and crawl policy

Read-only HTTPS requests checked the homepage, article archive, resume, admin,
and `/blog/2026-09-30-make-the-wrong-thing-hard-to-do/` on
<https://www.rahulmohandas.com>.

- All sampled pages return 200, nonempty titles and descriptions, and one
  canonical URL on the HTTPS www host. Open Graph and Twitter titles and
  descriptions match the page metadata. Both image URLs agree and return 200
  with image content types; image alt text is present. Cards use
  `summary_large_image`. The article publication timestamp is
  `2026-09-30T00:00:00.000Z`.
- Apex HTTPS now returns a valid TLS response and 301 redirect to the www host.
  Following it returns 200. This resolves the certificate blocker recorded in #5.
- The admin HTML declares `noindex, nofollow`. Robots allows crawling it so that
  directive can be read. The sitemap excludes admin, raw resume exports, the
  robots endpoint, and the 404 page; its 16 URLs use the canonical host.
- Raw JSON, Markdown, and text resume endpoints return 200 with their intended
  content types. Robots disallows all three. This implements the agreed crawl
  policy; it does not prove removal from search indexes or provide an HTTP
  `X-Robots-Tag` header on GitHub Pages.
- The SVG favicon returns `200 image/svg+xml`, `Cache-Control: max-age=600`,
  ETag, and Last-Modified. ETag revalidation returns 304. A query-busted request
  returns the same bytes as the unversioned asset and checked-in favicon.
  Browser and CDN freshness can lag by ten minutes; social providers may retain
  their own cached previews. No cache invalidation was requested, and provider
  dashboards or actual search-index state were not inspected.

## CMS branding

The deployed, query-busted admin sign-in screen visibly displays the canonical
monogram. Its image loads successfully from `/favicon.svg`. The response HTML
contains one SVG icon declaration and no legacy favicon reference.

Runtime inspection found two identical favicon links: SeoHead supplies one and
Sveltia adds another. The admin bootstrap now removes the initial declaration
before initializing Sveltia, which supplies the runtime icon from the existing
`logo.src` setting. Public-page favicon behavior is unchanged. No new asset,
configuration switch, or observer is needed.

The CMS config unit test protects `logo.src`. The admin browser regression checks
the initial HTML, one runtime SVG declaration, a visible loaded monogram, and a
query-busted navigation. Hosted verification of this fix remains pending merge
and deployment. The CMS was inspected without signing in or changing content.
