# Athena Admin Web

Staff frontend for Athena. Phase 3 covers admin login, 2FA, combined password recovery, the app shell, and sessions. Management tooling lands in Phase 4.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app serves at [http://localhost:3001](http://localhost:3001) and talks to `https://localhost:8084/api/v1`.

## TLS in local development

The Go backend always starts with `RunTLS`. If it uses a self-signed certificate, open [https://localhost:8084](https://localhost:8084) in the same browser once and accept the certificate before signing in.

## Seeded login (from the backend seeder)

- Username: `mobina`
- Password: `!Mobina123`
