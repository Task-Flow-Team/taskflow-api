# Deployment — taskflow-api

## Platform: Railway

Railway auto-deploys on every push to `main`. No manual steps after initial setup.

## One-time setup

1. Create a new project at [railway.app](https://railway.app)
2. Connect this GitHub repo
3. Add a **Postgres** plugin — Railway sets `DATABASE_URL` automatically
4. Add variables in the Railway dashboard:
   - `JWT_SECRET` — generate a strong random string
   - `NODE_ENV=production`
5. Deploy — Railway runs `prisma migrate deploy && node dist/main` automatically

## Environment variables

See `.env.example` for all required variables.

## Local development

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```
