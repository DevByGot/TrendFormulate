# TrendFormulate — Capstone Project Blueprint
### Managing AI | Full Build Guide for Claude Code

---

## Project Overview

TrendFormulate is a **mock B2B SaaS platform** for indie cosmetics founders. It simulates an AI-native operating system where every business department is powered by a specialized AI workflow. The goal of the capstone is to **demonstrate 7 independent AI components** that together form a believable end-to-end product.

**Tech philosophy:** No paid APIs. Use free-tier or fully local approaches. All data can be mocked/simulated. The demo should *look and feel* working, even if the "AI" is powered by hardcoded JSON, rule-based logic, or free LLM calls (Ollama locally, or Groq free tier, or OpenAI-compatible open endpoints).

---

## Architecture: How the 7 Components Stay Independent

Each component is a **standalone mini-app** (a single HTML page or Python script) that:
- Reads from its own **mock data file** (a local JSON or CSV)
- Produces its own **output artifact** (a JSON, a PDF-style HTML card, a dashboard)
- Is **self-contained** — no component depends on another being "live"

They are stitched together in a **central dashboard** (`index.html`) that acts as the TrendFormulate OS interface. Each department card on the dashboard links to its own component page. This means:

- Team members can build their component in isolation
- The integration step is just linking pages — not rewriting logic
- Each component can use fake/hardcoded AI output and still demo convincingly

### Monorepo Folder Structure

```
trendformulate/
├── index.html                    ← Main OS dashboard (links to all 7 components)
├── data/
│   ├── mock_comments.json        ← Raw social media comments (shared input)
│   ├── ingredients_db.json       ← Ingredient safety database
│   ├── factories.json            ← Mock factory list
│   └── safety_rules.json         ← Mock FDA/EU safety thresholds
├── components/
│   ├── 01_sentiment/
│   │   └── index.html            ← Sentiment-to-Ingredient Tool
│   ├── 02_formulation/
│   │   └── index.html            ← Formulation Proposer + Safety Check
│   ├── 03_marketing/
│   │   └── index.html            ← TikTok Content Engine
│   ├── 04_sales/
│   │   └── index.html            ← Waitlist Nurturing Chatbot
│   ├── 05_hr/
│   │   └── index.html            ← JD Generator + Skill-Gap Analyzer
│   ├── 06_finance/
│   │   └── index.html            ← Unit Economics Simulator
│   └── 07_ops/
│       └── index.html            ← Contract Manufacturer Selector
└── assets/
    └── style.css                 ← Shared design tokens (optional)
```

> **Team split:** Assign one person per `components/0X_*` folder. The dashboard (`index.html`) can be built last by anyone once all pages exist.

---

## Shared Design System

All 7 component pages should import a shared CSS file for visual consistency. Use a **clean, modern, dark-mode-capable** aesthetic fitting a B2B SaaS product. Suggested palette: near-black backgrounds, white text, teal (`#01696f`) as the primary accent, surface cards in dark gray.

Include these tokens in `assets/style.css`:
```css
:root {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface-2: #242424;
  --border: rgba(255,255,255,0.08);
  --text: #e8e6e1;
  --text-muted: #888;
  --accent: #4f98a3;
  --accent-hover: #227f8b;
  --success: #6daa45;
  --error: #dd6974;
  --radius: 0.75rem;
  --font-body: 'Inter', sans-serif;
  --font-display: 'Instrument Serif', Georgia, serif;
}
```

Every component page links to this shared CSS at the top.

---

## Component 1 — Sentiment-to-Ingredient LLM Mapping Tool

**Owner:** 1 person | **Output:** Interactive web page with JSON export

### What It Does
Takes raw social media comments → extracts beauty trends → maps them to chemical ingredients.

