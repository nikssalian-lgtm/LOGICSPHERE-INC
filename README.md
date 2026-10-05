# LogicSphere Inc — Phase 3

Laravel API + React/Next.js frontend + MySQL. The public marketing website and Phase 2 CMS/admin are implemented in the working application. The original single-file concept is preserved at `index.html` and `reference/demo.html`.

## Implemented

- Laravel 13, Sanctum cookie authentication, MySQL migrations, versioned REST routes, request validation and safe user resources.
- Login, logout, password recovery/reset, database sessions, rate limiting and server-enforced administrator access.
- Interactive administrator provisioning; no default administrator password or public registration.
- React/Next.js + TypeScript public website with responsive navigation, homepage, service and solution directories/details, portfolio/case studies, about, contact, blog/search/category filtering and CMS pages.
- Published CMS content renders server-side through Laravel's public API. Navigation/footer, hero, contact details, social links and SEO defaults read admin-managed menus/settings; public enquiry submissions are validated and stored by Laravel.
- CMS-driven SEO metadata, canonical URLs, Open Graph/Twitter cards, Organization/Article/Breadcrumb structured data, robots.txt and a paginated sitemap. Search indexing stays off until an HTTPS production URL and explicit admin setting are present.
- Responsive, keyboard-accessible public pages with reduced-motion support, purposeful motion, lazy-loaded editorial imagery and workspace loading states.
- Responsive admin shell, actual database counts, loading/error/404 states.
- Shared brand tokens, logo, buttons, fields, notices, panels and loading states. Official logo source remains unchanged.
- CMS for services, solutions, portfolio/case studies, clients, testimonials, team, technologies, industries, blog, pages and navigation menus.
- Private-by-default image/video library, enquiry pipeline with notes, assignment/export/archive, user invitations, configurable roles and permissions, audit trail, and site/contact/social/SEO settings.
- Public published-only versioned API for CMS content, media and settings. Company claims and client information remain blank until supplied by LogicSphere.

Public implementation and current verification are in [`docs/phase-3.md`](docs/phase-3.md), [`docs/phase-7.md`](docs/phase-7.md) and [`docs/verification.md`](docs/verification.md).

## Run on this workstation

From `C:\Users\Nikhil\company-website`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start.ps1
```

Website: http://127.0.0.1:3000

Admin: http://127.0.0.1:3000/admin

To use the alternate local port, run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start.ps1 -Port 3002` and open http://127.0.0.1:3002. Stop the tracked application processes before changing ports.

The script starts project-local MySQL on 3307, Laravel on 8000, the mail queue worker, and the production frontend build on 3000 in hidden windows. It does not alter XAMPP. After frontend changes, run `npm.cmd run build` inside `frontend` and restart the web process. For frontend development use `npm.cmd run dev` instead of the production frontend process.

Stop application processes with `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/stop.ps1`. Add `-Test` for browser-test processes; add `-Database` only when neither application nor tests need MySQL. The stop script verifies process ownership before stopping tracked processes.

Create your administrator account in an interactive terminal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-admin.ps1
```

The command prompts for name, email and a hidden password with confirmation. Use your real email. It will not overwrite an existing account. There is no seeded administrator in the application database. Local login credentials are the ones set with this command; no default username/password exists.

Local credentials are generated randomly and stored only in ignored `.local/database.json` and backend `.env` files. Do not commit or publish `.tools`, `.local`, or environment files. The PHP/MySQL binaries are development tools, not deployment assets.

## Clean installation on another machine

1. Install PHP 8.4+ with cURL, fileinfo, mbstring, OpenSSL, PDO MySQL, ZIP and intl; Composer; Node 24; MySQL 8.4.
2. Create a database and a dedicated database user. Copy `backend/.env.example` to `backend/.env`, supply database settings, frontend domain and mail settings.
3. In `backend`, run `composer install`, `php artisan key:generate`, `php artisan migrate`, then `php artisan app:create-admin`.
4. In `frontend`, copy `.env.example` to `.env.local`, set `API_INTERNAL_URL` **before building**, and run `npm ci` and `npm run build`.
5. Run Laravel and Next.js, a Laravel queue worker, and the scheduler. See the architecture document for the deployment contract.

## Verification

```powershell
# Backend tests against a separate local MySQL database
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-mysql.ps1

# Seeds only the isolated browser-test database, starts test servers, runs Edge
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-browser.ps1

# Frontend (from frontend/)
npm.cmd run typecheck
npm.cmd run build
```

Run MySQL tests before browser tests: Laravel's test database refresh clears browser fixture data. Browser fixtures refuse to run outside the `e2e` environment and `logicsphere_test` database. For another machine configure `backend/.env.e2e` with a dedicated database/user, port 3001 frontend URLs and a separate session cookie. Edge must be installed, or select another installed Playwright browser in its config.

## Email and production settings

Local mail uses the log transport. Reset links are written to `backend/storage/logs/laravel.log` after the queue worker processes a job. Real email delivery requires a configured SMTP/provider and verified sender in `.env`. Credentials never belong in React or CMS content.

Before production: configure HTTPS, `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, correct domains/trusted proxies, persistent storage, supervised workers, scheduled tasks, backups, monitoring and real mail. Rebuild the frontend for the target API origin. Public indexing is deliberately disabled until the actual website/content is ready. Phase 1 is not a claim that the full site is ready to launch.

## Current scope

The application includes the Laravel CMS/API, public website, cinematic motion and portfolio/case-study experience. Production domain, SMTP, real company content and final launch review still require owner configuration. Review [Phase 2 notes](docs/phase-2.md) for CMS/API details and [architecture](docs/architecture.md) for deployment boundaries.

See [architecture](docs/architecture.md), [API contract](docs/api.md) and [verification](docs/verification.md).
