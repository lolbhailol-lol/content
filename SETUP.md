# CrwdCtrl Brain

Internal strategic co-founder and company knowledge base for CrwdCtrl. RAG-powered chat over all workspace strategy documents.

## Intelligence Layer

CrwdCtrl Brain uses a two-layer reasoning model:

1. **Internal** — RAG over `CrwdCtrl-Brain/` markdown files (cited as `[Source: path/to/file.md]`)
2. **External** — Startup frameworks, marketplace theory, community-building patterns, and benchmarks vs Meetup, District, BookMyShow, Townscript, Eventbrite, Strava Clubs, AllTrails, Discord, and local discovery platforms

Strategic answers include:
- Internal Knowledge / Industry Knowledge / Assumptions / Confidence Level
- Hidden opportunity, major risk, and one experiment
- Truth over agreement — challenges ideas in company docs when warranted

Factual questions (e.g. "what's live today?") stay concise and source-grounded.

## Features

- Chat with company knowledge (Product Vision, GTM, Content OS, personas, and more)
- Six executive modes: CEO, Growth, Content, Product, Investor, Sales, **Board**
- Company Intelligence panel: health dashboard, contradiction scan, weekly report, simulations
- Institutional memory: decisions and experiments captured from chat
- Source citations on every answer
- Auto-indexes markdown in `CrwdCtrl-Brain/` (numbered knowledge base)
- Re-indexes when documents change
- Dark mode, mobile responsive, sidebar chat history

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Add your API key to `.env.local`:

```
GEMINI_API_KEY=AIza-your-key-here
```

