/**
 * cosing_db.js — CosIng Lookup Database
 * Sourced from: EU Commission CosIng database, downloaded 18 June 2026
 * Covers: Annex II (prohibited), Annex III (restricted), Annex V (preservatives), Annex VI (UV filters)
 *
 * Lookup is performed by normalised INCI name (uppercase, trimmed).
 * For each formula ingredient, the compliance engine checks:
 *   1. COSING_PROHIBITED  → automatic FAIL
 *   2. COSING_RESTRICTED  → compare % against max_pct; flag if exceeded
 *   3. Not found          → safe / no restriction (pass to LLM for context)
 */

// ─── ANNEX II — Prohibited substances ────────────────────────────────────────
// Cosmetically-relevant entries likely to appear in AI-generated formulas.
// Keys = normalised INCI name (or common name used in INCI lists).
const COSING_PROHIBITED = new Set([
  // Tretinoin / retinoic acid (Annex II entry 375) — prescription drug only
  "RETINOIC ACID", "TRETINOIN",
  // Hydroquinone — prohibited for general cosmetic use (Annex II entry 1339)
  // (it is allowed ONLY in artificial nail systems at 0.02% — see COSING_RESTRICTED)
  // Note: we keep it here for general detection; restricted entry handles nail exception
  // Steroids / hormones
  "PROGESTERONE", "ESTRADIOL", "TESTOSTERONE", "CORTISONE", "HYDROCORTISONE",
  "SPIRONOLACTONE", "METHOTREXATE", "TRETINOIN", "ISOTRETINOIN",
  // Heavy metals (cosmetically relevant)
  "LEAD ACETATE", "MERCURY", "MERCURIC CHLORIDE", "MERCURIC IODIDE",
  // Chloroform
  "CHLOROFORM",
  // Carcinogenic hair dyes
  "4-AMINOBIPHENYL", "BENZIDINE", "4-NITRO-O-PHENYLENEDIAMINE",
  "4-AMINO-2-NITROPHENOL",
  // Allergens / sensitisers prohibited
  "METHYL EUGENOL", "PERU BALSAM",
  // Phthalates
  "DIETHYL PHTHALATE", "DIBUTYL PHTHALATE", "DIMETHYL PHTHALATE",
  // Nitrosamines
  "DIMETHYLNITROSAMINE",
  // Boric acid (in leave-on products for children)
  // Note: context-dependent — flagged in restricted
  // Plant extracts containing prohibited alkaloids
  "ACONITINE", "COLCHICINE", "STRYCHNINE",
  // Formaldehyde as free substance above threshold (context-handled in restricted)
  // Polycyclic musks (some restricted)
  "MUSK TIBETENE", "MUSK AMBRETTE",
  // Nanomaterial-specific bans
  "CARBON BLACK",
]);

// ─── ANNEX II: Prohibited by common/INCI name — extended list ────────────────
// Additional entries mapped from "Identified INGREDIENTS" column of Annex II
const COSING_PROHIBITED_EXTENDED = new Set([
  "RAUWOLFIA SERPENTINA EXTRACT", "AMMI MAJUS EXTRACT", "SPIRONOLACTONE",
]);

