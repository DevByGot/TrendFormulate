# TrendFormulate OS

> Mock B2B SaaS platform for indie cosmetics founders — ESSEC Managing AI Capstone

---

## Quick Start

1. Clone / download the repo
2. Run a local server: `npx serve .` inside the `trendformulate/` folder, then open `http://localhost:3000`
3. Start at `components/04_sales/index.html` (waitlist gate) or set `localStorage.tf_waitlist_access = '1'` to open the main dashboard directly
4. Each department card links to its component page; Finance, HR, and Waitlist admin live under `admin/index.html`

> **Note:** Groq API calls use `/api/groq` when deployed (Vercel). Locally, copy `assets/config.example.js` to `assets/config.js` and add your Groq key, or deploy with `GROQ_API_KEY` set.

---

## Folder Structure

```
trendformulate/
├── index.html                    ← Main OS dashboard (requires waitlist access token)
├── admin/index.html              ← Presenter admin: Finance, HR, Waitlist monitor
├── api/groq.js                   ← Vercel proxy for Groq API
├── assets/
│   ├── style.css                 ← Shared design system
│   ├── comments.js               ← 15 consumer comments (Component 01)
│   ├── formulas.js               ← Shared formula workspace (localStorage)
│   └── cosing_db.js              ← EU CosIng compliance lookups (Component 02)
├── data/
│   ├── ingredients_db.json       ← Ingredient profiles (Component 02)
│   ├── safety_rules.json         ← EU/FDA thresholds (Component 02)
│   └── factories.json            ← 6 mock contract manufacturers (Component 07)
└── components/
    ├── 01_sentiment/index.html   ← Sentiment → Ingredient Mapping
    ├── 02_formulation/index.html ← Formulation Proposer + Safety Check
    ├── 03_marketing/index.html   ← TikTok Content Engine
    ├── 04_sales/index.html       ← Waitlist Nurturing Chatbot
    ├── 05_hr/index.html          ← JD Generator + Skill-Gap Analyzer
    ├── 06_finance/index.html     ← Unit Economics Simulator
    └── 07_ops/index.html         ← Contract Manufacturer Selector
```

---

## Team Assignment

| Component | Folder | Status |
|-----------|--------|--------|
| 01 — Sentiment Engine | `components/01_sentiment/` | ✅ Built |
| 02 — Formulation + Safety | `components/02_formulation/` | ✅ Built |
| 03 — TikTok Content | `components/03_marketing/` | ✅ Built |
| 04 — Sales Chatbot | `components/04_sales/` | ✅ Built |
| 05 — HR / JD Generator | `components/05_hr/` | ✅ Built |
| 06 — Finance Simulator | `components/06_finance/` | ✅ Built |
| 07 — Ops / Factory Selector | `components/07_ops/` | ✅ Built |

---

## How to Build Your Component

Each component skeleton (`components/0X_.../index.html`) already includes:

- ✅ Shared CSS import (`../../assets/style.css`)
- ✅ Lucide icons loaded
- ✅ Navbar with back-link to dashboard
- ✅ Page header with title and description
- ✅ All JS logic / data constants from the blueprint (ready to wire up)
- ⬜ **Your job:** Build the UI between the `👇 YOUR CODE GOES HERE` and `👆 YOUR CODE ENDS` comments

### Design rules (keep it consistent)

- Always link `../../assets/style.css` — never write inline fonts or custom color values
- Use CSS variables from `style.css` for all colors: `var(--accent)`, `var(--surface)`, etc.
- Use `.card`, `.btn`, `.badge` classes from the shared stylesheet
- Wrap your page content in `<div class="page-wrapper">` for consistent padding

### Libraries available (free, CDN, no install)

| Library | Already loaded in... | How to add elsewhere |
|---------|----------------------|----------------------|
| Lucide Icons | All skeletons | `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>` then `lucide.createIcons()` |
| Chart.js | 06_finance | `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` |
| Google Fonts (Inter + Instrument Serif) | style.css | Already global |

---

## Integration Checklist (Day 4)

When all components are done, the only integration step is confirming the links in `index.html` point to the right pages. They already do — just make sure each `components/0X_.../index.html` file exists.

- [x] All 7 `index.html` files exist
- [x] Each file links back to `../../index.html` via the navbar
- [x] Colors and card styles look consistent across pages
- [x] Export / download buttons work

---

## Tech Philosophy

- **No paid APIs required.** Core logic is JavaScript + local data; Groq free tier powers live AI where configured.
- **No build step.** Pure HTML/CSS/JS.
- **Groq integration:** Sentiment, Formulation, Marketing, Sales, HR, and Ops call `llama-3.3-70b-versatile` (Ops profile extraction uses `llama-3.1-8b-instant`). Compliance checking and factory scoring are deterministic — no LLM.
- **Fallbacks:** Keyword maps and rule-based logic when the API is unavailable.

---

## Demo Narrative (Presentation Day)

1. `components/04_sales/index.html` — Waitlist gate; Forma qualifies indie founders.
2. `index.html` — "This is the TrendFormulate OS."
3. Component 01 — Sentiment analyses 15 comments → trends and ingredients (saved for R&D).
4. Component 02 — Formulation proposes a formula; CosIng guardrail audits compliance.
5. Component 03 — Marketing generates a ready-to-film TikTok script from the saved formula.
6. Component 06 — CFO view: **~$0.50 AI COGS per formula** at default assumptions, **~91% gross margin** at 500 brands × $79 ARPU (live Groq demo spend is ~$0.10–0.15 per full pipeline run — the simulator is conservative).
7. Component 07 — Picks the right factory automatically.
8. `admin/index.html` — HR skill-gap analysis + waitlist presenter monitor.
9. Dashboard — "A 3-person indie brand competing with L'Oréal."