Get a free key at [Google AI Studio](https://aistudio.google.com/apikey) — no credit card required.

OpenAI is also supported if you set `OPENAI_API_KEY` instead (requires billing).

### 3. Set up knowledge base (first time)

```bash
npm run setup-kb
```

Creates `CrwdCtrl-Brain/` with the numbered folder structure and migrates legacy docs.

### 4. Build the knowledge index

```bash
npm run reindex
```

This scans all `.md` files in `CrwdCtrl-Brain/`, chunks them, embeds them, and stores the index in `.brain/vector-index.json`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
Workspace markdown (CrwdCtrl-Brain/**/*.md)
        ↓
    Chunker (by heading + size)
        ↓
    OpenAI or Gemini Embeddings
        ↓
    Vector Index (.brain/vector-index.json)
        ↓
    Cosine similarity retrieval (top-K chunks)
        ↓
    Gemini 2.0 Flash or GPT-4o-mini with mode-specific system prompt
        ↓
    Response + source citations
```

### Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Backend:** Next.js API routes (Node.js runtime)
- **RAG:** Custom chunker + Gemini or OpenAI embeddings + in-memory cosine search
- **LLM:** Google Gemini 2.0 Flash (free tier) or OpenAI GPT-4o-mini
- **Storage:** Local `.brain/` index; chat history in browser localStorage

### Auto re-indexing

The index rebuilds automatically when:
- Any markdown file is added, removed, or modified (mtime check)
- A chat request is made and the index is stale
- You click "Re-index knowledge base" in the sidebar
- You run `npm run reindex`

## Executive Modes

| Mode | Use for |
|------|---------|
| **CEO Mode** | Strategic priorities, tradeoffs, sequencing |
| **Growth Mode** | Campus expansion, flywheel, ambassadors, acquisition |
| **Content Mode** | Pillars, formats, calendar, brand voice |
| **Product Mode** | Features, personas, roadmap (verified only) |
| **Investor Mode** | Narrative, traction, unit economics, fundraising |
| **Sales Mode** | Organizer pitch, objections, onboarding |
| **Board Mode** | Investor + board challenge on every decision |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send a message, get RAG response |
| `/api/reindex` | POST/GET | Force or check knowledge index |
| `/api/health` | GET | System status and index stats |
| `/api/memory` | GET | Strategic memory (decisions, experiments) |
| `/api/intelligence/health` | POST | Generate startup health dashboard |
| `/api/intelligence/contradictions` | POST | Scan docs for conflicts |
| `/api/intelligence/weekly-report` | POST | CEO weekly report |
| `/api/intelligence/research` | POST | Research gap analysis |
| `/api/intelligence/simulate` | POST | Future scenario simulation |

### Chat request body

```json
{
  "message": "What should we prioritize in the next 30 days?",
  "mode": "ceo",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

## Deploy to Vercel

### 1. Push to GitHub

Ensure the repo includes all strategy markdown files and the Brain app code.

### 2. Import in Vercel

Connect the repository. Vercel detects Next.js automatically.

### 3. Set environment variables

In Vercel project settings → Environment Variables:

| Variable | Required | Value |
|----------|----------|-------|
| `GEMINI_API_KEY` | Yes (recommended) | Free key from [AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_CHAT_MODEL` | No | `gemini-2.0-flash` (default) |
| `GEMINI_EMBEDDING_MODEL` | No | `gemini-embedding-001` (default) |
| `OPENAI_API_KEY` | Optional | Use instead of Gemini (paid) |
| `DOCS_PATH` | No | `CrwdCtrl-Brain` (auto if folder exists) |

### 4. Deploy

The build command runs `npm run reindex && next build`, which:
1. Indexes all markdown files using your Gemini or OpenAI key
2. Bundles the index into the deployment
3. Builds the Next.js app

On first request in production, the bundled index is copied to `/tmp` for runtime re-indexing when documents change.

### 5. After adding new documents

Either:
- Redeploy (re-runs build-time index), or
- Click **Re-index knowledge base** in the app sidebar

## Environment Variables

See [`.env.example`](.env.example) for the full list.

## Project Structure

```
├── app/
│   ├── api/chat/          # Chat API (RAG + LLM)
│   ├── api/reindex/       # Index management
│   ├── api/health/        # Health check
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/              # Chat UI components
│   └── ThemeProvider.tsx
├── lib/
│   ├── rag/               # Chunker, embeddings, indexer, retriever
│   ├── chat-service.ts
│   ├── chat-storage.ts
│   ├── modes.ts
│   ├── prompts.ts
│   └── types.ts
├── CrwdCtrl-Brain/        # Numbered company knowledge base (00–18, 99 archive)
│   ├── 00_MASTER_CONTEXT/
│   ├── 01_VISION_STRATEGY/
│   ├── ... (see README)
│   └── 99_ARCHIVE/        # Not indexed
├── scripts/
│   ├── reindex.ts
│   └── setup-knowledge-base.ts
├── .brain/                # Generated vector index (gitignored)
├── SETUP.md
└── vercel.json
```

## Knowledge Base — `CrwdCtrl-Brain/`

The knowledge base uses numbered folders `00`–`18` plus `99_ARCHIVE` (excluded from indexing).

**Migrated legacy docs:**

| File | Location |
|------|----------|
| `MASTER_CONTEXT.md` | `00_MASTER_CONTEXT/` |
| `01_PRODUCT_VISION.md` | `01_VISION_STRATEGY/PRODUCT_VISION.md` |
| `12_30_60_90_DAY_PLAN.md` | `00_MASTER_CONTEXT/CURRENT_PRIORITIES.md` |
| `CONTENT_OS.md` | `08_CONTENT/CONTENT_OS.md` |
| All other `0X_*.md` | Matching numbered folders |

Stub files mark gaps to fill. Populate them as you learn — Brain indexes updates automatically.

Excluded directories: `node_modules`, `.next`, `.git`, `.brain`, `99_ARCHIVE`, `app`, `components`, `lib`, `scripts`, `public`.

## Accuracy Rules

CrwdCtrl Brain is instructed to:
- Only reference features documented in the knowledge base
- Challenge weak assumptions
- Provide actionable recommendations
- Never invent metrics or capabilities
- Use "Events" not "Theatre"
- Not claim gym communities or social feed features

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No AI provider configured" | Add `GEMINI_API_KEY` to `.env.local` and restart |
| Empty or weak answers | Run `npm run reindex` to rebuild index |
| Slow first response | Index is building — subsequent requests are faster |
| New docs not appearing | Click Re-index or run `npm run reindex -- --force` |

## License

Internal use — CrwdCtrl team only.
