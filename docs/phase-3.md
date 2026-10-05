# Phase 3 — Public website

## Implemented

- Public brand shell with sticky desktop navigation, accessible mobile menu, original LogicSphere logo, responsive footer and admin-managed published menu links.
- Homepage with an interactive Canvas 2D network sphere, CMS-managed hero copy/CTA, capabilities, business software solutions, featured portfolio, and optional published client logos, technologies, industries and testimonials. Additional sections show illustrative ERP/CRM/POS and web/mobile concepts, a scroll-led network → systems → CMS project → industries journey, published CMS counts (explicitly not company achievement claims), process steps, and optional CMS case studies.
- Service and solution indexes plus published-record detail pages.
- Portfolio listing and case-study pages with overview, challenge, approach, solution, outcomes, image gallery and technology metadata. Empty portfolio states direct an administrator to the CMS and never fabricate client work.
- About page backed by the published `about` CMS page and optional team/technology records.
- Contact form with name, email, phone, company, project type, budget, message, privacy consent and a honeypot. Submissions go to Laravel and display the resulting enquiry reference.
- Blog index with search/category filters, article details and related posts. Generic CMS pages are available by slug and can include SEO metadata.
- Published industry and technology directories, plus dedicated Privacy Policy and Terms & Conditions routes. Legal copy is read from published CMS pages (`privacy-policy` and `terms-and-conditions`); when no approved copy exists, the page asks the administrator to publish it rather than inventing legal terms.
- Optional homepage composition pages can personalize the introduction (`homepage-introduction`), process (`homepage-process`), rationale (`why-logicsphere`) and closing CTA (`homepage-cta`) through published CMS pages.
- A branded not-found page and sitemap entries for directories and legal routes.
- Safe React rendering for the backend-sanitized rich-text document nodes; no untrusted HTML injection.
- SEO defaults read from public settings; page and record titles/descriptions are dynamic. CMS page canonical URLs are honored. Generated robots.txt and sitemap.xml include published content routes and honor the indexing setting.
- Mobile-specific layouts, keyboard/focus states, semantic headings, lazy-loaded editorial images and reduced-motion support.

## Content and configuration

Publish service, solution, portfolio, client, testimonial, team, technology, industry, blog, page and menu records in the admin workspace. For images, attach media to the record and make each intended public file available through the media library. Private media remains inaccessible to anonymous visitors.

Set homepage copy and CTA, footer copy, public contact details, social links, SEO defaults and canonical base in Admin → Settings. Client logos, testimonials and portfolio examples only render from published records. The approved company palette and supplied logo are preserved.

## Brand identity and editable preview content

- The supplied `assets/brand/logicsphere-original.svg` and its frontend copy remain unchanged. The shared token file at `frontend/src/styles/tokens.css` owns the brand palette, RGB alpha channels, surfaces, text colors, semantic states, gradients, shadows, typography, spacing, radii and motion timings.
- The public stylesheet references those tokens for its palette. The responsive composition is tuned for the shared public navigation, hero, service and solution sections, portfolio previews, process story, CTA and footer.
- The local `BrandPreviewContentSeeder` adds one clearly named client placeholder and three clearly named project placeholders. These are published only to let the visual layout be reviewed; titles and summaries explicitly say to replace them before launch. They contain no invented client identities, results, screenshots or testimonials and can be edited or archived from Admin → Clients and Admin → Portfolio.
- On a fresh environment, run `php artisan db:seed --class=BrandPreviewContentSeeder` after migrations if placeholder preview entries are wanted. The seeder is idempotent and does not overwrite edits to existing records.

## Validation

`npm.cmd run typecheck` and `npm.cmd run build` pass. Build output includes the public route family, industry/technology directories, legal routes, generated robots and sitemap endpoints, and dynamic detail routes. The full Playwright E2E suite has not been run; it requires the isolated E2E MySQL environment.

