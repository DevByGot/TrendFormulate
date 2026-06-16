# TrendFormulate OS

> Mock B2B SaaS platform for indie cosmetics founders — ESSEC Managing AI Capstone

---

## Quick Start

1. Clone / download the repo
2. Open `trendformulate/index.html` in a browser — **no server needed**
3. Each department card links to its component page

> **Note:** Component pages that load local JSON files (`fetch("../../data/...")`) require a local server.
> Run one with: `npx serve .` inside the `trendformulate/` folder, then open `http://localhost:3000`.

---

## Folder Structure

```
trendformulate/
├── index.html                    ← Main OS dashboard (do not edit unless integrating)
├── assets/
│   └── style.css                 ← Shared design system — import this in every component
├── data/
│   ├── mock_comments.json        ← 5 social media comments (Component 01)
│   ├── ingredients_db.json       ← Ingredient profiles (Component 02)
│   ├── safety_rules.json         ← EU/FDA thresholds (Component 02)
│   └── factories.json            ← 4 mock manufacturers (Component 07)
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

| Component | Folder | Owner | Status |
|-----------|--------|-------|--------|
| 01 — Sentiment Engine | `components/01_sentiment/` | | ⬜ Not started |
| 02 — Formulation + Safety | `components/02_formulation/` | | ⬜ Not started |
| 03 — TikTok Content | `components/03_marketing/` | | ⬜ Not started |
| 04 — Sales Chatbot | `components/04_sales/` | | ⬜ Not started |
| 05 — HR / JD Generator | `components/05_hr/` | | ⬜ Not started |
| 06 — Finance Simulator | `components/06_finance/` | | ⬜ Not started |
| 07 — Ops / Factory Selector | `components/07_ops/` | | ⬜ Not started |

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

- [ ] All 7 `index.html` files exist
- [ ] Each file links back to `../../index.html` via the navbar
- [ ] Colors and card styles look consistent across pages
- [ ] Export / download buttons work

---

## Tech Philosophy

- **No paid APIs.** All logic is JavaScript + hardcoded mock data.
- **No build step.** Pure HTML/CSS/JS — open in any browser.
- **Optional LLM upgrade:** Each component can optionally call the [Groq free API](https://console.groq.com) (`llama3-8b-8192`) for real AI output. Free tier, no credit card.

---

## Demo Narrative (Presentation Day)

1. `index.html` — "This is the TrendFormulate OS."
2. Trend banner — "Glass Skin trending +340% this week."
3. Component 01 — Sentiment extracts what customers want.
4. Component 02 — Formulation proposes + self-corrects for safety.
5. Component 03 — Marketing creates a ready-to-film TikTok script.
6. Component 06 — CFO view: entire R&D pipeline cost $4.80.
7. Component 07 — Picks the right factory automatically.
8. Component 04 — Sales Agent qualifies leads 24/7.
9. Dashboard — "A 3-person indie brand competing with L'Oréal."