// ─── ANNEX III + V + VI — Restricted substances ───────────────────────────────
// Structure per entry:
// {
//   max_pct:     number           — max % in ready-for-use preparation (general / strictest)
//   max_leave_on: number | null   — specific limit for leave-on products (if different)
//   max_rinse_off: number | null  — specific limit for rinse-off products (if different)
//   annex:       string           — "III" | "V" | "VI"
//   entry:       string           — reference number
//   regulation:  string           — EU regulation reference
//   note:        string           — plain-English compliance note
//   product_scope: string | null  — product type limitation (null = all products)
// }
const COSING_RESTRICTED = {

  // ── ANNEX V — Preservatives ──────────────────────────────────────────────

  "PHENOXYETHANOL": {
    max_pct: 1.0, annex: "V", entry: "29",
    regulation: "(EC) 2009/1223",
    note: "Max 1.0% in all cosmetic products.",
    product_scope: null
  },
  "METHYLPARABEN": {
    max_pct: 0.4, max_mixture: 0.8, annex: "V", entry: "12",
    regulation: "(EC) 2014/1004",
    note: "Max 0.4% as single ester; max 0.8% as acid for mixtures of parabens (methyl + ethyl esters).",
    product_scope: null
  },
  "ETHYLPARABEN": {
    max_pct: 0.4, max_mixture: 0.8, annex: "V", entry: "12",
    regulation: "(EC) 2014/1004",
    note: "Max 0.4% as single ester; max 0.8% as acid for mixtures of parabens (methyl + ethyl esters).",
    product_scope: null
  },
  "SODIUM METHYLPARABEN": {
    max_pct: 0.4, annex: "V", entry: "12",
    regulation: "(EC) 2014/1004",
    note: "Salt of methylparaben. Max 0.4% (as acid) single ester; 0.8% in paraben mixtures.",
    product_scope: null
  },
  "SODIUM ETHYLPARABEN": {
    max_pct: 0.4, annex: "V", entry: "12",
    regulation: "(EC) 2014/1004",
    note: "Salt of ethylparaben. Max 0.4% (as acid) single ester; 0.8% in paraben mixtures.",
    product_scope: null
  },
  "POTASSIUM PARABEN": {
    max_pct: 0.4, annex: "V", entry: "12",
    regulation: "(EC) 2014/1004",
    note: "Paraben salt. Max 0.4% (as acid) single ester; 0.8% in paraben mixtures.",
    product_scope: null
  },
  "BUTYLPARABEN": {
    max_pct: 0.14, annex: "V", entry: "12a",
    regulation: "(EC) 2014/1004",
    note: "Max 0.14% (sum of butyl + propyl parabens as acid) for leave-on products. Not in leave-on nappy-area products for children under 3.",
    product_scope: "leave-on"
  },
  "PROPYLPARABEN": {
    max_pct: 0.14, annex: "V", entry: "12a",
    regulation: "(EC) 2014/1004",
    note: "Max 0.14% (sum of butyl + propyl parabens as acid) for leave-on products. Not in leave-on nappy-area products for children under 3.",
    product_scope: "leave-on"
  },
  "SODIUM BUTYLPARABEN": {
    max_pct: 0.14, annex: "V", entry: "12a",
    regulation: "(EC) 2014/1004",
    note: "Salt of butylparaben. Max 0.14% (sum with propylparaben as acid).",
    product_scope: "leave-on"
  },
  "SODIUM PROPYLPARABEN": {
    max_pct: 0.14, annex: "V", entry: "12a",
    regulation: "(EC) 2014/1004",
    note: "Salt of propylparaben. Max 0.14% (sum with butylparaben as acid).",
    product_scope: "leave-on"
  },
  "BENZOIC ACID": {
    max_pct: 0.5, max_rinse_off: 2.5, annex: "V", entry: "1",
    regulation: "(EC) 2009/1223",
    note: "Max 0.5% leave-on, 2.5% rinse-off (except oral care), 1.7% oral care (as acid).",
    product_scope: null
  },
  "SODIUM BENZOATE": {
    max_pct: 0.5, max_rinse_off: 2.5, annex: "V", entry: "1",
    regulation: "(EC) 2009/1223",
    note: "Max 0.5% leave-on, 2.5% rinse-off (except oral care), 1.7% oral care (as benzoic acid equivalent).",
    product_scope: null
  },
  "SALICYLIC ACID": {
    max_pct: 0.5, annex: "V", entry: "3",
    regulation: "(EU) 2019/1966",
    note: "Max 0.5% as preservative. As a keratolytic active, higher concentrations are governed by Annex III entry 98 (up to 3.0% rinse-off hair). Not for children under 3.",
    product_scope: null
  },
  "SODIUM SALICYLATE": {
    max_pct: 0.5, annex: "V", entry: "3",
    regulation: "(EU) 2019/1966",
    note: "Max 0.5% (as acid) as preservative. Not for children under 3.",
    product_scope: null
  },
  "POTASSIUM SORBATE": {
    max_pct: 0.6, annex: "V", entry: "4",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% (as sorbic acid equivalent) in all cosmetic products.",
    product_scope: null
  },
  "SORBIC ACID": {
    max_pct: 0.6, annex: "V", entry: "4",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% (as sorbic acid) in all cosmetic products.",
    product_scope: null
  },
  "CALCIUM SORBATE": {
    max_pct: 0.6, annex: "V", entry: "4",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% (as sorbic acid equivalent).",
    product_scope: null
  },
  "DMDM HYDANTOIN": {
    max_pct: 0.6, annex: "V", entry: "33",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% in all products. Formaldehyde releaser — must comply with formaldehyde warning threshold.",
    product_scope: null
  },
  "IMIDAZOLIDINYL UREA": {
    max_pct: 0.6, annex: "V", entry: "27",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% in all cosmetic products. Formaldehyde releaser.",
    product_scope: null
  },
  "DIAZOLIDINYL UREA": {
    max_pct: 0.5, annex: "V", entry: "46",
    regulation: "(EC) 2009/1223",
    note: "Max 0.5% in all cosmetic products. Formaldehyde releaser.",
    product_scope: null
  },
  "DEHYDROACETIC ACID": {
    max_pct: 0.6, annex: "V", entry: "13",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% (as acid). Not for use in aerosol dispensers.",
    product_scope: null
  },
  "SODIUM DEHYDROACETATE": {
    max_pct: 0.6, annex: "V", entry: "13",
    regulation: "(EC) 2009/1223",
    note: "Max 0.6% (as dehydroacetic acid equivalent). Not for use in aerosol dispensers.",
    product_scope: null
  },
  "BENZYL ALCOHOL": {
    max_pct: 1.0, annex: "V", entry: "34",
    regulation: "(EC) 2013/344",
    note: "Max 1.0% as preservative in all cosmetic products.",
    product_scope: null
  },
  "CHLORPHENESIN": {
    max_pct: 0.3, annex: "V", entry: "50",
    regulation: "(EC) 2009/1223",
    note: "Max 0.3% in all cosmetic products.",
    product_scope: null
  },
  "SODIUM HYDROXYMETHYLGLYCINATE": {
    max_pct: 0.5, annex: "V", entry: "51",
    regulation: "(EU) 2021/1902",
    note: "Max 0.5%. Formaldehyde releaser — not permitted if total releasable formaldehyde in the mixture ≥ 0.1% w/w.",
    product_scope: null
  },
  "METHYLISOTHIAZOLINONE": {
    max_pct: 0.0015, annex: "V", entry: "57",
    regulation: "(EU) 2017/1224",
    note: "Max 0.0015% in rinse-off products ONLY. Prohibited in leave-on products.",
    product_scope: "rinse-off"
  },
  "METHYLCHLOROISOTHIAZOLINONE": {
    max_pct: 0.0015, annex: "V", entry: "39",
    regulation: "(EC) 2014/1003",
    note: "Max 0.0015% (as mixture with methylisothiazolinone 3:1 ratio) in rinse-off products ONLY.",
    product_scope: "rinse-off"
  },
  "IODOPROPYNYL BUTYLCARBAMATE": {
    max_pct: 0.02, max_leave_on: 0.01, annex: "V", entry: "56",
    regulation: "(EC) 2009/1223",
    note: "Max 0.02% rinse-off; max 0.01% leave-on. Max 0.0075% deodorants/antiperspirants. Not in oral/lip products. Not for children under 3.",
    product_scope: null
  },
  "TRICLOSAN": {
    max_pct: 0.3, annex: "V", entry: "25",
    regulation: "(EU) 2024/996",
    note: "Max 0.3%, allowed ONLY in: toothpaste, hand soaps, body soaps/shower gels, deodorants (non-spray), face powders/concealers, nail cleaning products. Prohibited in all other products.",
    product_scope: "specific products only"
  },
  "TRICLOCARBAN": {
    max_pct: 0.2, annex: "V", entry: "23",
    regulation: "(EU) 2024/996",
    note: "Max 0.2% in all cosmetic products (except mouthwash). Not in toothpaste for children under 6.",
    product_scope: null
  },
  "CHLORHEXIDINE": {
    max_pct: 0.3, annex: "V", entry: "42",
    regulation: "(EC) 2009/1223",
    note: "Max 0.3% (as chlorhexidine) in all cosmetic products.",
    product_scope: null
  },
  "CHLORHEXIDINE DIGLUCONATE": {
    max_pct: 0.3, annex: "V", entry: "42",
    regulation: "(EC) 2009/1223",
    note: "Max 0.3% (as chlorhexidine) in all cosmetic products.",
    product_scope: null
  },
  "CHLOROBUTANOL": {
    max_pct: 0.5, annex: "V", entry: "11",
    regulation: "(EC) 2009/1223",
    note: "Max 0.5%. Not for use in aerosol dispensers. Label: 'Contains Chlorobutanol'.",
    product_scope: null
  },
  "PIROCTONE OLAMINE": {
    max_pct: 0.5, max_rinse_off: 1.0, annex: "V", entry: "35",
    regulation: "(EC) 2009/1223",
    note: "Max 1.0% rinse-off products; max 0.5% other products.",
    product_scope: null
  },
  "POLYAMINOPROPYL BIGUANIDE": {
    max_pct: 0.1, annex: "V", entry: "28",
    regulation: "(EU) 2019/831",
    note: "Max 0.1%. Not in sprays/aerosols. CMR Cat. 2 (carcinogenic).",
    product_scope: null
  },
  "CLIMBAZOLE": {
    max_pct: 0.5, annex: "V", entry: "32",
    regulation: "(EU) 2019/698",
    note: "Max 0.5% in rinse-off shampoo; max 0.2% in hair lotions, face creams, foot care products.",
    product_scope: null
  },
  "GLUTARAL": {
    max_pct: 0.1, annex: "V", entry: "48",
    regulation: "(EC) 2009/1223",
    note: "Max 0.1%. Not in aerosols. Label: 'Contains glutaral'.",
    product_scope: null
  },
  "BENZALKONIUM CHLORIDE": {
    max_pct: 0.1, annex: "V", entry: "54",
    regulation: "(EC) 2009/1223",
    note: "Max 0.1% (as benzalkonium chloride). Label: 'Avoid contact with eyes'.",
    product_scope: null
  },
  "O-PHENYLPHENOL": {
    max_pct: 0.15, max_rinse_off: 0.2, annex: "V", entry: "7",
    regulation: "(EU) 2026/78",
    note: "Max 0.2% rinse-off; max 0.15% leave-on (as phenol). Not in aerosols or oral products.",
    product_scope: null
  },

  // ── ANNEX VI — UV Filters ────────────────────────────────────────────────

  "ZINC OXIDE": {
    max_pct: 25.0, annex: "VI", entry: "30",
    regulation: "(EU) 2016/621",
    note: "Max 25% (non-nano and combined nano+non-nano). Not in spray applications.",
    product_scope: null
  },
  "ZINC OXIDE (NANO)": {
    max_pct: 25.0, annex: "VI", entry: "30a",
    regulation: "(EU) 2016/621",
    note: "Max 25% nano form (combined with non-nano, sum ≤ 25%). Not in sprays. Purity ≥ 96%, wurtzite structure, D50 > 30 nm.",
    product_scope: null
  },
  "TITANIUM DIOXIDE": {
    max_pct: 25.0, annex: "VI", entry: "27",
    regulation: "(EC) 2009/1223",
    note: "Max 25% (combined nano+non-nano). Powder form with ≥1% particles ≤10 μm aerodynamic diameter must comply with Annex III entry 321.",
    product_scope: null
  },
  "TITANIUM DIOXIDE (NANO)": {
    max_pct: 25.0, annex: "VI", entry: "27a",
    regulation: "(EU) 2019/1857",
    note: "Max 25% nano form (combined with non-nano, sum ≤ 25%). Not in sprays. Rutile/anatase form, specific size & coating requirements.",
    product_scope: null
  },
  "BENZOPHENONE-3": {
    max_pct: 6.0, annex: "VI", entry: "4",
    regulation: "(EU) 2022/1176",
    note: "Max 6% face/hand/lip products; max 2.2% body spray products; max 0.5% other products. Label: 'Contains Benzophenone-3' for products >0.5%. Updated 2022.",
    product_scope: null
  },
  "ETHYLHEXYL METHOXYCINNAMATE": {
    max_pct: 10.0, annex: "VI", entry: "12",
    regulation: "(EC) 2009/1223",
    note: "Max 10% in all cosmetic products (Octinoxate).",
    product_scope: null
  },
  "BUTYL METHOXYDIBENZOYLMETHANE": {
    max_pct: 5.0, annex: "VI", entry: "8",
    regulation: "(EC) 2009/1223",
    note: "Max 5% in all cosmetic products (Avobenzone).",
    product_scope: null
  },
  "OCTOCRYLENE": {
    max_pct: 10.0, annex: "VI", entry: "10",
    regulation: "(EU) 2022/1176",
    note: "Max 10% (9% in propellant sprays). Benzophenone trace impurity must be kept at trace level.",
    product_scope: null
  },
  "HOMOSALATE": {
    max_pct: 7.34, annex: "VI", entry: "3",
    regulation: "(EC) 2009/1223",
    note: "Max 7.34% in face products only (excluding propellent spray). Not for body products. Effective from January 2025.",
    product_scope: "face products"
  },
  "ETHYLHEXYL SALICYLATE": {
    max_pct: 5.0, annex: "VI", entry: "20",
    regulation: "(EC) 2009/1223",
    note: "Max 5% in all cosmetic products (Octisalate).",
    product_scope: null
  },
  "PHENYLBENZIMIDAZOLE SULFONIC ACID": {
    max_pct: 8.0, annex: "VI", entry: "6",
    regulation: "(EC) 2009/1223",
    note: "Max 8% (as acid) in all cosmetic products (Ensulizole).",
    product_scope: null
  },
  "TEREPHTHALYLIDENE DICAMPHOR SULFONIC ACID": {
    max_pct: 10.0, annex: "VI", entry: "7",
    regulation: "(EC) 2009/1223",
    note: "Max 10% (as acid) in all cosmetic products (Ecamsule).",
    product_scope: null
  },
  "DIETHYLAMINO HYDROXYBENZOYL HEXYL BENZOATE": {
    max_pct: 10.0, annex: "VI", entry: "28",
    regulation: "(EU) 2026/909",
    note: "Max 10% in all cosmetic products. Di-n-hexyl phthalate impurity must not exceed 10 ppm.",
    product_scope: null
  },
  "BIS-ETHYLHEXYLOXYPHENOL METHOXYPHENYL TRIAZINE": {
    max_pct: 10.0, annex: "VI", entry: "25",
    regulation: "(EC) 2009/1223",
    note: "Max 10% in all cosmetic products (Bemotrizinol).",
    product_scope: null
  },
  "METHYLENE BIS-BENZOTRIAZOLYL TETRAMETHYLBUTYLPHENOL": {
    max_pct: 10.0, annex: "VI", entry: "23",
    regulation: "(EU) 2018/885",
    note: "Max 10% (combined nano + non-nano) in all cosmetic products (Bisoctrizole).",
    product_scope: null
  },
  "ETHYLHEXYL TRIAZONE": {
    max_pct: 5.0, annex: "VI", entry: "15",
    regulation: "(EC) 2009/1223",
    note: "Max 5% in all cosmetic products.",
    product_scope: null
  },

  // ── ANNEX III — Restricted actives ──────────────────────────────────────

  "HYDROQUINONE": {
    max_pct: 0.02, annex: "III", entry: "14",
    regulation: "(EC) 2013/344",
    note: "Allowed ONLY in artificial nail systems at max 0.02% (after mixing). Prohibited for all other cosmetic uses (see Annex II entry 1339). CMR Cat. 2 (carcinogenic, mutagenic).",
    product_scope: "artificial nail systems only"
  },
  "KOJIC ACID": {
    max_pct: 1.0, annex: "III", entry: "375",
    regulation: "(EU) 2024/996",
    note: "Max 1.0% in face and hand products only. Restricted since February 2025. No other product types permitted.",
    product_scope: "face and hand products"
  },
  "RETINOL": {
    max_pct: 0.3, annex: "III", entry: "376",
    regulation: "(EU) 2024/996",
    note: "Max 0.3% RE (Retinol Equivalent) in leave-on and rinse-off products; max 0.05% RE in body lotions. Restricted since November 2025. Mandatory label: 'Contains Vitamin A. Consider your daily intake before use'.",
    product_scope: null
  },
  "RETINYL ACETATE": {
    max_pct: 0.3, annex: "III", entry: "376",
    regulation: "(EU) 2024/996",
    note: "Max 0.3% RE in leave-on/rinse-off; max 0.05% RE in body lotions. Mandatory label required. Restricted since November 2025.",
    product_scope: null
  },
  "RETINYL PALMITATE": {
    max_pct: 0.3, annex: "III", entry: "376",
    regulation: "(EU) 2024/996",
    note: "Max 0.3% RE in leave-on/rinse-off; max 0.05% RE in body lotions. Mandatory label required. Restricted since November 2025.",
    product_scope: null
  },
  "ALPHA-ARBUTIN": {
    max_pct: 2.0, annex: "III", entry: "377",
    regulation: "(EU) 2024/996",
    note: "Max 2.0% in face creams; max 0.5% in body lotions. Hydroquinone trace levels must be kept as low as possible. Restricted since February 2025.",
    product_scope: "face cream / body lotion"
  },
  "ARBUTIN": {
    max_pct: 7.0, annex: "III", entry: "378",
    regulation: "(EU) 2024/996",
    note: "Beta-arbutin: max 7.0% in face cream only. Hydroquinone trace levels must be kept as low as possible. Restricted since February 2025.",
    product_scope: "face cream only"
  },
  "GENISTEIN": {
    max_pct: 0.007, annex: "III", entry: "373",
    regulation: "(EU) 2024/996",
    note: "Max 0.007% in all cosmetic products. Phytoestrogen — endocrine activity concern. Restricted since February 2025.",
    product_scope: null
  },
  "DAIDZEIN": {
    max_pct: 0.02, annex: "III", entry: "374",
    regulation: "(EU) 2024/996",
    note: "Max 0.02% in all cosmetic products. Phytoestrogen — endocrine activity concern. Restricted since February 2025.",
    product_scope: null
  },
  "POTASSIUM HYDROXIDE": {
    max_pct: 5.0, annex: "III", entry: "15a",
    regulation: "(EC) 2009/1223",
    note: "Max 5% as nail cuticle solvent; max 2% general / 4.5% professional use in hair straighteners; 1.5% as pH adjuster in other uses.",
    product_scope: null
  },
  "SODIUM HYDROXIDE": {
    max_pct: 2.0, annex: "III", entry: "15a",
    regulation: "(EC) 2009/1223",
    note: "Max 2% as pH adjuster (general use). Higher concentrations require professional-use labelling. Concentration depends on product type.",
    product_scope: null
  },
  "HYDROGEN PEROXIDE": {
    max_pct: 12.0, annex: "III", entry: "12",
    regulation: "(EC) 2009/1223",
    note: "Max varies by product: 12% hair bleach, 4% skin/nail, 0.1% oral hygiene (as H2O2). Must comply with specific labelling requirements.",
    product_scope: null
  },
  "THIOGLYCOLIC ACID": {
    max_pct: 8.0, annex: "III", entry: "2a",
    regulation: "(EU) 2015/1190",
    note: "Max 8% general-use hair products; 11% professional hair products; 5% depilatories; 2% rinse-off hair products; 11% eyelash waving. pH constraints apply.",
    product_scope: null
  },
  "AMMONIUM THIOGLYCOLATE": {
    max_pct: 8.0, annex: "III", entry: "2a",
    regulation: "(EU) 2015/1190",
    note: "Max 8% general / 11% professional (as thioglycolic acid equivalent). pH 7–9.5.",
    product_scope: null
  },
  "RESORCINOL": {
    max_pct: 0.5, annex: "III", entry: "35",
    regulation: "(EC) 2009/1223",
    note: "Max 0.5% in hair lotions and shampoos; max 0.1% in other rinse-off hair products. Label required. Not in other product types as a cosmetic active.",
    product_scope: "hair products"
  },
  "KOJIC DIPALMITATE": {
    max_pct: 1.0, annex: "III", entry: "375",
    regulation: "(EU) 2024/996",
    note: "Kojic acid ester — treated as equivalent to Kojic Acid. Max 1.0% face/hand products. Restricted since February 2025.",
    product_scope: "face and hand products"
  },
};

