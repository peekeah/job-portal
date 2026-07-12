<div align="center">

# NextHire

**AI-native job application platform that semantically matches your resume to every role, critiques it, and writes your cover letter before you apply.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

[Live Demo](https://nexthire-app.vercel.app) · [Report a Bug](https://github.com/peekeah/nexthire/issues) · [Request a Feature](https://github.com/peekeah/nexthire/issues)

</div>

## Overview

Most job boards stop at discovery. NextHire picks up where they leave off.

Upload your resume once. When you apply to a role, NextHire parses it, runs it against the job description via a multi-pass LLM pipeline and surfaces targeted alignment suggestions covering missing keywords, scope mismatches, and weak framing. You review an editable preview in-browser, approve or tweak the changes, and submit. Your original resume stays untouched.

Beyond enhancement, NextHire scores how well your resume fits the role using pgvector cosine similarity on OpenAI embeddings so you know before you apply. It runs a structured AI critique of your resume and generates a personalized, streaming cover letter grounded in your actual experience and the job requirements using stateful, multi-turn LangGraph ReAct agents.

## Features

### AI Resume Intelligence

- **Multi-pass PDF parsing:** Extracts and normalizes content from PDFs into structured JSON representation.
- **Sectional embeddings:** Independently embeds experience, skills, and projects for high-precision semantic retrieval using LangChain's `OpenAIEmbeddings`.
- **ATS alignment:** Rewrites resumes in two phases: structural normalization followed by content polish with keyword alignment, validated using a rigid TypeScript schema ([resume-schema.ts](file:///home/pranay/workspace/projects/nexthire/src/lib/resume-schema.ts)).
- **Editable previews:** Review and modify the AI-enhanced resume section-by-section before submission.
- **Semantic match scoring:** Real-time cosine similarity between resume and job description embeddings, calculated efficiently in the database.

### Agentic Workflows

- **LangGraph ReAct agent pipeline:** A stateful, multi-turn AI pipeline that retrieves the top-K relevant experience sections using vector search before drafting cover letters or enhancing resumes.
- **Unified agent architecture:** Uses a reusable ReAct agent factory ([langgraph.ts](file:///home/pranay/workspace/projects/nexthire/src/lib/langgraph.ts)) to build, compile, and execute agents consistently.
- **Leak-free streaming:** Streams cover letters and critiques in real-time, filtering out internal tool-calling tokens to output only final assistant response chunks.
- **Resume critique agent:** Structured, streaming feedback on strengths, weaknesses, and specific improvements.

### Security & Optimization

- **Single-trip vector queries:** pgvector similarity search queries are optimized to fetch matches and profile records (using `JOIN`s) in a single database roundtrip.
- **Rate limiting:** Protects authentication and registration endpoints from brute-force attacks via Arcjet fixed-window rules.
- **Bot protection:** Identifies and blocks automated scrapers and malicious bots using Arcjet's bot detection.
- **Shield:** WAF-style protection against SQL injection, XSS, and common web attacks.
- **Secure authentication:** NextAuth.js credentials-based login with bcrypt hashed passwords and Google OAuth integration.

### Application Flow

- **Smart apply:** Choose between resume-only enhancement or a full resume-and-cover-letter package before submitting.
- **Dual-sided marketplace:** Complete workflows for both applicants (profile, resume management, applications) and recruiters (job posting, candidate selection, applicant tracking).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| Vector search | pgvector (cosine similarity via optimized SQL JOINs) |
| ORM | Prisma |
| AI Orchestration | LangChain & LangGraph |
| Security | [Arcjet](https://arcjet.com) |
| Auth | NextAuth.js (JWT, Google OAuth) |
| AI models | OpenAI (`gpt-4o`, `text-embedding-3-small` via `@langchain/openai`) |
| Storage | UploadThing |
| UI | Tailwind CSS, Radix UI, Framer Motion |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL with the `vector` extension enabled

### Setup

```bash
git clone https://github.com/peekeah/nexthire.git
cd nexthire
pnpm install
```

Copy `.env.example` to `.env` and fill in your keys:

```env
DATABASE_URL=
JWT_SECRET=
NEXTAUTH_SECRET=
RESEND_API_KEY=
CLIENT_HOST=http://localhost:3000
OPENAI_API_KEY=
UPLOADTHING_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ARCJET_KEY=
```

Generate Prisma client, run migrations/seed, and start local development:

```bash
pnpm db:push
pnpm dev
```

## Project Structure

```
nexthire/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, signup, verification flows
│   │   ├── (dashboard)/         # Applicant and recruiter dashboards
│   │   └── api/                 # AI, auth, and job management routes
│   ├── components/
│   │   ├── ai/                  # CoverLetter, Critique, and SmartApply components
│   │   └── ui/                  # Radix-based design primitives
│   ├── lib/
│   │   ├── ai.ts                # LangChain model and embedding initialization
│   │   ├── langgraph.ts         # Shared LangGraph ReAct agent factory
│   │   ├── resume-schema.ts     # Zod schema for structured resume enhancement
│   │   ├── embeddings.ts        # Sectional embedding generation logic
│   │   ├── vector-storage.ts    # pgvector retrieval and storage abstraction
│   │   └── resume-parser/       # Custom PDF extraction engine
│   └── constant/                # Prompt engineering and AI system messages
└── prisma/                      # Schema and migrations
```

## Contributing

Contributions are welcome. Please open an issue first to discuss significant changes.

## License

GNU General Public License v3.0