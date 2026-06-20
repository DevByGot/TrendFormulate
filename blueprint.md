# TrendFormulate OS — Complete Project Blueprint

> **Purpose of this document:** A rebuild guide for agents and developers. If you follow this blueprint, you should be able to reconstruct ~90% of the TrendFormulate capstone demo without reading the source code first.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Tech Stack & Constraints](#2-tech-stack--constraints)
3. [Repository Structure](#3-repository-structure)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Design System](#5-design-system)
6. [Groq / AI Integration](#6-groq--ai-integration)
7. [Shared Assets](#7-shared-assets)
8. [Access Gate & Navigation](#8-access-gate--navigation)
9. [Component 01 — Sentiment Engine](#9-component-01--sentiment-engine)
10. [Component 02 — R&D Formulation](#10-component-02--rd-formulation)
11. [Component 03 — Marketing Engine](#11-component-03--marketing-engine)
12. [Component 04 — Waitlist / Sales Gate](#12-component-04--waitlist--sales-gate)
13. [Component 05 — Workforce Architect (HR)](#13-component-05--workforce-architect-hr)
14. [Component 06 — Finance / Unit Economics](#14-component-06--finance--unit-economics)
15. [Component 07 — Operations / Factory Selector](#15-component-07--operations--factory-selector)
16. [Admin Dashboard](#16-admin-dashboard)
17. [Floating Chat Widget (Forma)](#17-floating-chat-widget-forma)
18. [Mock Data Files](#18-mock-data-files)
19. [CosIng Compliance Engine](#19-cosing-compliance-engine)
20. [Deployment (Vercel)](#20-deployment-vercel)
21. [Demo Script (Presentation Day)](#21-demo-script-presentation-day)
22. [Rebuild Checklist](#22-rebuild-checklist)

---

## 1. What This Project Is

**TrendFormulate OS** is a **mock B2B SaaS platform** for indie cosmetics founders, built as an ESSEC *Managing AI* capstone project. It simulates an AI-native operating system where every business department runs a specialized AI workflow.

### The product narrative

A 3-person indie beauty brand can compete with L'Oréal by compressing a 3–6 month R&D cycle into under 48 hours:

1. **Detect trends** from real consumer social comments
2. **Generate compliant formulas** with a two-agent pipeline (LLM creator + deterministic compliance guardrail)
3. **Create TikTok content** from saved formulas
4. **Match contract manufacturers** via weighted scoring
5. **Model unit economics** proving ~$0.50 AI COGS vs $15,000 legacy lab cost per formula
6. **Qualify inbound founders** via a waitlist chatbot (Forma)
7. **Hire the right chemist** when AI reveals skill gaps (admin-only HR tool)

### What is real vs. simulated

| Real | Simulated / Mock |
|------|------------------|
| Groq LLM calls (when API key configured) | Lead capture has no backend — localStorage only |
| CosIng-based compliance lookups (`cosing_db.js`) | Factory database (`factories.json`) |
| Deterministic factory scoring algorithm | "Live" dashboard counters and trend alerts |
| Chart.js financial modeling | Email demo confirmations (UI only) |
| 15 hardcoded consumer comments | Waitlist "beta at capacity" scarcity framing |

### User-facing vs. admin-facing surfaces

| Surface | Path | Audience |
|---------|------|----------|
| Waitlist landing + chat | `components/04_sales/index.html` | Public visitors |
| Main OS dashboard | `index.html` | Qualified founders (gated) |
| Sentiment, Formulation, Marketing, Ops | `components/01–03, 07/` | Product users |
| Admin backend | `admin/index.html` | Presenters / internal team |
| HR + Finance tools | `components/05_hr/`, `components/06_finance/` | Admin-linked only |

The main dashboard shows **4 department cards** (Sentiment, R&D, Marketing, Ops). HR and Finance are reachable only from the admin panel.

---

## 2. Tech Stack & Constraints

### Core philosophy

- **No build step** — pure HTML, CSS, vanilla JavaScript
- **No paid APIs required** for demo — Groq free tier powers live AI; keyword/rule fallbacks work offline
- **No backend database** — all persistence is `localStorage` / `sessionStorage`
- **No npm dependencies** — CDN libraries only

### Libraries (CDN)

| Library | URL | Used in |
|---------|-----|---------|
| Lucide Icons | `https://unpkg.com/lucide@latest/dist/umd/lucide.js` | All pages — call `lucide.createIcons()` after DOM changes |
| Chart.js | `https://cdn.jsdelivr.net/npm/chart.js` | `06_finance` only |
| Google Fonts | Via `style.css` `@import` | Cormorant Garamond + DM Sans |

### LLM models

| Component | Model | Temperature | Max tokens |
|-----------|-------|-------------|------------|
| 01 Sentiment | `llama-3.3-70b-versatile` | 0.3 | 768 (bump to 1536 on truncation) |
| 02 Formulation (Agent 1) | `llama-3.3-70b-versatile` | 0.35 | 1800 (bump to 4096) |
| 03 Marketing | `llama-3.3-70b-versatile` | ~0.6 | ~1800 |
| 04 Sales / chat-bubble | `llama-3.3-70b-versatile` | 0.55–0.6 | 220–280 |
| 05 HR (both phases) | `llama-3.3-70b-versatile` | default | 1200 / 2400 |
| 07 Ops (Tier 1 profile) | `llama-3.1-8b-instant` | default | profile JSON |

**Agent 2 (Formulation compliance)** and **Ops Tier 2 (factory scoring)** use **zero LLM** — pure JavaScript.

### Local development

```bash
cd trendformulate
npx serve .
# Open http://localhost:3000
```

For Groq locally:
1. Copy `assets/config.example.js` → `assets/config.js`
2. Set `const GROQ_API_KEY = "gsk_..."` (get free key at console.groq.com)
3. `config.js` is gitignored — never commit API keys

**Bypass waitlist gate for testing:**
```js
localStorage.setItem('tf_waitlist_access', '1')
```

---

## 3. Repository Structure

```
trendformulate/
├── blueprint.md                  ← THIS FILE (rebuild guide)
├── README.md                     ← Quick start for team
├── index.html                    ← Main OS dashboard (gated)
├── vercel.json                   ← Empty {} — Vercel auto-detects api/
├── api/
│   └── groq.js                   ← Serverless proxy (hides GROQ_API_KEY)
├── admin/
│   └── index.html                ← Internal admin: HR, Finance, Waitlist monitor
├── assets/
│   ├── style.css                 ← Shared design system (REQUIRED on every page)
│   ├── config.example.js         ← API key template
│   ├── config.js                 ← Real key (gitignored)
│   ├── formulas.js               ← TFFormulas localStorage API
│   ├── comments.js               ← 15 consumer comments (Component 01)
│   ├── cosing_db.js              ← EU/FDA compliance engine (Component 02)
│   └── chat-bubble.js            ← Floating Forma widget (all pages except 04)
├── data/
│   ├── ingredients_db.json       ← 11 ingredient profiles (chat-bubble context)
│   ├── safety_rules.json         ← Legacy thresholds (NOT wired in live code)
│   └── factories.json            ← 6 contract manufacturers (Component 07)
├── cosing/                       ← Raw EU CosIng annex text files (reference only)
│   ├── COSING_Annex_II_v2.txt
│   ├── COSING_Annex_III_v2.txt
│   ├── COSING_Annex_V_v2.txt
│   └── COSING_Annex_VI_v2.txt
└── components/
    ├── 01_sentiment/index.html
    ├── 02_formulation/index.html
    ├── 03_marketing/index.html
    ├── 04_sales/index.html       ← Public waitlist landing (NOT behind gate)
    ├── 05_hr/index.html
    ├── 06_finance/index.html
    └── 07_ops/index.html
```

**Path conventions for component pages:**
- CSS: `../../assets/style.css`
- Scripts: `../../assets/*.js`
- Data fetch: `../../data/*.json`
- Back to dashboard: `../../index.html`

---

## 4. Architecture & Data Flow

### End-to-end pipeline

```
┌─────────────────┐     tf_c1_results      ┌──────────────────┐
│ 01 Sentiment    │ ──────────────────────► │ 02 Formulation   │
│ (15 comments)   │                         │ Agent1: Groq LLM │
└─────────────────┘                         │ Agent2: CosIng   │
                                            └────────┬─────────┘
                                                     │ tf_saved_formulas
                              ┌──────────────────────┼──────────────────────┐
                              ▼                      ▼                      ▼
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │ 03 Marketing    │    │ 07 Ops          │    │ index.html      │
                    │ TikTok script   │    │ Factory match   │    │ Your Products   │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### localStorage contract

| Key | Writer | Reader(s) | Schema |
|-----|--------|-----------|--------|
| `tf_waitlist_access` | `04_sales`, `admin` | `index.html` gate | String `'1'` = granted |
| `tf_c1_results` | `01_sentiment` | `02_formulation`, `admin`, `chat-bubble` | Array of analysis objects (see §9) |
| `tf_saved_formulas` | `02_formulation` via `TFFormulas` | `03_marketing`, `07_ops`, `index.html`, `admin` | Array of formula workspace entries (see §7) |
| `tf_presenter_profiles` | `04_sales` chat | `admin` presenter modal | `{ [profileId]: LeadProfile }` |

### sessionStorage

| Key | Purpose |
|-----|---------|
| `tf_presenter_profile_id` | UUID for current waitlist chat session in `04_sales` |

### Cross-tab sync

`TFFormulas.persist()` dispatches `CustomEvent('tf-formulas-changed')`. Pages also listen to `storage` events on `tf_saved_formulas` for multi-tab updates.

### Component independence principle

Each component is a **standalone single-page app**. They integrate only through:
1. Shared `localStorage` keys
2. Links from the dashboard
3. Shared CSS/JS assets

No component requires another to be "running" — but the **demo narrative** assumes running 01 → 02 → 03 → 07 in sequence.

---

## 5. Design System

**File:** `assets/style.css` — every page MUST link this. Never hardcode colors outside CSS variables.

### Aesthetic

Light, warm, premium B2B SaaS — **not dark mode**. Think indie luxury beauty brand meets enterprise software.

- Background: warm off-white `#fdf9f7` with subtle rose/peach radial gradients
- Accent: dusty rose `#c4788a`
- Display font: **Cormorant Garamond** (italic headings)
- Body font: **DM Sans**

### CSS variables (complete list)

```css
:root {
  --bg: #fdf9f7;
  --bg-alt: #f8f2ef;
  --surface: #ffffff;
  --surface-2: #f5eeec;
  --surface-3: #edddd9;
  --border: rgba(196, 155, 148, 0.2);
  --border-strong: rgba(196, 120, 138, 0.35);
  --text: #271515;
  --text-mid: #6b4a46;
  --text-muted: #9a7b76;
  --text-faint: #c8adaa;
  --accent: #c4788a;
  --accent-hover: #a85c6e;
  --accent-soft: rgba(196, 120, 138, 0.1);
  --accent-mid: rgba(196, 120, 138, 0.22);
  --success: #5e9e47;
  --success-soft: rgba(94, 158, 71, 0.1);
  --error: #c9575e;
  --error-soft: rgba(201, 87, 94, 0.1);
  --warning: #b8862e;
  --warning-soft: rgba(184, 134, 46, 0.1);
  --radius: 14px;
  --radius-sm: 8px;
  --radius-xs: 5px;
  --radius-pill: 999px;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --shadow-xs through --shadow-lg, --shadow-accent;
  --space-1 through --space-12;
}
```

### Shared component classes

| Class | Use |
|-------|-----|
| `.page-wrapper` | Max-width 1280px centered content padding |
| `.navbar` | Sticky 68px header with blur backdrop |
| `.navbar-back` | Pill-shaped back link to dashboard |
| `.card` | White surface card with border + shadow |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` | Buttons |
| `.badge`, `.badge-success`, `.badge-error`, `.badge-warning`, `.badge-accent` | Status pills |
| `.input`, `select`, `textarea` | Form controls |
| `.spinner` | Loading spinner |
| `.no-print` | Hidden in `@media print` |
| `.eyebrow` | Uppercase section label |

### Navbar pattern (all component pages)

```html
<nav class="navbar">
  <a href="../../index.html" class="navbar-back">
    <i data-lucide="arrow-left"></i> Dashboard
  </a>
  <div class="navbar-brand">
    <!-- rose gradient flask icon + "TrendFormulate" in display font -->
  </div>
</nav>
```

### Logo icon

Rose gradient square (`linear-gradient(135deg, #c4788a, #d49678)`) with white `flask-conical` Lucide icon, 38×38px, border-radius 10px.

---

## 6. Groq / AI Integration

### Endpoint detection (used in most components)

```javascript
const ON_SERVER =
  window.location.protocol !== 'file:' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

const GROQ_ENDPOINT = ON_SERVER
  ? '/api/groq'
  : 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
```

**Local:** Requires `GROQ_API_KEY` in `config.js`, sent as `Authorization: Bearer` header.  
**Deployed:** Browser POSTs to `/api/groq`; Vercel function adds the key from `GROQ_API_KEY` env var.

### Standard call pattern

```javascript
async function callGroq(messages, maxTokens, retrying = false, bumped = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (!ON_SERVER && typeof GROQ_API_KEY !== 'undefined') {
    headers['Authorization'] = `Bearer ${GROQ_API_KEY}`;
  }
  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST', headers,
    body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.3, max_tokens: maxTokens, messages })
  });
  // 429 → wait 2s, retry once
  // finish_reason === 'length' → bump max_tokens 1.5× and retry once
  // Strip ```json fences before JSON.parse
}
```

### API proxy (`api/groq.js`)

Vercel serverless function:
- Accepts POST only
- Reads `process.env.GROQ_API_KEY`
- Forwards `req.body` to `https://api.groq.com/openai/v1/chat/completions`
- Returns Groq's status code and JSON body

### Components that hardcode `/api/groq` only

- `05_hr` — no local direct fallback; requires deployed proxy or local server with api route
- `07_ops` Tier 1 — same pattern for profile extraction

### Has-API check pattern

```javascript
const hasApi = ON_SERVER ||
  (typeof GROQ_API_KEY !== 'undefined' && GROQ_API_KEY && GROQ_API_KEY !== 'gsk_YOUR_KEY_HERE');
```

If `!hasApi`: use keyword fallback + simulated typing delay (600–1300ms).

---

## 7. Shared Assets

### `assets/formulas.js` — `window.TFFormulas`

Single source of truth for saved product formulas.

**Storage key:** `tf_saved_formulas`

**API surface:**

```javascript
TFFormulas.STORE_KEY          // 'tf_saved_formulas'
TFFormulas.loadAll()          // → FormulaEntry[]
TFFormulas.save(entry)        // upsert by id or name; dispatches event
TFFormulas.deleteById(id)
TFFormulas.getById(id)
TFFormulas.getByName(name)
TFFormulas.buildDescription(entry)  // human-readable summary for Ops LLM
TFFormulas.toMarketingShape(entry)  // shape for Marketing dropdown
TFFormulas.buildGenericFallbackProfile(entry)  // regex-based mfg profile for Ops fallback
TFFormulas.escHtml(s)         // XSS-safe HTML escape
```

**Formula workspace entry schema** (written by Component 02):

```javascript
{
  id: 1718723456789,           // Date.now() if new
  name: "HydraBalance Serum",   // product_name from Agent 1
  compliance: "compliant",      // "compliant" | "caution" | "violation"
  ingredients: [
    { name: "Water", inci: "Aqua", pct: 85, type: "solvent" }
  ],
  hero_ingredient: "Hyaluronic Acid",
  hero_inci: "Sodium Hyaluronate",
  ingredient_type: "humectant",
  mechanism: "binds up to 1000× its weight in water",
  benefit_stack: ["Long-lasting hydration", "Non-greasy texture"],
  shot_type: "Product texture close-up",
  savedAt: "2026-06-18T15:13:58.474Z",
  description: "auto-generated summary string"
}
```

**`buildGenericFallbackProfile` rules** (Ops fallback when Groq fails):

| Regex on description | Profile adjustments |
|---------------------|---------------------|
| `spf\|sunscreen\|zinc oxide\|titanium dioxide\|uv filter` | batch_tier mid, MOQ 1000, hot-mix, FDA Registered, sunscreen_otc |
| `peptide\|matrixyl\|argireline` | peptide_formulation, clean_room, EU GMP |
| `organic\|ecocert\|bakuchiol\|botanical` | Ecocert/COSMOS, botanical_extracts |
| `ascorbic\|vitamin c\|ferulic` | cold_mix, oxidation note |

### `assets/comments.js` — `const COMMENTS`

15 consumer social media comments (ids 1–15). First 5 are keyword-mappable; 6–15 are realistic human-style comments for richer Groq demos.

Load via `<script src="../../assets/comments.js"></script>` before page script.

### `assets/chat-bubble.js`

Self-injecting floating chat widget. **Skipped on `/04_sales/`** (that page has full chat UI).

- Fixed bottom-left rose button + slide-up panel (360×520px)
- Same Forma persona as sales page but lighter qualification flow
- Loads `ingredients_db.json` + `factories.json` for system prompt context
- Reads `tf_c1_results` for live trend context
- Lead form after 3 exchanges; lead score from keyword hits

---

## 8. Access Gate & Navigation

### Waitlist gate (`index.html` lines 8–12)

```html
<script>
  if (!localStorage.getItem('tf_waitlist_access')) {
    window.location.replace('./components/04_sales/index.html');
  }
</script>
```

Runs before page render. No token → redirect to waitlist landing.

### Granting access

1. **04_sales:** "Demo Access" button sets `tf_waitlist_access = '1'` → `../../index.html`
2. **04_sales chat:** Lead form submission path (presenter can also validate from admin)
3. **admin:** `presenterValidate()` sets the same key
4. **index.html:** "Reset Demo" button removes token → back to 04_sales

### Main dashboard (`index.html`) sections

1. **Navbar:** Brand, live "Saved products" counter, Reset Demo
2. **Hero:** "Where indie beauty meets intelligent R&D"
3. **Department grid (4 cards):** Sentiment, R&D Formulation, Marketing, Operations — each with icon circle + "Open Department" rose pill button
4. **Your Products:** List from `TFFormulas.loadAll()` — click opens modal with INCI breakdown, compliance badge, delete, "Open R&D Lab"
5. **Trend banner:** Hardcoded "Glass Skin Alternatives +340%", bakuchiol, reef-safe SPF stats

**Scripts loaded:** `formulas.js`, `chat-bubble.js`

---

## 9. Component 01 — Sentiment Engine

**Path:** `components/01_sentiment/index.html`  
**Tagline:** Trend → Ingredient mapping  
**Input:** 15 comments from `comments.js`  
**Output:** `localStorage.tf_c1_results` + optional JSON export

### User flow

1. Page loads → raw comments panel (collapsed) + empty results
2. Click **Run Sentiment Analysis**
3. Sequential loop over all 15 comments (500ms delay between each for "scanning" feel)
4. Each comment: Groq analysis → normalize → merge into trend groups Map
5. Live UI updates: trend cards appear/update as analysis progresses
6. Summary banner: "X trends across Y comments"
7. CTA: "Continue to R&D Formulation →"
8. Optional: Export as JSON

### UI layout

| Section | ID / class | Description |
|---------|------------|-------------|
| Error notice | `#error-notice` | Yellow banner if any comment used keyword fallback |
| Summary | `#summary-banner` | Trend count + export button |
| Next step CTA | `#next-step-cta` | Link to 02_formulation |
| Action bar | `.action-bar` | Run button + `.scanning-state` spinner |
| Results | `#results-panel` | Grouped `.result-card` per trend |
| Raw comments | `#raw-comments-section` | Collapsible; per-comment status badges |

### Trend group card contents

- Trend name (display font)
- Meta pills: comment count, dominant skin concern, formula type
- Pain points list (deduplicated from source comments)
- Rationale paragraph
- Ingredient pills (name + function)
- Expandable source comments list

### Analysis result schema (per comment)

```javascript
{
  id: 1,
  text: "original comment text",
  trend: "Glass Skin",
  pain_point: "niacinamide keeps irritating my skin",
  skin_concern: "sensitivity",       // enum — see SYSTEM_PROMPT
  ingredients: [
    { name: "Polyglutamic Acid", function: "humectant", why: "..." },
    { name: "Centella Asiatica Extract", function: "soothing agent", why: "..." }
  ],
  rationale: "one sentence cosmetic science justification",
  sentiment: "frustrated",           // enum
  formula_type: "serum",             // enum
  confidence: "high",                // high | medium | low
  source: "ai"                       // "ai" | "keyword"
}
```

### Groq SYSTEM_PROMPT (summary)

Role: cosmetic R&D analyst. Return **only** JSON matching exact schema. Rules:
- Exactly 2 ingredients with INCI names
- Controlled vocab for skin_concern, sentiment, formula_type, confidence
- Preserve emotional texture of pain_point

### Keyword fallback (`KEYWORD_MAP`)

5 hardcoded mappings (substring match on lowercased comment):

| Key phrase | Trend |
|------------|-------|
| `glass-skin` | Glass Skin |
| `slugging` | Barrier Repair |
| `reef-safe spf` | Clean Sun Care |
| `retinol` | Gentle Retinol Alternatives |
| `k-beauty` | Simplified K-Beauty |

No match → `trend: "Unclassified"`, empty ingredients, `confidence: "low"`.

### Key functions

- `analyzeCommentAI(text)` — Groq → parse → normalize; catch → keyword
- `upsertGroup(result, commentObj)` — merge by trend name into Map
- `runAnalysis()` — main orchestrator
- `exportJSON()` — downloads `trendformulate_sentiment_mapping.json`

### Export payload shape

```javascript
{
  generated_at: ISO string,
  summary: { trends_detected, comments_analyzed },
  mappings: [{ comment_id, comment_text, trend, pain_point, ingredients, confidence, source }]
}
```

### Scripts loaded

`config.js`, `comments.js`, `chat-bubble.js`

---

## 10. Component 02 — R&D Formulation

**Path:** `components/02_formulation/index.html`  
**Tagline:** Formulation + Safety Guardrail  
**Input:** `tf_c1_results` (deduped trends, excluding "Unclassified")  
**Output:** `TFFormulas.save()` + JSON export

### Two-agent pipeline

```
Agent 1 (Groq LLM)          Agent 2 (CosIng DB)
"Formulation Agent"    →    "Regulatory Agent"
Generates INCI formula      Deterministic audit
```

### User flow

1. Load trends from `tf_c1_results` into horizontal carousel
2. Select a trend card → enables "Generate AI Recipe"
3. Click generate → hide Phase 1, show Phase 2+3:
   - Left: agent pipeline status (Agent 1 → Agent 2)
   - Right: formula card + compliance card (with skeleton loaders)
4. Agent 1 completes → formula table rendered
5. Agent 2 completes → compliance verdict + per-ingredient checks
6. Auto-save to `TFFormulas`
7. Actions: Export Full Report, Next: TikTok Content, New Formula

### Step progress indicator

3 steps: Select Trend → Generate → Compliance (dots with active/done states)

### Trend carousel

- Responsive: 1 / 2 / 4 cards visible
- Scroll prev/next buttons
- Each card: trend name, pain point, ingredients, skin concern, formula type badge

### Agent 1 — FORMULATOR_SYSTEM prompt (critical rules)

Returns JSON:
```javascript
{
  product_name, product_type, tagline,
  ingredients: [{ name, inci, percentage, function, rationale }],  // 6-8 items, sum = 100%
  ph_range, shelf_life, marketing_claims[], formulation_notes
}
```

Hard rules enforced in prompt:
- Percentages sum to exactly 100.0
- Water (Aqua) highest % in water-based formulas
- Phenoxyethanol ≤ 1%, Fragrance ≤ 1%
- Bakuchiol ≤ 2%, Niacinamide ≤ 10%, Zinc Oxide ≤ 25%, Retinol ≤ 0.3%

Post-processing: if sum drifts >0.5 from 100, renormalize all percentages.

### Agent 2 — Compliance logic

```javascript
const dbResults = cosingCheckAll(formula.ingredients);
// Per ingredient: PASS | CAUTION | FAIL
// Overall: COMPLIANT if no FAIL; CAUTION if any CAUTION; NON_COMPLIANT if any FAIL
// market_clearance: { eu: bool, us_fda: bool }
```

Maps to workspace `compliance`:
- `COMPLIANT` → `"compliant"`
- `CAUTION` → `"caution"`
- `NON_COMPLIANT` → `"violation"`

Compliance card shows **only restricted ingredients** (those in regulatory lists), not unrestricted pass-throughs.

### saveToWorkspace mapping

```javascript
TFFormulas.save({
  id: Date.now(),
  name: formula.product_name,
  compliance: mappedStatus,
  ingredients: formula.ingredients.map(i => ({
    name: i.name, inci: i.inci, pct: i.percentage, type: i.function
  })),
  hero_ingredient: /* highest-% active */,
  hero_inci, ingredient_type, mechanism,
  benefit_stack: formula.marketing_claims,
  shot_type: "Product texture close-up",
  savedAt: new Date().toISOString()
});
```

### Export

`exportReport()` → `trendformulate_formula_{product_name}.json`:
```javascript
{ generated_at, trend, formula, compliance_audit }
```

See `trendformulate_formula_hydrabalance_serum.json` in repo root for a real example output.

### Scripts loaded

`config.js`, `cosing_db.js`, `formulas.js`, `chat-bubble.js`

### Empty state

No `tf_c1_results` → message + link back to `01_sentiment`. Generate button disabled.

---

## 11. Component 03 — Marketing Engine

**Path:** `components/03_marketing/index.html`  
**Tagline:** TikTok Content Engine  
**Input:** `TFFormulas.loadAll()`  
**Output:** On-screen script + storyboard (no persistence)

### User flow

1. Formula dropdown populated from workspace (or empty state with link to 02)
2. Configure: demographic select, tone radio pills (Clean Beauty / Science-Forward / Gen Z Playful)
3. Formula preview card updates on selection
4. Click **Generate Content** → 4-step animation → Groq → render
5. Copy Script / Download Storyboard PDF (print) / Regenerate / Reset

### UI layout

Two-column `.engine-grid`:
- **Left:** Content Settings + Formula Preview
- **Right:** Idle → Generating → Script card + 4-frame storyboard grid + action bar

### SCRIPT_SYSTEM output schema

```javascript
{
  hook: "0-3s spoken hook",
  science_bridge: "3-15s science explanation",
  transition: "15s director note / B-roll",
  benefit_stack: "15-28s benefit claims",
  cta: "28-30s call to action",
  storyboard: [
    { time, type, label, description, shotType, icon }  // exactly 4 frames
  ]
}
```

Tone rules differ per brand voice (see prompt in source).

### Script card rendering

5 timestamped lines with color classes:
- `.ts-hook` (rose), `.ts-science` (teal), `.ts-transition` (amber), `.ts-benefits` (green), `.ts-cta` (accent)

### Storyboard frames

4 cards with gradient backgrounds by type: hook / bridge / benefits / cta

### Copy script format

Plain text with `[0-3s] HOOK:` style timestamps, product name, tone, demographic header.

### Print / PDF

`window.print()` with `@media print` hiding `.engine-grid > .input-panel`, navbar, action bar.

### Scripts loaded

`config.js`, `formulas.js`

### Listens for

`tf-formulas-changed`, `storage` on `tf_saved_formulas`

---

## 12. Component 04 — Waitlist / Sales Gate

**Path:** `components/04_sales/index.html`  
**This is the public entry point** — no access gate on this page.

### Dual purpose

1. **Marketing landing page** for TrendFormulate beta waitlist
2. **Forma qualification chatbot** that gates access to the main OS

### Landing page sections

| Section | Content |
|---------|---------|
| Navbar | Beta pill + "Demo Access" button (grants token immediately) |
| Hero | Headline + subcopy + CTA opens chat modal |
| Stats row | 4 hardcoded metrics (founders waitlisted, avg time-to-formula, etc.) |
| How it works | 4 step cards (Detect → Formulate → Comply → Manufacture) |
| Feature grid | 6 platform capabilities |
| CTA banner | "Join the waitlist" opens chat |
| Trend ticker | Scrolling beauty trend headlines |
| Footer | Links + copyright |

### Chat modal (`#chat-modal`)

Full-screen overlay with:
- Header: Forma avatar, "AI Waitlist Agent", online dot
- Messages area (user right-aligned rose bubbles, agent left-aligned)
- Typing indicator (3 bouncing dots)
- Quick reply chips (contextual per exchange count)
- Lead capture form (appears when qualified)
- Input bar + send button

### Forma SYSTEM_PROMPT — three non-negotiable goals

1. **QUALIFY** real indie founders (not students/journalists/competitors)
2. **PROTECT** — NEVER generate formulas/INCI/recipes in chat (guardrail)
3. **CONVERT** — collect name, brand, email, launch timeline

Max 2-3 sentences per reply. No bullets/markdown. Always end with one follow-up question.

### Lead scoring

```javascript
const FORM_MIN_SCORE = 55;
const FORM_MIN_EXCHANGES = 3;

const LEAD_SCORE_SIGNALS = [
  { keywords: ["brand", "my brand", ...], score: 18, label: "brand_mention" },
  { keywords: ["launch", "timeline", "q1", ...], score: 18, label: "timeline_mention" },
  { keywords: ["eu", "fda", "compliance", ...], score: 14, label: "compliance_concern" },
  { keywords: ["budget", "price", ...], score: 10, label: "budget_signal" },
  { keywords: ["serum", "spf", "bakuchiol", ...], score: 12, label: "product_specificity" }
];
```

Diminishing returns: repeated signal labels score less on subsequent hits.  
Lead form shown when `leadScore >= 55 && exchangeCount >= 3`.

### Intent fallback map (`INTENTS`)

10 intents with keywords, labels, guardrail flags:
- `freeload` (guardrail: true) — formula/recipe requests
- `compliance`, `pricing`, `timeline`, `factory`, `access`
- `competitor`, `investor`, `how_it_works`, `greeting`

### Presenter state persistence

```javascript
// sessionStorage
tf_presenter_profile_id  // UUID per browser session

// localStorage
tf_presenter_profiles: {
  [profileId]: {
    leadScore, exchangeCount, guardrailCount,
    currentStage,  // greeting → qualifying → pitching → capturing → converted
    capturedName, capturedBrand, capturedEmail, capturedTimeline,
    intentLog: [{ label, timestamp }],
    startedAt, updatedAt, label
  }
}
```

Saved after every message exchange. Admin polls every 2s.

### Pipeline stages

`greeting` → `qualifying` → `pitching` → `capturing` → `converted`

### grantDemoAccess()

```javascript
localStorage.setItem('tf_waitlist_access', '1');
window.location.href = '../../index.html';
```

### Initial quick replies

- "Does this guarantee my formula will be legal to sell in the EU?"
- "Can you give me a quick recipe for a serum right now?" (tests guardrail)
- "How much does it cost?"
- "How fast can I get in?"

### Scripts loaded

`config.js` only (no chat-bubble — page has its own full chat)

---

## 13. Component 05 — Workforce Architect (HR)

**Path:** `components/05_hr/index.html`  
**Access:** Linked from `admin/index.html` only  
**Tagline:** JD Generator + Skill-Gap Analyzer

### User flow

1. Two pre-filled textareas: **Input A** (team roster) + **Input B** (R&D trend vector / active formulas)
2. Architecture flow diagram shows: Input A + B → Phase 1 Risk → Phase 2 JD
3. Click **Run Two-Phase AI Analysis**
4. Animated scan log streams progress messages
5. Phase 1 risk card renders (CRITICAL/HIGH/MEDIUM/LOW badge)
6. Phase 2 JD card renders (title, about, responsibilities, qualifications, 5 vetting questions)
7. Copy JD / Download `.txt` package

### Two-phase Groq chain

**Phase 1 — PHASE1_SYSTEM:** Organizational Risk Analyst  
Input: team roster + product roadmap text  
Output markdown sections: RISK LEVEL, SKILL GAP SUMMARY, MISSING CAPABILITIES, GOVERNANCE EXPOSURE

**Phase 2 — PHASE2_SYSTEM:** Technical Recruiter  
Input: Phase 1 raw output  
Output: JOB TITLE, ABOUT THE ROLE, KEY RESPONSIBILITIES, REQUIRED/PREFERRED QUALIFICATIONS, TECHNICAL VETTING QUESTIONS (5 numbered)

### API note

`callGroq` **always** uses `/api/groq` — no local direct endpoint. Works on Vercel deploy or local server that serves `api/groq.js`.

### Default demo textarea content

Hardcoded example: 3-person team missing peptide expertise while AI generates Matrixyl/peptide serums at scale.

### Export

`TrendFormulate_WorkforcePackage.txt` — plain text concatenation of Phase 1 + Phase 2.

### No localStorage integration

Does not read `tf_c1_results` or `TFFormulas` — conceptual link only.

---

## 14. Component 06 — Finance / Unit Economics

**Path:** `components/06_finance/index.html`  
**Access:** Admin-linked  
**Tagline:** Unit Economics Simulator  
**No API calls** — pure JavaScript + Chart.js

### Purpose

Prove the business case: AI formulation COGS is ~$0.50/formula vs $15,000 legacy lab cost, yielding ~91% gross margin at scale.

### Two-phase model

**Phase 1 — Per-formula token COGS:**
- Input tokens slider (default ~4000)
- Output tokens slider (default ~3000)
- Iterations slider (revision rounds, default 3)
- Model tier selector: Lean ($1/$3 per 1M in/out) | Balanced ($4/$8) | Frontier ($15/$45)

**Phase 2 — Scale economics:**
- Brands on platform (default 500)
- Avg formulas per brand per month (default 2)
- ARPU $/month (default 79)

### Core formula (`simulate()`)

```javascript
effInput  = inputTok  * iterations
effOutput = outputTok * iterations
inCost    = (effInput  / 1_000_000) * tier.inPerM
outCost   = (effOutput / 1_000_000) * tier.outPerM
tokenBurn = inCost + outCost
cogsPerFormula = tokenBurn + ROUTING_COST  // ROUTING_COST = $0.05

monthlyFormulas  = brands * avgFormulas
monthlyRevenue   = brands * arpu
monthlyTokenCOGS = monthlyFormulas * cogsPerFormula
totalMonthlyCOGS = monthlyTokenCOGS + INFRA_FIXED  // INFRA_FIXED = $2000
grossProfit      = monthlyRevenue - totalMonthlyCOGS
grossMarginPct   = grossProfit / monthlyRevenue * 100

legacyMonthly = monthlyFormulas * LEGACY_COST_PER_FORMULA  // $15,000
costMult      = LEGACY_COST_PER_FORMULA / cogsPerFormula
```

Token split annotation (UI labels):
- Input: 60% trends / 40% safety
- Output: 65% formula / 35% marketing

### KPI cards (top row)

1. AI COGS per formula
2. Gross margin %
3. Monthly gross profit
4. Cost vs legacy multiplier

### Charts

1. **Scale chart** (log Y): brands 10–3000 vs legacy cost / revenue / AI COGS
2. **Burn chart**: margin % vs iterations 1–10 for all 3 tiers

### Boardroom View

Fullscreen overlay toggled by button. Shows large KPIs + P&L table + tagline. Escape to exit. Hides sliders.

### Default slider values

| Slider | Default |
|--------|---------|
| Input tokens | 4000 |
| Output tokens | 3000 |
| Iterations | 3 |
| Brands | 500 |
| Formulas/brand | 2 |
| ARPU | $79 |
| Active tier | balanced |

---

## 15. Component 07 — Operations / Factory Selector

**Path:** `components/07_ops/index.html`  
**Tagline:** Contract Manufacturer Selector  
**Input:** `TFFormulas` + `data/factories.json`  
**Output:** Ranked Top 3 factories + recommendation narrative + print export

### Two-tier architecture

```
Tier 1 (Groq llama-3.1-8b-instant)    Tier 2 (Deterministic JS)
Extract manufacturing profile    →    Score all factories
```

### User flow

1. Select formula from dropdown (from `TFFormulas`)
2. Select target market (EU / US / UK / Global / Asia)
3. Pick launch date
4. Choose strategy tile (sets weight distribution):
   - **Balanced** (33% cost / 34% compliance / 33% lead time)
   - **Compliance-first** (15 / 70 / 15)
   - **Speed-first** (20 / 30 / 50)
   - **Cost-first** (55 / 30 / 15)
5. Auto-suggest: EU markets → compliance-first tile
6. Click **Run Analysis** → 10-step loading animation
7. Results: Top 3 factory cards + Tier 1 profile + Tier 2 scoring matrix + recommendation banner

### Tier 1 profile schema (Groq output)

```javascript
{
  batch_tier: "pilot" | "mid" | "commercial",
  recommended_moq: 500,
  emulsification_method: "cold-mix" | "hot-mix" | "both",
  required_certifications: ["ISO 22716", ...],
  preferred_regions: ["Europe", "Asia"],
  special_capabilities: ["cold_mix", "peptide_formulation", ...],
  regulatory_notes: "string",
  hard_filter_certifications: []  // non-negotiable; -40 score if factory lacks
}
```

**Fallback:** `TFFormulas.buildGenericFallbackProfile(entry)` on Groq failure.

### Tier 2 scoring algorithm

```javascript
function scoreFactories(factories, weights, profile) {
  // Normalize weights to sum to 1
  // For each factory:
  S_cost   = (1 - cost_per_unit / maxCost) * 100
  S_lead   = (1 - lead_time_days / maxLead) * 100
  S_comply = adjustedCompliance(factory, profile)
  // adjustedCompliance: base compliance_score
  //   - 40 if missing hard_filter_certification
  //   + bonuses for matching special_capabilities

  totalScore = W_cost * S_cost + W_comply * S_comply + W_lead * S_lead
  // Sort descending, take Top 3
}
```

### Factory card display

Rank badge (#1 gold), name, country, composite score, 3 mini score bars (cost/compliance/lead), MOQ, lead time, unit cost, certifications tags.

### Recommendation narrative

HTML paragraph explaining why #1 wins given weights, profile, launch date math (`today + lead_time_days`).

### Export

`window.print()` — hides `.config-area` and `.no-print` elements.

### Scripts loaded

`config.js`, `formulas.js`

---

## 16. Admin Dashboard

**Path:** `admin/index.html`  
**Not gated** — intended for presenters only (obscure URL).

### Sections

1. **Admin navbar:** Shield icon, "Admin" badge, link to user dashboard
2. **Internal Departments (3 cards):**
   - **Waitlist Agent** → opens presenter modal (live chat monitor)
   - **Workforce Architect** → `components/05_hr/index.html`
   - **Finance / CFO View** → `components/06_finance/index.html`
3. **Session Data grid (3 live cards):**
   - Waitlist Access status
   - Sentiment Results (grouped by trend)
   - Saved Formulas (name + compliance)
4. **Quick links** to all 7 components

### Presenter modal (Waitlist Agent)

Polls `tf_presenter_profiles` every 2 seconds.

- Profile tabs for sessions active within last 30 minutes
- 3-column grid:
  - **Score ring** (SVG arc, 0–100, letter grade A–F)
  - **Lead data:** name, brand, email, timeline, stage, exchange count, guardrail count
  - **Intent log:** last 30 detected intents with timestamps
- **Validate Access** button: sets `tf_waitlist_access = '1'`

### Legacy migration

`migrateLegacyPresenterState()` converts old `tf_presenter_state` key to new `tf_presenter_profiles` format.

### Key functions

- `renderDatabase()` — builds 3 db-cards from localStorage
- `tickPresenterState()` — 2s polling loop
- `getScoreGrade(score)` — A/B/C/D/F thresholds

---

## 17. Floating Chat Widget (Forma)

**File:** `assets/chat-bubble.js`  
**Loaded on:** `index.html`, components 01–03, 05–07  
**NOT loaded on:** `04_sales` (has own chat), `admin`

### Behavior

- Rose circular button bottom-left with unread dot
- Panel slides up with same chat UX as sales page (lighter weight)
- Lead form after 3 exchanges
- Lead score from 14 keywords (max 100)
- Groq with full platform context (ingredients, factories, live trends)

### System prompt built dynamically

Includes:
- Ingredient names from `ingredients_db.json`
- Factory summaries from `factories.json`
- Top 6 trends from `tf_c1_results` if available

---

## 18. Mock Data Files

### `data/ingredients_db.json` (11 entries)

```json
{ "name", "inci", "max_pct", "type", "optimal_pct?", "regulation?", "known_sensitivity?" }
```

Used by `chat-bubble.js` for sales context. **Not** used by Component 02 (uses `cosing_db.js` instead).

### `data/safety_rules.json` (4 entries) — LEGACY

```json
{ "ingredient", "max_allowed"?, "recommended_max"?, "optimal"?, "regulation"?, "violation_message"?, "note"? }
```

**Not loaded by any live component.** Original blueprint artifact. Compliance is handled by `cosing_db.js`.

### `data/factories.json` (6 factories: A–F)

```json
{
  "id", "name", "country", "region",
  "cost_per_unit", "lead_time_days",
  "certifications": [],
  "compliance_score": 0-100,
  "moq", "max_capacity",
  "capabilities": ["cold_mix", "hot_mix", "botanical_extracts", "mineral_uv", "sunscreen_otc", "peptide_formulation", "clean_room", "organic_handling", "fill_and_pack", "bulk_fill"],
  "markets_served": [],
  "batch_tier": "pilot" | "mid" | "commercial"
}
```

| ID | Name | Region | $/unit | Lead | Score | MOQ |
|----|------|--------|--------|------|-------|-----|
| A | GreenLab Korea | Asia | 1.00 | 55d | 92 | 500 |
| B | SpeedForm EU | Europe | 1.85 | 14d | 95 | 1000 |
| C | NaturaCo USA | N. America | 2.20 | 21d | 88 | 300 |
| D | ChemBase India | Asia | 0.55 | 90d | 52 | 5000 |
| E | BioForma France | Europe | 2.45 | 28d | 98 | 500 |
| F | PharmaBeauty Labs | N. America | 3.10 | 18d | 96 | 1000 |

---

## 19. CosIng Compliance Engine

**File:** `assets/cosing_db.js`  
**Sourced from:** EU CosIng Annexes II, III, V, VI (+ FDA 21 CFR subsets)

### Data structures

1. **`COSING_PROHIBITED`** (Set) — ~30 INCI names → automatic FAIL
   - Retinoic acid, tretinoin, hormones, heavy metals, phthalates, etc.

2. **`COSING_PROHIBITED_EXTENDED`** (Set) — additional botanical/drug entries

3. **`COSING_RESTRICTED`** (Object) — ~50+ entries keyed by normalised INCI:
   ```javascript
   "PHENOXYETHANOL": {
     max_pct: 1.0, annex: "V", entry: "29",
     regulation: "(EC) 2009/1223",
     note: "Max 1.0% in all cosmetic products.",
     product_scope: null
   }
   ```

4. **`FDA_PROHIBITED`** (Set) — US-specific bans

5. **`FDA_RESTRICTED`** (Object) — e.g. hexachlorophene, mercury compounds

### Functions

```javascript
cosingNormalise(name)     // uppercase, trim, collapse whitespace
cosingCheck(inci, pct)    // single ingredient → { status, ref, note, restricted }
cosingCheckAll(ingredients) // array → per-ingredient results
```

### Check priority

1. EU prohibited → **FAIL**
2. FDA prohibited → **FAIL**
3. EU restricted → **FAIL** if pct > max_pct; **CAUTION** if pct > 90% of max; else **PASS**
4. FDA restricted → same logic
5. Not in any list → **PASS** (unrestricted)

### Status values

`"PASS"` | `"CAUTION"` | `"FAIL"`

The `restricted` boolean flag indicates the ingredient appears in a regulatory list (used to filter compliance card display).

---

## 20. Deployment (Vercel)

### Setup

1. Connect GitHub repo to Vercel
2. Set environment variable: `GROQ_API_KEY=gsk_...`
3. Deploy — Vercel auto-serves static files + `api/groq.js` serverless function

### `vercel.json`

Empty `{}` — default behavior suffices.

### Production behavior

- All Groq calls from browser go to `/api/groq` (key never exposed)
- `ON_SERVER === true` on any non-localhost hostname
- No `config.js` needed in production

### Local vs production summary

| Environment | Groq endpoint | API key location |
|-------------|---------------|------------------|
| localhost | Direct Groq API | `assets/config.js` |
| file:// | Direct (if config.js) | `assets/config.js` |
| Vercel/production | `/api/groq` proxy | Vercel env var |

---

## 21. Demo Script (Presentation Day)

Run in this exact order for maximum narrative impact:

| Step | Page | Talking point |
|------|------|---------------|
| 1 | `04_sales` | "Public beta is closed. Forma qualifies real founders." Open chat, show guardrail on formula request. |
| 2 | `04_sales` | Click **Demo Access** or complete qualification → enter OS. |
| 3 | `index.html` | "This is TrendFormulate OS — every department, one workspace." Show empty Products. |
| 4 | `01_sentiment` | Run analysis on 15 comments. "We extract what consumers actually want." |
| 5 | `02_formulation` | Pick top trend, generate recipe. "Agent 1 creates; Agent 2 audits against EU CosIng." Save formula. |
| 6 | `index.html` | Product appears in "Your Products" counter. |
| 7 | `03_marketing` | Generate TikTok script from saved formula. "Ready to film in 30 seconds." |
| 8 | `07_ops` | Run factory analysis. "SpeedForm EU wins on your launch date." |
| 9 | `06_finance` | Boardroom View. "~$0.50 AI COGS, 91% gross margin at 500 brands." |
| 10 | `admin` | Open Waitlist presenter modal. Show live lead scoring from step 1. |
| 11 | `05_hr` | "AI revealed a peptide gap — here's the JD to fill it." |
| 12 | `index.html` | Close: "A 3-person indie brand competing with L'Oréal." |

### Reset between demos

Click **Reset Demo** on dashboard → clears `tf_waitlist_access` → back to waitlist.

To fully reset data:
```js
localStorage.removeItem('tf_c1_results');
localStorage.removeItem('tf_saved_formulas');
localStorage.removeItem('tf_presenter_profiles');
localStorage.removeItem('tf_waitlist_access');
```

---

## 22. Rebuild Checklist

Use this ordered checklist to reconstruct the app from scratch.

### Phase 1 — Foundation

- [ ] Create folder structure per §3
- [ ] Build `assets/style.css` with all tokens from §5
- [ ] Build `assets/formulas.js` (TFFormulas API per §7)
- [ ] Build `assets/comments.js` (15 comments per §7)
- [ ] Build `data/factories.json` (6 factories per §18)
- [ ] Build `data/ingredients_db.json` (11 entries per §18)
- [ ] Create `assets/config.example.js` + `.gitignore` for `config.js`
- [ ] Build `api/groq.js` proxy per §20

### Phase 2 — Compliance engine

- [ ] Build `assets/cosing_db.js` with prohibited/restricted sets per §19
- [ ] Implement `cosingNormalise`, `cosingCheck`, `cosingCheckAll`

### Phase 3 — Components (any order, but test pipeline 01→02→03→07)

- [ ] **01_sentiment:** COMMENTS loader, Groq loop, KEYWORD_MAP, trend grouping, `tf_c1_results` save, export
- [ ] **02_formulation:** Trend carousel, Agent 1 Groq, Agent 2 CosIng, TFFormulas save, export
- [ ] **03_marketing:** Formula dropdown, tone/demographic inputs, Groq script, storyboard, copy/print
- [ ] **04_sales:** Landing page, chat modal, Forma prompt, scoring, presenter profiles, access grant
- [ ] **05_hr:** Two-phase Groq, risk card, JD card, copy/download
- [ ] **06_finance:** simulate(), sliders, KPIs, 2 Chart.js charts, Boardroom View
- [ ] **07_ops:** Tier 1 Groq profile, Tier 2 scoring, Top 3 cards, narrative, print

### Phase 4 — Integration

- [ ] Build `index.html` with access gate, 4 dept cards, Products workspace, modal, trend banner
- [ ] Build `admin/index.html` with dept cards, session data grid, presenter modal
- [ ] Build `assets/chat-bubble.js` floating widget
- [ ] Verify all `../../` relative paths from components
- [ ] Verify `lucide.createIcons()` called after dynamic DOM updates
- [ ] Verify `tf-formulas-changed` event propagation

### Phase 5 — Polish

- [ ] Skeleton loaders and scanning animations on AI components
- [ ] 429 retry logic on all Groq calls
- [ ] Token truncation bump logic
- [ ] Print CSS on marketing and ops
- [ ] Empty states with cross-links when upstream data missing
- [ ] Mobile responsive breakpoints on grids

### Phase 6 — Deploy

- [ ] Push to GitHub
- [ ] Deploy to Vercel with `GROQ_API_KEY`
- [ ] Dry-run full demo script from §21

---

## Appendix A — Groq JSON Parsing Pattern

All components use this fence-stripping before `JSON.parse`:

```javascript
function parseJSON(raw) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned);
}
```

## Appendix B — JSON Export Helper

```javascript
function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

## Appendix C — ON_SERVER + Config Script Pattern

Every AI component should include:

```html
<script src="../../assets/config.js"></script>
<script>
  const GROQ_MODEL = 'llama-3.3-70b-versatile';
  const ON_SERVER = window.location.protocol !== 'file:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const GROQ_ENDPOINT = ON_SERVER
    ? '/api/groq'
    : 'https://api.groq.com/openai/v1/chat/completions';
</script>
```

## Appendix D — Known Gaps / Not Implemented

These are intentional or out of scope — do not expect them in the codebase:

- No real email sending on lead capture
- No user authentication beyond localStorage token
- No backend database or CRM integration
- `safety_rules.json` is not wired (superseded by CosIng)
- No automated tests
- HR component does not auto-read live trend/formula data
- Finance simulator uses illustrative defaults, not live Groq token metering

---

*Document generated from the live TrendFormulate codebase. Last aligned: June 2026.*
