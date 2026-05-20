<div align="center">

# NextHire

**AI-native job application platform that semantically matches your resume to every role, critiques it, and writes your cover letter before you apply.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)

[Live Demo](https://nexthire.vercel.app) · [Report a Bug](https://github.com/peekeah/nexthire/issues) · [Request a Feature](https://github.com/peekeah/nexthire/issues)

</div>

## About

Most job boards stop at discovery. NextHire picks up where they leave off.

Upload your resume once. When you apply to a role, NextHire parses it, runs it against the job description via an LLM and surfaces targeted alignment suggestions—missing keywords, scope mismatches, weak framing. You review an editable preview in-browser, approve or tweak the changes and submit. Your original resume stays untouched.

Beyond enhancement, NextHire scores how well your resume actually fits the role using **pgvector cosine similarity** on OpenAI embeddings so you know before you apply. It also runs a structured AI critique of your resume and generates a personalized, streaming cover letter grounded in your actual experience and the job requirements using a **RAG-based agentic pipeline**.

The goal is to make every application feel as intentional as the job search itself.

## Core Features

### 🧠 AI Resume Intelligence
- **Multi-Pass PDF Parsing**: Automatically extracts and normalizes content from PDFs into structured JSON.
- **Sectional Embeddings**: Independently embeds experience, skills, and projects for high-precision semantic retrieval.
- **AI-Powered ATS Alignment**: Rewrites resumes in two phases—structural normalization followed by content polish with ATS keyword alignment.
- **Editable AI Previews**: Review and modify the AI-enhanced resume section by section before submission.
- **Semantic Match Scoring**: Calculates real-time cosine similarity between resume and job description embeddings.

### 🤖 Agentic AI Workflows
- **RAG-based Cover Letter Agent**: A streaming, personalized generator that retrieves the top-k relevant experience sections using vector search before drafting.
- **Tool-Calling Pipeline**: Uses an agentic loop to search the candidate's history for context-aware, multi-step cover letter generation.
- **Resume Critique Agent**: Provides structured, streaming feedback on strengths, weaknesses, and specific improvements, with results cached for performance.

### 🛡️ Security & Performance
- **Arcjet Integration**: Production-grade protection including:
  - **Rate Limiting**: Protects auth endpoints (Login, Signup, Forgot Password) from brute-force attacks.
  - **Bot Protection**: Identifies and blocks automated scrapers and malicious bots.
  - **Shield**: WAF-like protection against SQL injection, XSS, and common web attacks.
- **Secure Authentication**: NextAuth.js integration supporting both **Google OAuth** and credentials-based login with bcrypt hashing.
- **Cloud File Storage**: Enterprise-ready PDF storage via **UploadThing**.

### 💼 Application Flow
- **Smart Apply**: Seamless choice between resume-only enhancement or a full resume + cover letter package.
- **Dual-Sided Marketplace**: Complete workflows for both Applicants (profile, resume mgmt, applications) and Recruiters (job posting, candidate selection, applicant tracking).

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| **Framework**  | Next.js 15 (App Router)                             |
| **Database**   | PostgreSQL via [Neon](https://neon.tech)            |
| **Vector DB**  | pgvector for high-performance similarity search      |
| **ORM**        | Prisma                                              |
| **Security**   | [Arcjet](https://arcjet.com) (Rate Limiting, Bot Detection, Shield) |
| **Auth**       | NextAuth.js (JWT strategy, Google OAuth)            |
| **AI Models**  | OpenAI (GPT-4o, GPT-4o-mini, text-embedding-3-small) |
| **Storage**    | UploadThing                                         |
| **UI**         | Tailwind CSS + Radix UI + Framer Motion             |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database with **pgvector** enabled.

### Local Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/peekeah/nexthire.git
   cd nexthire
   pnpm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   OPENAI_API_KEY=
   UPLOADTHING_SECRET=
   ARCJET_KEY= # Optional in development
   ```

3. **Database Initialization**
   ```bash
   pnpm db:push
   pnpm dev
   ```

## Project Structure

```text
nexthire/
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login, signup, verification flows
│   │   ├── (dashboard)/    # Applicant and recruiter dashboards
│   │   └── api/            # AI, Auth, and Job management routes
│   ├── components/
│   │   ├── ai/             # CoverLetter, Critique, and SmartApply components
│   │   └── ui/             # Radix-based design primitives
│   ├── lib/
│   │   ├── arcjet.ts       # Security middleware & rate limiting
│   │   ├── embeddings.ts   # Sectional embedding generation logic
│   │   ├── vector-storage.ts# pgvector retrieval and storage
│   │   └── resume-parser/  # Custom PDF extraction engine
│   └── constant/           # Prompt engineering and AI system messages
└── prisma/                 # Schema and migrations
```

## Contributing

Contributions are welcome. Please open an issue first to discuss significant changes.

## License

This project is licensed under the **GNU General Public License v3.0**.