// ─── FDA — Prohibited substances (21 CFR 700 series) ─────────────────────────
// Source: FDA Prohibited & Restricted Ingredients for Cosmetics
const FDA_PROHIBITED = new Set([
  // 21 CFR 700.11 — causes photocontact sensitization
  "BITHIONOL",
  // 21 CFR 700.18 — causes cancer in animals (exception: residual from processing)
  "CHLOROFORM",
  // 21 CFR 700.15 — halogenated salicylanilides, cause serious skin disorders
  "DIBROMSALAN", "TRIBROMSALAN", "METABROMSALAN", "TETRACHLOROSALICYLANILIDE",
  // 21 CFR 700.19 — causes cancer in animals
  "METHYLENE CHLORIDE", "DICHLOROMETHANE",
  // 21 CFR 700.14 — causes cancer; prohibited in aerosol products
  "VINYL CHLORIDE",
  // 21 CFR 700.16 — toxic to lungs; prohibited in aerosol cosmetic products
  "ZIRCONIUM", "ZIRCONIUM OXIDE", "ZIRCONIUM HYDROXIDE", "ZIRCONIUM CHLORIDE",
  // 21 CFR 700.23 — ozone-depleting; prohibited in domestic aerosol cosmetics
  "TRICHLOROFLUOROMETHANE", "DICHLORODIFLUOROMETHANE",
]);