The current environment's project startup script could not start its E2E processes because Windows PowerShell `Start-Process` rejected duplicate `PATH`/`Path` environment keys. I started the production frontend directly on `http://127.0.0.1:3000` against the existing Laravel API on port 8000. HTTP checks returned 200 for `/`, `/services`, `/solutions`, `/portfolio`, `/about`, `/contact`, `/blog`, `/robots.txt`, `/sitemap.xml`, and `/api/v1/health`. The full Playwright suite remains unrun.

The brand refresh was rechecked with a clean production build. Microsoft Edge returned one shared header and footer at desktop width; at mobile width it had no horizontal overflow, and the hamburger opened with working service navigation. The local Laravel suite passed 20 tests / 77 assertions. Pint passed for the changed seeder files; the repository-wide formatting check still reports five existing unrelated files.

## Motion experience

- The hero and journey use a custom Canvas 2D network sphere (88 nodes on desktop; 40 on mobile) with connected edges and pointer parallax. It caps rendering at roughly 31 fps on desktop and 24 fps on mobile, limits mobile device-pixel ratio, batches drawing work, and pauses when hidden, off-screen, or inside an inactive journey scene. It does not require Three.js/WebGL.
- A sticky visual in the homepage journey transitions among connected systems, an illustrative operations dashboard, a CMS-backed featured project image (or clearly labeled preview state), and CMS industries. Scroll observers select the scene without hijacking scroll.
- Public pages share one-time viewport reveals, small magnetic button offsets, a compact scrolled navigation state, subtle portfolio image/arrow interactions, animated CMS counters and supported short page transitions. Motion uses opacity and transforms; reveal behavior initializes only when browser motion support is available.
- `prefers-reduced-motion` disables the canvas loop, reveal initialization and magnetic movement, while leaving all content visible and navigation usable.
- Microsoft Edge verification passed at 1440px and 390px: no horizontal overflow, the canvas and story nodes render, all four story steps are reached by scrolling, the mobile menu opens, reduced motion avoids adding the motion-ready state, and no page errors were reported. Desktop and mobile review captures are temporarily stored in ignored `.local/`.
- An instrumented Edge probe confirmed that canvas drawing falls to zero after the hero/journey move off-screen; reduced-motion pages perform only their initial static canvas draws. Emulated mobile frame throughput varied with host load, so those headless numbers should not be treated as a physical-device benchmark.

## Portfolio and case studies

- Portfolio listing cards, category facets, technology choices and search are derived from published Laravel project records. Categories use each project's CMS project type and industry; search includes title, client, summary, services and technologies. Featured records lead the grid, and category/technology changes use a short native view transition where supported. No hard-coded project/client list is used.
- Portfolio CMS fields include project category (ERP, CRM, POS, e-commerce, website, mobile application or custom software), services, key features, client, industry, challenge, approach, solution, optional results, technologies, project URL, SEO title and SEO description. Image and video records can be linked through the existing media library; only public media is returned to the public site.
- Case-study pages use the project's actual CMS data for overview, client/industry, services, challenge, approach, solution, optional results, features, technology, URL, images/videos and related published projects. Empty optional fields are omitted, including results. Project SEO metadata and CreativeWork structured data are generated from the record.
- Microsoft Edge checks confirmed search empty-state recovery, category selection, case-study navigation, related records, structured data, mobile width and no runtime errors. Current seeded records are labeled placeholders and intentionally contain no fabricated client claims, results or project media. The three preview projects share the same placeholder industry, so that sample category currently returns all three; production facets will follow the distinct values entered in the CMS.
- The focused CMS backend suite passes 5 tests / 31 assertions, including publishing project category, services, features and technology values through the public API. Pint passes for the changed registry and test files. Frontend typecheck and the production build pass.

## Next

Next, review this public-site expansion locally and supply approved legal copy before publishing the policy routes. Continue performance checks as real media and production content are added; retain the lightweight canvas approach unless profiling shows a clear need for another rendering method.
