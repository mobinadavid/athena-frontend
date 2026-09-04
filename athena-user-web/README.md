# Athena User Web

Customer frontend for Athena payment tracking. Phase 1 covers authentication, the app shell, 2FA, and sessions.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app serves at [http://localhost:3000](http://localhost:3000) and talks to `https://localhost:8080/api/v1`.

## TLS in local development

The Go backend always starts with `RunTLS`. If it uses a self-signed certificate, open [https://localhost:8080](https://localhost:8080) in the same browser once and accept the certificate before signing in. Do not disable certificate validation in this app.

If the API is behind a reverse proxy with a trusted certificate, set `NEXT_PUBLIC_API_URL` to that URL instead.

## Seeded login (from the backend seeder)

- National identity code: `0441226086`
- Password: `!Mobina123`

OTP codes are 5 digits. If `FIXED_OTP` is set on the backend, that value is used in development.
