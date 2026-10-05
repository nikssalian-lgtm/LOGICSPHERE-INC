# Website menu visibility

Open **Admin → Header & menus** (`/admin/menus`). The default **Header sections** view lists Services, Solutions, Work, About and Insights. Use **Hide** or **Publish** to control an entire public section. Select a footer group to manage individual footer links separately.

The sidebar entry is directly below Dashboard. There is also a **Header & menus** shortcut on the dashboard. Both require `menus.view`; refresh an already-open browser tab after updating the frontend.

Hiding uses the existing protected publication endpoint and requires `menus.publish`. Content stays intact in the CMS. A hidden header section disappears from desktop/mobile navigation, related homepage showcases, footer navigation and the sitemap. Its public index and detail pages render the unavailable page with noindex. Publishing the header record restores the section. Work controls `/portfolio` and its case studies. Insights controls `/blog` and its articles. The header project CTA and legal links remain separate.

Public navigation now uses CMS records only, with no fallback links that could reappear after hiding the last item. Menu reads bypass the frontend data cache, so refreshing a public page reflects changes.

The existing 12 built-in links were imported into the local CMS. On another installation without menu records, run `.tools/php/php.exe scripts/import-default-menus.php` once. It preserves any existing menu records, including archived records. The browser test launcher imports defaults into the isolated test database with `--test`.

Validation: production build passed; Edge test `menu-visibility.spec.ts` checks Hide/Publish requests and reload persistence. The isolated `.local/check-section-publishing.cjs` browser check uses a mock API to exercise all five section guards and the homepage Work hide/restore behavior without modifying live menu visibility.