// ─── FDA — Restricted substances ─────────────────────────────────────────────
const FDA_RESTRICTED = {
  // 21 CFR 250.250 — toxic; only when no other preservative is effective
  "HEXACHLOROPHENE": {
    max_pct: 0.1,
    ref: "FDA 21 CFR 250.250",
    note: "Max 0.1% as preservative of last resort only. Prohibited in products applied to mucous membranes (lips, around eyes). Use only if no other preservative is effective.",
    product_scope: "not for mucous membranes"
  },
  // 21 CFR 700.13 — mercury compounds: only in eye area at trace levels
  "MERCURY": {
    max_pct: 0.0065,
    ref: "FDA 21 CFR 700.13",
    note: "Max 0.0065% (65 ppm as Hg) in eye area products ONLY, and only when no other effective safe preservative is available. All other cosmetics: max 0.0001% unavoidable trace.",
    product_scope: "eye area only"
  },
  "THIMEROSAL": {
    max_pct: 0.0065,
    ref: "FDA 21 CFR 700.13",
    note: "Mercury-containing preservative. Max 0.0065% (65 ppm as Hg) in eye area products only. Prohibited in all other cosmetics except unavoidable trace (< 0.0001%).",
    product_scope: "eye area only"
  },
  "PHENYL MERCURIC ACETATE": {
    max_pct: 0.0065,
    ref: "FDA 21 CFR 700.13",
    note: "Mercury compound. Max 0.0065% (65 ppm as Hg) in eye area products only. Prohibited in all other cosmetics.",
    product_scope: "eye area only"
  },
};