### Mock Data (`data/mock_comments.json`)
```json
[
  { "id": 1, "text": "I love the glass-skin look but niacinamide breaks me out, I wish there was something cleaner that plumps skin" },
  { "id": 2, "text": "Slugging with petroleum jelly is too heavy, I want something that locks moisture without the greasy feel" },
  { "id": 3, "text": "Looking for a reef-safe SPF that doesn't leave a white cast on dark skin tones" },
  { "id": 4, "text": "Retinol is too harsh for my sensitive skin, what gives similar anti-aging results?" },
  { "id": 5, "text": "I want the dewy K-beauty look without 10 steps, something that does it all in one" }
]
```

### How to Build It (HTML + JS, no backend needed)

**UI Layout:**
1. A left panel showing the raw comment cards (loaded from the JSON)
2. A central "Analyze" button that triggers the mapping
3. A right panel showing the structured output per comment

**The "AI" Logic (rule-based mock, no API needed):**
Create a `keyword_map.js` file with a hardcoded dictionary:
```javascript
const KEYWORD_MAP = {
  "glass-skin":        { trend: "Glass Skin", ingredients: ["Polyglutamic Acid", "Centella Asiatica"], pain_point: "niacinamide irritation" },
  "slugging":          { trend: "Barrier Repair", ingredients: ["Squalane", "Snow Mushroom Extract"], pain_point: "heavy texture" },
  "reef-safe spf":     { trend: "Clean Sun Care", ingredients: ["Zinc Oxide", "Non-nano Titanium Dioxide"], pain_point: "white cast" },
  "retinol":           { trend: "Gentle Retinol Alternatives", ingredients: ["Bakuchiol", "Peptide Complex"], pain_point: "sensitivity" },
  "k-beauty":          { trend: "Simplified K-Beauty", ingredients: ["Hyaluronic Acid", "Rice Ferment Filtrate"], pain_point: "too many steps" }
};
```
Loop through each comment, match keywords, and render results.

**Output format per comment:**
```json
{
  "trend": "Glass Skin",
  "pain_point": "niacinamide irritation",
  "target_ingredients": ["Polyglutamic Acid", "Centella Asiatica"],
  "confidence": "High"
}
```

**UI Features to include:**
- Animated "scanning..." state before results appear (adds AI feel)
- Color-coded confidence badges (High / Medium / Low)
- "Export as JSON" button that downloads the full mapping result
- A summary card at the top: "X trends detected across Y comments"

