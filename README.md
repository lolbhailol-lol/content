# CrwdCtrl Brain

Internal AI strategic co-founder and company knowledge base for CrwdCtrl.

**Live docs:** See [SETUP.md](./SETUP.md) for installation, deployment, and configuration.

## Quick start

```bash
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local
npm run setup-kb   # create CrwdCtrl-Brain/ folder (first time)
npm run reindex
npm run dev
```

Open http://localhost:3000

## Company knowledge — `CrwdCtrl-Brain/`

All strategy docs live in the numbered knowledge base:

| Folder | Contents |
|--------|----------|
| `00_MASTER_CONTEXT/` | Master context, priorities, quick start |
| `01_VISION_STRATEGY/` | Vision, mission, positioning |
| `02_FOUNDER/` | Founder story, journal, beliefs |
| `03_USERS/` | Personas, research, interviews |
| `04_ORGANIZERS/` | Organizer personas and feedback |
| `05_GROWTH/` | GTM, acquisition, experiments |
| `06_REVENUE/` | Revenue model, pricing, unit economics |
| `07_COMMUNITIES/` | Community strategy by vertical |
| `08_CONTENT/` | Content strategy, CONTENT_OS, libraries |
| `09_CONTENT_ANALYTICS/` | Performance and insights |
| `10_PRODUCT/` | Features, roadmap, architecture |
| `11_SALES/` | Playbooks and templates |
| `12_COMPETITORS/` | Competitor profiles |
| `13_INVESTORS/` | Narrative, deck, fundraising |
| `14_EXPERIMENTS/` | Growth, content, product, revenue tests |
| `15_DECISIONS/` | Decision log |
| `16_MEETINGS/` | Call and meeting notes |
| `17_REPORTS/` | CEO weekly, health dashboard |
| `18_AI_SYSTEM/` | Agent specs and prompts |
| `99_ARCHIVE/` | Deprecated (not indexed) |

Add any `.md` file in `CrwdCtrl-Brain/` — Brain indexes it on reindex or when stale.
