# Athena Admin Web

Staff frontend for Athena. Phase 1 covers admin login, 2FA, password recovery, the app shell, and sessions.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app serves at [http://localhost:3001](http://localhost:3001) and talks to `https://localhost:8081/api/v1`.

## TLS in local development

The Go backend always starts with `RunTLS`. If it uses a self-signed certificate, open [https://localhost:8081](https://localhost:8081) in the same browser once and accept the certificate before signing in.

## Seeded login (from the backend seeder)

- Username: `mobina`
- Password: `!Mobina123`
