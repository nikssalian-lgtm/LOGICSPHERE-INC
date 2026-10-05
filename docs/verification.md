# Project verification

## September 30 runtime verification

- Existing owner administrator access was restored by resetting its password. Edge sign-in, dashboard Connected status, authenticated overview HTTP 200 and sign-out passed on port 3002. No password is stored in this document.
- Corrected local application/frontend URLs and Sanctum stateful domains for port 3002. A stale PHP listener retained the old settings after restart; stopping that verified project listener resolved dashboard authentication failures.

- Restored the local website at `http://127.0.0.1:3002`; homepage and admin route return HTTP 200. The production build timestamp is newer than the frontend sources.
- Fixed the launcher to preserve PATH while normalizing its casing, use the actual `.next` production build, and accept an optional `-Port` argument.
- A stale `.next-e2e` cache caused a Windows EPERM rename error and was moved aside. With a fresh cache, 10 of 11 Edge tests passed; the navigation test hit the 45-second cold-compilation timeout and passed on a focused rerun (7.2 seconds). All 11 tests have now passed across those runs.
- Increased the browser-test timeout to 120 seconds for the isolated development server's first-access compilation. Authentication, authorization, CSRF, password reset, mobile layouts, reduced motion, metadata, public portfolio visibility and 404 behavior passed.

## Visual redesign verification — 2026-10-02

### Light default and graphic contrast follow-up

- Light theme is rendered by default on the server and retained if browser storage is blocked; explicit saved dark choices still apply before paint.
- Replaced near-white accent text with a theme-aware semantic color. Light illustrations now use darker cyan outlines, stronger fills, charcoal framing and defined shadows. Network canvas lines/particles use stronger light-mode paint and redraw on theme changes, including while paused.
- Reviewed service, dashboard, storefront/phone, network and mobile screenshots. Targeted label contrast checks exceed 4.5:1 against conservative reference surfaces; this is not a full accessibility audit.
- Final production build and formatting pass. All 14 Edge tests pass in one 2-minute run on isolated ports 3001/8001, including default theme, saved dark preference, blocked storage, contrast, animation, mobile, and admin authentication checks.
- Final production homepage, services, about and contact return HTTP 200 and include the server-rendered light default on port 3002.
- Earlier follow-up removed the duplicate shared footer CTA from every public page while retaining each page's own closing section.

- Production build passes, including TypeScript compilation. Prettier passes for all changed TSX/CSS/test files.
- All 13 Edge browser tests pass in a single 2.4-minute run through `scripts/test-browser.ps1`; fixtures remain in `logicsphere_test` on ports 3001/8001. Includes existing authentication, authorization, mobile layouts, metadata, CSRF, password reset, and 404 checks.
- Two new experience tests also pass against the final production build on port 3002: theme persistence, live canvas frame changes, paused canvas stability, three scroll chapters and sticky positioning, mobile navigation, no horizontal overflow, reduced-motion static chapters, and no homepage JavaScript errors.
- Screenshots reviewed for desktop dark/light, mobile dark/light, scroll artwork, and mobile services. Saved in ignored `.local/experience-*.png`. Existing mobile regression checks six viewport widths from 360px to 2560px.
- Final homepage, `/admin`, and API services endpoint return HTTP 200. Homepage HTML includes the new hero sculpture. The real administrator account was unchanged; authenticated testing was performed with isolated fixtures.
- An initial visual run reached the old frontend before restart and failed. A broader production smoke selection also included a test-only account login, which could not succeed against the real database. These were corrected by replacing the frontend process and running the complete suite in its isolated environment; the final runs above pass.
- Performance measures are implementation controls, not benchmark claims: bounded canvas resolution and mobile geometry, offscreen/hidden-document suspension, local fonts, reduced-motion support, and a persistent pause control. Physical-device frame rates and formal Lighthouse/axe audits were not measured.

## Environment

Windows, PHP 8.4.26, Laravel 13.33.0, Sanctum 4.3.3, MySQL 8.4.11, Node 24.18.0, Next.js 16.3.6 and React 19.3.0. Project-local tooling leaves XAMPP unchanged.

## Production optimization checks

- Laravel suite: 26 tests / 101 assertions against SQLite in-memory, including CMS, preview-content visibility, public settings, enquiry handling and unsafe SVG upload rejection.
- MySQL suite: 26 tests / 101 assertions against the dedicated isolated test database.
- Browser: 11 Playwright tests in Microsoft Edge. Covers homepage/navigation/contact, reveal visibility, unpublished preview work, metadata and Organization schema, keyboard skip link, responsive overflow at six widths from 360px to 2560px, reduced motion, authentication and access control, CSRF, password reset, and real 404 responses.
- Frontend: Prettier formatting lint, TypeScript check and Next.js production build pass. CMS-backed routes render dynamically with cached API reads; routes are code-split by Next.js.
- PHP: Laravel Pint formatting check passes.
- Dependency security: Composer audit and `npm audit --omit=dev` report no known advisories.
- Local production server: `http://127.0.0.1:3002`; responsive, metadata/schema, mobile navigation and browser-console smoke checks pass.

## Security, SEO and performance work

CMS settings are batched through a cached public endpoint. Sitemap generation retrieves every page in bounded batches and remains disabled until a real HTTPS site URL and explicit indexing setting are configured; local robots defaults to disallow indexing. Public pages emit CMS-driven canonical/social metadata and suitable Organization, Article, CreativeWork and breadcrumb structured data. Rich text and navigation reject unsafe URL forms. Media uploads enforce size, allowed format, image decoding and pixel/dimension bounds. CMS imagery uses Next Image responsive optimization and lazy loading where appropriate. Reduced-motion preferences are honored. Explicitly fictitious seeded clients and portfolio projects remain editable as drafts and are not exposed publicly.

## Boundaries

No real CMS media, company/client/project claims, production hostname, SMTP provider or production deployment were supplied. Image optimizer output for real uploaded assets, formal Lighthouse/axe audits, target physical-device testing, load testing and production-host verification therefore remain deployment validation. PHP GD is unavailable locally; the upload regression tests rejection of unsafe SVG payloads without GD. Live email delivery requires provider credentials. No administrator is seeded into the real application database; create the initial administrator with `scripts/create-admin.ps1`.
