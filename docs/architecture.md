# LogicSphere — Phase 3 architecture

The original single-file demo remains at index.html and reference/demo.html. It is not the production application.

## Applications

- backend: Laravel 13 REST API, PHP 8.4, MySQL 8.4. Laravel owns authentication, authorization, validation and all business data.
- frontend: Next.js App Router, React, TypeScript. Public pages can render on the server; admin interactions use authenticated APIs.
- One public origin: /api/* and /sanctum/* proxy to Laravel. This avoids third-party cookies and keeps Sanctum session authentication same-origin. Production reverse proxies must preserve the trusted host and HTTPS scheme.
- /api/v1 is the versioned API namespace. JSON resources wrap records in data; failures expose message and optional field errors. Never return stack traces in production.
- HttpOnly session cookies, CSRF tokens, session rotation on login, invalidation on logout, login throttling, password reset broker and server-side admin authorization.
- No public registration. Administrators are provisioned through an interactive Artisan command without seeded default credentials.
- Role slugs are stored against users and resolved through normalized roles, permissions and a pivot; each API action checks a named permission. The system administrator keeps full access.

## Scope

Phase 1 delivered the application foundation and authentication. Phase 2 adds editorial content modules, private media, enquiries, role/permission management, settings and a responsive React admin. Phase 3 adds the public pages and server-rendered CMS integration. Client, award, testimonial, revenue and team claims remain absent until LogicSphere publishes real information. More elaborate motion direction remains a subsequent phase.

## Design

Official SVG remains unchanged. Brand cyan #00AFEF, black/ink surfaces, white and charcoal #373435. Semantic CSS tokens centralize colors, spacing, typography, radii and motion. Cyan is decorative/accent; small text and button combinations must retain contrast. Motion honors reduced-motion preferences.

## Future extension

Public pages consume published-only API resources with a 60-second revalidation window. Rich text is rendered as React elements from the backend-sanitized document tree; HTML is never injected. Public media URLs are emitted only for assets explicitly marked public. Contact forms use the same-origin CSRF-aware API client and create enquiry records through Laravel. robots.txt and sitemap.xml reflect configured indexing and published CMS slugs.

Feature-focused controllers, Form Requests, API Resources and policies; service classes only when workflows justify them. Normalize content relationships, use structured page sections, protect unpublished content, and invalidate public caches on publish. Background jobs handle email/media. Admin settings cannot contain executable scripts or expose environment secrets. Analytics integrations use validated provider identifiers.

Phase 2 currently uses one typed `content_items` table for editorial records, with module field definitions and validation centralized in `ContentModuleRegistry`; blog classifications, media, enquiries, site settings and audit events use related tables. Public content routes return published records only. Media is stored on Laravel's private local disk by default and requires an explicit public toggle before it can be referenced by a published page. Production deployments should use durable private object storage and configure upload size limits at the proxy/PHP layers.

## Deployment contract

PHP with PDO MySQL, mbstring, intl, fileinfo, OpenSSL, cURL and ZIP; Node; MySQL; persistent storage; queue worker; scheduler; TLS; SMTP; backups. The local PHP/MySQL tools under .tools are development-only and excluded from version control. Production secrets are supplied through environment configuration.
