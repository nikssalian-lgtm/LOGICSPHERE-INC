# Phase 2 API

Base path: `/api/v1`. Send `Accept: application/json`. Data responses use `{ "data": ... }`; action responses use `{ "message": ... }`. Validation errors are HTTP 422 with `message` and `errors` keyed by field. Authentication failures return 401, insufficient permissions 403, expired/missing CSRF 419, throttling 429.

| Method | Endpoint | Access | Result |
| --- | --- | --- | --- |
| GET | /health | Public, throttled | API/database readiness; 503 when unavailable |
| POST | /auth/login | CSRF, throttled | Email/password login, rotates session, returns safe user resource |
| GET | /auth/user | Session | id, name, email, role, effective permissions, active state |
| POST | /auth/logout | Session + CSRF | Invalidates session and rotates CSRF token |
| POST | /auth/forgot-password | CSRF, throttled | Email input, neutral response, queues reset notification if eligible |
| POST | /auth/reset-password | CSRF, throttled | email, token, password, password_confirmation; resets password and revokes stored sessions |
| GET | /admin/overview | `dashboard.view` | Live content, enquiry and account counts plus recent enquiries |

Protected CMS routes are under `/admin` and require Sanctum session authentication plus the relevant permission. `/admin/content/modules` returns the schemas visible to the user. The repeated `/admin/content/{module}` routes provide paginated list, create, show, update, publication, archive and restore actions for `services`, `solutions`, `portfolio`, `clients`, `testimonials`, `team`, `technologies`, `industries`, `blog`, `pages` and `menus`. Content begins as a draft; publish/unpublish is a separate action. Public readers use `GET /public/content/{module}` and `GET /public/content/{module}/{slug}` and receive published content only.

Other protected routes include `/admin/media` (upload, preview, metadata, public visibility and archive), `/admin/enquiries` (filter, update status, assign, note, archive/restore and CSV export), `/admin/blog/taxonomies/{category|tag}`, `/admin/roles`, `/admin/permissions`, `/admin/users`, `/admin/settings/{site|seo|contact|social}` and `/admin/activity`. The public `POST /enquiries` endpoint is throttled and validates explicit privacy consent. Public reads are available at `/public/media/{id}/file` and `/public/settings/{group}`.

Before POST requests, GET `/sanctum/csrf-cookie`. Include cookies and send the decoded `XSRF-TOKEN` cookie value in `X-XSRF-TOKEN`. The `logicsphere_session` cookie is HttpOnly. No bearer token is stored in localStorage. API tokens and public registration are not enabled.

Same-origin frontend requests are proxied to Laravel. Set `FRONTEND_URL`, `APP_URL` and `SANCTUM_STATEFUL_DOMAINS` for the actual domain. Use HTTPS and secure cookies in production. Do not make the Laravel development port publicly accessible.

Passwords require at least 12 characters, mixed case, a number and a symbol; maximum 128 characters. Reset tokens expire according to Laravel's password broker configuration (60 minutes by default) and are single-use. Login allows 5 attempts per email/IP per minute plus an IP-wide cap. Password endpoints allow 5 requests per IP per minute. API requests allow 120 per identity/IP per minute. Configure trusted proxies explicitly before deploying behind a load balancer so IP throttling uses the correct address.
