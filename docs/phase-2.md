# Phase 2 CMS and admin

Phase 2 turns the authenticated foundation into a working content workspace. The backend owns validation, persistence, publication state and permissions. React pages use the same versioned API as future public pages.

## Included modules

- Dashboard with live totals for published content, media, users and enquiries, plus recent enquiries.
- Typed editorial CRUD for services, solutions, portfolio projects/case studies, clients, testimonials, team, technologies, industries, blog posts, pages and navigation menus. Records have draft/published status, SEO fields where appropriate, order/featured flags, galleries and soft archive/restore.
- Blog category/tag management and post assignments.
- Media library for images/videos up to 100 MB. Files are private by default; public URLs require explicit enablement. In-use assets cannot be archived.
- Enquiries with six pipeline statuses, assignment, internal notes, event/audit tracking, archive/restore and CSV export.
- Account invitations, disable/enable, role assignment and editable grouped permissions. No default admin credentials are created.
- Site, contact, social and SEO settings. SMTP/provider secrets stay in server environment configuration.

## API and database

All routes are rooted at `/api/v1`. Private routes use Sanctum cookie sessions, CSRF, active-account checks, and per-action permission middleware. Content is stored in shared `content_items` with its type and validated attributes; dedicated normalized tables hold roles/permissions, media, taxonomies, enquiries, settings and audit logs. Public content endpoints return published records only. Public media delivery checks its explicit visibility flag.

See [API routes](api.md) and [architecture](architecture.md). Apply schema changes with `backend/artisan migrate --env=local --force` after starting the local services.

## Local admin access

Create the first administrator interactively with `scripts/create-admin.ps1`. There is no fixed username/password; use the email and password entered in that prompt. Invitations trigger password setup through the configured Laravel mail queue. Local mail uses the log transport until SMTP is configured.

## Limits before launch

The visitor-facing marketing pages, cinematic motion system, public portfolio/blog layouts, sitemap/robots rendering and analytics script loading are later phases. Brand/client/project content must be supplied by the company. For deployment, configure durable object storage, HTTPS, SMTP, worker supervision and the matching PHP/reverse-proxy upload limits. Current uploads use Laravel's private local disk.
