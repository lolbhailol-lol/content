# CrwdCtrl Brain — Knowledge Base Quick Start

> How to use and maintain the CrwdCtrl-Brain folder.

---

## Structure

Numbered folders `00`–`18` hold company knowledge. `99_ARCHIVE` holds deprecated material (not indexed by default).

## Adding knowledge

1. Add or edit `.md` files in the relevant folder
2. Run `npm run reindex` or ask Brain in chat (auto-reindexes when stale)
3. Major decisions → `15_DECISIONS/` or let Brain capture via chat memory

## Key entry points

| Need | Start here |
|------|------------|
| Full company context | `MASTER_CONTEXT.md` |
| What to do now | `CURRENT_PRIORITIES.md` |
| Product truth | `10_PRODUCT/FEATURES.md` |
| Content ops | `08_CONTENT/CONTENT_OS.md` |
| Competitors | `12_COMPETITORS/COMPETITOR_ANALYSIS.md` |

## Brain app

The Next.js app indexes `CrwdCtrl-Brain/` by default. Set `DOCS_PATH` in `.env.local` to override.
