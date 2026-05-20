<div align="center">

# NextHire

**AI-native job application platform that semantically matches your resume to every role, critiques it and writes your cover letter before you apply.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

[Live Demo](https://nexthire.vercel.app) · [Report a Bug](https://github.com/peekeah/nexthire/issues) · [Request a Feature](https://github.com/peekeah/nexthire/issues)

</div>

## About

Most job boards stop at discovery. NextHire picks up where they leave off.

Upload your resume once. When you apply to a role, NextHire parses it, runs it against the job description via an LLM and surfaces targeted alignment suggestions missing keywords, scope mismatches, weak framing. You review an editable preview in-browser, approve or tweak the changes and submit. Your original resume stays untouched.

Beyond enhancement, NextHire scores how well your resume actually fits the role using pgvector cosine similarity on OpenAI embeddings so you know before you apply. It also runs a structured AI critique of your resume and generates a personalized, streaming cover letter grounded in your actual experience and the job requirements.

The goal is to make every application feel as intentional as the job search itself.

## Features

### Resume Intelligence
- **PDF parsing** Upload a PDF and NextHire extracts and normalizes content automatically using a custom multi-pass parser
- **AI-powered ATS alignment** Resume rewritten against the job description in two phases: structural normalization first, then content polish with ATS keyword alignment
- **Editable preview** Review and modify the enhanced resume section by section before it gets submitted
- **Match scoring** Cosine similarity between your resume embedding and the job description embedding, scored and stored per application

### AI Agents
- **Resume Critique Agent** Streaming structured critique of your resume: strengths, weaknesses and specific improvement suggestions. Output cached locally so you don't re-run on every visit
- **Cover Letter Agent** Streaming, personalized cover letter generated from your resume content and the job description. Editable before submitting. Copy or download as `.txt`

### Application Flow
- **Smart Apply** Choose between resume-only enhancement or resume + cover letter before applying
- **Apply with cover letter** Submit resume and cover letter together in a single application; cover letter stored against the application record
- **Dual roles** Applicants apply, recruiters post and manage listings, review applicants, and select candidates

### Platform
- **Secure auth** JWT-based sessions with bcrypt-hashed credentials, no third-party adapter dependency
- **Cloud file storage** PDFs stored via UploadThing, not in the database
- **Typed environment config** All env vars validated at startup; server won't boot on missing config

## Tech stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 14 (App Router)                             |
| Language       | TypeScript                                          |
| Database       | PostgreSQL via [Neon](https://neon.tech)            |
| Vector search  | pgvector cosine similarity on OpenAI embeddings     |
| ORM            | Prisma                                              |
| Auth           | NextAuth.js JWT strategy, no adapter                |
| File storage   | UploadThing                                         |
| AI             | OpenAI API gpt-4o, gpt-4o-mini, gpt-5.2, text-embedding-3-small |
| Streaming      | Native OpenAI SDK streaming via ReadableStream      |
| UI             | Tailwind CSS + shadcn/ui                            |
| Deployment     | Vercel                                              |

## Getting started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database with pgvector extension enabled [Neon](https://neon.tech) supports this out of the box
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

Enable the pgvector extension on your database, then run migrations and start the dev server:

```bash
pnpm db:migrate-dev
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable             | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string (Neon recommended)                      |
| `NEXTAUTH_SECRET`    | Secret used to sign session tokens any random string works locally   |
| `NEXTAUTH_URL`       | Base URL of your deployment                                          |
| `OPENAI_API_KEY`     | Used for resume enhancement, embeddings, critique, and cover letter  |
| `UPLOADTHING_SECRET` | UploadThing API secret                                               |
| `UPLOADTHING_APP_ID` | UploadThing app ID                                                   |

## Project structure

```text
nexthire/
├── app/
│   ├── (auth)/               # Login, signup, forgot/reset password
│   ├── (dashboard)/          # Applicant and recruiter pages
│   └── api/
│       ├── ai/               # resume-critique, cover-letter streaming routes
│       ├── auth/             # signup, forgot-password, reset-password
│       ├── jobs/             # apply, apply-with-cover-letter, apply-with-edits, enhance-resume
│       └── student/          # profile, resume CRUD
├── components/
│   ├── ai/                   # CoverLetterGenerator, ResumeCritiquePanel, SmartApplyDialog
│   ├── enhanced-preview-modal/  # Section-by-section resume editor
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── ai.ts                 # OpenAI client LLM calls + streaming
│   ├── embeddings.ts         # text-embedding-3-small via OpenAI
│   ├── vector-storage.ts     # pgvector read/write
│   ├── match-score.ts        # cosine similarity scoring pipeline
│   ├── cosine-similarity.ts  # similarity computation
│   └── resume-parser/        # Multi-pass PDF → structured JSON parser
├── constant/
│   └── ai-prompts.ts         # All LLM prompts resume builder, critique, cover letter
└── prisma/
    └── schema.prisma
```

## Database

Migrations are decoupled from the build and deploy step run them manually.

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

> **Note:** pgvector must be enabled on your database before running migrations. On Neon, enable it via the Neon console or by running `CREATE EXTENSION IF NOT EXISTS vector;` on your database.

## Deployment

NextHire is configured for Vercel + Neon out of the box.

1. Import the repo on [Vercel](https://vercel.com) and set all environment variables
2. Enable the pgvector extension on your production Neon database
3. Run `pnpm db:migrate-prod` locally against your production `DATABASE_URL` before the first deploy
4. Push to `main` Vercel handles the rest

Every branch push creates an isolated preview deployment automatically.

## CI

GitHub Actions runs on every push and pull request:

```text
pnpm install → type-check → lint
```

Merges to `main` use `ff-only` to keep history linear. Vercel deploys from `main`.

## Roadmap

- [ ] Sectional resume embeddings embed experience, skills, projects independently for higher-precision retrieval
- [ ] RAG-based cover letter generation retrieve top-k relevant resume sections by job description similarity before generating
- [ ] Agentic cover letter pipeline tool-calling loop for context-aware, multi-step generation
- [ ] Google OAuth
- [ ] Email verification with OTP
- [x] Rate limiting on auth endpoints (Implemented using Arcjet)

## Contributing

Contributions are welcome. To get started:

1. Fork the repo and create a branch off `main`
2. Make your changes with focused, descriptive commits
3. Open a pull request against `main`

For significant changes new features, schema modifications please open an issue first so we can align on direction before you build.

## License

This project is licensed under the **GNU General Public License v3.0**.

You are free to use, study, modify, and distribute this software. Any derivative work must also be distributed under the same license.

See [LICENSE](./LICENSE) for the full terms, or read a plain-English summary at [tldrlegal.com](https://www.tldrlegal.com/license/gnu-general-public-license-v3-gpl-3).