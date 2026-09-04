# Athena Frontend

Two independent Next.js 15 apps for the [Athena](https://github.com/mobinadavid/Athena.git) Go backend. They share no code, cookies, or session state.

| App | Folder | Dev URL | API |
|---|---|---|---|
| User | `athena-user-web` | http://localhost:3000 | `https://localhost:8080/api/v1` |
| Admin | `athena-admin-web` | http://localhost:3001 | `https://localhost:8081/api/v1` |

## Phase 1 (this branch)

Authentication, API client with refresh interceptors, protected shell, 2FA, and sessions. Dashboard pages are intentionally a signed-in landing until Phase 2 / Phase 3.

## Local TLS

The backend serves HTTPS even in development. If requests fail with a certificate error, visit the API origin in the browser once and accept the self-signed cert. Do not disable TLS verification in these apps.

## Start both apps

```bash
cd athena-user-web && npm install && npm run dev
cd athena-admin-web && npm install && npm run dev
```
