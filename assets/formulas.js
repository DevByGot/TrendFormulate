/**
 * TrendFormulate — shared formula workspace (localStorage)
 * Single source of truth for formulas saved from R&D Formulation.
 */
window.TFFormulas = (function () {
  const STORE_KEY = 'tf_saved_formulas';

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const list = JSON.parse(raw || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function persist(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('tf-formulas-changed'));
  }

  function getById(id) {
    return loadAll().find(f => f.id === id) || null;
  }

  function getByName(name) {
    return loadAll().find(f => f.name === name) || null;
  }

  function save(entry) {
    const list = loadAll();
    const idx = list.findIndex(f => f.id === entry.id || f.name === entry.name);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...entry };
    } else {
      list.push({ id: entry.id || Date.now(), ...entry });
    }
    persist(list);
    return entry;
  }

  function deleteById(id) {
    const list = loadAll().filter(f => f.id !== id);
    persist(list);
  }

  function buildDescription(entry) {
    if (!entry) return '';
    if (entry.description) return entry.description;

    const ingredients = entry.ingredients || [];
    if (ingredients.length === 0) {
      const hero = entry.hero_ingredient || entry.hero_inci || 'active blend';
      const mech = entry.mechanism ? ` ${entry.mechanism}.` : '';
      return `${entry.name}: Hero active ${hero}.${mech}`.trim();
    }

    const top = ingredients
      .slice(0, 8)
      .map(i => `${i.pct != null ? i.pct + '% ' : ''}${i.inci || i.name}`)
      .join(', ');
    const claims = (entry.benefit_stack || []).slice(0, 3).join(', ');
    let desc = `${entry.name}: ${top}${ingredients.length > 8 ? ', …' : ''}.`;
    if (claims) desc += ` Key claims: ${claims}.`;
    if (entry.compliance) desc += ` Compliance status: ${entry.compliance}.`;
    return desc;
  }

  function toMarketingShape(entry) {
    return {
      id:              entry.id,
      name:            entry.name,
      hero_ingredient: entry.hero_ingredient,
      ingredient_type: entry.ingredient_type,
      mechanism:       entry.mechanism,
      benefit_stack:   entry.benefit_stack || [],
      shot_type:       entry.shot_type || 'Product texture close-up',
      compliance:      entry.compliance,
      ingredients:     entry.ingredients || [],
      fromLab:         true
    };
  }

  function buildGenericFallbackProfile(entry) {
    const desc = buildDescription(entry).toLowerCase();
    const profile = {
      batch_tier: 'pilot',
      recommended_moq: 500,
      emulsification_method: 'cold-mix',
      required_certifications: ['ISO 22716'],
      preferred_regions: ['Europe', 'Asia'],
      special_capabilities: ['cold_mix'],
      regulatory_notes: buildDescription(entry),
      hard_filter_certifications: []
    };

    if (/spf|sunscreen|zinc oxide|titanium dioxide|uv filter/.test(desc)) {
      profile.batch_tier = 'mid';
      profile.recommended_moq = 1000;
      profile.emulsification_method = 'hot-mix';
      profile.required_certifications = ['FDA Registered', 'cGMP'];
      profile.preferred_regions = ['North America'];
      profile.special_capabilities = ['sunscreen_otc', 'mineral_uv'];
      profile.hard_filter_certifications = ['FDA Registered'];
    } else if (/peptide|matrixyl|argireline|ghk|copper tripeptide/.test(desc)) {
      profile.emulsification_method = 'cold-mix';
      profile.required_certifications = ['ISO 22716', 'EU GMP'];
      profile.special_capabilities = ['peptide_formulation', 'clean_room', 'cold_mix'];
    } else if (/organic|ecocert|cosmos|botanical|plant extract|bakuchiol/.test(desc)) {
      profile.emulsification_method = 'hot-mix';
      profile.required_certifications = ['Ecocert', 'COSMOS'];
      profile.preferred_regions = ['Europe', 'Asia'];
      profile.special_capabilities = ['botanical_extracts', 'organic_handling'];
    } else if (/ascorbic|vitamin c|ferulic/.test(desc)) {
      profile.emulsification_method = 'cold-mix';
      profile.special_capabilities = ['cold_mix'];
      profile.regulatory_notes += ' Oxidation-sensitive actives — cold-mix and inert atmosphere recommended.';
    }

    return profile;
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    STORE_KEY,
    loadAll,
    save,
    deleteById,
    getById,
    getByName,
    buildDescription,
    toMarketingShape,
    buildGenericFallbackProfile,
    escHtml
  };
})();