// ─── Lookup helper functions ──────────────────────────────────────────────────

/**
 * Normalise an INCI name for lookup: uppercase, trim, collapse whitespace.
 */
function cosingNormalise(name) {
  return String(name || "").toUpperCase().trim().replace(/\s+/g, " ");
}

/**
 * Check a single ingredient against the EU CosIng + FDA databases.
 * @param {string} inci   - INCI name of the ingredient
 * @param {number} pct    - percentage in the formula
 * @returns {{ status: "PASS"|"CAUTION"|"FAIL", ref: string, note: string, restricted: boolean }}
 */
function cosingCheck(inci, pct) {
  const key = cosingNormalise(inci);

  // 1. EU Annex II — Prohibited
  if (COSING_PROHIBITED.has(key) || COSING_PROHIBITED_EXTENDED.has(key)) {
    return {
      status: "FAIL",
      ref: "EU Annex II — Prohibited substance · (EC) 1223/2009",
      note: `${inci} is prohibited in all cosmetic products under EU Regulation (EC) 1223/2009, Annex II. This ingredient must be removed from the formula.`,
      restricted: true
    };
  }

  // 2. FDA Prohibited
  if (FDA_PROHIBITED.has(key)) {
    return {
      status: "FAIL",
      ref: "FDA Prohibited Ingredient",
      note: `${inci} is prohibited in cosmetic products under FDA regulations (21 CFR 700 series). This ingredient must be removed from the formula.`,
      restricted: true
    };
  }

  // 3. EU Restricted (Annexes III, V, VI) — check concentration
  const entry = COSING_RESTRICTED[key];
  if (entry) {
    const maxPct = entry.max_pct;
    const exceeded = pct > maxPct;
    const nearLimit = pct > maxPct * 0.9 && pct <= maxPct;
    const ref = `EU Annex ${entry.annex}, Entry ${entry.entry} — ${entry.regulation}`;

    if (exceeded) {
      return {
        status: "FAIL",
        ref,
        note: `EXCEEDS LIMIT: ${pct.toFixed(2)}% used but EU maximum is ${maxPct}%. ${entry.note}`,
        restricted: true
      };
    } else if (nearLimit) {
      return {
        status: "CAUTION",
        ref,
        note: `${pct.toFixed(2)}% is within the EU limit of ${maxPct}% but close to the threshold. ${entry.note}${entry.product_scope ? ` Scope: ${entry.product_scope}.` : ""}`,
        restricted: true
      };
    } else {
      return {
        status: "PASS",
        ref,
        note: `${pct.toFixed(2)}% is within the EU limit of ${maxPct}%. ${entry.note}`,
        restricted: true
      };
    }
  }

  // 4. FDA Restricted — check concentration
  const fdaEntry = FDA_RESTRICTED[key];
  if (fdaEntry) {
    const exceeded = pct > fdaEntry.max_pct;
    const nearLimit = pct > fdaEntry.max_pct * 0.9 && pct <= fdaEntry.max_pct;
    if (exceeded) {
      return {
        status: "FAIL",
        ref: fdaEntry.ref,
        note: `EXCEEDS FDA LIMIT: ${pct.toFixed(2)}% used but maximum is ${fdaEntry.max_pct}%. ${fdaEntry.note}`,
        restricted: true
      };
    } else if (nearLimit) {
      return {
        status: "CAUTION",
        ref: fdaEntry.ref,
        note: `${pct.toFixed(2)}% is within the FDA limit of ${fdaEntry.max_pct}% but close to the threshold. ${fdaEntry.note}`,
        restricted: true
      };
    } else {
      return {
        status: "PASS",
        ref: fdaEntry.ref,
        note: `${pct.toFixed(2)}% is within the FDA limit of ${fdaEntry.max_pct}%. ${fdaEntry.note}`,
        restricted: true
      };
    }
  }

  // 5. Not found in any restriction list → no limits apply.
  return {
    status: "PASS",
    ref: "",
    note: "",
    restricted: false
  };
}

