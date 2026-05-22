<div align="center">

# NextHire

**AI-native job application platform that semantically matches your resume to every role, critiques it, and writes your cover letter before you apply.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

[Live Demo](https://nexthire-app.vercel.app) · [Report a Bug](https://github.com/peekeah/nexthire/issues) · [Request a Feature](https://github.com/peekeah/nexthire/issues)

</div>

## Overview

Most job boards stop at discovery. NextHire picks up where they leave off.

Upload your resume once. When you apply to a role, NextHire parses it, runs it against the job description via a multi-pass LLM pipeline and surfaces targeted alignment suggestions covering missing keywords, scope mismatches and weak framing. You review an editable preview in-browser, approve or tweak the changes and submit. Your original resume stays untouched.

Beyond enhancement, NextHire scores how well your resume fits the role using pgvector cosine similarity on OpenAI embeddings so you know before you apply. It also runs a structured AI critique of your resume and generates a personalized, streaming cover letter grounded in your actual experience and the job requirements using a RAG-based agentic pipeline.

## Features

### AI Resume Intelligence

- **Multi-pass PDF parsing:** Extracts and normalizes content from PDFs into structured JSON
- **Sectional embeddings:** Independently embeds experience, skills and projects for high-precision semantic retrieval
- **ATS alignment:** Rewrites resumes in two phases: structural normalization followed by content polish with keyword alignment
- **Editable previews:** Review and modify the AI-enhanced resume section by section before submission
- **Semantic match scoring:** Real-time cosine similarity between resume and job description embeddings

### Agentic Workflows

- **RAG-based cover letter agent:** A streaming, personalized generator that retrieves the top-k relevant experience sections using vector search before drafting
- **Tool-calling pipeline:** An agentic ReAct loop that searches candidate history for context-aware, multi-step cover letter generation
- **Resume critique agent:** Structured, streaming feedback on strengths, weaknesses and specific improvements with results cached per resume

### Security

- **Rate limiting:** Protects auth endpoints from brute-force attacks via Arcjet fixed-window rules
- **Bot protection:** Identifies and blocks automated scrapers and malicious bots
- **Shield:** WAF-style protection against SQL injection, XSS, and common web attacks
- **Secure authentication:** NextAuth.js with Google OAuth and credentials-based login with bcrypt hashed passwords

### Application Flow

- **Smart apply:** choose between resume-only enhancement or a full resume and cover letter package before submitting
- **Dual-sided marketplace:** complete workflows for both applicants (profile, resume management, applications) and recruiters (job posting, candidate selection, applicant tracking)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| Vector search | pgvector (cosine similarity) |
| ORM | Prisma |
| Security | [Arcjet](https://arcjet.com) |
| Auth | NextAuth.js (JWT, Google OAuth) |
| AI models | OpenAI (GPT-4o, GPT-4o-mini, gpt-5.2, text-embedding-3-small) |
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
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=
UPLOADTHING_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ARCJET_KEY=
```

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
│   │   ├── ai.ts                # OpenAI client and streaming utilities
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