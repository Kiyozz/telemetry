# PCA Telemetry

Anonymous usage statistics of [Papyrus Compiler App](https://github.com/Kiyozz/papyrus-compiler-app): a dashboard per app (events, launches, first launches, exceptions, versions, games, event types and their properties) and an events explorer.

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, [ui-sdk](https://ui-sdk.dev), Recharts, Prisma 7 on PostgreSQL. Runs on bun.

## Getting started

```bash
docker compose up -d        # PostgreSQL on 5432, database "telemetry"
bun install
bun run prisma:deploy       # apply the migrations
bun run db:seed             # optional: fake anonymous events
bun run dev
```

Local defaults live in `.env.development`; set the variables in the hosting environment for production:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` (5432), `POSTGRES_DATABASE` (telemetry), `POSTGRES_SSLMODE` (preferred), or a full `DATABASE_URL` instead. `sslmode` accepts `disable`, `prefer`, `require`, `verify-ca` and `verify-full`.
- `TELEMETRY_ADMIN_TOKEN` (optional): when set, `POST /api/v1/apps` and `PUT /api/v1/apps/:key` need `Authorization: Bearer <token>`.

## Scripts

| Script                            | What it does                      |
| --------------------------------- | --------------------------------- |
| `bun run dev` / `build` / `start` | Next.js                           |
| `bun run lint`                    | oxlint                            |
| `bun run fmt` / `fmt:check`       | oxfmt                             |
| `bun run typecheck`               | route types + `tsc`               |
| `bun run prisma:migrate`          | create a migration in development |
| `bun run prisma:deploy`           | apply migrations in production    |

## API

| Method        | Path                                   |                                             |
| ------------- | -------------------------------------- | ------------------------------------------- |
| `POST`        | `/api/v1/events`                       | `{ type, appKey, properties }`, sent by PCA |
| `GET`         | `/api/v1/apps`                         | list apps                                   |
| `POST`        | `/api/v1/apps`                         | `{ name }`, create an app                   |
| `GET` / `PUT` | `/api/v1/apps/:key`                    | read or rename an app                       |
| `GET`         | `/api/v1/apps/:key/events?page=&type=` | events, 150 per page                        |
| `GET`         | `/api/v1/apps/:key/summary`            | counts per type                             |

## Privacy

No IP address, user agent or identifier is stored. Event properties go through `src/lib/anonymize.ts` on ingestion and again on display: file paths are reduced to file names, home folders to `~`, and e-mail addresses are removed.