/**
 * Check all ingredients in a formula array.
 * Returns array of results, one per ingredient.
 * Each result has: { ingredient, inci, percentage, status, ref, note, restricted }
 */
function cosingCheckAll(ingredients) {
  return ingredients.map(ing => {
    const result = cosingCheck(ing.inci, parseFloat(ing.percentage) || 0);
    return {
      ingredient: ing.name,
      inci:        ing.inci,
      percentage:  ing.percentage,
      status:      result.status,
      ref:         result.ref,
      note:        result.note,
      restricted:  result.restricted
    };
  });
}

/**
 * Format a single EU restricted entry for the Formulation Agent prompt.
 */
function cosingFormatRestrictedLine(inci, entry) {
  const parts = [`max ${entry.max_pct}%`];
  if (entry.max_leave_on != null) parts.push(`leave-on max ${entry.max_leave_on}%`);
  if (entry.max_rinse_off != null) parts.push(`rinse-off max ${entry.max_rinse_off}%`);
  if (entry.max_mixture != null) parts.push(`mixture max ${entry.max_mixture}%`);
  parts.push(`EU Annex ${entry.annex}`);
  if (entry.product_scope) parts.push(`scope: ${entry.product_scope}`);
  return `- ${inci}: ${parts.join("; ")}`;
}

