<div align="center">

# NextHire

**AI-powered job application platform that aligns your resume to every role before you apply.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

[Live Demo](https://nexthire.vercel.app) · [Report a Bug](https://github.com/your-username/nexthire/issues) · [Request a Feature](https://github.com/your-username/nexthire/issues)

</div>

---

## About

Most job boards stop at discovery. NextHire picks up where they leave off.

When you apply to a role, NextHire parses your resume, runs it against the job description via an LLM, and surfaces targeted alignment suggestions — missing keywords, scope mismatches, weak framing. You review an editable preview in-browser, approve the changes, and submit. Your original resume stays untouched.

The goal is to make the actual application step feel as intentional as the job search itself.

## Features

- **Resume parsing** — Upload a PDF and NextHire extracts and normalizes the content automatically
- **AI-powered ATS alignment** — Resume is analyzed against the job description and specific improvements are suggested
- **Editable preview** — Review and modify the enhanced resume before it gets sent
- **Dual user roles** — Applicants apply, recruiters post and manage listings
- **Secure auth** — JWT-based sessions with hashed credentials, no third-party adapter
- **Cloud file storage** — Resumes stored via UploadThing, not your database

## Tech stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| Framework    | Next.js 14 (App Router)                  |
| Language     | TypeScript                               |
| Database     | PostgreSQL via [Neon](https://neon.tech) |
| ORM          | Prisma                                   |
| Auth         | NextAuth.js — JWT strategy, no adapter   |
| File storage | UploadThing                              |
| AI           | OpenAI API                               |
| UI           | Tailwind CSS + shadcn/ui                 |
| Deployment   | Vercel                                   |

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database — [Neon](https://neon.tech) has a generous free tier
- [OpenAI API key](https://platform.openai.com/api-keys)
- [UploadThing](https://uploadthing.com) account

### Local setup

```bash
git clone https://github.com/peekeah/nexthire.git
cd nexthire
pnpm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

Run migrations and start the dev server:

```bash
pnpm db:migrate-dev
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable             | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                                         |
| `NEXTAUTH_SECRET`    | Secret used to sign session tokens — any random string works locally |
| `NEXTAUTH_URL`       | Base URL of your deployment                                          |
| `OPENAI_API_KEY`     | Used for resume parsing and ATS alignment                            |
| `UPLOADTHING_SECRET` | UploadThing API secret                                               |
| `UPLOADTHING_APP_ID` | UploadThing app ID                                                   |

## Project structure

```
nexthire/
├── app/
│   ├── (auth)/            # Login, register
│   ├── (dashboard)/       # Applicant and recruiter pages
│   └── api/               # Route handlers — auth, jobs, resumes, apply
├── components/            # Shared UI components
├── lib/                   # Prisma client, auth config, env validation
├── prisma/
│   └── schema.prisma
└── types/                 # Shared TypeScript types
```

## Database

Migrations are decoupled from the build and deploy step — run them manually.

```bash
# Dev: push schema without creating a migration file
pnpm db:push

# Dev: create and apply a new migration
pnpm db:migrate-dev

# Production: apply pending migrations
pnpm db:migrate-prod

# Dev only: wipe and reseed
pnpm db:reset
```

## Deployment

NextHire is configured for Vercel + Neon out of the box.

1. Import the repo on [Vercel](https://vercel.com) and set all environment variables
2. Run `pnpm db:migrate-prod` locally against your production `DATABASE_URL` before the first deploy
3. Push to `main` — Vercel handles the rest

Every branch push creates an isolated preview deployment automatically.

## CI

GitHub Actions runs on every push and pull request:

```
pnpm install → type-check → lint
```

Merges to `main` use `--ff-only` to keep history linear. Vercel deploys from `main`.

## Roadmap

- [ ] Google OAuth
- [ ] Email verification with OTP
- [ ] Active Resume Flow — choose which uploaded resume to use per application
- [ ] Rate limiting on auth endpoints

## Contributing

Contributions are welcome. To get started:

1. Fork the repo and create a branch off `main`
2. Make your changes with focused, descriptive commits
3. Open a pull request against `main`

For significant changes — new features, schema modifications — please open an issue first so we can align on direction before you build.

## License

This project is licensed under the **GNU General Public License v3.0**.

You are free to use, study, modify, and distribute this software. Any derivative work must also be distributed under the same license.

See [LICENSE](./LICENSE) for the full terms, or read a plain-English summary at [tldrlegal.com](https://www.tldrlegal.com/license/gnu-general-public-license-v3-gpl-3).