**Optional upgrade (free LLM):** If you want real NLP, use the [Groq free API](https://console.groq.com) with `llama3-8b-8192`. Send a system prompt: *"Extract the beauty trend, the pain point, and suggest 2 clean alternative ingredients. Reply only in JSON."* This costs $0 and needs no local setup.

---

## Component 2 — Formulation Proposer + Safety Check Agent

**Owner:** 1 person | **Output:** Interactive formulation sheet with safety audit trail

### What It Does
Takes an ingredient list → generates a cosmetic formula → validates it against safety rules → outputs a corrected, compliant formula sheet.

### Mock Data

**`data/ingredients_db.json`** — ingredient profiles:
```json
[
  { "name": "Water", "inci": "Aqua", "max_pct": 95, "type": "base" },
  { "name": "Polyglutamic Acid", "inci": "Sodium Polyglutamate", "max_pct": 5, "optimal_pct": 3, "type": "active" },
  { "name": "Phenoxyethanol", "inci": "Phenoxyethanol", "max_pct": 1, "type": "preservative", "regulation": "EU Annex V" },
  { "name": "Centella Asiatica", "inci": "Centella Asiatica Extract", "max_pct": 10, "type": "active" },
  { "name": "Niacinamide", "inci": "Niacinamide", "max_pct": 10, "type": "active", "known_sensitivity": true },
  { "name": "Glycerin", "inci": "Glycerin", "max_pct": 30, "type": "humectant" }
]
```

**`data/safety_rules.json`** — threshold checks:
```json
[
  { "ingredient": "Phenoxyethanol", "max_allowed": 1.0, "regulation": "EU Annex V / FDA", "violation_message": "Phenoxyethanol cannot exceed 1% in leave-on products." },
  { "ingredient": "Polyglutamic Acid", "recommended_max": 5.0, "optimal": 3.0, "note": "Highly effective at 3%; above 5% adds cost without benefit." }
]
```

### How to Build It (2-Step Agentic Loop)

**Step A — The Creator:**
User selects ingredients from a dropdown + assigns percentages via sliders. Percentages must total 100%. A "Generate Formula" button assembles the draft recipe and displays it as a table.

**Step B — The Safety Guardrail:**
A `validateFormula(formula)` JavaScript function loops through `safety_rules.json`:
- For each ingredient in the formula, check if its `%` exceeds `max_allowed`
- If violation found: display a red warning card with the rule text and an "Auto-Fix" button
- Auto-Fix: automatically adjusts the violating ingredient to its safe maximum, redistributes the remainder to "Water (Aqua)"
- After fixing: display a green "Compliant ✓" badge

**UI Layout:**
1. Left: Ingredient selector + percentage sliders
2. Center: Live formula table (updates as sliders move)
3. Right: Safety audit panel — shows each rule check with PASS/FAIL status

**Output — Formulation Sheet Card (printable):**
```
TRENDFORMULATE FORMULA SHEET
───────────────────────────────────
Product Name: Glass Skin Serum v1.2
Generated: [date]
Status: EU & FDA Compliant ✓

INCI Name                  %      Function
────────────────────────────────────────────
Aqua                      91.0    Base
Sodium Polyglutamate       3.0    Active – Humectant
Centella Asiatica Extract  5.0    Active – Soothing
Phenoxyethanol             1.0    Preservative [EU Annex V max: 1%]

SAFETY AUDIT LOG:
[WARN] Phenoxyethanol input: 5% → Corrected to: 1% (EU Annex V)
[OK]   All other ingredients within safe limits.
───────────────────────────────────
```

**No API needed.** All logic is pure JavaScript rule-checking. The "AI feel" comes from the animated audit log that appears line by line.

---

## Component 3 — AI TikTok Content Engine

**Owner:** 1 person | **Output:** Production-ready script + visual storyboard card

### What It Does
Takes an approved formula → generates a 30-second TikTok script with a storyboard breakdown, tailored to a brand's tone.

### How to Build It

**UI Layout:**
1. Input section: dropdown to select "approved formula" (from Component 2's output, but use a hardcoded list for independence), brand tone selector (Clean Beauty / Science-Forward / Gen Z Playful), target demographic selector
2. A "Generate Content" button
3. Output: a styled script card + a visual storyboard grid (3 frames: 0s, 15s, 30s)

**The "AI" Logic (Templated Output):**
Use a JS template function that fills in variables based on the formula and brand tone:

```javascript
function generateScript(formula, tone, demographic) {
  const hook = {
    "Clean Beauty": `POV: You finally found the ingredient your skin was BEGGING for. 🌿`,
    "Science-Forward": `Why is ${formula.hero_ingredient} outperforming niacinamide in every clinical trial right now?`,
    "Gen Z Playful": `Niacinamide who? Let me introduce you to your new holy grail ✨`
  }[tone];

  return `
[0–3s] HOOK: "${hook}"
[3–15s] SCIENCE BRIDGE: "${formula.hero_ingredient} is a ${formula.ingredient_type} 
  that works by ${formula.mechanism}. Unlike niacinamide, it doesn't trigger 
  inflammatory responses in sensitive skin types."
[15s] TRANSITION: B-roll of product texture close-up. Text on screen: "No irritation. No compromise."
[15–28s] BENEFIT STACK: "Glass skin. Dewy finish. Zero white cast."
[28–30s] CTA: "Link in bio — join the waitlist. First 100 founders get early access."
  `;
}
```

**Mock formula objects** (hardcoded, no dependency on Component 2):
```javascript
const APPROVED_FORMULAS = [
  { name: "Glass Skin Serum", hero_ingredient: "Polyglutamic Acid", ingredient_type: "polysaccharide", mechanism: "forms a moisture-locking film on the skin surface" },
  { name: "Bakuchiol Night Cream", hero_ingredient: "Bakuchiol", ingredient_type: "plant-derived retinol alternative", mechanism: "activates retinol receptors without photosensitivity" }
];
```

**Storyboard Grid UI:**
3 cards side by side, each showing:
- Frame timestamp (0s / 15s / 30s)
- Scene description text
- A color-coded overlay label (Hook / Bridge / CTA)
- Icon placeholder for video type (talking head / B-roll / product shot)

**Extra touch:** A "Copy Script" button and a "Download Storyboard PDF" button (uses `window.print()` CSS tricks — no backend needed).

---

## Component 4 — AI Waitlist Nurturing Agent (Sales Chatbot)

**Owner:** 1 person | **Output:** Functional chat interface

### What It Does
Simulates an autonomous B2B sales chatbot that qualifies inbound leads from indie beauty founders.

### How to Build It

**Pure frontend chatbot** — no API needed. Uses a **keyword-intent matching engine** in JavaScript.

**UI Layout:**
- A chat window (messages on the right = user, left = TrendFormulate AI agent)
- A text input at the bottom
- An animated typing indicator (3 dots) before responses
- Suggested quick-reply buttons that appear after certain messages

**Intent Map (the "AI brain"):**
```javascript
const INTENTS = [
  {
    keywords: ["eu", "regulation", "compliance", "lawyer", "legal"],
    response: "Great question! Our core Formulation Agent features an automated safety guardrail layer that cross-references all formulations against EU Annex V regulations in real-time — eliminating the need for upfront compliance consulting. What is your target launch market: EU, US, or both?"
  },
  {
    keywords: ["price", "cost", "pricing", "how much", "expensive"],
    response: "TrendFormulate operates on a usage-based model — you pay per formula generated, not per seat. Early waitlist founders lock in our Founder Rate. What's your estimated monthly formula volume?"
  },
  {
    keywords: ["factory", "manufacture", "production", "supplier"],
    response: "Our Ops module automatically matches your formula to certified contract manufacturers based on your speed-to-market priority, minimum order quantity, and certification level. Would you like a walkthrough of how the scoring works?"
  },
  {
    keywords: ["timeline", "launch", "when", "how long"],
    response: "From trend detection to a production-ready formula sheet, TrendFormulate compresses what takes a traditional R&D lab 3-6 months into under 48 hours. What's your target shelf date?"
  },
  {
    keywords: ["hi", "hello", "hey", "start"],
    response: "Hi! I'm Forma, TrendFormulate's AI sales agent 👋 I'm here to help you understand how our platform can get your first product to market faster. What's the biggest bottleneck in your current product development process?"
  }
];

function getResponse(input) {
  const lower = input.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some(k => lower.includes(k))) {
      return intent.response;
    }
  }
  return "That's a great point to explore. Can you tell me more about your current team size and R&D setup? That'll help me show you the most relevant part of our platform.";
}
```

**UI Features:**
- Typing animation (300ms delay before response appears)
- Quick reply chips after opener: ["Tell me about compliance", "How does pricing work?", "Show me the factory selector"]
- A lead capture form that appears after 3 exchanges: "Want a personalized demo? Leave your email."
- Session "lead score" counter (hidden from user) that increments based on specific keywords — displayed as a panel visible to the demo presenter

---

## Component 5 — AI JD Generator + Skill-Gap Analyzer

**Owner:** 1 person | **Output:** Printable Job Description card + gap analysis report

### What It Does
Detects a skill gap in the team based on what formulas the platform is generating, then writes a hyper-targeted Job Description.

### How to Build It

**UI Layout — 3 steps:**

**Step 1 — Current Team Skills:**
A set of toggle chips representing skills: `Plant Extracts`, `Peptides`, `Emulsification`, `Preservative Systems`, `Retinoids`, `Fermentation`, `SPF Chemistry`, `Regulatory Affairs`. User toggles which skills the current team has.

**Step 2 — Active Product Roadmap:**
Another set of chips representing upcoming formulas: `Peptide Serum`, `Bakuchiol Cream`, `Zinc SPF`, `Fermented Essence`. User selects what the platform is currently generating.

**Step 3 — Gap Detection + JD Generation:**
A JavaScript function compares required skills (based on selected formulas) against current team skills, identifies the delta, and generates a JD.

**Skill requirement map:**
```javascript
const FORMULA_SKILLS = {
  "Peptide Serum":       ["Peptides", "Preservative Systems"],
  "Bakuchiol Cream":     ["Plant Extracts", "Emulsification"],
  "Zinc SPF":            ["SPF Chemistry", "Regulatory Affairs"],
  "Fermented Essence":   ["Fermentation", "Plant Extracts"]
};
```

**JD Template function:**
```javascript
function generateJD(gapSkills) {
  const titles = {
    "Peptides": "Senior Macromolecular Peptide Chemist",
    "SPF Chemistry": "Regulatory Cosmetic Chemist — UV Filters",
    "Fermentation": "Biotechnology Fermentation Scientist"
  };

  const title = titles[gapSkills[0]] || "Senior Cosmetic Formulation Scientist";

  return `
JOB DESCRIPTION — ${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABOUT THE ROLE:
TrendFormulate's AI platform is now generating ${gapSkills.join(", ")}-based formulas 
at scale. We need a human expert to validate, stress-test, and iterate on 
AI-proposed formulations before production sign-off.

REQUIRED EXPERTISE:
• ${gapSkills.map(s => `Deep knowledge of ${s} chemistry and safety profiles`).join("\n• ")}
• Experience reading and interpreting EU Annex or FDA monograph regulations
• Comfortable working alongside AI-generated formula proposals

TECHNICAL VETTING QUESTIONS:
1. Walk us through your process for stabilizing a ${gapSkills[0]} compound in a water-based serum at pH 5.5.
2. What concentration thresholds do you apply when combining multiple actives to avoid antagonistic interactions?
3. How do you assess the difference between a formulation that is "safe" versus "effective" at the regulatory boundary?
4. Describe a time an AI or computational chemistry tool produced an unsafe formula recommendation — how did you catch it?
5. What preservative system would you pair with a high-water-activity serum targeting EU consumers, and why?
  `;
}
```

**UI Output:**
- The generated JD displayed in a styled card (formatted like a real job posting)
- A gap analysis bar chart (simple CSS bars — no library needed) showing covered vs. missing skills
- A "Download JD" button

---

## Component 6 — AI Unit Economics Simulator

**Owner:** 1 person | **Output:** Interactive P&L model with charts

### What It Does
Compares the cost of AI-generated formulations (API tokens) vs. traditional R&D lab costs, and models the ROI for a beauty brand.

### How to Build It

**UI Layout:**
1. Left: Input sliders (number of formulas, lab cost per test, token cost per formula, revision rounds)
2. Right: Live-updating output cards + two comparison charts

**Financial Model (pure JavaScript math):**

```javascript
function simulate(inputs) {
  const { numFormulas, labCostPerTest, tokenCostPer1k, revisionRounds } = inputs;

  // Traditional R&D
  const labCostTotal = numFormulas * labCostPerTest * revisionRounds;
  const labTimeWeeks = numFormulas * 3; // 3 weeks per formula
  const labCapex = labCostTotal + (numFormulas * 500); // materials overhead

  // TrendFormulate AI
  const tokensPerFormula = 8000; // ~8k tokens per LLM call
  const aiCostPer1kTokens = tokenCostPer1k / 1000;
  const aiCostTotal = numFormulas * tokensPerFormula * aiCostPer1kTokens;
  const aiTimeHours = numFormulas * 0.5; // 30 min per formula

  // Delta
  const savings = labCostTotal - aiCostTotal;
  const savingsPct = ((savings / labCostTotal) * 100).toFixed(1);
  const speedupFactor = (labTimeWeeks * 168) / aiTimeHours; // hours ratio

  return { labCostTotal, aiCostTotal, savings, savingsPct, speedupFactor, labTimeWeeks, aiTimeHours };
}
```

**Default slider values:**
- Number of formulas: 100
- Lab cost per test: $5,000
- Token cost per 1k tokens: $0.002 (Groq/open model pricing)
- Revision rounds: 3

**Output cards to display:**
| Metric | Traditional Lab | TrendFormulate AI |
|--------|----------------|-------------------|
| Total Cost | $1,500,000 | $4.80 |
| Time to 100 formulas | 300 weeks | 50 hours |
| CapEx saved | — | 99.9997% |
| Cash freed for manufacturing | $0 | $1,499,995 |

**Charts (use Chart.js via CDN — free):**
1. A **bar chart**: Traditional Cost vs. AI Cost (logarithmic scale to handle the 99%+ gap)
2. A **line chart**: Cumulative cost as formula count increases from 1 → 1000

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

**Investor slide mode:** A "Present Mode" button that hides the sliders and shows only the summary cards in full-screen, formatted like a pitch deck slide.

---

## Component 7 — AI Contract Manufacturer Selector

**Owner:** 1 person | **Output:** Ranked recommendation report with scoring breakdown

### What It Does
Takes a list of mock factories + user priorities → runs a weighted multi-criteria scoring algorithm → outputs a ranked recommendation.

### Mock Data (`data/factories.json`)

```json
[
  { "id": "A", "name": "GreenLab Korea", "cost_per_unit": 1.00, "delivery_days": 60, "certification": "ISO 22716 + Ecocert", "moq": 500, "region": "Asia", "cert_score": 95 },
  { "id": "B", "name": "SpeedForm EU", "cost_per_unit": 1.80, "delivery_days": 14, "certification": "EU GMP", "moq": 1000, "region": "Europe", "cert_score": 80 },
  { "id": "C", "name": "NaturaCo USA", "cost_per_unit": 2.20, "delivery_days": 21, "certification": "FDA Registered + Leaping Bunny", "moq": 300, "region": "North America", "cert_score": 90 },
  { "id": "D", "name": "ChemBase India", "cost_per_unit": 0.60, "delivery_days": 90, "certification": "Basic GMP", "moq": 5000, "region": "Asia", "cert_score": 55 }
]
```

### How to Build It

**UI Layout — 3 panels:**

**Panel 1 — Priority Sliders:**
Three sliders (each 0–100, total capped at 100 via auto-normalization):
- Speed to Market weight
- Cost weight
- Certification weight

**Panel 2 — Formula Context (simulated input):**
A dropdown: "My formula is: [Glass Skin Serum / Bakuchiol Cream / Zinc SPF]"
A checkbox: "I need EU compliance"
A text field: "Target launch date" (affects speed weight)

**Panel 3 — Ranked Results:**

**Scoring algorithm (JavaScript):**
```javascript
function scoreFactories(factories, weights) {
  // Normalize weights to sum to 1
  const total = weights.speed + weights.cost + weights.cert;
  const w = { speed: weights.speed/total, cost: weights.cost/total, cert: weights.cert/total };

  // Normalize each metric to 0-100 scale
  const maxDelivery = Math.max(...factories.map(f => f.delivery_days));
  const maxCost = Math.max(...factories.map(f => f.cost_per_unit));

  return factories.map(factory => {
    const speedScore = (1 - factory.delivery_days / maxDelivery) * 100;
    const costScore  = (1 - factory.cost_per_unit / maxCost) * 100;
    const certScore  = factory.cert_score;

    const totalScore = (speedScore * w.speed) + (costScore * w.cost) + (certScore * w.cert);

    return { ...factory, speedScore, costScore, certScore, totalScore: totalScore.toFixed(1) };
  }).sort((a, b) => b.totalScore - a.totalScore);
}
```

**Results display:**
- Ranked cards (#1, #2, #3, #4) with a medal icon for the top pick
- Each card shows a mini bar chart of the 3 score components
- The top card has a special "RECOMMENDED" banner and a written rationale:

```
RECOMMENDATION: SpeedForm EU (#1 with score 84.2)

Despite a 80% higher unit cost than GreenLab Korea, SpeedForm EU is the 
optimal choice for your fast summer trend launch. With delivery in 14 days 
vs. 60 days for the next option, and full EU GMP certification matching 
your target market, it delivers on your two highest priorities: Speed (50%) 
and Certification (30%).

Estimated launch date: [today + 14 days]
Estimated unit cost at 1,000 MOQ: $1,800
```

- A "Download Report" button that generates a formatted HTML print view

---

## The Central Dashboard (`index.html`)

The main OS interface that ties all 7 components together. Think of it as a SaaS app homescreen.

**UI Design:**
- Top navbar with TrendFormulate logo + "OS v1.0" label
- A "Trend Alert" banner at the top: "🔥 Trending now: Glass Skin Alternatives (+340% search volume this week)"
- 7 department cards in a bento grid layout, each showing:
  - Department name + icon
  - Status badge (Active / Ready / In Progress)
  - A 1-line summary of the latest output (hardcoded mock)
  - A "Launch" button linking to the component page

**Example card:**
```
┌──────────────────────────────┐
│ 🧪 R&D Formulation           │
│ Status: ● Active             │
│ Latest: Glass Skin Serum v1.2│
│ Safety: EU Compliant ✓       │
│                 [Launch →]   │
└──────────────────────────────┘
```

**Animated elements for demo feel:**
- A live "formulas generated today" counter that ticks up every 3 seconds
- A scrolling news ticker at the bottom: "TikTok trend detected: Bakuchiol | New factory certified: GreenLab Korea | Formula #1,247 generated"

---

## Implementation Priority Order

If the team has 1 week, build in this order:

1. **Day 1:** Set up shared CSS + folder structure. All 7 people agree on color scheme and card style.
2. **Days 2–3:** Each person builds their component page independently using mock data.
3. **Day 4:** Integration — link all components from the dashboard. Fix any style inconsistencies.
4. **Day 5:** Add polish — animations, export buttons, demo flow.
5. **Day 6:** Dry run the full demo. Identify any broken states. Fix.
6. **Day 7:** Buffer / presentation prep.

## Free Tools & Libraries (No Paid APIs)

| Purpose | Tool | CDN/Link |
|---------|------|----------|
| Charts | Chart.js | `cdn.jsdelivr.net/npm/chart.js` |
| Icons | Lucide Icons | `unpkg.com/lucide@latest` |
| Fonts | Google Fonts Inter + Instrument Serif | fonts.googleapis.com |
| Free LLM (optional) | Groq API | `console.groq.com` — free tier, no card |
| Local LLM (optional) | Ollama + llama3 | `ollama.ai` — fully offline |
| Print/PDF export | `window.print()` with `@media print` CSS | built-in |
| JSON export | `Blob` + `URL.createObjectURL` | built-in |

---

## Demo Script (For Presentation Day)

Follow this exact narrative arc:

1. Open `index.html` — "This is the TrendFormulate OS. Every department runs on AI."
2. Point to the trend alert banner — "Our system detected Glass Skin trending +340% this week."
3. Click Component 1 — "First, our Sentiment Engine extracts what customers actually want."
4. Click Component 2 — "Then our Formulation Agent proposes a formula — and self-corrects for safety."
5. Click Component 3 — "Simultaneously, the Marketing Engine creates a ready-to-film TikTok script."
6. Click Component 6 — "The CFO view: this entire R&D pipeline cost $4.80. A lab would cost $1.5M."
7. Click Component 7 — "Finally, we pick the right factory automatically based on launch priority."
8. Click Component 4 — "And while all this runs, our Sales Agent is qualifying inbound leads 24/7."
9. Close on the dashboard — "This is how a 3-person indie beauty brand can compete with L'Oréal."