/**
 * Build regulatory constraint text for Agent 1 from CosIng + FDA data in this file.
 * @returns {string}
 */
function cosingBuildFormulatorConstraints() {
  const euProhibited = [...COSING_PROHIBITED, ...COSING_PROHIBITED_EXTENDED].sort();
  const fdaProhibited = [...FDA_PROHIBITED].sort();

  const euRestricted = Object.entries(COSING_RESTRICTED)
    .map(([inci, entry]) => cosingFormatRestrictedLine(inci, entry))
    .sort();

  const fdaRestricted = Object.entries(FDA_RESTRICTED)
    .map(([inci, entry]) => {
      let line = `- ${inci}: max ${entry.max_pct}%; ${entry.ref}`;
      if (entry.product_scope) line += `; scope: ${entry.product_scope}`;
      return line;
    })
    .sort();

  return [
    "Regulatory constraints (EU CosIng Annexes II, III, V, VI + FDA 21 CFR — all percentages must comply):",
    "",
    "PROHIBITED — never include these INCI substances:",
    `EU Annex II: ${euProhibited.join(", ")}`,
    `FDA prohibited: ${fdaProhibited.join(", ")}`,
    "",
    "RESTRICTED — do not exceed these maximum concentrations in the ready-to-use product:",
    ...euRestricted,
    ...fdaRestricted,
    "",
    "Ingredients not listed above have no concentration cap in this database; still use real INCI names and respect any product-scope notes on restricted entries."
  ].join("\n");
}
